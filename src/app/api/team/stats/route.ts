import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const managerId = searchParams.get('managerId');
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
      return NextResponse.json({
        stats: {
          totalMembers: 0,
          pendingRequests: 0,
          approvedThisMonth: 0,
          onLeaveToday: 0,
          upcomingLeave: 0,
        },
      });
    }

    // Get pending requests count
    const { count: pendingCount } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .in('user_id', memberIds)
      .eq('status', 'pending');

    // Get approved requests this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: approvedThisMonth } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .in('user_id', memberIds)
      .eq('status', 'approved')
      .gte('approved_at', startOfMonth.toISOString());

    // Get on leave today
    const today = new Date().toISOString().split('T')[0];

    const { count: onLeaveToday } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .in('user_id', memberIds)
      .eq('status', 'approved')
      .lte('start_date', today)
      .gte('end_date', today);

    // Get upcoming leave (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const { count: upcomingLeave } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .in('user_id', memberIds)
      .eq('status', 'approved')
      .gte('start_date', today)
      .lte('start_date', nextWeekStr);

    // Get leave by type statistics
    const { data: leaveByType } = await supabase
      .from('leave_requests')
      .select(`
        leave_type_id,
        working_days,
        leave_type:leave_types(
          name,
          code,
          color
        )
      `)
      .in('user_id', memberIds)
      .eq('status', 'approved')
      .gte('start_date', startOfMonth.toISOString().split('T')[0]) as { data: Array<{
        leave_type_id: string;
        working_days: number;
        leave_type: { name: string; code: string; color: string } | null;
      }> | null };

    interface LeaveTypeStat {
      name: string;
      code?: string;
      color?: string;
      totalDays: number;
      count: number;
    }

    // Aggregate by leave type
    const leaveTypeStats = (leaveByType || []).reduce((acc: Record<string, LeaveTypeStat>, request) => {
      const typeName = request.leave_type?.name || 'Unknown';
      if (!acc[typeName]) {
        acc[typeName] = {
          name: typeName,
          code: request.leave_type?.code,
          color: request.leave_type?.color,
          totalDays: 0,
          count: 0,
        };
      }
      acc[typeName].totalDays += request.working_days || 0;
      acc[typeName].count += 1;
      return acc;
    }, {});

    return NextResponse.json({
      stats: {
        totalMembers: memberIds.length,
        pendingRequests: pendingCount || 0,
        approvedThisMonth: approvedThisMonth || 0,
        onLeaveToday: onLeaveToday || 0,
        upcomingLeave: upcomingLeave || 0,
        leaveByType: Object.values(leaveTypeStats),
      },
    });

  } catch (error) {
    console.error('Error in team stats API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
