import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import LeaveMetrics from '../../components/analytics/LeaveMetrics';
import TrendAnalysis from '../../components/analytics/TrendAnalysis';
import PredictiveInsights from '../../components/analytics/PredictiveInsights';

interface AnalyticsOverview {
  totalEmployees: number;
  totalRequests: number;
  averageApprovalTime: number;
  topRequesters: Array<{ name: string; requests: number }>;
  departmentStats: Array<{ 
    department: string; 
    employees: number; 
    requests: number; 
    days: number;
    utilizationRate: number;
  }>;
  recentActivity: Array<{
    type: 'request_submitted' | 'request_approved' | 'request_denied';
    employee: string;
    date: string;
    details: string;
  }>;
}

async function fetchAnalyticsOverview(orgId: string): Promise<AnalyticsOverview> {
  // Get organization members
  const { data: members } = await supabase
    .from('org_members')
    .select(`
      user_id,
      department,
      profiles!inner (
        full_name,
        email
      )
    `)
    .eq('org_id', orgId)
    .eq('active', true);

  // Get leave requests from this year
  const currentYear = new Date().getFullYear();
  const { data: requests } = await supabase
    .from('leave_requests')
    .select(`
      id,
      user_id,
      leave_type,
      status,
      total_days,
      created_at,
      approved_at,
      profiles!inner (
        full_name,
        email
      )
    `)
    .gte('created_at', `${currentYear}-01-01`)
    .order('created_at', { ascending: false });

  // Calculate department stats
  const departmentMap = new Map<string, { 
    employees: Set<string>; 
    requests: number; 
    days: number; 
  }>();

  members?.forEach(member => {
    const dept = member.department || 'Other';
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, { employees: new Set(), requests: 0, days: 0 });
    }
    departmentMap.get(dept)!.employees.add(member.user_id);
  });

  // Add request data to departments
  const memberDeptMap = new Map(
    members?.map(m => [m.user_id, m.department || 'Other']) || []
  );

  requests?.forEach(request => {
    const dept = memberDeptMap.get(request.user_id) || 'Other';
    const deptData = departmentMap.get(dept);
    if (deptData) {
      deptData.requests++;
      if (request.status === 'approved') {
        deptData.days += request.total_days || 0;
      }
    }
  });

  const departmentStats = Array.from(departmentMap.entries()).map(([dept, data]) => {
    const avgDaysPerEmployee = data.employees.size > 0 ? data.days / data.employees.size : 0;
    const utilizationRate = Math.min(avgDaysPerEmployee / 20 * 100, 100); // Assuming 20 days annual allowance
    
    return {
      department: dept,
      employees: data.employees.size,
      requests: data.requests,
      days: data.days,
      utilizationRate: Math.round(utilizationRate * 10) / 10
    };
  }).sort((a, b) => b.days - a.days);

  // Top requesters
  const userRequestMap = new Map<string, { name: string; count: number }>();
  requests?.forEach(request => {
    const name = request.profiles.full_name || request.profiles.email || 'Unknown';
    const existing = userRequestMap.get(request.user_id) || { name, count: 0 };
    userRequestMap.set(request.user_id, { ...existing, count: existing.count + 1 });
  });

  const topRequesters = Array.from(userRequestMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent activity
  const recentActivity = requests?.slice(0, 10).map(request => {
    const name = request.profiles.full_name || request.profiles.email || 'Unknown';
    let type: 'request_submitted' | 'request_approved' | 'request_denied';
    let details: string;

    if (request.status === 'approved' && request.approved_at) {
      type = 'request_approved';
      details = `${request.leave_type} leave approved`;
    } else if (request.status === 'denied') {
      type = 'request_denied';
      details = `${request.leave_type} leave denied`;
    } else {
      type = 'request_submitted';
      details = `${request.leave_type} leave submitted`;
    }

    return {
      type,
      employee: name,
      date: request.approved_at || request.created_at,
      details
    };
  }) || [];

  // Calculate average approval time
  const approvedRequests = requests?.filter(r => r.status === 'approved' && r.approved_at) || [];
  const approvalTimes = approvedRequests.map(r => {
    const created = new Date(r.created_at).getTime();
    const approved = new Date(r.approved_at!).getTime();
    return (approved - created) / (1000 * 60 * 60 * 24); // Days
  });
  
  const averageApprovalTime = approvalTimes.length > 0 
    ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
    : 0;

  return {
    totalEmployees: members?.length || 0,
    totalRequests: requests?.length || 0,
    averageApprovalTime: Math.round(averageApprovalTime * 10) / 10,
    topRequesters,
    departmentStats,
    recentActivity
  };
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'trends' | 'insights'>('overview');

  // Get current user's organization
  const { data: userRole } = useQuery({
    queryKey: ['current-user-role-analytics'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data } = await supabase
        .from('org_members')
        .select('org_id, role')
        .eq('user_id', user.user.id)
        .eq('active', true)
        .single();

      return data;
    }
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview', userRole?.org_id],
    queryFn: () => fetchAnalyticsOverview(userRole?.org_id || ''),
    enabled: !!userRole?.org_id
  });

  if (!userRole?.org_id) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be part of an organization to access analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive insights into leave patterns and organizational trends
            </p>
          </div>
          
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'month' | 'quarter' | 'year')}
              className="select"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card">
          <div className="card-header border-b-0 pb-0">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  activeTab === 'overview'
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                ].join(' ')}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  activeTab === 'metrics'
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                ].join(' ')}
              >
                📈 Metrics
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  activeTab === 'trends'
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                ].join(' ')}
              >
                📅 Trends
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  activeTab === 'insights'
                    ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                ].join(' ')}
              >
                🎯 Insights
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {overviewLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-lg"></div>
                  ))}
                </div>
              ) : overview ? (
                <>
                  {/* Key Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {overview.totalEmployees}
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">Total Employees</div>
                        </div>
                        <div className="text-2xl">👥</div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {overview.totalRequests}
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300">Total Requests</div>
                        </div>
                        <div className="text-2xl">📋</div>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {overview.averageApprovalTime}
                          </div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">Avg Approval Days</div>
                        </div>
                        <div className="text-2xl">⏱️</div>
                      </div>
                    </div>

                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            {overview.departmentStats.length}
                          </div>
                          <div className="text-sm text-teal-700 dark:text-teal-300">Departments</div>
                        </div>
                        <div className="text-2xl">🏢</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Department Statistics */}
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">Department Statistics</h3>
                        <p className="card-subtle">Leave utilization by department</p>
                      </div>
                      <div className="card-body">
                        <div className="space-y-4">
                          {overview.departmentStats.map(dept => (
                            <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <div className="font-medium">{dept.department}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {dept.employees} employees • {dept.requests} requests
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-teal-600 dark:text-teal-400">
                                  {dept.utilizationRate}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {dept.days} days used
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                        <p className="card-subtle">Latest leave request activities</p>
                      </div>
                      <div className="card-body">
                        <div className="space-y-3">
                          {overview.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 p-2">
                              <div className="text-lg">
                                {activity.type === 'request_approved' ? '✅' :
                                 activity.type === 'request_denied' ? '❌' : '📋'}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{activity.employee}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {activity.details}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(activity.date).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Requesters */}
                  {overview.topRequesters.length > 0 && (
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">Most Active Requesters</h3>
                        <p className="card-subtle">Employees with the most leave requests this year</p>
                      </div>
                      <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {overview.topRequesters.map((user, index) => (
                            <div key={user.name} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                                {index + 1}
                              </div>
                              <div className="font-medium text-sm truncate">{user.name}</div>
                              <div className="text-teal-600 dark:text-teal-400 font-bold">
                                {user.requests} requests
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <LeaveMetrics orgId={userRole.org_id} timeRange={timeRange} />
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <TrendAnalysis orgId={userRole.org_id} />
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <PredictiveInsights orgId={userRole.org_id} />
          )}
        </div>

        {/* Export Actions */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Export Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download detailed reports for further analysis
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn-secondary">
                  📊 Export to CSV
                </button>
                <button className="btn-secondary">
                  📈 Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
