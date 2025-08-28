import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import TeamCalendar from '../../components/calendar/TeamCalendar';
import CapacityPlanner from '../../components/team/CapacityPlanner';

interface TeamStats {
  totalMembers: number;
  activeRequests: number;
  pendingApprovals: number;
  departments: string[];
}

async function fetchTeamStats(orgId: string): Promise<TeamStats> {
  // Get team members count and departments
  const { data: members, error: membersError } = await supabase
    .from('org_members')
    .select('department')
    .eq('org_id', orgId)
    .eq('active', true);

  if (membersError) throw membersError;

  const departments = [...new Set(members?.map(m => m.department).filter(Boolean) || [])];

  // Get leave requests stats
  const { data: requests, error: requestsError } = await supabase
    .from('leave_requests')
    .select('status, created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

  if (requestsError) throw requestsError;

  return {
    totalMembers: members?.length || 0,
    activeRequests: requests?.filter(r => ['approved', 'pending'].includes(r.status)).length || 0,
    pendingApprovals: requests?.filter(r => r.status === 'pending').length || 0,
    departments
  };
}

export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'capacity'>('calendar');
  const [showOnlyApproved, setShowOnlyApproved] = useState(true);

  // Get current user's organization
  const { data: userRole } = useQuery({
    queryKey: ['current-user-role'],
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

  const { data: teamStats, isLoading: statsLoading } = useQuery({
    queryKey: ['team-stats', userRole?.org_id],
    queryFn: () => fetchTeamStats(userRole?.org_id || ''),
    enabled: !!userRole?.org_id
  });

  if (!userRole?.org_id) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be part of an organization to access team management features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Team Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Monitor team capacity, plan coverage, and track leave requests
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <div className="skeleton h-20 rounded-lg"></div>
              <div className="skeleton h-20 rounded-lg"></div>
              <div className="skeleton h-20 rounded-lg"></div>
              <div className="skeleton h-20 rounded-lg"></div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {teamStats?.totalMembers || 0}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Team Members</div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {teamStats?.activeRequests || 0}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Active Requests</div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {teamStats?.pendingApprovals || 0}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending Approvals</div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {teamStats?.departments.length || 0}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Departments</div>
              </div>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="card">
          <div className="card-header border-b-0 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={[
                    'px-4 py-2 rounded-lg text-sm font-medium transition',
                    activeTab === 'calendar'
                      ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  ].join(' ')}
                >
                  📅 Team Calendar
                </button>
                <button
                  onClick={() => setActiveTab('capacity')}
                  className={[
                    'px-4 py-2 rounded-lg text-sm font-medium transition',
                    activeTab === 'capacity'
                      ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  ].join(' ')}
                >
                  📊 Capacity Planning
                </button>
              </div>

              {/* Filters */}
              {activeTab === 'calendar' && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showOnlyApproved}
                      onChange={(e) => setShowOnlyApproved(e.target.checked)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    Show only approved
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'calendar' && (
            <TeamCalendar 
              orgId={userRole.org_id} 
              showOnlyApproved={showOnlyApproved}
            />
          )}

          {activeTab === 'capacity' && (
            <CapacityPlanner orgId={userRole.org_id} />
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold mb-2">Manage Team</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                View and manage team members, roles, and departments
              </p>
              <button className="btn-secondary w-full">
                Go to Team Settings
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold mb-2">Review Requests</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Approve or deny pending leave requests from your team
              </p>
              <button className="btn-primary w-full">
                Review Approvals
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold mb-2">View Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate reports on team leave usage and trends
              </p>
              <button className="btn-secondary w-full">
                Generate Reports
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800/30">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Team Management Best Practices
                </h4>
                <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <p>• <strong>Plan ahead:</strong> Use the capacity planner to identify potential coverage gaps</p>
                  <p>• <strong>Monitor trends:</strong> Watch for patterns in leave requests across departments</p>
                  <p>• <strong>Communicate early:</strong> Notify teams about high-demand periods requiring coverage</p>
                  <p>• <strong>Cross-train:</strong> Ensure team members can cover critical functions</p>
                  <p>• <strong>Set policies:</strong> Establish clear guidelines for peak seasons and blackout dates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}