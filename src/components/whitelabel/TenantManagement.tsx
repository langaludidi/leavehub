import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface Tenant {
  id: string
  name: string
  domain: string
  partnerId: string
  partnerName: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  users: number
  mrrRevenue: number
  createdAt: string
  lastActive: string
  customBranding: {
    primaryColor: string
    logo: string
    customDomain: string
  }
  features: {
    maxUsers: number
    customReports: boolean
    apiAccess: boolean
    ssoEnabled: boolean
  }
}

const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Acme Corp Solutions',
    domain: 'acme-corp.leavehub.app',
    partnerId: 'partner-1',
    partnerName: 'HR Solutions Pro',
    status: 'active',
    users: 147,
    mrrRevenue: 2450.00,
    createdAt: '2025-07-15',
    lastActive: '2025-08-15T14:30:00Z',
    customBranding: {
      primaryColor: '#1F4E79',
      logo: '/assets/tenants/acme-logo.png',
      customDomain: 'hr.acmecorp.com'
    },
    features: {
      maxUsers: 200,
      customReports: true,
      apiAccess: true,
      ssoEnabled: true
    }
  },
  {
    id: '2',
    name: 'TechStart Industries',
    domain: 'techstart.leavehub.app',
    partnerId: 'partner-2',
    partnerName: 'Business Automation Ltd',
    status: 'active',
    users: 89,
    mrrRevenue: 1275.00,
    createdAt: '2025-07-20',
    lastActive: '2025-08-15T09:15:00Z',
    customBranding: {
      primaryColor: '#7C3AED',
      logo: '/assets/tenants/techstart-logo.png',
      customDomain: ''
    },
    features: {
      maxUsers: 100,
      customReports: false,
      apiAccess: true,
      ssoEnabled: false
    }
  },
  {
    id: '3',
    name: 'Global Manufacturing Co',
    domain: 'globalmanuf.leavehub.app',
    partnerId: 'partner-1',
    partnerName: 'HR Solutions Pro',
    status: 'suspended',
    users: 234,
    mrrRevenue: 0,
    createdAt: '2025-06-10',
    lastActive: '2025-08-01T16:45:00Z',
    customBranding: {
      primaryColor: '#DC2626',
      logo: '/assets/tenants/globalmanuf-logo.png',
      customDomain: 'leave.globalmanuf.com'
    },
    features: {
      maxUsers: 300,
      customReports: true,
      apiAccess: true,
      ssoEnabled: true
    }
  }
]

export function TenantManagement() {
  const { actualTheme } = useTheme()
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'view' | 'edit' | 'suspend' | 'activate'>('view')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const handleTenantAction = (tenant: Tenant, action: 'view' | 'edit' | 'suspend' | 'activate') => {
    setSelectedTenant(tenant)
    setModalType(action)
    setShowModal(true)
  }

  const executeTenantAction = () => {
    if (!selectedTenant) return

    switch (modalType) {
      case 'suspend':
        setTenants(prev => prev.map(t => 
          t.id === selectedTenant.id ? { ...t, status: 'suspended' as const } : t
        ))
        break
      case 'activate':
        setTenants(prev => prev.map(t => 
          t.id === selectedTenant.id ? { ...t, status: 'active' as const } : t
        ))
        break
    }
    setShowModal(false)
  }

  const totalTenants = tenants.length
  const activeTenants = tenants.filter(t => t.status === 'active').length
  const totalMRR = tenants.reduce((sum, t) => sum + t.mrrRevenue, 0)
  const totalUsers = tenants.reduce((sum, t) => sum + t.users, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Tenant Management
        </h1>
        <p className={`${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Manage white label instances and tenant configurations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Tenants
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {totalTenants}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Active Tenants
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {activeTenants}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Users
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 110-5.292" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total MRR
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                R{totalMRR.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Tenants Table */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${
        actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Tenant
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Partner
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Users
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  MRR
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Created
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              actualTheme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
            }`}>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className={
                  actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {tenant.name}
                      </div>
                      <div className={`text-sm ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {tenant.domain}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {tenant.partnerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusColor(tenant.status)
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {tenant.users.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      R{tenant.mrrRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleTenantAction(tenant, 'view')}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleTenantAction(tenant, 'edit')}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      {tenant.status === 'active' ? (
                        <button
                          onClick={() => handleTenantAction(tenant, 'suspend')}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTenantAction(tenant, 'activate')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-xl shadow-xl ${
            actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {modalType === 'view' ? 'Tenant Details' :
                 modalType === 'edit' ? 'Edit Tenant' :
                 modalType === 'suspend' ? 'Suspend Tenant' : 'Activate Tenant'}
              </h3>

              {modalType === 'view' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Name</label>
                      <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                        {selectedTenant.name}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Domain</label>
                      <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                        {selectedTenant.domain}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Partner</label>
                      <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                        {selectedTenant.partnerName}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Status</label>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusColor(selectedTenant.status)
                      }`}>
                        {selectedTenant.status}
                      </span>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Users</label>
                      <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                        {selectedTenant.users} / {selectedTenant.features.maxUsers}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>MRR Revenue</label>
                      <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                        R{selectedTenant.mrrRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(modalType === 'suspend' || modalType === 'activate') && (
                <div className="text-center">
                  <p className={`mb-4 ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {modalType === 'suspend' 
                      ? `Are you sure you want to suspend "${selectedTenant.name}"? This will prevent their users from accessing the platform.`
                      : `Are you sure you want to activate "${selectedTenant.name}"? This will restore full access to the platform.`
                    }
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                    actualTheme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {modalType === 'view' ? 'Close' : 'Cancel'}
                </button>
                {(modalType === 'suspend' || modalType === 'activate') && (
                  <button
                    onClick={executeTenantAction}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                      modalType === 'suspend' 
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {modalType === 'suspend' ? 'Suspend' : 'Activate'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}