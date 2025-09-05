import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface AnalyticsData {
  clicks: { date: string; value: number }[]
  conversions: { date: string; value: number }[]
  revenue: { date: string; value: number }[]
  topReferringSources: { source: string; clicks: number; conversions: number }[]
}

const mockAnalytics: AnalyticsData = {
  clicks: [
    { date: '2025-08-01', value: 45 },
    { date: '2025-08-02', value: 52 },
    { date: '2025-08-03', value: 38 },
    { date: '2025-08-04', value: 67 },
    { date: '2025-08-05', value: 71 },
    { date: '2025-08-06', value: 83 },
    { date: '2025-08-07', value: 59 }
  ],
  conversions: [
    { date: '2025-08-01', value: 3 },
    { date: '2025-08-02', value: 4 },
    { date: '2025-08-03', value: 2 },
    { date: '2025-08-04', value: 5 },
    { date: '2025-08-05', value: 6 },
    { date: '2025-08-06', value: 7 },
    { date: '2025-08-07', value: 4 }
  ],
  revenue: [
    { date: '2025-08-01', value: 95.50 },
    { date: '2025-08-02', value: 127.00 },
    { date: '2025-08-03', value: 63.75 },
    { date: '2025-08-04', value: 158.25 },
    { date: '2025-08-05', value: 191.50 },
    { date: '2025-08-06', value: 223.75 },
    { date: '2025-08-07', value: 127.00 }
  ],
  topReferringSources: [
    { source: 'Twitter', clicks: 156, conversions: 12 },
    { source: 'LinkedIn', clicks: 143, conversions: 11 },
    { source: 'Email Newsletter', clicks: 89, conversions: 8 },
    { source: 'Personal Blog', clicks: 76, conversions: 6 },
    { source: 'Facebook', clicks: 52, conversions: 4 }
  ]
}

export function AffiliateAnalytics() {
  const { actualTheme } = useTheme()
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d')

  const totalClicks = analytics.clicks.reduce((sum, item) => sum + item.value, 0)
  const totalConversions = analytics.conversions.reduce((sum, item) => sum + item.value, 0)
  const totalRevenue = analytics.revenue.reduce((sum, item) => sum + item.value, 0)
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Analytics Dashboard
        </h1>
        <p className={`${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Track your affiliate performance and optimize your strategy
        </p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as '7d' | '30d' | '90d')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Clicks
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                Conversions
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {totalConversions}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
                Conversion Rate
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
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
                Total Revenue
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                R{totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Clicks Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Clicks Over Time
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.clicks.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t-sm"
                  style={{
                    height: `${(item.value / Math.max(...analytics.clicks.map(i => i.value))) * 200}px`
                  }}
                />
                <span className={`text-xs mt-2 ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(item.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Revenue Over Time
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.revenue.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-green-500 rounded-t-sm"
                  style={{
                    height: `${(item.value / Math.max(...analytics.revenue.map(i => i.value))) * 200}px`
                  }}
                />
                <span className={`text-xs mt-2 ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(item.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Referring Sources */}
      <div className={`p-6 rounded-xl shadow-lg ${
        actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Top Referring Sources
        </h3>
        <div className="space-y-4">
          {analytics.topReferringSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {index + 1}
                </div>
                <span className={`font-medium ${
                  actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {source.source}
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {source.clicks}
                  </div>
                  <div className={`${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    clicks
                  </div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {source.conversions}
                  </div>
                  <div className={`${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    conversions
                  </div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {source.clicks > 0 ? ((source.conversions / source.clicks) * 100).toFixed(1) : 0}%
                  </div>
                  <div className={`${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    rate
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}