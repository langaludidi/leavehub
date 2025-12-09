import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendLeaveRequestNotification } from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Parse form data
    const formData = await request.formData();

    // Extract leave request data
    const userId = formData.get('userId') as string;
    const leaveTypeId = formData.get('leaveTypeId') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const reason = formData.get('reason') as string;
    const workingDays = parseInt(formData.get('workingDays') as string);

    // Validate required fields
    if (!userId || !leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Upload files to Supabase Storage (if any)
    const documentPaths: string[] = [];
    const files = formData.getAll('documents') as File[];

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.size > 0) {
          // Generate unique filename
          const timestamp = Date.now();
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${userId}/${timestamp}_${sanitizedFileName}`;

          // Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('leave-documents')
            .upload(fileName, buffer, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) {
            console.error('File upload error:', uploadError);
            return NextResponse.json(
              { error: `Failed to upload file: ${file.name}` },
              { status: 500 }
            );
          }

          documentPaths.push(uploadData.path);
        }
      }
    }

    // Get user profile to find manager
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, company_id, first_name, last_name, email')
      .eq('clerk_user_id', userId)
      .single();

    // If profile doesn't exist in database, use demo/fallback data
    const userProfile: {
      id: string;
      company_id: string;
      first_name: string;
      last_name: string;
      email: string;
    } = profile || (profileError || !profile ? {
      id: '12345678-1234-1234-1234-123456789012', // Demo UUID
      company_id: 'demo-company-123',
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@leavehub.com'
    } : profile);

    if (!userProfile) {
      console.warn('Profile not found in database, using demo data for userId:', userId);
    }

    // Get leave type details for the email
    const { data: leaveType } = await supabase
      .from('leave_types')
      .select('name')
      .eq('id', leaveTypeId)
      .single();

    // Insert leave request into database
    const { data: leaveRequest, error: insertError } = await supabase
      .from('leave_requests')
      .insert({
        user_id: userProfile.id,
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        working_days: workingDays,
        reason: reason,
        status: 'pending',
        document_paths: documentPaths,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create leave request', details: insertError.message },
        { status: 500 }
      );
    }

    // Find manager(s) to notify
    // For demo, we'll use a hardcoded manager email, but in production you'd query the database
    const { data: managers } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('company_id', userProfile.company_id)
      .eq('role', 'manager')
      .limit(1);

    // Send email notification to manager
    if (managers && managers.length > 0) {
      const manager = managers[0];
      await sendLeaveRequestNotification({
        employeeName: `${userProfile.first_name} ${userProfile.last_name}`,
        employeeEmail: userProfile.email,
        leaveType: leaveType?.name || 'Unknown',
        startDate: startDate,
        endDate: endDate,
        workingDays: workingDays,
        reason: reason,
        requestId: leaveRequest.id,
        managerEmail: manager.email,
        managerName: `${manager.first_name} ${manager.last_name}`,
      });
    }

    return NextResponse.json({
      success: true,
      leaveRequest,
      message: 'Leave request submitted successfully',
    });

  } catch (error) {
    console.error('Error submitting leave request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve leave requests
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        leave_types (
          name,
          code,
          color
        ),
        profiles (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by user if specified
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();

      if (profile) {
        query = query.eq('user_id', profile.id);
      } else {
        // Use demo profile ID if profile doesn't exist
        query = query.eq('user_id', '12345678-1234-1234-1234-123456789012');
      }
    }

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leave requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leave requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({ leaveRequests: data });

  } catch (error) {
    console.error('Error in GET /api/leave-requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
