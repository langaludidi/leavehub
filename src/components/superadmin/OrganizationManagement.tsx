import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface Organization {
  id: string
  name: string
  plan: 'Starter' | 'Professional' | 'Enterprise'
  employees: number
  monthlyRevenue: number
  status: 'active' | 'inactive' | 'trial'
  joinDate: string
  contactEmail: string
  usage: number
}

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    plan: 'Enterprise',
    employees: 247,
    monthlyRevenue: 2890,
    status: 'active',
    joinDate: '2023-08-15',
    contactEmail: 'admin@techcorp.com',
    usage: 92
  },
  {
    id: '2',
    name: 'MegaCorp Industries',
    plan: 'Enterprise',
    employees: 425,
    monthlyRevenue: 3210,
    status: 'active',
    joinDate: '2023-06-10',
    contactEmail: 'billing@megacorp.com',
    usage: 87
  },
  {
    id: '3',
    name: 'SmallBiz Co.',
    plan: 'Professional',
    employees: 89,
    monthlyRevenue: 1450,
    status: 'active',
    joinDate: '2023-11-03',
    contactEmail: 'owner@smallbiz.com',
    usage: 78
  },
  {
    id: '4',
    name: 'StartupX',
    plan: 'Starter',
    employees: 15,
    monthlyRevenue: 290,
    status: 'trial',
    joinDate: '2024-01-20',
    contactEmail: 'founder@startupx.com',
    usage: 45
  }
]

export function OrganizationManagement({ userRole = 'superadmin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations)
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'trial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800'
      case 'Professional': return 'bg-blue-100 text-blue-800'
      case 'Starter': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = planFilter === 'all' || org.plan === planFilter
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter
    return matchesSearch && matchesPlan && matchesStatus
  })

  const totalRevenue = organizations.reduce((sum, org) => sum + org.monthlyRevenue, 0)
  const totalEmployees = organizations.reduce((sum, org) => sum + org.employees, 0)
  const activeOrgs = organizations.filter(org => org.status === 'active').length

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl heading-premium text-gray-900 dark:text-gray-100">Organization Management</h1>
            <p className="text-premium text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Manage organizations, subscriptions, and enterprise accounts</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button 
              onClick={() => handleExport('csv')}
              className="btn-premium bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-green-700 shadow-lg flex items-center justify-center sm:justify-start space-x-2 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="btn-premium bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-red-700 shadow-lg flex items-center justify-center sm:justify-start space-x-2 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-premium bg-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center sm:justify-start space-x-2 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Add Org</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card-premium shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">{organizations.length}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Total Organizations</div>
                <div className="text-premium text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">+2 this month</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">{activeOrgs}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Active Organizations</div>
                <div className="text-premium text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">98% uptime</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">{totalEmployees.toLocaleString()}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Total Employees</div>
                <div className="text-premium text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">Across all orgs</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">R{totalRevenue.toLocaleString()}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Monthly Revenue</div>
                <div className="text-premium text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">+18% this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Filter Cards - Clickable drill-down */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {['Enterprise', 'Professional', 'Starter'].map(plan => {
            const planOrgs = organizations.filter(org => org.plan === plan)
            const planRevenue = planOrgs.reduce((sum, org) => sum + org.monthlyRevenue, 0)
            const isActive = planFilter === plan
            return (
              <div 
                key={plan}
                className={`card-premium shadow-lg p-4 sm:p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl border-2 ${
                  isActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400' : 'border-transparent hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
                onClick={() => handlePlanFilter(plan)}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg heading-premium text-gray-900 dark:text-gray-100 font-bold">{plan} Plan</h3>
                  <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getPlanColor(plan)}`}>
                    {planOrgs.length} orgs
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Organizations:</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{planOrgs.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly Revenue:</span>
                    <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">R{planRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg. Employees:</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{Math.round(planOrgs.reduce((sum, org) => sum + org.employees, 0) / planOrgs.length) || 0}</span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 text-center">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {isActive ? '✓ Viewing this plan' : 'Click to filter'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="card-premium shadow-xl p-4 sm:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4 lg:gap-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
              />
            </div>
            <div className="sm:w-40 lg:w-48">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
              >
                <option value="all">All Plans</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Professional">Professional</option>
                <option value="Starter">Starter</option>
              </select>
            </div>
            <div className="sm:w-40 lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="card-premium shadow-xl">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Organizations</h2>
            <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Showing {filteredOrganizations.length} of {organizations.length} organizations
            </p>
          </div>
          
          {/* Mobile Cards */}
          <div className="block sm:hidden">
            {filteredOrganizations.map(org => (
              <div key={org.id} className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {org.name.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-premium text-gray-900 dark:text-gray-100 font-medium">{org.name}</h3>
                    <p className="text-premium text-gray-600 dark:text-gray-400 text-xs truncate">{org.contactEmail}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(org.status)}`}>
                    {org.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Plan</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(org.plan)}`}>
                        {org.plan}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Employees</span>
                    <p className="text-premium text-gray-900 dark:text-gray-100 font-semibold mt-1">{org.employees}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Revenue</span>
                    <p className="text-premium text-gray-900 dark:text-gray-100 font-semibold mt-1">R{org.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Usage</span>
                    <div className="mt-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${org.usage > 80 ? 'bg-red-500' : org.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{width: `${org.usage}%`}}
                          ></div>
                        </div>
                        <span className="text-premium text-gray-900 dark:text-gray-100 text-xs">{org.usage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleViewOrganization(org)}
                    className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEditOrganization(org)}
                    className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleSuspendOrganization(org)}
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Organization</th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Plan</th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Employees</th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Revenue</th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Usage</th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrganizations.map(org => (
                  <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {org.name.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{org.name}</div>
                          <div className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">{org.contactEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                      <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getPlanColor(org.plan)}`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 font-semibold text-sm sm:text-base">{org.employees}</td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 font-semibold text-sm sm:text-base">R{org.monthlyRevenue.toLocaleString()}</td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${org.usage > 80 ? 'bg-red-500' : org.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{width: `${org.usage}%`}}
                          ></div>
                        </div>
                        <span className="text-premium text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{org.usage}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                      <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(org.status)}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <button 
                          onClick={() => handleViewOrganization(org)}
                          className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleEditOrganization(org)}
                          className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleSuspendOrganization(org)}
                          className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Organization Detail Modal */}
        {showDetail && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl heading-premium text-gray-900 font-bold">{selectedOrg.name} - Details</h2>
                  <button 
                    onClick={() => setShowDetail(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="card-premium p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Organization Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-semibold">{selectedOrg.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(selectedOrg.plan)}`}>
                          {selectedOrg.plan}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-semibold">{selectedOrg.contactEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Join Date:</span>
                        <span className="font-semibold">{new Date(selectedOrg.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-premium p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Employees:</span>
                          <span className="font-semibold text-2xl text-blue-600">{selectedOrg.employees}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Monthly Revenue:</span>
                          <span className="font-semibold text-2xl text-green-600">R{selectedOrg.monthlyRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Usage:</span>
                          <span className="font-semibold">{selectedOrg.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              selectedOrg.usage > 80 ? 'bg-red-500' : selectedOrg.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{width: `${selectedOrg.usage}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button 
                    onClick={() => setShowDetail(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleEditOrganization(selectedOrg)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Edit Organization
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Organization Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl heading-premium text-gray-900 font-bold">Add New Organization</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                    <input type="text" placeholder="Enter organization name" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                    <input type="email" placeholder="admin@company.com" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subscription Plan</label>
                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="Starter">Starter - R299/mo</option>
                      <option value="Professional">Professional - R849/mo</option>
                      <option value="Enterprise">Enterprise - R2,499/mo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Employees</label>
                    <input type="number" placeholder="50" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Revenue (R)</label>
                    <input type="number" placeholder="2500" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      // Create new organization (for demo purposes)
                      const newOrg: Organization = {
                        id: (organizations.length + 1).toString(),
                        name: 'New Organization',
                        plan: 'Professional',
                        employees: 50,
                        monthlyRevenue: 849,
                        status: 'trial',
                        joinDate: new Date().toISOString().split('T')[0],
                        contactEmail: 'demo@neworg.com',
                        usage: 0
                      }
                      setOrganizations([...organizations, newOrg])
                      setShowAddModal(false)
                      alert('✅ New organization added successfully!')
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Add Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Organization Modal */}
        {showEditModal && editingOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl heading-premium text-gray-900 font-bold">Edit Organization</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                    <input type="text" defaultValue={editingOrg.name} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                    <input type="email" defaultValue={editingOrg.contactEmail} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subscription Plan</label>
                    <select defaultValue={editingOrg.plan} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="Starter">Starter - R299/mo</option>
                      <option value="Professional">Professional - R849/mo</option>
                      <option value="Enterprise">Enterprise - R2,499/mo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Employees</label>
                    <input type="number" defaultValue={editingOrg.employees} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select defaultValue={editingOrg.status} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Revenue (R)</label>
                    <input type="number" defaultValue={editingOrg.monthlyRevenue} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      // Update organization (for demo purposes)
                      setOrganizations(organizations.map(org => 
                        org.id === editingOrg.id 
                          ? { ...org, name: editingOrg.name + ' (Updated)' }
                          : org
                      ))
                      setShowEditModal(false)
                      alert('✅ Organization updated successfully!')
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
  
  // Helper functions
  function handleExport(format: 'csv' | 'pdf') {
    const data = filteredOrganizations.map(org => ({
      Organization: org.name,
      Plan: org.plan,
      Employees: org.employees,
      'Monthly Revenue': org.monthlyRevenue,
      Usage: `${org.usage}%`,
      Status: org.status,
      'Join Date': org.joinDate,
      'Contact Email': org.contactEmail
    }))
    
    if (format === 'csv') {
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape values that contain commas or quotes
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `organizations-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Show success notification
      alert(`✅ Successfully exported ${data.length} organizations to CSV!`)
    } else if (format === 'pdf') {
      // Create a simple PDF-like text format
      const headers = Object.keys(data[0] || {})
      let pdfContent = 'LEAVEHUB - ORGANIZATION REPORT\n'
      pdfContent += '=====================================\n\n'
      pdfContent += `Generated: ${new Date().toLocaleString()}\n`
      pdfContent += `Total Organizations: ${data.length}\n\n`
      
      data.forEach((org, index) => {
        pdfContent += `${index + 1}. ${org.Organization}\n`
        pdfContent += `   Plan: ${org.Plan}\n`
        pdfContent += `   Employees: ${org.Employees}\n`
        pdfContent += `   Monthly Revenue: R${org['Monthly Revenue']}\n`
        pdfContent += `   Usage: ${org.Usage}\n`
        pdfContent += `   Status: ${org.Status}\n`
        pdfContent += `   Join Date: ${org['Join Date']}\n`
        pdfContent += `   Contact: ${org['Contact Email']}\n`
        pdfContent += `   ${'─'.repeat(50)}\n\n`
      })
      
      pdfContent += '\n' + '='.repeat(60) + '\n'
      pdfContent += 'LeaveHub\n'
      pdfContent += 'Leave Management System\n'
      pdfContent += 'www.leavehub.co.za\n'
      pdfContent += '='.repeat(60) + '\n'
      
      const blob = new Blob([pdfContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `organizations-report-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Show success notification
      alert(`✅ Successfully exported ${data.length} organizations to text report!`)
    }
  }
  
  function handlePlanFilter(plan: string) {
    setPlanFilter(plan)
    // Optional: scroll to table
    setTimeout(() => {
      const tableElement = document.querySelector('.card-premium:last-child')
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
  
  function handleViewOrganization(org: Organization) {
    setSelectedOrg(org)
    setShowDetail(true)
  }
  
  function handleEditOrganization(org: Organization) {
    setEditingOrg(org)
    setShowEditModal(true)
  }
  
  function handleSuspendOrganization(org: Organization) {
    const confirmed = confirm(`⚠️ Are you sure you want to suspend ${org.name}?\\n\\nThis will temporarily disable their access to the platform.`)
    if (confirmed) {
      alert(`✅ ${org.name} has been suspended. They will be notified via email at ${org.contactEmail}`)
    }
  }
}