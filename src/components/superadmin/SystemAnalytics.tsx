import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface SystemMetric {
  name: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: string
}

interface UsageData {
  organization: string
  activeUsers: number
  totalRequests: number
  storageUsed: string
  apiCalls: number
  uptime: number
}

const mockMetrics: SystemMetric[] = [
  {
    name: 'Total Platform Users',
    value: '12,847',
    change: '+18%',
    trend: 'up',
    icon: '👥'
  },
  {
    name: 'Active Organizations',
    value: '247',
    change: '+8%',
    trend: 'up',
    icon: '🏢'
  },
  {
    name: 'Monthly Revenue',
    value: 'R48,320',
    change: '+22%',
    trend: 'up',
    icon: '💰'
  },
  {
    name: 'System Uptime',
    value: '99.98%',
    change: '+0.1%',
    trend: 'up',
    icon: '⚡'
  }
]

const mockUsageData: UsageData[] = [
  {
    organization: 'TechCorp Solutions',
    activeUsers: 185,
    totalRequests: 2847,
    storageUsed: '24.7 GB',
    apiCalls: 58920,
    uptime: 99.9
  },
  {
    organization: 'MegaCorp Industries',
    activeUsers: 342,
    totalRequests: 4521,
    storageUsed: '38.2 GB',
    apiCalls: 89340,
    uptime: 99.8
  },
  {
    organization: 'SmallBiz Co.',
    activeUsers: 67,
    totalRequests: 892,
    storageUsed: '8.4 GB',
    apiCalls: 15670,
    uptime: 99.9
  }
]

export function SystemAnalytics({ userRole = 'superadmin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days')
  const [activeTab, setActiveTab] = useState('overview')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: '📊' },
    { id: 'performance', name: 'Performance', icon: '🚀' },
    { id: 'usage', name: 'Usage Analytics', icon: '📈' },
    { id: 'errors', name: 'Error Tracking', icon: '🚨' }
  ]

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl heading-premium text-gray-900 dark:text-gray-100">System Analytics</h1>
            <p className="text-premium text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">System-wide analytics, usage metrics, and performance monitoring</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            >
              <option value="last-7-days">Last 7 days</option>
              <option value="last-30-days">Last 30 days</option>
              <option value="last-90-days">Last 90 days</option>
              <option value="this-year">This year</option>
              <option value="custom">Custom Range</option>
            </select>
            <div className="flex space-x-2 sm:space-x-3">
              <button 
                onClick={() => handleExportAnalytics('csv')}
                className="btn-premium bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-green-700 shadow-lg flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transform hover:scale-105 transition-all duration-200 flex-1 sm:flex-none text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              <button 
                onClick={() => handleExportAnalytics('pdf')}
                className="btn-premium bg-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transform hover:scale-105 transition-all duration-200 flex-1 sm:flex-none text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-indigo-900 dark:text-indigo-300 shadow-md font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-base sm:text-lg">{tab.icon}</span>
              <span className="text-premium text-xs sm:text-sm lg:text-base">{tab.name}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {mockMetrics.map((metric, index) => (
                <div key={index} className="card-premium shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                      <span className="text-lg sm:text-xl">{metric.icon}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">{metric.value}</div>
                      <div className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{metric.name}</div>
                      <div className={`text-premium text-xs sm:text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {metric.change} this month
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="card-premium shadow-xl">
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">User Growth</h2>
                  <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Monthly active users across all organizations</p>
                </div>
                <div className="p-4 sm:p-8">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">January 2024</h3>
                        <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">8,247 active users</p>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">+12%</div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">February 2024</h3>
                        <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">9,834 active users</p>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">+19%</div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">March 2024</h3>
                        <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">12,847 active users</p>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">+31%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-premium shadow-xl">
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Revenue Distribution</h2>
                  <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Revenue by subscription plan</p>
                </div>
                <div className="p-4 sm:p-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                        <span className="text-premium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Enterprise Plans</span>
                        <span className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">R32,450 (67%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div className="bg-purple-500 h-3 rounded-full" style={{width: '67%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                        <span className="text-premium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Professional Plans</span>
                        <span className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">R12,280 (25%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div className="bg-blue-500 h-3 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                        <span className="text-premium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Starter Plans</span>
                        <span className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">R3,590 (8%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{width: '8%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'usage' && (
          <div className="card-premium shadow-xl">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Organization Usage Analytics</h2>
              <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Detailed usage metrics by organization</p>
            </div>
            
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              {mockUsageData.map((data, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="heading-premium text-gray-900 dark:text-gray-100 font-medium">{data.organization}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${data.uptime > 99.5 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-premium text-gray-900 dark:text-gray-100 text-sm">{data.uptime}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Active Users</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 font-semibold mt-1">{data.activeUsers}</p>
                    </div>
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Requests</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 font-semibold mt-1">{data.totalRequests.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Storage</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 font-semibold mt-1">{data.storageUsed}</p>
                    </div>
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">API Calls</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 font-semibold mt-1">{data.apiCalls.toLocaleString()}</p>
                    </div>
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
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Active Users</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Requests</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Storage</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">API Calls</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockUsageData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 sm:px-8 py-4 sm:py-6 heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{data.organization}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{data.activeUsers}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{data.totalRequests.toLocaleString()}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{data.storageUsed}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{data.apiCalls.toLocaleString()}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${data.uptime > 99.5 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="text-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{data.uptime}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="card-premium shadow-xl">
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">System Performance</h2>
                <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Real-time system metrics</p>
              </div>
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Response Time</h3>
                    <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Average API response time</p>
                  </div>
                  <div className="text-xl sm:text-2xl heading-premium text-green-600 dark:text-green-400">89ms</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Throughput</h3>
                    <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Requests per second</p>
                  </div>
                  <div className="text-xl sm:text-2xl heading-premium text-blue-600 dark:text-blue-400">1,247</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Error Rate</h3>
                    <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Percentage of failed requests</p>
                  </div>
                  <div className="text-xl sm:text-2xl heading-premium text-purple-600 dark:text-purple-400">0.02%</div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl">
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Resource Usage</h2>
                <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Server resource utilization</p>
              </div>
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                    <span className="text-premium text-gray-700 dark:text-gray-300 text-sm sm:text-base">CPU Usage</span>
                    <span className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">34%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{width: '34%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                    <span className="text-premium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Memory Usage</span>
                    <span className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{width: '67%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                    <span className="text-premium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Disk Usage</span>
                    <span className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="card-premium shadow-xl">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Recent System Errors</h2>
              <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Error tracking and resolution status</p>
            </div>
            <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-premium font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Database Connection Timeout</p>
                  <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Connection to primary database timed out for TechCorp Solutions</p>
                  <p className="text-premium text-gray-500 dark:text-gray-500 text-xs mt-1">2 hours ago • Resolved</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-premium font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">High Memory Usage Alert</p>
                  <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Server-02 memory usage exceeded 85% threshold</p>
                  <p className="text-premium text-gray-500 dark:text-gray-500 text-xs mt-1">4 hours ago • Monitoring</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-premium font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">API Rate Limit Exceeded</p>
                  <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">MegaCorp Industries hit API rate limits</p>
                  <p className="text-premium text-gray-500 dark:text-gray-500 text-xs mt-1">6 hours ago • Auto-resolved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Date Range Modal */}
        {selectedPeriod === 'custom' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-xl heading-premium text-gray-900 font-bold mb-6">Select Custom Date Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button 
                  onClick={() => setSelectedPeriod('last-30-days')}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleApplyCustomRange()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
  
  function handleExportAnalytics(format: 'csv' | 'pdf') {
    const data = {
      period: selectedPeriod,
      metrics: mockMetrics,
      usageData: mockUsageData,
      exportDate: new Date().toISOString().split('T')[0]
    }
    
    if (format === 'csv') {
      // Export metrics and usage data as CSV
      let csvContent = 'LEAVEHUB SYSTEM ANALYTICS REPORT\n'
      csvContent += `Report Period: ${selectedPeriod}\n`
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`
      
      // System Metrics Section
      csvContent += 'SYSTEM METRICS\n'
      csvContent += 'Metric,Value,Change,Trend\n'
      csvContent += mockMetrics.map(metric => 
        `"${metric.name}","${metric.value}","${metric.change}","${metric.trend}"`
      ).join('\n')
      
      // Usage Data Section
      csvContent += '\n\nUSAGE DATA BY ORGANIZATION\n'
      csvContent += 'Organization,Active Users,Total Requests,Storage Used,API Calls,Uptime\n'
      csvContent += mockUsageData.map(data => 
        `"${data.organization}",${data.activeUsers},${data.totalRequests},"${data.storageUsed}",${data.apiCalls},${data.uptime}%`
      ).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `system-analytics-${data.exportDate}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert(`✅ Successfully exported system analytics to CSV!`)
    } else {
      alert(`✅ PDF export initiated for ${selectedPeriod} analytics data!`)
    }
  }
  
  function handleApplyCustomRange() {
    if (customStartDate && customEndDate) {
      setSelectedPeriod('custom')
      setShowCustomDatePicker(false)
      alert(`✅ Custom date range applied: ${customStartDate} to ${customEndDate}`)
      // Here you would typically update your analytics data
    } else {
      alert('⚠️ Please select both start and end dates')
    }
  }
}