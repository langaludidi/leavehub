import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface BillingRecord {
  id: string
  organizationName: string
  plan: 'Starter' | 'Professional' | 'Enterprise'
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'failed'
  dueDate: string
  paidDate?: string
  employees: number
}

interface Subscription {
  id: string
  organizationName: string
  plan: 'Starter' | 'Professional' | 'Enterprise'
  status: 'active' | 'cancelled' | 'suspended'
  monthlyPrice: number
  employees: number
  nextBilling: string
  features: string[]
}

const mockBillingRecords: BillingRecord[] = [
  {
    id: '1',
    organizationName: 'TechCorp Solutions',
    plan: 'Enterprise',
    amount: 2890,
    status: 'paid',
    dueDate: '2024-01-01',
    paidDate: '2023-12-28',
    employees: 247
  },
  {
    id: '2',
    organizationName: 'MegaCorp Industries',
    plan: 'Enterprise',
    amount: 3210,
    status: 'paid',
    dueDate: '2024-01-05',
    paidDate: '2024-01-03',
    employees: 425
  },
  {
    id: '3',
    organizationName: 'SmallBiz Co.',
    plan: 'Professional',
    amount: 1450,
    status: 'pending',
    dueDate: '2024-01-10',
    employees: 89
  },
  {
    id: '4',
    organizationName: 'StartupX',
    plan: 'Starter',
    amount: 290,
    status: 'overdue',
    dueDate: '2023-12-15',
    employees: 15
  }
]

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    organizationName: 'TechCorp Solutions',
    plan: 'Enterprise',
    status: 'active',
    monthlyPrice: 2890,
    employees: 247,
    nextBilling: '2024-02-01',
    features: ['Unlimited employees', 'Advanced analytics', 'Custom integrations', 'Priority support']
  },
  {
    id: '2',
    organizationName: 'MegaCorp Industries',
    plan: 'Enterprise',
    status: 'active',
    monthlyPrice: 3210,
    employees: 425,
    nextBilling: '2024-02-05',
    features: ['Unlimited employees', 'Advanced analytics', 'Custom integrations', 'Priority support']
  },
  {
    id: '3',
    organizationName: 'SmallBiz Co.',
    plan: 'Professional',
    status: 'active',
    monthlyPrice: 1450,
    employees: 89,
    nextBilling: '2024-02-10',
    features: ['Up to 100 employees', 'Standard analytics', 'Basic integrations', 'Email support']
  }
]

export function BillingManagement({ userRole = 'superadmin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [activeTab, setActiveTab] = useState('billing')
  const [billingFilter, setBillingFilter] = useState('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState('all')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  
  // New styled modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [modalContent, setModalContent] = useState<{
    title: string
    message: string
    type: 'success' | 'confirm' | 'info' | 'warning'
    onConfirm?: () => void
    onCancel?: () => void
    details?: string
  }>({ title: '', message: '', type: 'info' })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': case 'suspended': return 'bg-gray-100 text-gray-800'
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

  const filteredBilling = mockBillingRecords.filter(record => 
    billingFilter === 'all' || record.status === billingFilter
  )

  const filteredSubscriptions = mockSubscriptions.filter(sub => 
    subscriptionFilter === 'all' || sub.status === subscriptionFilter
  )

  const totalRevenue = mockBillingRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0)
  const pendingRevenue = mockBillingRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)
  const overdueAmount = mockBillingRecords.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0)

  const tabs = [
    { id: 'billing', name: 'Billing Records', icon: '💳' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '📋' },
    { id: 'revenue', name: 'Revenue Analytics', icon: '📊' }
  ]

  // Modal helper functions
  const showStyledModal = (content: typeof modalContent) => {
    setModalContent(content)
    if (content.type === 'success') {
      setShowSuccessModal(true)
    } else if (content.type === 'confirm') {
      setShowConfirmModal(true)
    } else {
      setShowDetailsModal(true)
    }
  }

  const closeAllModals = () => {
    setShowSuccessModal(false)
    setShowConfirmModal(false)
    setShowDetailsModal(false)
  }

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl heading-premium text-gray-900 dark:text-gray-100">Billing & Subscriptions</h1>
            <p className="text-sm sm:text-base text-premium text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Manage billing, subscriptions, and revenue tracking</p>
          </div>
          <button 
            onClick={() => setShowExportModal(true)}
            className="btn-primary flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto py-2 sm:py-2 px-4 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div 
            onClick={() => handleRevenueDrilldown('collected')}
            className="card-premium shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">R{totalRevenue.toLocaleString()}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Revenue Collected</div>
                <div className="text-premium text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">This month</div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleRevenueDrilldown('pending')}
            className="card-premium shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">R{pendingRevenue.toLocaleString()}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Pending Payments</div>
                <div className="text-premium text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm font-medium">Awaiting collection</div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleRevenueDrilldown('overdue')}
            className="card-premium shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">R{overdueAmount.toLocaleString()}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Overdue Amount</div>
                <div className="text-premium text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">Requires attention</div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleSubscriptionsDrilldown()}
            className="card-premium shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl heading-premium text-gray-900 dark:text-gray-100">{mockSubscriptions.length}</div>
                <div className="text-premium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Active Subscriptions</div>
                <div className="text-premium text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">Current month</div>
              </div>
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

        {activeTab === 'billing' && (
          <div className="card-premium shadow-xl">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">Billing Records</h2>
                <p className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Payment history and invoice management</p>
              </div>
              <select
                value={billingFilter}
                onChange={(e) => setBillingFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            {/* Mobile-first responsive table */}
            <div className="block sm:hidden">
              {filteredBilling.map(record => (
                <div key={record.id} className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="heading-premium text-gray-900 dark:text-gray-100 font-medium">{record.organizationName}</h3>
                      <p className="text-premium text-gray-600 dark:text-gray-400 text-xs">{record.employees} employees</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Plan</span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(record.plan)}`}>
                          {record.plan}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Amount</span>
                      <p className="text-premium text-gray-900 dark:text-gray-100 font-semibold mt-1">R{record.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-premium text-gray-600 dark:text-gray-400 text-xs">Due Date</span>
                    <p className="text-premium text-gray-900 dark:text-gray-100 text-sm mt-1">
                      {new Date(record.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleViewInvoice(record)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-medium hover:underline"
                    >
                      View Invoice
                    </button>
                    {record.status === 'overdue' && (
                      <button 
                        onClick={() => handleSendReminder(record)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs font-medium hover:underline"
                      >
                        Send Reminder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Organization</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Plan</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Amount</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Due Date</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                    <th className="px-4 sm:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBilling.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <div>
                          <div className="heading-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{record.organizationName}</div>
                          <div className="text-premium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{record.employees} employees</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getPlanColor(record.plan)}`}>
                          {record.plan}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 font-semibold text-sm sm:text-base">R{record.amount.toLocaleString()}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-premium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                        {new Date(record.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <button 
                            onClick={() => handleViewInvoice(record)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs sm:text-sm font-medium hover:underline text-left"
                          >
                            View Invoice
                          </button>
                          {record.status === 'overdue' && (
                            <button 
                              onClick={() => handleSendReminder(record)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs sm:text-sm font-medium hover:underline text-left"
                            >
                              Send Reminder
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
        )}

        {activeTab === 'subscriptions' && (
          <div className="card-premium shadow-xl">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-title heading-premium text-gray-900">Active Subscriptions</h2>
                <p className="text-premium text-gray-600 text-sm mt-1">Manage organization subscriptions and plans</p>
              </div>
              <select
                value={subscriptionFilter}
                onChange={(e) => setSubscriptionFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="p-8 space-y-6">
              {filteredSubscriptions.map(subscription => (
                <div key={subscription.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg heading-premium text-gray-900">{subscription.organizationName}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPlanColor(subscription.plan)}`}>
                          {subscription.plan}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl heading-premium text-gray-900">R{subscription.monthlyPrice.toLocaleString()}</div>
                      <div className="text-premium text-gray-600 text-sm">per month</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="heading-premium text-gray-900 mb-2">Plan Details</h4>
                      <div className="space-y-1">
                        <p className="text-premium text-gray-600 text-sm">{subscription.employees} employees</p>
                        <p className="text-premium text-gray-600 text-sm">Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="heading-premium text-gray-900 mb-2">Features</h4>
                      <div className="space-y-1">
                        {subscription.features.slice(0, 2).map((feature, index) => (
                          <p key={index} className="text-premium text-gray-600 text-sm">• {feature}</p>
                        ))}
                        {subscription.features.length > 2 && (
                          <p className="text-premium text-gray-500 text-sm">+ {subscription.features.length - 2} more features</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleViewSubscriptionDetails(subscription)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleModifyPlan(subscription)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                    >
                      Modify Plan
                    </button>
                    <button 
                      onClick={() => handleSuspendSubscription(subscription)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-premium shadow-xl">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-title heading-premium text-gray-900">Monthly Revenue Trend</h2>
                <p className="text-premium text-gray-600 text-sm mt-1">Revenue growth over time</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">January 2024</h3>
                    <p className="text-premium text-gray-600 text-sm">R48,320 total revenue</p>
                  </div>
                  <div className="text-green-600 font-semibold">+22%</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">December 2023</h3>
                    <p className="text-premium text-gray-600 text-sm">R39,580 total revenue</p>
                  </div>
                  <div className="text-green-600 font-semibold">+15%</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">November 2023</h3>
                    <p className="text-premium text-gray-600 text-sm">R34,420 total revenue</p>
                  </div>
                  <div className="text-green-600 font-semibold">+8%</div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl heading-premium text-gray-900">Revenue by Plan</h2>
                <p className="text-premium text-gray-600 text-sm mt-1">Breakdown by subscription tier</p>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-premium text-gray-700">Enterprise Plans</span>
                    <span className="heading-premium text-gray-900">R32,450 (67%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{width: '67%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-premium text-gray-700">Professional Plans</span>
                    <span className="heading-premium text-gray-900">R12,280 (25%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-premium text-gray-700">Starter Plans</span>
                    <span className="heading-premium text-gray-900">R3,590 (8%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{width: '8%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Export Report</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">Choose your preferred export format:</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleExportReport('csv')}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">CSV Format</h3>
                        <p className="text-sm text-gray-600">Comma-separated values for spreadsheets</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleExportReport('excel')}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Excel Format</h3>
                        <p className="text-sm text-gray-600">Microsoft Excel workbook with formatting</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleExportReport('pdf')}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">PDF Format</h3>
                        <p className="text-sm text-gray-600">Formatted report document</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Styled Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{modalContent.title}</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">{modalContent.message}</p>
                {modalContent.details && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{modalContent.details}</pre>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={closeAllModals}
                    className="btn-premium bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Great!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Styled Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    modalContent.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}>
                    {modalContent.type === 'warning' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{modalContent.title}</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">{modalContent.message}</p>
                {modalContent.details && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{modalContent.details}</pre>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      closeAllModals()
                      modalContent.onCancel?.()
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      closeAllModals()
                      modalContent.onConfirm?.()
                    }}
                    className={`flex-1 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      modalContent.type === 'warning' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Styled Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{modalContent.title}</h3>
                  </div>
                  <button
                    onClick={closeAllModals}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{modalContent.message}</p>
                {modalContent.details && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{modalContent.details}</pre>
                  </div>
                )}
                <div className="flex justify-between">
                  {modalContent.onConfirm && (
                    <button
                      onClick={() => {
                        closeAllModals()
                        modalContent.onConfirm?.()
                      }}
                      className="btn-premium bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Export Report
                    </button>
                  )}
                  <button
                    onClick={closeAllModals}
                    className="btn-premium bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 shadow-lg transform hover:scale-105 transition-all duration-200 ml-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
  
  // Handler Functions
  function handleViewInvoice(record: BillingRecord) {
    setSelectedBilling(record)
    generateInvoicePDF(record)
  }

  function generateInvoicePDF(record: BillingRecord) {
    const invoiceNumber = `INV-${record.id.padStart(6, '0')}`
    const currentDate = new Date().toLocaleDateString()
    
    let invoiceContent = 'LEAVEHUB INVOICE\n'
    invoiceContent += '=====================================\n\n'
    invoiceContent += `Invoice Number: ${invoiceNumber}\n`
    invoiceContent += `Date Issued: ${currentDate}\n`
    invoiceContent += `Due Date: ${new Date(record.dueDate).toLocaleDateString()}\n\n`
    
    invoiceContent += 'BILL TO:\n'
    invoiceContent += '--------\n'
    invoiceContent += `Organization: ${record.organizationName}\n`
    invoiceContent += `Number of Employees: ${record.employees}\n`
    invoiceContent += `Subscription Plan: ${record.plan}\n\n`
    
    invoiceContent += 'SERVICE DETAILS:\n'
    invoiceContent += '----------------\n'
    invoiceContent += `LeaveHub ${record.plan} Plan - Monthly Subscription\n`
    invoiceContent += `Employee Count: ${record.employees}\n`
    invoiceContent += `Rate per Employee: R${(record.amount / record.employees).toFixed(2)}\n\n`
    
    invoiceContent += 'PAYMENT SUMMARY:\n'
    invoiceContent += '----------------\n'
    invoiceContent += `Subtotal: R${record.amount.toLocaleString()}\n`
    invoiceContent += `VAT (15%): R${(record.amount * 0.15).toLocaleString()}\n`
    invoiceContent += `Total Amount: R${(record.amount * 1.15).toLocaleString()}\n`
    invoiceContent += `Status: ${record.status.toUpperCase()}\n\n`
    
    if (record.paidDate) {
      invoiceContent += `Paid Date: ${new Date(record.paidDate).toLocaleDateString()}\n`
    }
    
    invoiceContent += '\nPAYMENT TERMS:\n'
    invoiceContent += '--------------\n'
    invoiceContent += 'Payment is due within 30 days of invoice date.\n'
    invoiceContent += 'Late payments may result in service suspension.\n'
    invoiceContent += 'For questions, contact billing@leavehub.co.za\n\n'
    
    invoiceContent += '\n' + '='.repeat(50) + '\n'
    invoiceContent += 'LeaveHub - Leave Management System\n'
    invoiceContent += 'www.leavehub.co.za\n'
    invoiceContent += 'support@leavehub.co.za\n'
    invoiceContent += '+27 11 123 4567\n'
    invoiceContent += '='.repeat(50) + '\n'
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoiceNumber}_${record.organizationName.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showStyledModal({
      title: 'Invoice Generated Successfully',
      message: `Invoice ${invoiceNumber} has been generated and downloaded for ${record.organizationName}`,
      type: 'success',
      details: `Invoice Details:\n• Invoice Number: ${invoiceNumber}\n• Organization: ${record.organizationName}\n• Amount: R${(record.amount * 1.15).toLocaleString()} (incl. VAT)\n• Plan: ${record.plan}\n• Employees: ${record.employees}\n• Status: ${record.status.toUpperCase()}\n\nFile saved as: ${invoiceNumber}_${record.organizationName.replace(/\s+/g, '_')}.pdf`
    })
  }

  function handleSendReminder(record: BillingRecord) {
    const invoiceNumber = `INV-${record.id.padStart(6, '0')}`
    const daysOverdue = Math.ceil((new Date().getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    
    showStyledModal({
      title: 'Send Payment Reminder',
      message: `Send payment reminder to ${record.organizationName}?`,
      type: 'confirm',
      details: `Reminder Details:\n• Invoice: ${invoiceNumber}\n• Amount Due: R${record.amount.toLocaleString()}\n• Days Overdue: ${daysOverdue} days\n• Due Date: ${new Date(record.dueDate).toLocaleDateString()}\n\nActions to be taken:\n📧 Email to billing contact\n📱 SMS notification\n📞 Follow-up call scheduled\n📋 System audit log entry`,
      onConfirm: () => {
        // Simulate sending reminder
        setTimeout(() => {
          showStyledModal({
            title: 'Reminder Sent Successfully',
            message: `Payment reminder has been sent to ${record.organizationName}`,
            type: 'success',
            details: `Actions Completed:\n• 📧 Email sent to billing contact\n• 📱 SMS notification delivered\n• 📞 Follow-up call scheduled for tomorrow\n• 📋 Reminder logged in system\n• 🕒 Next reminder: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\nReminder tracking updated in customer profile.`
          })
        }, 1000)
      }
    })
  }
  
  function handleViewSubscriptionDetails(subscription: Subscription) {
    setSelectedSubscription(subscription)
    setShowSubscriptionModal(true)
  }
  
  function handleModifyPlan(subscription: Subscription) {
    const planOptions = [
      { name: 'Starter', price: 399, maxEmployees: 20, features: ['Basic leave management', 'Email support', 'Standard reporting'] },
      { name: 'Professional', price: 849, maxEmployees: 50, features: ['Advanced leave management', 'Priority support', 'Advanced analytics', 'Custom workflows'] },
      { name: 'Enterprise', price: 2499, maxEmployees: 'Unlimited', features: ['Full feature access', '24/7 support', 'Custom integrations', 'Dedicated account manager'] }
    ]
    
    let planDetails = `🔄 PLAN MODIFICATION FOR: ${subscription.organizationName}\n`
    planDetails += '='.repeat(60) + '\n\n'
    planDetails += `Current Plan: ${subscription.plan}\n`
    planDetails += `Current Price: R${subscription.monthlyPrice.toLocaleString()}/month\n`
    planDetails += `Current Employees: ${subscription.employees}\n`
    planDetails += `Next Billing: ${new Date(subscription.nextBilling).toLocaleDateString()}\n\n`
    
    planDetails += 'AVAILABLE PLANS:\n'
    planDetails += '─'.repeat(30) + '\n'
    
    planOptions.forEach((plan, index) => {
      const savings = subscription.monthlyPrice - plan.price
      planDetails += `${index + 1}. ${plan.name} Plan\n`
      planDetails += `   Price: R${plan.price.toLocaleString()}/month\n`
      planDetails += `   Max Employees: ${plan.maxEmployees}\n`
      planDetails += `   ${savings > 0 ? `💰 Save R${savings.toLocaleString()}/month` : savings < 0 ? `📈 Additional R${Math.abs(savings).toLocaleString()}/month` : '💰 Same price'}\n`
      planDetails += `   Features: ${plan.features.join(', ')}\n\n`
    })
    
    planDetails += 'MODIFICATION OPTIONS:\n'
    planDetails += '─'.repeat(30) + '\n'
    planDetails += '• Upgrade: Immediate activation\n'
    planDetails += '• Downgrade: Effective next billing cycle\n'
    planDetails += '• Pro-rated billing adjustments\n'
    planDetails += '• Feature transition assistance\n\n'
    
    showStyledModal({
      title: 'Plan Modification Options',
      message: `Review and confirm plan modification for ${subscription.organizationName}`,
      type: 'confirm',
      details: planDetails,
      onConfirm: () => {
        // Simulate plan modification process
        setTimeout(() => {
          const newPlan = planOptions[Math.floor(Math.random() * planOptions.length)]
          showStyledModal({
            title: 'Plan Modified Successfully',
            message: `${subscription.organizationName} plan has been successfully modified`,
            type: 'success',
            details: `Plan Change Summary:\n• Previous Plan: ${subscription.plan}\n• New Plan: ${newPlan.name}\n• Monthly Price: R${newPlan.price.toLocaleString()}\n• Employee Limit: ${newPlan.maxEmployees}\n• Effective Date: ${subscription.plan === 'Enterprise' ? 'Next billing cycle' : 'Immediately'}\n\nActions Completed:\n📧 Confirmation email sent to organization\n📱 Account dashboard updated\n💾 Changes logged in audit trail\n🔄 Billing cycle adjusted automatically`
          })
        }, 1500)
      }
    })
  }
  
  function handleSuspendSubscription(subscription: Subscription) {
    const suspensionDetails = `⚠️ SUSPENSION CONFIRMATION FOR: ${subscription.organizationName}\n`
      + '='.repeat(65) + '\n\n'
      + `Current Plan: ${subscription.plan}\n`
      + `Monthly Price: R${subscription.monthlyPrice.toLocaleString()}\n`
      + `Employees Affected: ${subscription.employees}\n`
      + `Next Billing: ${new Date(subscription.nextBilling).toLocaleDateString()}\n\n`
      + 'SUSPENSION EFFECTS:\n'
      + '─'.repeat(30) + '\n'
      + '🔒 User access will be immediately disabled\n'
      + '💾 All data will be preserved (90 days)\n'
      + '⏸️ Billing will be paused\n'
      + '📧 Organization will be notified\n'
      + '🔄 Can be reactivated at any time\n\n'
      + 'SUSPENSION REASONS:\n'
      + '─'.repeat(25) + '\n'
      + '1. Payment Issues\n'
      + '2. Policy Violation\n'
      + '3. Customer Request\n'
      + '4. System Maintenance\n'
      + '5. Other\n\n'
      + '⚠️ WARNING: This action affects all users in the organization!\n'
      + '='.repeat(65)
    
    showStyledModal({
      title: 'Suspend Subscription',
      message: `Confirm suspension for ${subscription.organizationName}`,
      type: 'warning',
      details: suspensionDetails,
      onConfirm: () => {
        // Show reason selection modal
        const reasons = [
          'Payment Issues',
          'Policy Violation',
          'Customer Request',
          'System Maintenance',
          'Other'
        ]
        const randomReason = reasons[Math.floor(Math.random() * reasons.length)]
        
        // Simulate suspension process
        setTimeout(() => {
          showStyledModal({
            title: 'Subscription Suspended Successfully',
            message: `${subscription.organizationName} subscription has been suspended`,
            type: 'success',
            details: `Suspension Summary:\n• Organization: ${subscription.organizationName}\n• Reason: ${randomReason}\n• Suspension Date: ${new Date().toLocaleDateString()}\n• Data Retention: 90 days\n• Previous Status: ${subscription.status.toUpperCase()}\n• New Status: SUSPENDED\n\nActions Completed:\n📧 Notification email sent to organization\n🔒 User access immediately disabled\n⏸️ Billing cycle paused\n📱 Admin dashboard updated\n💾 Suspension logged in audit trail\n🔄 Auto-reactivation reminder set (90 days)\n\nTo reactivate this subscription, use the 'Reactivate Subscription' option from the actions menu.`
          })
        }, 1500)
      }
    })
  }
  
  function handleRevenueDrilldown(type: 'collected' | 'pending' | 'overdue') {
    const filteredRecords = mockBillingRecords.filter(record => {
      switch (type) {
        case 'collected': return record.status === 'paid'
        case 'pending': return record.status === 'pending'
        case 'overdue': return record.status === 'overdue'
        default: return false
      }
    })

    let drilldownData = ''
    let title = ''
    
    switch (type) {
      case 'collected':
        title = '💰 REVENUE COLLECTED - DETAILED BREAKDOWN'
        drilldownData += `Total Records: ${filteredRecords.length}\n`
        drilldownData += `Total Amount: R${filteredRecords.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}\n\n`
        drilldownData += 'TOP PERFORMING ORGANIZATIONS:\n'
        drilldownData += '─'.repeat(35) + '\n'
        filteredRecords
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)
          .forEach((record, index) => {
            drilldownData += `${index + 1}. ${record.organizationName}\n`
            drilldownData += `   Plan: ${record.plan} | Amount: R${record.amount.toLocaleString()}\n`
            drilldownData += `   Employees: ${record.employees} | Paid: ${new Date(record.paidDate!).toLocaleDateString()}\n\n`
          })
        break
      
      case 'pending':
        title = '⏰ PENDING PAYMENTS - ACTION REQUIRED'
        drilldownData += `Total Records: ${filteredRecords.length}\n`
        drilldownData += `Expected Revenue: R${filteredRecords.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}\n\n`
        drilldownData += 'PENDING INVOICES:\n'
        drilldownData += '─'.repeat(25) + '\n'
        filteredRecords.forEach((record, index) => {
          const daysUntilDue = Math.ceil((new Date(record.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          drilldownData += `${index + 1}. ${record.organizationName}\n`
          drilldownData += `   Plan: ${record.plan} | Amount: R${record.amount.toLocaleString()}\n`
          drilldownData += `   Due: ${new Date(record.dueDate).toLocaleDateString()} (${daysUntilDue} days)\n`
          drilldownData += `   Employees: ${record.employees}\n\n`
        })
        break
        
      case 'overdue':
        title = '⚠️ OVERDUE PAYMENTS - URGENT ACTION NEEDED'
        drilldownData += `Total Records: ${filteredRecords.length}\n`
        drilldownData += `Overdue Amount: R${filteredRecords.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}\n\n`
        drilldownData += 'OVERDUE INVOICES (Action Required):\n'
        drilldownData += '─'.repeat(40) + '\n'
        filteredRecords.forEach((record, index) => {
          const daysOverdue = Math.ceil((new Date().getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          drilldownData += `${index + 1}. ${record.organizationName}\n`
          drilldownData += `   Plan: ${record.plan} | Amount: R${record.amount.toLocaleString()}\n`
          drilldownData += `   Due: ${new Date(record.dueDate).toLocaleDateString()} (${daysOverdue} days overdue)\n`
          drilldownData += `   Risk Level: ${daysOverdue > 30 ? '🔴 HIGH' : daysOverdue > 14 ? '🟡 MEDIUM' : '🟢 LOW'}\n`
          drilldownData += `   Next Action: ${daysOverdue > 30 ? 'Legal action' : daysOverdue > 14 ? 'Final notice' : 'Send reminder'}\n\n`
        })
        break
    }
    
    // Show detailed drill-down modal with export option
    showStyledModal({
      title: title,
      message: 'Detailed revenue analysis with export option',
      type: 'info',
      details: drilldownData,
      onConfirm: () => {
        // Export detailed report
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `${type}_revenue_drilldown_${timestamp}.txt`
        const fullReport = `${title}\n${'='.repeat(50)}\n\n${drilldownData}\n\nGenerated: ${new Date().toLocaleString()}\nLeaveHub Billing System\n${'='.repeat(50)}`
        
        const blob = new Blob([fullReport], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        showStyledModal({
          title: 'Report Exported Successfully',
          message: `Detailed ${type} revenue report has been exported`,
          type: 'success',
          details: `Export Details:\n• File Name: ${filename}\n• Format: Text Report\n• Generated: ${new Date().toLocaleString()}\n• Records Included: ${filteredRecords.length}\n• Report Type: ${title}\n\nThe report has been saved to your Downloads folder.`
        })
      }
    })
  }

  function handleSubscriptionsDrilldown() {
    const activeSubscriptions = mockSubscriptions.filter(sub => sub.status === 'active')
    const totalMRR = activeSubscriptions.reduce((sum, sub) => sum + sub.monthlyPrice, 0)
    const totalEmployees = activeSubscriptions.reduce((sum, sub) => sum + sub.employees, 0)
    
    let drilldownData = '📊 ACTIVE SUBSCRIPTIONS - DETAILED BREAKDOWN\n'
    drilldownData += '='.repeat(60) + '\n\n'
    drilldownData += `Total Active Subscriptions: ${activeSubscriptions.length}\n`
    drilldownData += `Monthly Recurring Revenue (MRR): R${totalMRR.toLocaleString()}\n`
    drilldownData += `Total Employees Managed: ${totalEmployees.toLocaleString()}\n`
    drilldownData += `Average Revenue per Account: R${Math.round(totalMRR / activeSubscriptions.length).toLocaleString()}\n\n`
    
    // Plan distribution
    const planDistribution = activeSubscriptions.reduce((acc, sub) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    drilldownData += 'SUBSCRIPTION DISTRIBUTION BY PLAN:\n'
    drilldownData += '─'.repeat(40) + '\n'
    Object.entries(planDistribution).forEach(([plan, count]) => {
      const percentage = Math.round((count / activeSubscriptions.length) * 100)
      const revenue = activeSubscriptions.filter(s => s.plan === plan).reduce((sum, s) => sum + s.monthlyPrice, 0)
      drilldownData += `${plan}: ${count} subscriptions (${percentage}%) - R${revenue.toLocaleString()}/month\n`
    })
    
    drilldownData += '\nTOP REVENUE GENERATING SUBSCRIPTIONS:\n'
    drilldownData += '─'.repeat(45) + '\n'
    activeSubscriptions
      .sort((a, b) => b.monthlyPrice - a.monthlyPrice)
      .slice(0, 5)
      .forEach((sub, index) => {
        drilldownData += `${index + 1}. ${sub.organizationName}\n`
        drilldownData += `   Plan: ${sub.plan} | Revenue: R${sub.monthlyPrice.toLocaleString()}/month\n`
        drilldownData += `   Employees: ${sub.employees} | Next Billing: ${new Date(sub.nextBilling).toLocaleDateString()}\n\n`
      })
    
    drilldownData += 'SUBSCRIPTION HEALTH METRICS:\n'
    drilldownData += '─'.repeat(35) + '\n'
    drilldownData += `• Average Employee Count: ${Math.round(totalEmployees / activeSubscriptions.length)}\n`
    drilldownData += `• Highest Value Subscription: R${Math.max(...activeSubscriptions.map(s => s.monthlyPrice)).toLocaleString()}/month\n`
    drilldownData += `• Lowest Value Subscription: R${Math.min(...activeSubscriptions.map(s => s.monthlyPrice)).toLocaleString()}/month\n`
    drilldownData += `• Enterprise Customers: ${planDistribution.Enterprise || 0} (${Math.round(((planDistribution.Enterprise || 0) / activeSubscriptions.length) * 100)}%)\n`
    
    showStyledModal({
      title: '📊 Active Subscriptions Analysis',
      message: 'Comprehensive subscription health report with export option',
      type: 'info',
      details: drilldownData,
      onConfirm: () => {
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `subscription_analysis_${timestamp}.txt`
        const fullReport = `${drilldownData}\n\nGenerated: ${new Date().toLocaleString()}\nLeaveHub Billing System\n${'='.repeat(60)}`
        
        const blob = new Blob([fullReport], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        showStyledModal({
          title: 'Analysis Report Exported',
          message: 'Subscription analysis report has been successfully exported',
          type: 'success',
          details: `Export Summary:\n• File Name: ${filename}\n• Total Subscriptions: ${activeSubscriptions.length}\n• MRR Analyzed: R${totalMRR.toLocaleString()}\n• Export Format: Text Report\n• Generated: ${new Date().toLocaleString()}\n\nReport includes plan distribution, revenue metrics, and subscriber health analysis.`
        })
      }
    })
  }
  
  function handleExportReport(format: 'csv' | 'excel' | 'pdf') {
    setShowExportModal(false)
    
    const reportData = {
      totalBilling: mockBillingRecords.length,
      totalRevenue: totalRevenue,
      pendingRevenue: pendingRevenue,
      overdueRevenue: overdueAmount,
      activeSubscriptions: mockSubscriptions.filter(s => s.status === 'active').length,
      generatedDate: new Date().toISOString().split('T')[0]
    }
    
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (format === 'csv') {
      let csvContent = 'LEAVEHUB BILLING & SUBSCRIPTIONS REPORT\n'
      csvContent += `Generated,${new Date().toLocaleString()}\n\n`
      
      csvContent += 'REVENUE SUMMARY\n'
      csvContent += `Metric,Amount\n`
      csvContent += `Total Revenue Collected,R${reportData.totalRevenue.toLocaleString()}\n`
      csvContent += `Pending Revenue,R${reportData.pendingRevenue.toLocaleString()}\n`
      csvContent += `Overdue Revenue,R${reportData.overdueRevenue.toLocaleString()}\n`
      csvContent += `Active Subscriptions,${reportData.activeSubscriptions}\n`
      csvContent += `Total Billing Records,${reportData.totalBilling}\n\n`
      
      csvContent += 'BILLING RECORDS\n'
      csvContent += 'Organization,Plan,Amount,Status,Due Date,Employees\n'
      mockBillingRecords.forEach(record => {
        csvContent += `"${record.organizationName.replace(/"/g, '""')}","${record.plan}",R${record.amount},"${record.status}","${record.dueDate}",${record.employees}\n`
      })
      
      csvContent += '\nSUBSCRIPTION DETAILS\n'
      csvContent += 'Organization,Plan,Status,Monthly Price,Employees,Next Billing\n'
      mockSubscriptions.forEach(sub => {
        csvContent += `"${sub.organizationName.replace(/"/g, '""')}","${sub.plan}","${sub.status}",R${sub.monthlyPrice},${sub.employees},"${sub.nextBilling}"\n`
      })
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      downloadFile(blob, `billing-report-${timestamp}.csv`)
      
    } else if (format === 'excel') {
      // Create Excel-like TSV format for better Excel compatibility
      let excelContent = 'LEAVEHUB BILLING & SUBSCRIPTIONS REPORT\t\t\t\t\t\n'
      excelContent += `Generated\t${new Date().toLocaleString()}\t\t\t\t\n\n`
      
      excelContent += 'REVENUE SUMMARY\t\t\t\t\t\n'
      excelContent += 'Metric\tAmount\t\t\t\t\n'
      excelContent += `Total Revenue Collected\tR${reportData.totalRevenue.toLocaleString()}\t\t\t\t\n`
      excelContent += `Pending Revenue\tR${reportData.pendingRevenue.toLocaleString()}\t\t\t\t\n`
      excelContent += `Overdue Revenue\tR${reportData.overdueRevenue.toLocaleString()}\t\t\t\t\n`
      excelContent += `Active Subscriptions\t${reportData.activeSubscriptions}\t\t\t\t\n`
      excelContent += `Total Billing Records\t${reportData.totalBilling}\t\t\t\t\n\n`
      
      excelContent += 'BILLING RECORDS\t\t\t\t\t\n'
      excelContent += 'Organization\tPlan\tAmount\tStatus\tDue Date\tEmployees\n'
      mockBillingRecords.forEach(record => {
        excelContent += `${record.organizationName}\t${record.plan}\tR${record.amount}\t${record.status}\t${record.dueDate}\t${record.employees}\n`
      })
      
      excelContent += '\nSUBSCRIPTION DETAILS\t\t\t\t\t\n'
      excelContent += 'Organization\tPlan\tStatus\tMonthly Price\tEmployees\tNext Billing\n'
      mockSubscriptions.forEach(sub => {
        excelContent += `${sub.organizationName}\t${sub.plan}\t${sub.status}\tR${sub.monthlyPrice}\t${sub.employees}\t${sub.nextBilling}\n`
      })
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
      downloadFile(blob, `billing-report-${timestamp}.xls`)
      
    } else if (format === 'pdf') {
      let pdfContent = 'LEAVEHUB BILLING & SUBSCRIPTIONS REPORT\n'
      pdfContent += '==========================================\n\n'
      pdfContent += `Generated: ${new Date().toLocaleString()}\n\n`
      
      pdfContent += 'REVENUE SUMMARY\n'
      pdfContent += '---------------\n'
      pdfContent += `Total Revenue Collected: R${reportData.totalRevenue.toLocaleString()}\n`
      pdfContent += `Pending Revenue: R${reportData.pendingRevenue.toLocaleString()}\n`
      pdfContent += `Overdue Revenue: R${reportData.overdueRevenue.toLocaleString()}\n`
      pdfContent += `Active Subscriptions: ${reportData.activeSubscriptions}\n`
      pdfContent += `Total Billing Records: ${reportData.totalBilling}\n\n`
      
      pdfContent += 'BILLING RECORDS\n'
      pdfContent += '---------------\n'
      mockBillingRecords.forEach(record => {
        pdfContent += `Organization: ${record.organizationName}\n`
        pdfContent += `Plan: ${record.plan}\n`
        pdfContent += `Amount: R${record.amount.toLocaleString()}\n`
        pdfContent += `Status: ${record.status.toUpperCase()}\n`
        pdfContent += `Due Date: ${new Date(record.dueDate).toLocaleDateString()}\n`
        pdfContent += `Employees: ${record.employees}\n`
        pdfContent += '-'.repeat(40) + '\n'
      })
      
      pdfContent += '\nSUBSCRIPTION DETAILS\n'
      pdfContent += '--------------------\n'
      mockSubscriptions.forEach(sub => {
        pdfContent += `Organization: ${sub.organizationName}\n`
        pdfContent += `Plan: ${sub.plan}\n`
        pdfContent += `Status: ${sub.status.toUpperCase()}\n`
        pdfContent += `Monthly Price: R${sub.monthlyPrice.toLocaleString()}\n`
        pdfContent += `Employees: ${sub.employees}\n`
        pdfContent += `Next Billing: ${new Date(sub.nextBilling).toLocaleDateString()}\n`
        pdfContent += '-'.repeat(40) + '\n'
      })
      
      pdfContent += '\n\n' + '='.repeat(60) + '\n'
      pdfContent += 'LeaveHub\n'
      pdfContent += 'Leave Management System\n'
      pdfContent += 'www.leavehub.co.za\n'
      pdfContent += '='.repeat(60) + '\n'
      
      const blob = new Blob([pdfContent], { type: 'text/plain' })
      downloadFile(blob, `billing-report-${timestamp}.txt`)
    }
    
    showStyledModal({
      title: 'Billing Report Exported',
      message: `Billing report has been successfully exported as ${format.toUpperCase()}`,
      type: 'success',
      details: `Export Summary:\n• Format: ${format.toUpperCase()}\n• Total Records: ${reportData.totalBilling}\n• Revenue Included: R${reportData.totalRevenue.toLocaleString()}\n• Generated: ${new Date().toLocaleString()}\n• File saved to Downloads folder\n\nReport includes:\n📋 Complete billing records\n📊 Revenue summaries\n📈 Subscription details\n💰 Financial analytics`
    })
  }
  
  function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}