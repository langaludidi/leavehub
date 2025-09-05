import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface ReportData {
  month: string
  totalRequests: number
  approvedRequests: number
  rejectedRequests: number
  averageResponseTime: string
}

const mockReportData: ReportData[] = [
  { month: 'Nov 2024', totalRequests: 45, approvedRequests: 38, rejectedRequests: 7, averageResponseTime: '2.3 hours' },
  { month: 'Oct 2024', totalRequests: 52, approvedRequests: 44, rejectedRequests: 8, averageResponseTime: '3.1 hours' },
  { month: 'Sep 2024', totalRequests: 38, approvedRequests: 35, rejectedRequests: 3, averageResponseTime: '1.8 hours' },
  { month: 'Aug 2024', totalRequests: 41, approvedRequests: 37, rejectedRequests: 4, averageResponseTime: '2.5 hours' }
]

export function ReportsAnalytics({ userRole = 'admin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl heading-premium text-gray-900">Reports & Analytics</h1>
            <p className="text-premium text-gray-600 mt-2">View detailed reports and analytics on leave usage and team productivity</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomDatePicker(true)
                } else {
                  setSelectedPeriod(e.target.value)
                }
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="last-7-days">Last 7 days</option>
              <option value="last-30-days">Last 30 days</option>
              <option value="last-90-days">Last 90 days</option>
              <option value="this-year">This year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="btn-premium bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">156</div>
                <div className="text-premium text-gray-600">Total Requests</div>
                <div className="text-premium text-green-600 text-sm font-medium">+12% this month</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">89%</div>
                <div className="text-premium text-gray-600">Approval Rate</div>
                <div className="text-premium text-green-600 text-sm font-medium">+3% this month</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">2.3h</div>
                <div className="text-premium text-gray-600">Avg Response Time</div>
                <div className="text-premium text-green-600 text-sm font-medium">-26% faster</div>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl heading-premium text-gray-900">87%</div>
                <div className="text-premium text-gray-600">Team Capacity</div>
                <div className="text-premium text-red-600 text-sm font-medium">-5% this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-premium shadow-xl">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl heading-premium text-gray-900">Monthly Leave Trends</h2>
              <p className="text-premium text-gray-600 text-sm mt-1">Request volume over time</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {mockReportData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{data.month.split(' ')[0]}</span>
                      </div>
                      <div>
                        <h3 className="heading-premium text-gray-900">{data.month}</h3>
                        <p className="text-premium text-gray-600 text-sm">{data.totalRequests} total requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">{data.approvedRequests} approved</div>
                      <div className="text-sm text-red-600 font-medium">{data.rejectedRequests} rejected</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-premium shadow-xl">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl heading-premium text-gray-900">Leave Types Breakdown</h2>
              <p className="text-premium text-gray-600 text-sm mt-1">Distribution by category</p>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-premium text-gray-700">Annual Leave</span>
                    <span className="heading-premium text-gray-900">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-premium text-gray-700">Sick Leave</span>
                    <span className="heading-premium text-gray-900">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-500 h-3 rounded-full" style={{width: '20%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-premium text-gray-700">Maternity/Paternity</span>
                    <span className="heading-premium text-gray-900">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{width: '10%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-premium text-gray-700">Other</span>
                    <span className="heading-premium text-gray-900">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{width: '5%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Analytics */}
        <div className="card-premium shadow-xl">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl heading-premium text-gray-900">Department Analytics</h2>
            <p className="text-premium text-gray-600 text-sm mt-1">Leave usage by department</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Total Employees</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">On Leave</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Avg. Leave Days</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-8 py-6 heading-premium text-gray-900">Engineering</td>
                  <td className="px-8 py-6 text-premium text-gray-900">15</td>
                  <td className="px-8 py-6 text-premium text-gray-900">3</td>
                  <td className="px-8 py-6 text-premium text-gray-900">16.2 days</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
                      </div>
                      <span className="text-premium text-gray-900 text-sm">80%</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-8 py-6 heading-premium text-gray-900">Marketing</td>
                  <td className="px-8 py-6 text-premium text-gray-900">8</td>
                  <td className="px-8 py-6 text-premium text-gray-900">0</td>
                  <td className="px-8 py-6 text-premium text-gray-900">14.1 days</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                      </div>
                      <span className="text-premium text-gray-900 text-sm">100%</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-8 py-6 heading-premium text-gray-900">Sales</td>
                  <td className="px-8 py-6 text-premium text-gray-900">10</td>
                  <td className="px-8 py-6 text-premium text-gray-900">4</td>
                  <td className="px-8 py-6 text-premium text-gray-900">18.7 days</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-premium text-gray-900 text-sm">60%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Date Range Modal */}
        {showCustomDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl heading-premium text-gray-900 font-bold">Custom Date Range</h3>
                <button 
                  onClick={() => setShowCustomDatePicker(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowCustomDatePicker(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
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