import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { requestId, managerId, action, rejectionReason } = body;

    if (!requestId || !managerId || !action) {
      return NextResponse.json(
        { error: 'Request ID, manager ID, and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting' },
        { status: 400 }
      );
    }

    // Get manager's profile
    const { data: managerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', managerId)
      .single();

    if (!managerProfile) {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    // Get the leave request
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select(`
        *,
        user:profiles!leave_requests_user_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        leave_type:leave_types(
          id,
          name,
          code
        )
      `)
      .eq('id', requestId)
      .single();

    if (fetchError || !leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Check if request is already processed
    if (leaveRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Request has already been ${leaveRequest.status}` },
        { status: 400 }
      );
    }

    // Update leave request status
    const updateData: {
      status: 'approved' | 'rejected';
      approved_by: string;
      approved_at: string;
      updated_at: string;
      manager_comments?: string;
      rejection_reason?: string;
    } = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: managerProfile.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (action === 'reject') {
      updateData.rejection_reason = rejectionReason;
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', requestId)
      .select(`
        *,
        user:profiles!leave_requests_user_id_fkey(
          id,
          clerk_user_id,
          first_name,
          last_name,
          email
        ),
        leave_type:leave_types(
          id,
          name,
          code,
          color
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating leave request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update leave request' },
        { status: 500 }
      );
    }

    // If approved, update leave balance
    if (action === 'approve') {
      const { error: balanceError } = await supabase.rpc('update_leave_balance', {
        p_user_id: leaveRequest.user_id,
        p_leave_type_id: leaveRequest.leave_type_id,
        p_year: new Date(leaveRequest.start_date).getFullYear(),
        p_days: leaveRequest.working_days,
        p_operation: 'subtract'
      });

      if (balanceError) {
        console.error('Error updating leave balance:', balanceError);
        // Note: We don't fail the approval, but log the error
      }
    }

    // Create notification for the employee
    await supabase
      .from('notifications')
      .insert({
        user_id: leaveRequest.user_id,
        type: action === 'approve' ? 'leave_request_approved' : 'leave_request_rejected',
        title: action === 'approve' ? 'Leave Request Approved' : 'Leave Request Rejected',
        message: action === 'approve'
          ? `Your ${leaveRequest.leave_type.name} request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been approved.`
          : `Your ${leaveRequest.leave_type.name} request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been rejected. Reason: ${rejectionReason}`,
        action_url: `/dashboard/leave/requests/${requestId}`,
        is_read: false,
      });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: action === 'approve'
        ? 'Leave request approved successfully'
        : 'Leave request rejected successfully'
    });

  } catch (error) {
    console.error('Error in approve API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Bulk approve/reject
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { requestIds, managerId, action, rejectionReason } = body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return NextResponse.json(
        { error: 'Request IDs array is required' },
        { status: 400 }
      );
    }

    if (!managerId || !action) {
      return NextResponse.json(
        { error: 'Manager ID and action are required' },
        { status: 400 }
      );
    }

    // Process each request
    const results = await Promise.all(
      requestIds.map(async (requestId) => {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/team/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestId,
              managerId,
              action,
              rejectionReason,
            }),
          });

          const data = await response.json();
          return { requestId, success: response.ok, data };
        } catch (error) {
          return {
            requestId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    });

  } catch (error) {
    console.error('Error in bulk approve API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
