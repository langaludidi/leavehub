import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import CalendarSync from "../components/calendar/CalendarSync";
import NotificationCenter from "../components/notifications/NotificationCenter";

async function fetchLeaveStats() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  // Get leave requests count
  const { data: requests, error } = await supabase
    .from('leave_requests')
    .select('status')
    .eq('user_id', user.user.id);

  if (error) throw error;

  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    approved: requests?.filter(r => r.status === 'approved').length || 0,
    denied: requests?.filter(r => r.status === 'denied').length || 0
  };

  return stats;
}

export default function EmployeeHome() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['leave-stats'],
    queryFn: fetchLeaveStats
  });

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Leave Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your time off requests and calendar integration
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <div className="skeleton h-20 rounded-lg"></div>
              <div className="skeleton h-20 rounded-lg"></div>
              <div className="skeleton h-20 rounded-lg"></div>
              <div className="skeleton h-20 rounded-lg"></div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.total || 0}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Requests</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.pending || 0}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.approved || 0}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Approved</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.denied || 0}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Denied</div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
                <p className="card-subtle">Common tasks you can perform</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/employee/request" className="btn-primary text-center py-6">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-semibold">Request Leave</div>
                  </Link>
                  <Link to="/employee/history" className="btn-secondary text-center py-6">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="font-semibold">View History</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Activity</h2>
                <p className="card-subtle">Your latest leave requests</p>
              </div>
              <div className="card-body">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No recent activity</p>
                  <p className="text-sm">Your recent leave requests will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar Integration */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Calendar Sync</h3>
                <p className="card-subtle">Connect your calendar apps</p>
              </div>
              <div className="card-body">
                <CalendarSync compact />
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/employee/calendar" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    Manage Settings →
                  </Link>
                </div>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="card bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800/30">
              <div className="card-body text-center">
                <div className="text-3xl mb-2">🏖️</div>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                  21
                </div>
                <div className="text-sm text-teal-700 dark:text-teal-300">Days Remaining</div>
                <div className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                  This year
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Notifications</h3>
                <p className="card-subtle">Your latest updates</p>
              </div>
              <div className="card-body">
                <NotificationCenter compact />
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/employee/notifications" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    Manage Settings →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Links</h3>
              </div>
              <div className="card-body space-y-3">
                <Link to="/employee/calendar" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                  <div className="font-medium">Calendar Settings</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Configure calendar sync</div>
                </Link>
                
                <Link to="/employee/history" className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition">
                  <div className="font-medium">Request History</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">View all your requests</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
