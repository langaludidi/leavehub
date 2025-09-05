import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface CalendarEvent {
  id: string
  title: string
  employee: string
  startDate: string
  endDate: string
  type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'other'
  status: 'approved' | 'pending'
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Annual Leave',
    employee: 'John Smith',
    startDate: '2024-12-20',
    endDate: '2024-12-24',
    type: 'annual',
    status: 'approved'
  },
  {
    id: '2', 
    title: 'Maternity Leave',
    employee: 'Mary Davis',
    startDate: '2025-01-15',
    endDate: '2025-04-15',
    type: 'maternity',
    status: 'approved'
  },
  {
    id: '3',
    title: 'Sick Leave',
    employee: 'David Wilson',
    startDate: '2024-12-15',
    endDate: '2024-12-15',
    type: 'sick',
    status: 'pending'
  }
]

interface TeamCalendarProps {
  userRole: 'employee' | 'admin' | 'superadmin'
}

export function TeamCalendar({ userRole }: TeamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'sick': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'maternity': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'paternity': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-16 sm:h-24 lg:h-32 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"></div>
      )
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEvents = mockEvents.filter(event => {
        const eventStart = new Date(event.startDate)
        const eventEnd = new Date(event.endDate)
        const currentDay = new Date(dateStr)
        return currentDay >= eventStart && currentDay <= eventEnd
      })
      
      days.push(
        <div key={day} className="h-16 sm:h-24 lg:h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1 sm:p-2 overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 mb-1">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, viewMode === 'month' ? 1 : 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded border ${getTypeColor(event.type)} truncate`}
                title={`${event.employee} - ${event.title}`}
              >
                <span className="hidden sm:inline">{event.employee}</span>
                <span className="sm:hidden">{event.employee.split(' ')[0]}</span>
              </div>
            ))}
            {dayEvents.length > (viewMode === 'month' ? 1 : 2) && (
              <div className="text-xs text-gray-500 dark:text-gray-400">+{dayEvents.length - (viewMode === 'month' ? 1 : 2)} more</div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl heading-premium text-gray-900 dark:text-gray-100">Team Calendar</h1>
            <p className="text-premium text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">View team availability and leave schedules</p>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        <div className="card-premium shadow-xl">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button className="btn-premium bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-indigo-700 shadow-lg text-sm sm:text-base">
              Today
            </button>
          </div>

          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-7 gap-px mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="p-1 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600">
              {renderCalendarGrid()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 card-premium shadow-xl">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Upcoming Leave</h2>
              <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Next 30 days</p>
            </div>
            <div className="p-4 sm:p-8">
              <div className="space-y-3 sm:space-y-4">
                {mockEvents
                  .filter(event => new Date(event.startDate) > new Date())
                  .map(event => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {event.employee.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{event.employee}</h3>
                        <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{event.title}</p>
                        <p className="text-premium text-gray-500 dark:text-gray-500 text-xs">
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(event.type)} self-start sm:self-center`}>
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-premium shadow-xl">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Team Capacity</h2>
              <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Current availability</p>
            </div>
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl heading-premium text-indigo-600 dark:text-indigo-400 mb-2">87%</div>
                <p className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Available Today</p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-premium text-gray-600 dark:text-gray-400">Engineering</span>
                    <span className="heading-premium text-gray-900 dark:text-gray-100">12/15</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-premium text-gray-600 dark:text-gray-400">Marketing</span>
                    <span className="heading-premium text-gray-900 dark:text-gray-100">8/8</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-premium text-gray-600 dark:text-gray-400">Sales</span>
                    <span className="heading-premium text-gray-900 dark:text-gray-100">6/10</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}