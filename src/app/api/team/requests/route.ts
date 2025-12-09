import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const managerId = searchParams.get('managerId');
    const status = searchParams.get('status'); // pending, approved, rejected, all
    const departmentId = searchParams.get('departmentId');

    if (!managerId && !departmentId) {
      return NextResponse.json(
        { error: 'Manager ID or Department ID is required' },
        { status: 400 }
      );
    }

    // Get manager's profile
    let companyId: string | null = null;
    let managerDepartmentId: string | null = null;

    if (managerId) {
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('company_id, department_id')
        .eq('clerk_user_id', managerId)
        .single();

      if (managerProfile) {
        companyId = managerProfile.company_id;
        managerDepartmentId = managerProfile.department_id;
      }
    }

    // Get team member IDs
    const filterDepartmentId = departmentId || managerDepartmentId;
    let memberQuery = supabase.from('profiles').select('id');

    if (filterDepartmentId) {
      memberQuery = memberQuery.eq('department_id', filterDepartmentId);
    } else if (companyId) {
      memberQuery = memberQuery.eq('company_id', companyId);
    }

    const { data: teamMembers } = await memberQuery;
    const memberIds = teamMembers?.map(m => m.id) || [];

    if (memberIds.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // Get leave requests for team members
    let requestsQuery = supabase
      .from('leave_requests')
      .select(`
        id,
        user_id,
        leave_type_id,
        start_date,
        end_date,
        working_days,
        half_day,
        half_day_period,
        reason,
        status,
        rejection_reason,
        approved_by,
        approved_at,
        created_at,
        updated_at,
        user:profiles!leave_requests_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          department:departments(
            id,
            name
          )
        ),
        leave_type:leave_types(
          id,
          name,
          code,
          color
        ),
        approver:profiles!leave_requests_approved_by_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .in('user_id', memberIds)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      requestsQuery = requestsQuery.eq('status', status);
    }

    const { data: requests, error } = await requestsQuery;

    if (error) {
      console.error('Error fetching team requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch team requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests: requests || [] });

  } catch (error) {
    console.error('Error in team requests API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
