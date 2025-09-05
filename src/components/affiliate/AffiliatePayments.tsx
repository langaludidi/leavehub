import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface PaymentRecord {
  id: string
  period: string
  amount: number
  commission: number
  referrals: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  paymentDate?: string
  paymentMethod: string
  transactionId?: string
  createdAt: string
}

const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    period: 'August 2025',
    amount: 2450.00,
    commission: 612.50,
    referrals: 8,
    status: 'paid',
    paymentDate: '2025-09-05',
    paymentMethod: 'PayPal',
    transactionId: 'TXN_AFF_20250905_001',
    createdAt: '2025-09-01'
  },
  {
    id: '2',
    period: 'July 2025',
    amount: 1890.00,
    commission: 472.50,
    referrals: 6,
    status: 'paid',
    paymentDate: '2025-08-05',
    paymentMethod: 'PayPal',
    transactionId: 'TXN_AFF_20250805_001',
    createdAt: '2025-08-01'
  },
  {
    id: '3',
    period: 'September 2025',
    amount: 3120.00,
    commission: 780.00,
    referrals: 12,
    status: 'processing',
    paymentMethod: 'PayPal',
    createdAt: '2025-09-25'
  },
  {
    id: '4',
    period: 'June 2025',
    amount: 1560.00,
    commission: 390.00,
    referrals: 4,
    status: 'paid',
    paymentDate: '2025-07-05',
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN_AFF_20250705_001',
    createdAt: '2025-07-01'
  },
  {
    id: '5',
    period: 'May 2025',
    amount: 780.00,
    commission: 195.00,
    referrals: 2,
    status: 'failed',
    paymentMethod: 'PayPal',
    createdAt: '2025-06-01'
  }
]

export function AffiliatePayments() {
  const { actualTheme } = useTheme()
  const [payments] = useState<PaymentRecord[]>(mockPayments)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredPayments = payments.filter(payment => 
    selectedStatus === 'all' || payment.status === selectedStatus
  )

  const totalEarnings = payments.reduce((sum, payment) => 
    payment.status === 'paid' ? sum + payment.commission : sum, 0
  )

  const pendingEarnings = payments.reduce((sum, payment) => 
    payment.status === 'pending' || payment.status === 'processing' ? sum + payment.commission : sum, 0
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'processing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Payment History
        </h1>
        <p className={`${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Track your commission payments and earnings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${
          actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Earnings
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                R{totalEarnings.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                Pending Payments
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                R{pendingEarnings.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                This Month
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                R{payments.find(p => p.period === 'September 2025')?.commission || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${
        actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${
              actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Period
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
                  Referrals
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Payment Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Method
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              actualTheme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
            }`}>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className={`hover:${
                  actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                } transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {payment.period}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      R{payment.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      R{payment.commission.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {payment.referrals}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {payment.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {payment.transactionId && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(payment.transactionId!)
                          alert('Transaction ID copied to clipboard!')
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Copy Transaction ID"
                      >
                        Copy ID
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <svg className={`mx-auto h-12 w-12 mb-4 ${
            actualTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
          }`}>
            No payments found
          </h3>
          <p className={`${
            actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Try adjusting your filter criteria
          </p>
        </div>
      )}
    </div>
  )
}