import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface EmployeeInvite {
  email: string
  firstName: string
  lastName: string
  department: string
  position: string
  branch: string
  manager: string
}

interface PendingInvitation {
  id: string
  email: string
  firstName: string
  lastName: string
  department: string
  position: string
  branch: string
  manager: string
  inviteCode: string
  sentDate: string
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
}

const mockPendingInvitations: PendingInvitation[] = [
  {
    id: '1',
    email: 'alice.johnson@company.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    department: 'Engineering',
    position: 'Frontend Developer',
    branch: 'Head Office',
    manager: 'Sarah Johnson',
    inviteCode: 'INV-ABC123',
    sentDate: '2024-12-10',
    status: 'pending',
    expiresAt: '2024-12-17'
  },
  {
    id: '2',
    email: 'bob.wilson@company.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    department: 'Marketing',
    position: 'Content Writer',
    branch: 'Remote',
    manager: 'Michael Brown',
    inviteCode: 'INV-DEF456',
    sentDate: '2024-12-09',
    status: 'accepted',
    expiresAt: '2024-12-16'
  }
]

export function InviteEmployees({ userRole = 'admin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'pending'>('single')
  const [singleInvite, setSingleInvite] = useState<EmployeeInvite>({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    branch: '',
    manager: ''
  })
  const [bulkEmails, setBulkEmails] = useState('')
  const [pendingInvitations, setPendingInvitations] = useState(mockPendingInvitations)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
  const branches = ['Head Office', 'Branch A', 'Branch B', 'Remote']
  const managers = ['Sarah Johnson', 'Michael Brown', 'David Lee', 'Emma Wilson']

  const generateInviteCode = () => {
    return 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  const handleSingleInvite = async () => {
    if (!singleInvite.email || !singleInvite.firstName || !singleInvite.lastName) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newInvitation: PendingInvitation = {
        id: Date.now().toString(),
        ...singleInvite,
        inviteCode: generateInviteCode(),
        sentDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      
      setPendingInvitations([newInvitation, ...pendingInvitations])
      setSingleInvite({
        email: '',
        firstName: '',
        lastName: '',
        department: '',
        position: '',
        branch: '',
        manager: ''
      })
      setSuccess(`Invitation sent to ${singleInvite.email} successfully!`)
      
    } catch (err) {
      setError('Failed to send invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkInvite = async () => {
    const emails = bulkEmails.split('\n').filter(email => email.trim() && email.includes('@'))
    
    if (emails.length === 0) {
      setError('Please enter valid email addresses')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newInvitations = emails.map(email => ({
        id: Date.now().toString() + Math.random(),
        email: email.trim(),
        firstName: '',
        lastName: '',
        department: '',
        position: '',
        branch: '',
        manager: '',
        inviteCode: generateInviteCode(),
        sentDate: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
      
      setPendingInvitations([...newInvitations, ...pendingInvitations])
      setBulkEmails('')
      setSuccess(`${emails.length} invitations sent successfully!`)
      
    } catch (err) {
      setError('Failed to send bulk invitations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendInvite = async (invitationId: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPendingInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, sentDate: new Date().toISOString().split('T')[0], expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            : inv
        )
      )
      setSuccess('Invitation resent successfully!')
    } catch (err) {
      setError('Failed to resend invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvite = async (invitationId: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      setSuccess('Invitation cancelled successfully!')
    } catch (err) {
      setError('Failed to cancel invitation')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'accepted': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'expired': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl heading-premium text-gray-900 dark:text-gray-100">Invite Employees</h1>
            <p className="text-premium text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Send invitations to new employees to join your organization</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm sm:text-base text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('single'); setError(''); setSuccess('') }}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 rounded-lg transition-all ${
              activeTab === 'single'
                ? 'bg-white dark:bg-gray-700 text-indigo-900 dark:text-indigo-300 shadow-md font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-base sm:text-lg">👤</span>
            <span className="text-premium text-xs sm:text-sm lg:text-base">Single Invite</span>
          </button>
          <button
            onClick={() => { setActiveTab('bulk'); setError(''); setSuccess('') }}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 rounded-lg transition-all ${
              activeTab === 'bulk'
                ? 'bg-white dark:bg-gray-700 text-indigo-900 dark:text-indigo-300 shadow-md font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-base sm:text-lg">👥</span>
            <span className="text-premium text-xs sm:text-sm lg:text-base">Bulk Invite</span>
          </button>
          <button
            onClick={() => { setActiveTab('pending'); setError(''); setSuccess('') }}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-gray-700 text-indigo-900 dark:text-indigo-300 shadow-md font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="text-base sm:text-lg">⏳</span>
            <span className="text-premium text-xs sm:text-sm lg:text-base">Pending ({pendingInvitations.filter(inv => inv.status === 'pending').length})</span>
          </button>
        </div>

        {/* Single Invite Tab */}
        {activeTab === 'single' && (
          <div className="card-premium shadow-xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Invite Single Employee</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={singleInvite.email}
                  onChange={(e) => setSingleInvite({ ...singleInvite, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                  placeholder="employee@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={singleInvite.firstName}
                  onChange={(e) => setSingleInvite({ ...singleInvite, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={singleInvite.lastName}
                  onChange={(e) => setSingleInvite({ ...singleInvite, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                  placeholder="Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Department
                </label>
                <select
                  value={singleInvite.department}
                  onChange={(e) => setSingleInvite({ ...singleInvite, department: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={singleInvite.position}
                  onChange={(e) => setSingleInvite({ ...singleInvite, position: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                  placeholder="Software Developer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Branch
                </label>
                <select
                  value={singleInvite.branch}
                  onChange={(e) => setSingleInvite({ ...singleInvite, branch: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                >
                  <option value="">Select branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Manager
                </label>
                <select
                  value={singleInvite.manager}
                  onChange={(e) => setSingleInvite({ ...singleInvite, manager: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                >
                  <option value="">Select manager</option>
                  {managers.map(manager => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8">
              <button
                onClick={handleSingleInvite}
                disabled={loading}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        )}

        {/* Bulk Invite Tab */}
        {activeTab === 'bulk' && (
          <div className="card-premium shadow-xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Bulk Invite Employees</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Addresses
                </label>
                <textarea
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                  rows={8}
                  placeholder="Enter email addresses, one per line:
john.doe@company.com
jane.smith@company.com
bob.wilson@company.com"
                />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Enter one email address per line. Employee details can be updated after they accept the invitation.
                </p>
              </div>
              
              <div>
                <button
                  onClick={handleBulkInvite}
                  disabled={loading || !bulkEmails.trim()}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Sending Invitations...' : 'Send Bulk Invitations'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Invitations Tab */}
        {activeTab === 'pending' && (
          <div className="card-premium shadow-xl">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Pending Invitations</h2>
              <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Manage sent invitations and track their status</p>
            </div>
            
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              {pendingInvitations.map(invitation => (
                <div key={invitation.id} className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="heading-premium text-gray-900 dark:text-gray-100 font-medium">
                        {invitation.firstName} {invitation.lastName}
                      </h3>
                      <p className="text-premium text-gray-600 dark:text-gray-400 text-xs truncate">{invitation.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                      {invitation.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Department</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 text-sm">{invitation.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Position</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 text-sm">{invitation.position || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Invite Code</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 text-sm font-mono">{invitation.inviteCode}</p>
                    </div>
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Expires</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 text-sm">{new Date(invitation.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {invitation.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => handleResendInvite(invitation.id)}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleCancelInvite(invitation.id)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invite Code</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingInvitations.map(invitation => (
                    <tr key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {invitation.firstName} {invitation.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{invitation.email}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{invitation.department || '-'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{invitation.position || 'Not specified'}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{invitation.inviteCode}</code>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(invitation.sentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                          {invitation.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {invitation.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleResendInvite(invitation.id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium"
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => handleCancelInvite(invitation.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pendingInvitations.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No pending invitations</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}