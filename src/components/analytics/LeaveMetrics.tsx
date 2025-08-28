import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface LeaveMetricsProps {
  orgId: string;
  timeRange: 'month' | 'quarter' | 'year';
}

interface MetricData {
  totalRequests: number;
  approvedRequests: number;
  deniedRequests: number;
  pendingRequests: number;
  totalDaysUsed: number;
  averageRequestDays: number;
  approvalRate: number;
  leaveTypeBreakdown: Record<string, number>;
  departmentBreakdown: Record<string, number>;
  monthlyTrends: Array<{ month: string; requests: number; days: number }>;
  topUsers: Array<{ name: string; days: number; requests: number }>;
}

async function fetchLeaveMetrics(orgId: string, timeRange: 'month' | 'quarter' | 'year'): Promise<MetricData> {
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  // Get leave requests with user profile and org member data
  const { data: requests, error } = await supabase
    .from('leave_requests')
    .select(`
      id,
      start_date,
      end_date,
      leave_type,
      status,
      total_days,
      created_at,
      user_id,
      profiles!inner (
        full_name,
        email
      )
    `)
    .gte('created_at', startDate.toISOString())
    .order('created_at');

  if (error) throw error;

  // Get org members to map departments
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('user_id, department')
    .eq('org_id', orgId);

  const departmentMap = new Map(
    orgMembers?.map(m => [m.user_id, m.department || 'Other']) || []
  );

  // Calculate metrics
  const totalRequests = requests?.length || 0;
  const approvedRequests = requests?.filter(r => r.status === 'approved').length || 0;
  const deniedRequests = requests?.filter(r => r.status === 'denied').length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  
  const approvedRequestsData = requests?.filter(r => r.status === 'approved') || [];
  const totalDaysUsed = approvedRequestsData.reduce((sum, r) => sum + (r.total_days || 0), 0);
  const averageRequestDays = approvedRequestsData.length > 0 
    ? totalDaysUsed / approvedRequestsData.length 
    : 0;
  
  const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;

  // Leave type breakdown
  const leaveTypeBreakdown: Record<string, number> = {};
  approvedRequestsData.forEach(request => {
    const type = request.leave_type || 'unknown';
    leaveTypeBreakdown[type] = (leaveTypeBreakdown[type] || 0) + (request.total_days || 0);
  });

  // Department breakdown
  const departmentBreakdown: Record<string, number> = {};
  approvedRequestsData.forEach(request => {
    const dept = departmentMap.get(request.user_id) || 'Other';
    departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + (request.total_days || 0);
  });

  // Monthly trends
  const monthlyData = new Map<string, { requests: number; days: number }>();
  requests?.forEach(request => {
    const monthKey = new Date(request.created_at).toISOString().substring(0, 7);
    const existing = monthlyData.get(monthKey) || { requests: 0, days: 0 };
    monthlyData.set(monthKey, {
      requests: existing.requests + 1,
      days: existing.days + (request.status === 'approved' ? (request.total_days || 0) : 0)
    });
  });

  const monthlyTrends = Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      requests: data.requests,
      days: data.days
    }));

  // Top users by days taken
  const userStats = new Map<string, { days: number; requests: number; name: string }>();
  approvedRequestsData.forEach(request => {
    const userId = request.user_id;
    const existing = userStats.get(userId) || { 
      days: 0, 
      requests: 0, 
      name: request.profiles.full_name || request.profiles.email || 'Unknown'
    };
    userStats.set(userId, {
      ...existing,
      days: existing.days + (request.total_days || 0),
      requests: existing.requests + 1
    });
  });

  const topUsers = Array.from(userStats.values())
    .sort((a, b) => b.days - a.days)
    .slice(0, 10);

  return {
    totalRequests,
    approvedRequests,
    deniedRequests,
    pendingRequests,
    totalDaysUsed,
    averageRequestDays: Math.round(averageRequestDays * 10) / 10,
    approvalRate: Math.round(approvalRate * 10) / 10,
    leaveTypeBreakdown,
    departmentBreakdown,
    monthlyTrends,
    topUsers
  };
}

export default function LeaveMetrics({ orgId, timeRange }: LeaveMetricsProps) {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['leave-metrics', orgId, timeRange],
    queryFn: () => fetchLeaveMetrics(orgId, timeRange),
    enabled: !!orgId
  });

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vacation: 'bg-blue-500',
      sick: 'bg-red-500',
      personal: 'bg-yellow-500',
      maternity: 'bg-purple-500',
      bereavement: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-400';
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Vacation',
      sick: 'Sick Leave',
      personal: 'Personal',
      maternity: 'Maternity/Paternity',
      bereavement: 'Bereavement'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-64 rounded-lg"></div>
          <div className="skeleton h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Error Loading Metrics</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load analytics data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.totalRequests}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Requests</div>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.totalDaysUsed}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Days Used</div>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {metrics.approvalRate}%
              </div>
              <div className="text-sm text-teal-700 dark:text-teal-300">Approval Rate</div>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.averageRequestDays}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Avg Days/Request</div>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Request Status</h3>
            <p className="card-subtle">Breakdown by approval status</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Approved</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{metrics.approvedRequests}</div>
                  <div className="text-sm text-gray-500">
                    {((metrics.approvedRequests / metrics.totalRequests) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{metrics.pendingRequests}</div>
                  <div className="text-sm text-gray-500">
                    {((metrics.pendingRequests / metrics.totalRequests) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Denied</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{metrics.deniedRequests}</div>
                  <div className="text-sm text-gray-500">
                    {((metrics.deniedRequests / metrics.totalRequests) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Type Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Leave Types</h3>
            <p className="card-subtle">Days used by leave type</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {Object.entries(metrics.leaveTypeBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([type, days]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={[
                        'w-3 h-3 rounded-full',
                        getLeaveTypeColor(type)
                      ].join(' ')}></div>
                      <span>{getLeaveTypeLabel(type)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{days}</div>
                      <div className="text-sm text-gray-500">
                        {((days / metrics.totalDaysUsed) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      {Object.keys(metrics.departmentBreakdown).length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department Usage</h3>
            <p className="card-subtle">Leave days used by department</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics.departmentBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([dept, days]) => (
                  <div key={dept} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="font-medium mb-1">{dept}</div>
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {days}
                    </div>
                    <div className="text-sm text-gray-500">
                      {((days / metrics.totalDaysUsed) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {metrics.monthlyTrends.length > 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Trends</h3>
            <p className="card-subtle">Requests and days over time</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {metrics.monthlyTrends.map(trend => (
                <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium">{trend.month}</div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{trend.requests}</div>
                      <div className="text-sm text-gray-500">Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600 dark:text-green-400">{trend.days}</div>
                      <div className="text-sm text-gray-500">Days</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Users */}
      {metrics.topUsers.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Leave Users</h3>
            <p className="card-subtle">Employees with the most approved leave days</p>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {metrics.topUsers.slice(0, 5).map((user, index) => (
                <div key={user.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="font-bold">{user.requests}</div>
                      <div className="text-sm text-gray-500">Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-teal-600 dark:text-teal-400">{user.days}</div>
                      <div className="text-sm text-gray-500">Days</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}