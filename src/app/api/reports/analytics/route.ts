import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate') || '2025-01-01';
    const endDate = searchParams.get('endDate') || '2025-12-31';
    const companyId = searchParams.get('companyId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile to determine company
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, company_id, department, role')
      .eq('clerk_user_id', userId)
      .single();

    const targetCompanyId = companyId || userProfile?.company_id;

    // 1. LEAVE USAGE OVERVIEW
    const { data: leaveUsage } = await supabase
      .from('leave_requests')
      .select(`
        id,
        working_days,
        status,
        start_date,
        leave_types (name, code, color),
        profiles!inner (company_id)
      `)
      .eq('profiles.company_id', targetCompanyId)
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    // 2. DEPARTMENT BREAKDOWN
    const { data: departmentData } = await supabase
      .from('leave_requests')
      .select(`
        working_days,
        status,
        profiles!inner (department, company_id)
      `)
      .eq('profiles.company_id', targetCompanyId)
      .gte('start_date', startDate)
      .lte('end_date', endDate) as { data: Array<{
        working_days: number;
        status: string;
        profiles: { department: string; company_id: string };
      }> | null };

    // 3. LEAVE TYPE BREAKDOWN
    const { data: leaveTypeData } = await supabase
      .from('leave_requests')
      .select(`
        working_days,
        status,
        leave_types (name, code, color),
        profiles!inner (company_id)
      `)
      .eq('profiles.company_id', targetCompanyId)
      .gte('start_date', startDate)
      .lte('end_date', endDate) as { data: Array<{
        working_days: number;
        status: string;
        leave_types: { name: string; code: string; color: string } | null;
        profiles: { company_id: string };
      }> | null };

    // 4. MONTHLY TRENDS
    const { data: monthlyData } = await supabase
      .from('leave_requests')
      .select(`
        start_date,
        working_days,
        status,
        profiles!inner (company_id)
      `)
      .eq('profiles.company_id', targetCompanyId)
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .order('start_date') as { data: Array<{
        start_date: string;
        working_days: number;
        status: string;
        profiles: { company_id: string };
      }> | null };

    // 5. EMPLOYEE UTILIZATION
    const { data: employeeData } = await supabase
      .from('leave_balances')
      .select(`
        entitled_days,
        used_days,
        year,
        profiles!inner (first_name, last_name, department, company_id)
      `)
      .eq('profiles.company_id', targetCompanyId)
      .eq('year', new Date(startDate).getFullYear()) as { data: Array<{
        entitled_days: number;
        used_days: number;
        year: number;
        profiles: { first_name: string; last_name: string; department: string; company_id: string };
      }> | null };

    // 6. BALANCE SUMMARY
    const { data: balanceSummary } = await supabase
      .from('leave_balances')
      .select(`
        entitled_days,
        used_days,
        year,
        leave_types (name, code),
        profiles!inner (company_id)
      `)
      .eq('profiles.company_id', targetCompanyId)
      .eq('year', new Date(startDate).getFullYear());

    // Process data for analytics

    // Leave Usage by Status
    const usageByStatus = {
      approved: leaveUsage?.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.working_days, 0) || 0,
      pending: leaveUsage?.filter(l => l.status === 'pending').reduce((sum, l) => sum + l.working_days, 0) || 0,
      rejected: leaveUsage?.filter(l => l.status === 'rejected').reduce((sum, l) => sum + l.working_days, 0) || 0,
    };

    interface LeaveTypeData {
      leave_types?: { name?: string; code?: string; color?: string } | null;
      working_days: number;
    }

    interface LeaveByTypeResult {
      name: string;
      code: string;
      color: string;
      days: number;
      count: number;
    }

    // Leave by Type
    const leaveByType = leaveTypeData?.reduce((acc: LeaveByTypeResult[], item: LeaveTypeData) => {
      const existing = acc.find(a => a.name === item.leave_types?.name);
      if (existing) {
        existing.days += item.working_days;
        existing.count += 1;
      } else {
        acc.push({
          name: item.leave_types?.name || 'Unknown',
          code: item.leave_types?.code || 'UNK',
          color: item.leave_types?.color || '#666',
          days: item.working_days,
          count: 1,
        });
      }
      return acc;
    }, []) || [];

    interface DepartmentData {
      profiles?: { department?: string } | null;
      working_days: number;
    }

    interface LeaveByDepartmentResult {
      department: string;
      days: number;
      count: number;
    }

    // Leave by Department
    const leaveByDepartment = departmentData?.reduce((acc: LeaveByDepartmentResult[], item: DepartmentData) => {
      const dept = item.profiles?.department || 'Unknown';
      const existing = acc.find(a => a.department === dept);
      if (existing) {
        existing.days += item.working_days;
        existing.count += 1;
      } else {
        acc.push({
          department: dept,
          days: item.working_days,
          count: 1,
        });
      }
      return acc;
    }, []) || [];

    interface MonthlyData {
      start_date: string;
      working_days: number;
    }

    interface MonthlyTrendsResult {
      month: string;
      days: number;
      requests: number;
    }

    // Monthly Trends
    const monthlyTrends = monthlyData?.reduce((acc: MonthlyTrendsResult[], item: MonthlyData) => {
      const month = new Date(item.start_date).toLocaleString('en-US', { month: 'short' });
      const existing = acc.find(a => a.month === month);
      if (existing) {
        existing.days += item.working_days;
        existing.requests += 1;
      } else {
        acc.push({
          month,
          days: item.working_days,
          requests: 1,
        });
      }
      return acc;
    }, []) || [];

    // Employee Utilization
    const employeeUtilization = employeeData?.map((item) => ({
      name: `${item.profiles.first_name} ${item.profiles.last_name}`,
      department: item.profiles.department || 'Unknown',
      entitled: item.entitled_days,
      used: item.used_days,
      available: item.entitled_days - item.used_days,
      utilizationRate: Math.round((item.used_days / item.entitled_days) * 100),
    })) || [];

    // Balance Summary
    const totalEntitled = balanceSummary?.reduce((sum, b) => sum + b.entitled_days, 0) || 0;
    const totalUsed = balanceSummary?.reduce((sum, b) => sum + b.used_days, 0) || 0;
    const totalAvailable = totalEntitled - totalUsed;

    // Compliance Metrics
    const totalRequests = leaveUsage?.length || 0;
    const approvedRequests = leaveUsage?.filter(l => l.status === 'approved').length || 0;
    const pendingRequests = leaveUsage?.filter(l => l.status === 'pending').length || 0;
    const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalDaysUsed: usageByStatus.approved,
        totalRequests,
        approvedRequests,
        pendingRequests,
        approvalRate,
        totalEntitled,
        totalUsed,
        totalAvailable,
      },
      usageByStatus,
      leaveByType: leaveByType.sort((a, b) => b.days - a.days),
      leaveByDepartment: leaveByDepartment.sort((a, b) => b.days - a.days),
      monthlyTrends,
      employeeUtilization: employeeUtilization.sort((a, b) => b.utilizationRate - a.utilizationRate),
      period: { startDate, endDate },
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
