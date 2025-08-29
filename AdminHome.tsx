import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useUserRole } from "../components/RequireRole";
import UsageLimits from "../components/UsageLimits";

interface DashboardStats {
  totalEmployees: number;
  activeRequests: number;
  pendingApprovals: number;
  monthlyRequests: number;
  recentActivity: any[];
}

export default function AdminHome() {
  const { data: userRole } = useUserRole();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', userRole?.orgId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!userRole?.orgId) throw new Error('No organization');

      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Get total employees
      const { count: totalEmployees } = await supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', userRole.orgId)
        .eq('active', true);

      // Get active leave requests (approved for current/future dates)
      const { count: activeRequests } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('end_date', new Date().toISOString().split('T')[0]);

      // Get pending approvals
      const { count: pendingApprovals } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get monthly requests
      const { count: monthlyRequests } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('leave_requests')
        .select(`
          id,
          leave_type,
          status,
          created_at,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        totalEmployees: totalEmployees || 0,
        activeRequests: activeRequests || 0,
        pendingApprovals: pendingApprovals || 0,
        monthlyRequests: monthlyRequests || 0,
        recentActivity: recentActivity || []
      };
    },
    enabled: !!userRole?.orgId
  });

  const quickActions = [
    { 
      to: "/admin/employees", 
      label: "Manage Users", 
      desc: "Add, remove, and manage team members", 
      color: "from-blue-500 to-indigo-500",
      icon: "👥"
    },
    { 
      to: "/admin/requests", 
      label: "All Requests", 
      desc: "View and manage leave requests", 
      color: "from-green-500 to-emerald-500",
      icon: "📋"
    },
    { 
      to: "/admin/billing", 
      label: "Billing", 
      desc: "Subscription and usage management", 
      color: "from-purple-500 to-violet-500",
      icon: "💳"
    },
    { 
      to: "/admin/analytics", 
      label: "Analytics", 
      desc: "Trends, insights and reports", 
      color: "from-orange-500 to-red-500",
      icon: "📊"
    },
    { 
      to: "/admin/holidays", 
      label: "Holidays", 
      desc: "Manage company holidays", 
      color: "from-teal-500 to-cyan-500",
      icon: "🎉"
    },
    { 
      to: "/admin/leave-types", 
      label: "Leave Policies", 
      desc: "Configure leave types and policies", 
      color: "from-pink-500 to-rose-500",
      icon: "⚙️"
    },
    { 
      to: "/admin/departments", 
      label: "Departments", 
      desc: "Organize teams and assign managers", 
      color: "from-indigo-500 to-purple-500",
      icon: "🏢"
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'sick': return '🤒';
      case 'personal': return '👤';
      case 'maternity': return '👶';
      case 'bereavement': return '🕊️';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">Admin Dashboard</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Manage your organization and monitor key metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats?.totalEmployees || 0}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Total Employees</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats?.activeRequests || 0}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Active Leave</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {stats?.pendingApprovals || 0}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending Approvals</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800/30">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stats?.monthlyRequests || 0}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">This Month</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Usage Limits */}
        <div className="lg:col-span-1">
          <UsageLimits />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Activity</div>
              <div className="card-subtle mt-1">Latest leave requests</div>
            </div>
            <div className="card-body">
              {stats?.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-2xl">{getLeaveTypeIcon(activity.leave_type)}</span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {activity.profiles?.full_name || activity.profiles?.email || 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.leave_type} leave • {formatDate(activity.created_at)}
                        </div>
                      </div>
                      <span className={[
                        "px-2 py-1 rounded-full text-xs font-medium",
                        activity.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      ].join(' ')}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link 
              key={action.to} 
              to={action.to} 
              className="card hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} 
                    opacity-90 group-hover:opacity-100 transition-opacity
                    flex items-center justify-center text-white text-xl
                  `}>
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-lg font-semibold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {action.label}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {action.desc}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
