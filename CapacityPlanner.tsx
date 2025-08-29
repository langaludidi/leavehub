import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  department: string | null;
  role: string;
}

interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: string;
}

interface CapacityPlannerProps {
  orgId: string;
  lookAheadWeeks?: number;
}

async function fetchTeamData(orgId: string) {
  const { data: members, error: membersError } = await supabase
    .from('org_members')
    .select(`
      user_id,
      role,
      department,
      profiles!inner (
        id,
        full_name,
        email
      )
    `)
    .eq('org_id', orgId)
    .eq('active', true);

  if (membersError) throw membersError;

  return (members || []).map(member => ({
    id: member.user_id,
    full_name: member.profiles.full_name,
    email: member.profiles.email,
    department: member.department,
    role: member.role
  })) as TeamMember[];
}

async function fetchLeaveRequests(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('id, user_id, start_date, end_date, leave_type, status')
    .gte('start_date', startDate)
    .lte('end_date', endDate)
    .in('status', ['approved', 'pending']);

  if (error) throw error;
  return data as LeaveRequest[];
}

export default function CapacityPlanner({ orgId, lookAheadWeeks = 4 }: CapacityPlannerProps) {
  const startDate = startOfWeek(new Date());
  const endDate = endOfWeek(addDays(new Date(), lookAheadWeeks * 7));
  const weeks = [];
  
  let currentWeekStart = startDate;
  for (let i = 0; i < lookAheadWeeks; i++) {
    const weekEnd = endOfWeek(currentWeekStart);
    weeks.push({
      start: currentWeekStart,
      end: weekEnd,
      days: eachDayOfInterval({ start: currentWeekStart, end: weekEnd })
    });
    currentWeekStart = addDays(weekEnd, 1);
  }

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', orgId],
    queryFn: () => fetchTeamData(orgId)
  });

  const { data: leaveRequests } = useQuery({
    queryKey: ['leave-requests-capacity', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: () => fetchLeaveRequests(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
  });

  const capacityAnalysis = useMemo(() => {
    if (!teamMembers || !leaveRequests) return null;

    const departmentSizes: Record<string, number> = {};
    teamMembers.forEach(member => {
      const dept = member.department || 'Other';
      departmentSizes[dept] = (departmentSizes[dept] || 0) + 1;
    });

    const analysis = weeks.map(week => {
      const weekCapacity: Record<string, { total: number; available: number; coverage: number }> = {};
      
      // Initialize department capacity
      Object.keys(departmentSizes).forEach(dept => {
        weekCapacity[dept] = {
          total: departmentSizes[dept],
          available: departmentSizes[dept],
          coverage: 100
        };
      });

      // Calculate leave impact for each day of the week
      week.days.forEach(day => {
        const dayRequests = leaveRequests.filter(req => {
          const startDate = new Date(req.start_date);
          const endDate = new Date(req.end_date);
          return day >= startDate && day <= endDate && req.status === 'approved';
        });

        dayRequests.forEach(req => {
          const member = teamMembers.find(m => m.id === req.user_id);
          if (member) {
            const dept = member.department || 'Other';
            if (weekCapacity[dept]) {
              weekCapacity[dept].available = Math.max(0, weekCapacity[dept].available - (1/5)); // Assuming 5-day work week
            }
          }
        });
      });

      // Calculate coverage percentages
      Object.keys(weekCapacity).forEach(dept => {
        const capacity = weekCapacity[dept];
        capacity.coverage = (capacity.available / capacity.total) * 100;
      });

      return {
        week: week.start,
        weekEnd: week.end,
        capacity: weekCapacity,
        alerts: Object.entries(weekCapacity)
          .filter(([_, data]) => data.coverage < 70)
          .map(([dept, data]) => ({ department: dept, coverage: data.coverage }))
      };
    });

    return analysis;
  }, [teamMembers, leaveRequests, weeks]);

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    if (coverage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
  };

  const getCoverageIcon = (coverage: number) => {
    if (coverage >= 80) return '✅';
    if (coverage >= 60) return '⚠️';
    return '🚨';
  };

  if (!capacityAnalysis) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Capacity Planning</h3>
        </div>
        <div className="card-body">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Team Capacity Planning</h3>
          <p className="card-subtle">Track team coverage and identify potential staffing gaps</p>
        </div>

        <div className="card-body">
          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {teamMembers?.length || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Team Members</div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {capacityAnalysis.flatMap(w => w.alerts).length}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Coverage Alerts</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.keys(teamMembers?.reduce((acc, member) => {
                  const dept = member.department || 'Other';
                  acc[dept] = true;
                  return acc;
                }, {} as Record<string, boolean>) || {}).length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Departments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Capacity Breakdown */}
      <div className="space-y-4">
        {capacityAnalysis.map((weekData, index) => (
          <div key={index} className="card">
            <div className="card-header">
              <h4 className="font-medium">
                Week of {format(weekData.week, 'MMM dd')} - {format(weekData.weekEnd, 'MMM dd, yyyy')}
              </h4>
              {weekData.alerts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ {weekData.alerts.length} coverage alert{weekData.alerts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="card-body">
              {/* Department Breakdown */}
              <div className="space-y-3">
                {Object.entries(weekData.capacity).map(([department, data]) => (
                  <div key={department} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCoverageIcon(data.coverage)}</span>
                      <div>
                        <div className="font-medium">{department}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(data.available * 10) / 10} of {data.total} available
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={[
                        'inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border',
                        getCoverageColor(data.coverage)
                      ].join(' ')}>
                        {Math.round(data.coverage)}% Coverage
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alerts Section */}
              {weekData.alerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Coverage Concerns</h5>
                  <div className="space-y-2">
                    {weekData.alerts.map(alert => (
                      <div key={alert.department} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <span className="text-sm">
                          <strong>{alert.department}</strong> department is at {Math.round(alert.coverage)}% capacity
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Consider limiting additional leave approvals
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Capacity Planning Tips
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• <strong>Green (80%+):</strong> Healthy capacity, approvals can proceed normally</p>
                <p>• <strong>Yellow (60-80%):</strong> Monitor closely, consider staggered approvals</p>
                <p>• <strong>Red (&lt;60%):</strong> Critical shortage, limit new approvals or find coverage</p>
                <p>• Plan ahead: Review capacity before approving leave requests</p>
                <p>• Cross-train team members to provide backup coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}