import React, { useState } from 'react'
import { LeaveRequestForm } from './LeaveRequestForm'

interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  employeeAvatar?: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  submittedDate: string
  approvedBy?: string
  approvedDate?: string
  comments?: string
  attachments?: string[]
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeName: 'John Smith',
    employeeId: 'EMP001',
    leaveType: 'Annual Leave',
    startDate: '2024-12-20',
    endDate: '2024-12-24',
    totalDays: 5,
    reason: 'Family vacation during the holidays',
    status: 'pending',
    submittedDate: '2024-11-15',
    attachments: ['flight-booking.pdf']
  },
  {
    id: '2',
    employeeName: 'Mary Davis',
    employeeId: 'EMP002',
    leaveType: 'Maternity Leave',
    startDate: '2025-01-15',
    endDate: '2025-05-15',
    totalDays: 120,
    reason: 'Maternity leave for newborn care (BCEA Section 25)',
    status: 'approved',
    submittedDate: '2024-10-01',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-10-03',
    comments: 'Approved. Congratulations! Please coordinate handover with team lead. UIF benefits may apply.'
  },
  {
    id: '3',
    employeeName: 'David Wilson',
    employeeId: 'EMP003',
    leaveType: 'Sick Leave',
    startDate: '2024-11-12',
    endDate: '2024-11-14',
    totalDays: 3,
    reason: 'Flu symptoms and doctor recommended rest',
    status: 'approved',
    submittedDate: '2024-11-12',
    approvedBy: 'Michael Brown',
    approvedDate: '2024-11-12',
    comments: 'Medical certificate required as per BCEA Section 23 (>2 consecutive days)',
    attachments: ['medical-certificate.pdf']
  },
  {
    id: '4',
    employeeName: 'Lisa Anderson',
    employeeId: 'EMP004',
    leaveType: 'Study Leave',
    startDate: '2024-12-01',
    endDate: '2024-12-05',
    totalDays: 5,
    reason: 'Attending professional development workshop',
    status: 'rejected',
    submittedDate: '2024-11-20',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-11-22',
    comments: 'Unfortunately, we cannot approve during peak project period. Please reschedule for January.'
  },
  {
    id: '5',
    employeeName: 'Peter Williams',
    employeeId: 'EMP005',
    leaveType: 'Family Responsibility Leave',
    startDate: '2024-11-18',
    endDate: '2024-11-20',
    totalDays: 3,
    reason: 'Child illness requiring parent care (BCEA Section 27)',
    status: 'approved',
    submittedDate: '2024-11-18',
    approvedBy: 'Michael Brown',
    approvedDate: '2024-11-18',
    comments: 'Auto-approved. No advance notice required for family emergencies.'
  },
  {
    id: '6',
    employeeName: 'James Thompson',
    employeeId: 'EMP006',
    leaveType: 'Paternity Leave',
    startDate: '2024-12-10',
    endDate: '2024-12-19',
    totalDays: 10,
    reason: 'Birth of child - paternity leave (BCEA Section 25A)',
    status: 'approved',
    submittedDate: '2024-11-10',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-11-12',
    comments: 'Congratulations! Full 10-day BCEA entitlement approved.'
  }
]

interface LeaveManagementProps {
  userRole: 'employee' | 'admin' | 'superadmin'
  currentUser?: string
}

export function LeaveManagement({ userRole, currentUser = 'John Smith' }: LeaveManagementProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]) 
  const [viewMode, setViewMode] = useState<'stats' | 'list'>(userRole === 'employee' ? 'list' : 'stats')
  const [dateRange, setDateRange] = useState<'this_week' | 'next_week' | 'this_month' | 'custom'>('this_week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const filteredRequests = mockLeaveRequests.filter(request => {
    if (userRole === 'employee' && request.employeeName !== currentUser) return false
    if (filterStatus === 'all') return true
    return request.status === filterStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLeaveTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual leave': return '🏖️'
      case 'sick leave': return '🤒'
      case 'maternity leave': return '👶'
      case 'paternity leave': return '👨‍👶'
      case 'adoption leave': return '👪'
      case 'family responsibility leave': return '👨‍👩‍👧‍👦'
      case 'study leave': return '📚'
      case 'compassionate leave': return '🕊️'
      case 'unpaid leave': return '🏃‍♂️'
      default: return '📅'
    }
  }

  const handleBulkAction = (action: 'approve' | 'reject') => {
    console.log(`${action} requests:`, selectedRequests)
    setSelectedRequests([])
  }

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const handleFormSubmit = (data: any) => {
    console.log('New leave request:', data)
    setShowForm(false)
  }

  // Calculate stats for dashboard
  const getLeaveStats = () => {
    const totalRequests = mockLeaveRequests.length
    const pendingRequests = mockLeaveRequests.filter(r => r.status === 'pending').length
    const approvedRequests = mockLeaveRequests.filter(r => r.status === 'approved').length
    const rejectedRequests = mockLeaveRequests.filter(r => r.status === 'rejected').length
    
    // Calculate leave type distribution
    const leaveTypeStats = mockLeaveRequests.reduce((acc, request) => {
      acc[request.leaveType] = (acc[request.leaveType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Calculate average processing time (mock data)
    const avgProcessingTime = mockLeaveRequests
      .filter(r => r.approvedDate)
      .reduce((acc, r) => {
        const submitted = new Date(r.submittedDate)
        const approved = new Date(r.approvedDate!)
        return acc + (approved.getTime() - submitted.getTime())
      }, 0) / mockLeaveRequests.filter(r => r.approvedDate).length || 0
    
    const avgDays = Math.round(avgProcessingTime / (1000 * 60 * 60 * 24))
    
    // Calculate total days requested this year
    const totalDaysRequested = mockLeaveRequests.reduce((acc, r) => acc + r.totalDays, 0)
    
    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      leaveTypeStats,
      avgProcessingDays: avgDays || 2,
      totalDaysRequested
    }
  }

  const stats = getLeaveStats()

  // Helper function to get date range
  const getDateRange = () => {
    const today = new Date()
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay()) // Sunday
    const currentWeekEnd = new Date(currentWeekStart)
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6) // Saturday

    switch (dateRange) {
      case 'this_week':
        return { start: currentWeekStart, end: currentWeekEnd }
      case 'next_week':
        const nextWeekStart = new Date(currentWeekStart)
        nextWeekStart.setDate(currentWeekStart.getDate() + 7)
        const nextWeekEnd = new Date(nextWeekStart)
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6)
        return { start: nextWeekStart, end: nextWeekEnd }
      case 'this_month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { start: monthStart, end: monthEnd }
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : currentWeekStart,
          end: customEndDate ? new Date(customEndDate) : currentWeekEnd
        }
      default:
        return { start: currentWeekStart, end: currentWeekEnd }
    }
  }

  // Get leaves for the selected date range
  const getTimelineLeavesData = () => {
    const { start, end } = getDateRange()
    
    const timelineLeaves = mockLeaveRequests.filter(request => {
      const startDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)
      
      // Check if leave overlaps with selected date range
      return (startDate <= end && endDate >= start) && request.status === 'approved'
    })

    // Group by date for timeline view
    const leavesByDate = timelineLeaves.reduce((acc, leave) => {
      const startDate = new Date(Math.max(new Date(leave.startDate).getTime(), start.getTime()))
      const endDate = new Date(Math.min(new Date(leave.endDate).getTime(), end.getTime()))
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]
        if (!acc[dateKey]) {
          acc[dateKey] = []
        }
        if (!acc[dateKey].some(l => l.id === leave.id)) {
          acc[dateKey].push(leave)
        }
      }
      return acc
    }, {} as Record<string, typeof mockLeaveRequests>)

    return { timelineLeaves, leavesByDate, dateRange: { start, end } }
  }

  const timelineData = getTimelineLeavesData()

  return (
    <>
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {userRole === 'employee' ? 'My Leave Requests' : 'Leave Management Dashboard'}
            </h1>
            <p className="text-lg text-gray-700 font-medium">
              {userRole === 'employee' 
                ? 'Track your time off and manage your work-life balance'
                : 'Streamline your team\'s leave requests and approvals'
              }
            </p>
            {userRole === 'employee' && (
              <div className="flex items-center space-x-4 mt-4">
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-indigo-100">
                  <span className="text-sm font-medium text-gray-600">Available Balance</span>
                  <p className="text-lg font-bold text-indigo-600">18.5 days</p>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Used This Year</span>
                  <p className="text-lg font-bold text-green-600">6.5 days</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {userRole === 'employee' && (
              <button
                onClick={() => setShowForm(true)}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 font-semibold"
              >
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Request</span>
              </button>
            )}
            
            {userRole !== 'employee' && selectedRequests.length > 0 && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approve ({selectedRequests.length})</span>
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-rose-600 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Reject ({selectedRequests.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Dashboard */}
      {userRole !== 'employee' && viewMode === 'stats' && (
        <div className="space-y-6">
          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-premium shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.totalRequests}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100">
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Days</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.totalDaysRequested}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-premium shadow-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Processing Time</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgProcessingDays}</p>
                    <p className="text-sm text-gray-600">days</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-slate-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approval Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.round((stats.approvedRequests / stats.totalRequests) * 100)}%</p>
                    <p className="text-sm text-gray-600">this period</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.rejectedRequests}</p>
                    <p className="text-sm text-gray-600">requests</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Type Distribution Chart */}
          <div className="card-premium shadow-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Leave Type Distribution</h3>
              <p className="text-gray-600 mt-1">Breakdown of leave requests by type</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.leaveTypeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getLeaveTypeIcon(type)}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{type}</p>
                        <p className="text-xs text-gray-600">{Math.round((count / stats.totalRequests) * 100)}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{count}</p>
                      <p className="text-xs text-gray-500">requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Leaves Card with Customizable Date Range */}
          <div className="card-premium shadow-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {dateRange === 'this_week' ? 'This Week\'s Leaves' :
                     dateRange === 'next_week' ? 'Next Week\'s Leaves' :
                     dateRange === 'this_month' ? 'This Month\'s Leaves' :
                     'Custom Period Leaves'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {timelineData.dateRange.start.toLocaleDateString()} - {timelineData.dateRange.end.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="this_week">This Week</option>
                    <option value="next_week">Next Week</option>
                    <option value="this_month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Custom Date Range Inputs */}
              {dateRange === 'custom' && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {timelineData.timelineLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No approved leaves found</h4>
                  <p className="text-gray-600">No approved leave requests in the selected period</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Timeline Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Approved Leaves</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {timelineData.timelineLeaves.length} employee{timelineData.timelineLeaves.length !== 1 ? 's' : ''} out
                      </span>
                    </div>
                  </div>

                  {/* Timeline Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timelineData.timelineLeaves.map((leave) => (
                      <div key={leave.id} className="bg-gradient-to-r from-white to-green-50 rounded-xl border border-green-100 p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {leave.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{leave.employeeName}</h5>
                            <p className="text-sm text-gray-600">{leave.employeeId}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getLeaveTypeIcon(leave.leaveType)}</span>
                            <span className="text-sm font-medium text-gray-900">{leave.leaveType}</span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Approved
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Daily Breakdown (for current week view) */}
                  {dateRange === 'this_week' && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Daily Breakdown</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = new Date(timelineData.dateRange.start)
                          date.setDate(date.getDate() + i)
                          const dateKey = date.toISOString().split('T')[0]
                          const dayLeaves = timelineData.leavesByDate[dateKey] || []
                          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
                          
                          return (
                            <div key={i} className="text-center">
                              <div className="text-xs font-semibold text-gray-600 mb-2">{dayName}</div>
                              <div className="text-sm font-bold text-gray-900 mb-1">{date.getDate()}</div>
                              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-semibold ${ 
                                dayLeaves.length > 0 
                                  ? 'bg-orange-100 text-orange-700' 
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                {dayLeaves.length > 0 ? dayLeaves.length : '•'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-600 mt-3 text-center">
                        Numbers indicate employees on leave that day
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6">
            {/* View Mode Toggle */}
            {userRole !== 'employee' && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900">Dashboard View</label>
                  <div className="mt-1 flex bg-gray-100 rounded-lg p-1 space-x-1">
                    <button
                      onClick={() => setViewMode('stats')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                        viewMode === 'stats'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📊 Stats
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📋 List
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {viewMode === 'list' && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="mt-1 block bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="approved">✅ Approved</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {viewMode === 'list' && (
              <div className="text-sm font-medium text-gray-600 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                Showing <span className="font-bold text-indigo-600">{filteredRequests.length}</span> of <span className="font-bold text-gray-900">{mockLeaveRequests.length}</span> requests
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Leave Requests */}
      {(viewMode === 'list' || userRole === 'employee') && (
      <div>
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-lg text-gray-600 mb-6">
              {userRole === 'employee' 
                ? 'Ready to take some time off? Submit your first leave request!'
                : 'No leave requests match your current filters.'
              }
            </p>
            {userRole === 'employee' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Submit Your First Request
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {userRole !== 'employee' && (
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.id)}
                          onChange={() => toggleRequestSelection(request.id)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 transition-all duration-200"
                        />
                      )}
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                          {request.employeeName}
                        </h4>
                        {userRole !== 'employee' && (
                          <p className="text-sm text-gray-500 font-medium">{request.employeeId}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-sm ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  {/* Leave Type and Duration */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getLeaveTypeIcon(request.leaveType)}</span>
                      <div>
                        <h5 className="text-lg font-bold text-gray-900">{request.leaveType}</h5>
                        <p className="text-sm font-medium text-gray-600">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-indigo-600">{request.totalDays}</span>
                      <span className="text-sm font-medium text-gray-600">{request.totalDays === 1 ? 'day' : 'days'}</span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-4">
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Reason</h6>
                    <p className="text-gray-600 text-sm leading-relaxed">{request.reason}</p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">Submitted</span>
                      <span>{new Date(request.submittedDate).toLocaleDateString()}</span>
                    </div>
                    {request.approvedDate && (
                      <div className="flex items-center justify-between text-xs text-green-600">
                        <span className="font-medium">Approved</span>
                        <span>{new Date(request.approvedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {request.attachments && request.attachments.length > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="font-medium">{request.attachments.length} attachment{request.attachments.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Details</span>
                    </button>
                    
                    {userRole !== 'employee' && request.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Approve</span>
                        </button>
                        <button className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Leave Request Form Modal */}
      {showForm && (
        <LeaveRequestForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Leave Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Employee</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.employeeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Leave Type</label>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-xl">{getLeaveTypeIcon(selectedRequest.leaveType)}</span>
                  <span className="text-gray-900">{selectedRequest.leaveType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Start Date</label>
                  <p className="mt-1 text-gray-900">{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">End Date</label>
                  <p className="mt-1 text-gray-900">{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Total Days</label>
                <p className="mt-1 text-gray-900 font-semibold">{selectedRequest.totalDays} {selectedRequest.totalDays === 1 ? 'day' : 'days'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Reason</label>
                <p className="mt-1 text-gray-900">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Attachments</label>
                  <div className="mt-1 space-y-2">
                    {selectedRequest.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.comments && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Comments</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.comments}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}