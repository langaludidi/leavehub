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

    // Get the leave request details
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select(`
        *,
        leave_types (
          id,
          name,
          code
        ),
        profiles (
          id,
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

    // Update leave request status to approved
    const { data: updatedRequest, error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        approved_by: managerId,
        approved_at: new Date().toISOString(),
        manager_comments: comments || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating leave request:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve leave request' },
        { status: 500 }
      );
    }

    // Deduct leave days from employee's balance
    const { error: balanceError } = await supabase.rpc('deduct_leave_balance', {
      p_user_id: leaveRequest.profiles.id,
      p_leave_type_id: leaveRequest.leave_types.id,
      p_days_to_deduct: leaveRequest.working_days,
      p_year: new Date(leaveRequest.start_date).getFullYear()
    });

    if (balanceError) {
      console.error('Error deducting leave balance:', balanceError);
      // Don't fail the approval if balance update fails, but log it
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
      'approved',
      managerName,
      leaveRequest.start_date,
      leaveRequest.end_date,
      comments
    );

    return NextResponse.json({
      success: true,
      leaveRequest: updatedRequest,
      message: 'Leave request approved successfully',
    });

  } catch (error) {
    console.error('Error approving leave request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
