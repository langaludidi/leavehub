import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  };
}

interface TeamCalendarProps {
  orgId?: string;
  showOnlyApproved?: boolean;
}

async function fetchTeamLeaveRequests(orgId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      id,
      user_id,
      start_date,
      end_date,
      leave_type,
      status,
      profiles!inner (
        full_name,
        email
      )
    `)
    .gte('start_date', startDate)
    .lte('end_date', endDate)
    .order('start_date');

  if (error) throw error;
  return data as LeaveRequest[];
}

export default function TeamCalendar({ orgId, showOnlyApproved = false }: TeamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['team-leave-requests', orgId, format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')],
    queryFn: () => fetchTeamLeaveRequests(orgId || '', format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')),
    enabled: !!orgId
  });

  const filteredRequests = useMemo(() => {
    if (!leaveRequests) return [];
    return showOnlyApproved 
      ? leaveRequests.filter(req => req.status === 'approved')
      : leaveRequests;
  }, [leaveRequests, showOnlyApproved]);

  const getRequestsForDay = (date: Date) => {
    return filteredRequests.filter(request => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getLeaveTypeColor = (leaveType: string) => {
    const colors: Record<string, string> = {
      vacation: 'bg-blue-500',
      sick: 'bg-red-500',
      personal: 'bg-yellow-500',
      maternity: 'bg-purple-500',
      bereavement: 'bg-gray-500'
    };
    return colors[leaveType] || 'bg-gray-400';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'border-green-400',
      pending: 'border-yellow-400',
      denied: 'border-red-400'
    };
    return colors[status] || 'border-gray-400';
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Team Calendar</h3>
        </div>
        <div className="card-body">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Team Calendar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ←
            </button>
            <h4 className="font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h4>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              →
            </button>
          </div>
        </div>
        <p className="card-subtle">View team leave coverage at a glance</p>
      </div>

      <div className="card-body">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Vacation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Sick</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Personal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Maternity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Bereavement</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map(date => {
            const dayRequests = getRequestsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toISOString()}
                className={[
                  'min-h-[80px] p-1 border border-gray-200 dark:border-gray-700 rounded',
                  isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800',
                  isToday && 'ring-2 ring-teal-400'
                ].join(' ')}
              >
                <div className={[
                  'text-sm font-medium mb-1',
                  isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600',
                  isToday && 'text-teal-600 dark:text-teal-400'
                ].join(' ')}>
                  {format(date, 'd')}
                </div>

                <div className="space-y-1">
                  {dayRequests.slice(0, 3).map(request => (
                    <div
                      key={request.id}
                      className={[
                        'text-xs px-1 py-0.5 rounded border-l-2 truncate',
                        'bg-gray-50 dark:bg-gray-800',
                        getStatusColor(request.status)
                      ].join(' ')}
                      title={`${request.profiles.full_name || request.profiles.email} - ${request.leave_type} (${request.status})`}
                    >
                      <div className="flex items-center gap-1">
                        <div className={[
                          'w-2 h-2 rounded-full',
                          getLeaveTypeColor(request.leave_type)
                        ].join(' ')}></div>
                        <span className="truncate">
                          {request.profiles.full_name || request.profiles.email?.split('@')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayRequests.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      +{dayRequests.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {filteredRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {new Set(filteredRequests.filter(r => r.status === 'approved').map(r => r.user_id)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {Math.max(...calendarDays.map(date => getRequestsForDay(date).filter(r => r.status === 'approved').length), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Max Out/Day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}