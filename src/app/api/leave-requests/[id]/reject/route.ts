import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendLeaveRequestStatusNotification } from '@/lib/email/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();
    const { comments, managerId } = body;

    // Validate that comments are provided for rejection
    if (!comments || !comments.trim()) {
      return NextResponse.json(
        { error: 'Comments are required when rejecting a leave request' },
        { status: 400 }
      );
    }

    // Get the leave request details
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select(`
        *,
        leave_types (
          name,
          code
        ),
        profiles (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (leaveRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `This request has already been ${leaveRequest.status}` },
        { status: 400 }
      );
    }

    // Update leave request status to rejected
    const { data: updatedRequest, error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        approved_by: managerId,
        approved_at: new Date().toISOString(),
        manager_comments: comments,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating leave request:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject leave request' },
        { status: 500 }
      );
    }

    // Get manager details for the email
    const { data: manager } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('clerk_user_id', managerId)
      .single();

    const managerName = manager
      ? `${manager.first_name} ${manager.last_name}`
      : 'Your Manager';

    // Send email notification to employee
    await sendLeaveRequestStatusNotification(
      leaveRequest.profiles.email,
      `${leaveRequest.profiles.first_name} ${leaveRequest.profiles.last_name}`,
      leaveRequest.leave_types.name,
      'rejected',
      managerName,
      leaveRequest.start_date,
      leaveRequest.end_date,
      comments
    );

    return NextResponse.json({
      success: true,
      leaveRequest: updatedRequest,
      message: 'Leave request rejected',
    });

  } catch (error) {
    console.error('Error rejecting leave request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
