'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
} from 'lucide-react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from 'date-fns';

interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  working_days: number;
  status: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  leave_type: {
    name: string;
    code: string;
    color: string;
  };
}

export default function TeamCalendarPage() {
  const userId = 'demo-user-123';
  const managerId = userId;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchLeaveRequests();
  }, [managerId]);

  async function fetchLeaveRequests() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/team/requests?managerId=${managerId}&status=approved`
      );
      const data = await response.json();

      if (data.requests) {
        setLeaveRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  }

  function getLeaveForDate(date: Date): LeaveRequest[] {
    return leaveRequests.filter((request) =>
      isWithinInterval(date, {
        start: new Date(request.start_date),
        end: new Date(request.end_date),
      })
    );
  }

  function previousMonth() {
    setCurrentMonth(subMonths(currentMonth, 1));
  }

  function nextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  function goToToday() {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedLeave = selectedDate ? getLeaveForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userId={userId} userName="Demo Manager" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading calendar...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userId={userId} userName="Demo Manager" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/manager">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Calendar</h1>
          <p className="text-gray-600">View all team leave in a calendar view</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day) => {
                  const leaveOnDay = getLeaveForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[80px] p-2 border rounded-lg transition-all relative
                        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                        ${isToday ? 'border-primary border-2' : 'border-gray-200'}
                        ${isSelected ? 'ring-2 ring-primary' : ''}
                        ${leaveOnDay.length > 0 ? 'hover:shadow-md' : 'hover:border-gray-300'}
                      `}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>

                      {leaveOnDay.length > 0 && (
                        <div className="space-y-1">
                          {leaveOnDay.slice(0, 2).map((leave) => (
                            <div
                              key={leave.id}
                              className="text-xs px-1 py-0.5 rounded truncate"
                              style={{
                                backgroundColor: `${leave.leave_type.color}20`,
                                color: leave.leave_type.color,
                              }}
                              title={`${leave.user.first_name} ${leave.user.last_name} - ${leave.leave_type.name}`}
                            >
                              {leave.user.first_name.charAt(0)}
                              {leave.user.last_name.charAt(0)}
                            </div>
                          ))}
                          {leaveOnDay.length > 2 && (
                            <div className="text-xs text-gray-600 font-medium">
                              +{leaveOnDay.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">
                  Leave Types
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Array.from(
                    new Map(
                      leaveRequests.map((req) => [
                        req.leave_type.code,
                        req.leave_type,
                      ])
                    ).values()
                  ).map((type) => (
                    <div key={type.code} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Selected Date Info */}
          <div>
            <Card className="p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {selectedDate
                    ? format(selectedDate, 'MMMM d, yyyy')
                    : 'Select a date'}
                </h3>
              </div>

              {!selectedDate ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    Click on a date to see who&apos;s on leave
                  </p>
                </div>
              ) : selectedLeave.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No one on leave</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Full team available
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">
                      {selectedLeave.length} on leave
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedLeave.map((leave) => (
                      <div key={leave.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">
                              {leave.user.first_name} {leave.user.last_name}
                            </h4>
                            <div
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mb-2"
                              style={{
                                backgroundColor: `${leave.leave_type.color}15`,
                                color: leave.leave_type.color,
                              }}
                            >
                              {leave.leave_type.name}
                            </div>
                            <p className="text-xs text-gray-600">
                              {format(new Date(leave.start_date), 'MMM d')} -{' '}
                              {format(new Date(leave.end_date), 'MMM d')}
                              <span className="text-gray-500">
                                {' '}
                                ({leave.working_days} days)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
