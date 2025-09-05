import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface AnalyticsData {
  totalOrganizations: number
  totalUsers: number
  totalRequests: number
  monthlyRecurringRevenue: number
  growth: {
    organizations: number
    users: number
    revenue: number
  }
  popularFeatures: Array<{
    name: string
    usage: number
    trend: 'up' | 'down' | 'stable'
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    severity: 'info' | 'warning' | 'error'
  }>
}

export function SuperAdminDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrganizations: 47,
    totalUsers: 1243,
    totalRequests: 3891,
    monthlyRecurringRevenue: 10510,
    growth: {
      organizations: 12,
      users: 23,
      revenue: 8.5
    },
    popularFeatures: [
      { name: 'Leave Requests', usage: 98, trend: 'up' },
      { name: 'Calendar Sync', usage: 76, trend: 'up' },
      { name: 'Mobile App', usage: 65, trend: 'stable' },
      { name: 'Reporting', usage: 54, trend: 'down' },
      { name: 'API Access', usage: 32, trend: 'up' }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'NEW_ORGANIZATION',
        description: 'TechCorp signed up for Enterprise plan',
        timestamp: '2 hours ago',
        severity: 'info'
      },
      {
        id: '2',
        type: 'PAYMENT_FAILED',
        description: 'SmallBiz payment failed - card expired',
        timestamp: '4 hours ago',
        severity: 'warning'
      },
      {
        id: '3',
        type: 'HIGH_USAGE',
        description: 'Enterprise Co. exceeded API rate limit',
        timestamp: '6 hours ago',
        severity: 'warning'
      },
      {
        id: '4',
        type: 'CHURN',
        description: 'StartupXYZ cancelled their subscription',
        timestamp: '1 day ago',
        severity: 'error'
      }
    ]
  })

  const [timeRange, setTimeRange] = useState('30d')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
              <p className="text-gray-600">System overview and monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Link
                to="/"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizations</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalOrganizations}</p>
              </div>
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">+{analytics.growth.organizations}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
              </div>
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">+{analytics.growth.users}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leave Requests</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalRequests.toLocaleString()}</p>
              </div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">R{analytics.monthlyRecurringRevenue.toLocaleString()}</p>
              </div>
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">+{analytics.growth.revenue}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature Usage */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Feature Usage</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.popularFeatures.map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                      <div className={`ml-2 flex items-center ${
                        feature.trend === 'up' ? 'text-green-500' : 
                        feature.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {feature.trend === 'up' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {feature.trend === 'down' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${feature.usage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{feature.usage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.severity === 'error' ? 'bg-red-500' :
                      activity.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.severity === 'error' ? 'bg-red-100 text-red-800' :
                      activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="text-sm font-medium text-gray-900">Billing Overview</div>
                <div className="text-xs text-gray-500 mt-1">Manage subscriptions</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="text-sm font-medium text-gray-900">System Health</div>
                <div className="text-xs text-gray-500 mt-1">Monitor performance</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="text-sm font-medium text-gray-900">Feature Flags</div>
                <div className="text-xs text-gray-500 mt-1">Toggle features</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="text-sm font-medium text-gray-900">Support Tickets</div>
                <div className="text-xs text-gray-500 mt-1">Handle customer issues</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}