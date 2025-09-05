import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface AffiliateStats {
  totalReferrals: number
  activeReferrals: number
  totalCommissionsEarned: number
  totalCommissionsPaid: number
  pendingCommissions: number
  conversionRate: number
  clicksThisMonth: number
  signupsThisMonth: number
}

interface Referral {
  id: string
  orgName: string
  status: 'pending' | 'converted' | 'expired'
  conversionDate?: string
  commissionEarned: number
  createdAt: string
}

const mockStats: AffiliateStats = {
  totalReferrals: 12,
  activeReferrals: 8,
  totalCommissionsEarned: 2450.00,
  totalCommissionsPaid: 1800.00,
  pendingCommissions: 650.00,
  conversionRate: 8.5,
  clicksThisMonth: 247,
  signupsThisMonth: 21
}

const mockReferrals: Referral[] = [
  {
    id: '1',
    orgName: 'TechCorp Solutions',
    status: 'converted',
    conversionDate: '2025-08-15',
    commissionEarned: 125.00,
    createdAt: '2025-08-10'
  },
  {
    id: '2', 
    orgName: 'Marketing Plus',
    status: 'converted',
    conversionDate: '2025-08-22',
    commissionEarned: 95.00,
    createdAt: '2025-08-18'
  },
  {
    id: '3',
    orgName: 'StartupCo',
    status: 'pending',
    commissionEarned: 0,
    createdAt: '2025-09-01'
  }
]

export function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats>(mockStats)
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals)
  const [affiliateCode, setAffiliateCode] = useState('AFF123XY')
  const [referralLink, setReferralLink] = useState(`https://leavehub.co.za/?ref=${affiliateCode}`)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const statCards = [
    {
      name: 'Total Referrals',
      value: stats.totalReferrals.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      name: 'Total Earned',
      value: `R${stats.totalCommissionsEarned.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      name: 'Pending Commissions',
      value: `R${stats.pendingCommissions.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    },
    {
      name: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your referrals and earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Referral Link */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this link to earn 25% commission on all referred subscriptions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/affiliate/materials"
              className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Marketing Materials
            </Link>
            <Link
              to="/affiliate/payments"
              className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Payment History
            </Link>
            <Link
              to="/affiliate/analytics"
              className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Detailed Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Referrals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{referral.orgName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      referral.status === 'converted' 
                        ? 'bg-green-100 text-green-800'
                        : referral.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {referral.conversionDate || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R{referral.commissionEarned.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referral.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}