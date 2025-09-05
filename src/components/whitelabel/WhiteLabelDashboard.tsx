import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface Partner {
  id: string
  name: string
  email: string
  company: string
  status: 'active' | 'pending' | 'suspended'
  plan: 'starter' | 'professional' | 'enterprise'
  tenants: number
  monthlyRevenue: number
  commissionRate: number
  joinDate: string
}

interface TenantStats {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  monthlyRevenue: number
  projectedGrowth: number
}

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@hrtech.co.za',
    company: 'HR Tech Solutions',
    status: 'active',
    plan: 'professional',
    tenants: 8,
    monthlyRevenue: 12400,
    commissionRate: 40,
    joinDate: '2025-06-15'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@consultant.com',
    company: 'Business Consulting Pro',
    status: 'active',
    plan: 'enterprise',
    tenants: 15,
    monthlyRevenue: 28500,
    commissionRate: 50,
    joinDate: '2025-05-02'
  },
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma@startups.io',
    company: 'Startup Solutions Hub',
    status: 'pending',
    plan: 'starter',
    tenants: 3,
    monthlyRevenue: 4200,
    commissionRate: 30,
    joinDate: '2025-08-20'
  }
]

const mockStats: TenantStats = {
  totalTenants: 26,
  activeTenants: 23,
  totalUsers: 1847,
  monthlyRevenue: 45100,
  projectedGrowth: 18.5
}

export function WhiteLabelDashboard() {
  const { actualTheme } = useTheme()
  const [partners] = useState<Partner[]>(mockPartners)
  const [stats] = useState<TenantStats>(mockStats)

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'professional':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          White Label Dashboard
        </h1>
        <p className={`${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Manage your white label partners and tenant organizations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                {stats.totalTenants}
              </p>
              <p className={`text-sm mt-1 ${
                actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {stats.activeTenants} active
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v11" />
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
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Across all tenants
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
                Monthly Revenue
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                R{stats.monthlyRevenue.toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${
                actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                +{stats.projectedGrowth}% growth
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                Active Partners
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {partners.filter(p => p.status === 'active').length}
              </p>
              <p className={`text-sm mt-1 ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                of {partners.length} total
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className={`rounded-xl shadow-lg overflow-hidden mb-8 ${
        actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            White Label Partners
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${
              actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Partner
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Plan
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Tenants
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Revenue
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Commission
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Join Date
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              actualTheme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
            }`}>
              {partners.map((partner) => (
                <tr key={partner.id} className={`hover:${
                  actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                } transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {partner.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${
                          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {partner.name}
                        </div>
                        <div className={`text-sm ${
                          actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {partner.company}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(partner.plan)}`}>
                      {partner.plan.charAt(0).toUpperCase() + partner.plan.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {partner.tenants}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      R{partner.monthlyRevenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {partner.commissionRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partner.status)}`}>
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(partner.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Partner Applications
          </h3>
          <p className={`text-sm mb-4 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            2 pending partner applications requiring review
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Review Applications
          </button>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Tenant Management
          </h3>
          <p className={`text-sm mb-4 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Provision new tenants and manage configurations
          </p>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Manage Tenants
          </button>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Revenue Analytics
          </h3>
          <p className={`text-sm mb-4 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Detailed revenue reports and partner performance
          </p>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}