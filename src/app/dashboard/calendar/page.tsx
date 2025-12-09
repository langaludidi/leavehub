'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Download,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
  isWithinInterval,
} from 'date-fns';
interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  working_days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  leave_types: {
    name: string;
    code: string;
    color: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
  };
}

interface DayLeave {
  date: Date;
  leaves: LeaveRequest[];
  isCurrentMonth: boolean;
}

export default function CalendarPage() {
  // Use demo user ID for now (same as dashboard)
  const userId = 'demo-user-123';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my-team' | 'my-leaves'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('approved');
  const [selectedDay, setSelectedDay] = useState<DayLeave | null>(null);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('userId', userId);
      params.append('filter', filter);
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/calendar/leave-data?${params}`);
      const data = await response.json();

      if (data.leaveRequests) {
        setLeaveRequests(data.leaveRequests);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, filter, statusFilter]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  function getDaysInMonth(date: Date): DayLeave[] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: DayLeave[] = [];
    let currentDay = calendarStart;

    while (currentDay <= calendarEnd) {
      const dayLeaves = leaveRequests.filter((leave) => {
        const leaveStart = parseISO(leave.start_date);
        const leaveEnd = parseISO(leave.end_date);
        return isWithinInterval(currentDay, { start: leaveStart, end: leaveEnd });
      });

      days.push({
        date: currentDay,
        leaves: dayLeaves,
        isCurrentMonth: isSameMonth(currentDay, date),
      });

      currentDay = addDays(currentDay, 1);
    }

    return days;
  }

  function getDaysInWeek(date: Date): DayLeave[] {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    const days: DayLeave[] = [];
    let currentDay = weekStart;

    while (currentDay <= weekEnd) {
      const dayLeaves = leaveRequests.filter((leave) => {
        const leaveStart = parseISO(leave.start_date);
        const leaveEnd = parseISO(leave.end_date);
        return isWithinInterval(currentDay, { start: leaveStart, end: leaveEnd });
      });

      days.push({
        date: currentDay,
        leaves: dayLeaves,
        isCurrentMonth: true,
      });

      currentDay = addDays(currentDay, 1);
    }

    return days;
  }

  function goToPreviousPeriod() {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  }

  function goToNextPeriod() {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const days = view === 'month' ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Calendar</h1>
            <p className="text-gray-600">View and manage team leave schedules</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousPeriod}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextPeriod}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Date Display */}
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                onClick={() => setView('month')}
                size="sm"
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                onClick={() => setView('week')}
                size="sm"
              >
                Week
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'my-team' | 'my-leaves')}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Leaves</option>
                <option value="my-team">My Team</option>
                <option value="my-leaves">My Leaves Only</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved')}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>

            {/* Export Button */}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-600">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-400"></div>
              <span className="text-sm text-gray-600">Rejected</span>
            </div>
          </div>
        </Card>

        {/* Calendar Grid */}
        {loading ? (
          <Card className="p-12">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-3 text-gray-600">Loading calendar...</p>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-700 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayData, index) => {
                const isCurrentDay = isToday(dayData.date);
                const hasLeaves = dayData.leaves.length > 0;

                return (
                  <div
                    key={index}
                    onClick={() => hasLeaves && setSelectedDay(dayData)}
                    className={`
                      min-h-24 p-2 border rounded-lg transition-all cursor-pointer
                      ${
                        !dayData.isCurrentMonth
                          ? 'bg-gray-50 text-gray-400'
                          : 'bg-white hover:bg-gray-50'
                      }
                      ${isCurrentDay ? 'border-primary border-2' : 'border-gray-200'}
                      ${hasLeaves ? 'cursor-pointer hover:shadow-md' : ''}
                    `}
                  >
                    {/* Day Number */}
                    <div
                      className={`
                        text-sm font-medium mb-1
                        ${isCurrentDay ? 'text-primary font-bold' : ''}
                        ${!dayData.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                      `}
                    >
                      {format(dayData.date, 'd')}
                    </div>

                    {/* Leave Indicators */}
                    {dayData.leaves.length > 0 && (
                      <div className="space-y-1">
                        {dayData.leaves.slice(0, 3).map((leave) => (
                          <div
                            key={leave.id}
                            className={`
                              px-2 py-1 rounded text-xs font-medium text-white truncate
                              ${
                                leave.status === 'approved'
                                  ? 'bg-green-500'
                                  : leave.status === 'pending'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                              }
                            `}
                            style={
                              leave.status === 'approved'
                                ? { backgroundColor: leave.leave_types.color }
                                : undefined
                            }
                          >
                            {leave.profiles.first_name} {leave.profiles.last_name.charAt(0)}.
                          </div>
                        ))}
                        {dayData.leaves.length > 3 && (
                          <div className="text-xs text-gray-600 text-center">
                            +{dayData.leaves.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Day Detail Modal */}
        {selectedDay && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDay(null)}
          >
            <Card
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedDay.leaves.length} team member(s) on leave
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedDay(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedDay.leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: leave.leave_types.color }}
                          >
                            {leave.profiles.first_name.charAt(0)}
                            {leave.profiles.last_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {leave.profiles.first_name} {leave.profiles.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {leave.profiles.department || 'Unknown Department'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${
                              leave.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : leave.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          `}
                        >
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Leave Type:</span>
                          <span
                            className="px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: leave.leave_types.color }}
                          >
                            {leave.leave_types.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Duration:</span>
                          <span className="text-gray-600">
                            {format(parseISO(leave.start_date), 'MMM d')} -{' '}
                            {format(parseISO(leave.end_date), 'MMM d, yyyy')} (
                            {leave.working_days} days)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-gray-700">Reason:</span>
                          <span className="text-gray-600">{leave.reason}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && leaveRequests.length === 0 && (
          <Card className="p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No leave requests found
            </h3>
            <p className="text-gray-600">
              There are no approved leave requests for the selected period.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
