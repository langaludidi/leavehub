import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface Integration {
  id: string
  name: string
  type: 'HRIS' | 'Calendar' | 'Email' | 'SSO' | 'API'
  status: 'active' | 'inactive' | 'error'
  description: string
  lastSync?: string
}

interface SystemSetting {
  id: string
  category: string
  name: string
  value: string | boolean | number
  type: 'text' | 'boolean' | 'number' | 'select'
  description: string
  options?: string[]
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Microsoft Outlook',
    type: 'Calendar',
    status: 'active',
    description: 'Sync leave requests with employee calendars',
    lastSync: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Azure Active Directory',
    type: 'SSO',
    status: 'active',
    description: 'Single sign-on authentication provider',
    lastSync: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    name: 'Workday HRIS',
    type: 'HRIS',
    status: 'inactive',
    description: 'Employee data synchronization',
  },
  {
    id: '4',
    name: 'SendGrid',
    type: 'Email',
    status: 'active',
    description: 'Email notification service',
    lastSync: '2024-01-15T12:15:00Z'
  }
]

const mockSettings: SystemSetting[] = [
  {
    id: '1',
    category: 'Platform',
    name: 'Platform Name',
    value: 'LeaveHub',
    type: 'text',
    description: 'The name displayed across the platform'
  },
  {
    id: '2',
    category: 'Platform',
    name: 'Maximum File Upload Size',
    value: 10,
    type: 'number',
    description: 'Maximum file upload size in MB'
  },
  {
    id: '3',
    category: 'Security',
    name: 'Require Two-Factor Authentication',
    value: false,
    type: 'boolean',
    description: 'Enforce 2FA for all users'
  },
  {
    id: '4',
    category: 'Security',
    name: 'Password Policy',
    value: 'medium',
    type: 'select',
    description: 'Password complexity requirements',
    options: ['low', 'medium', 'high']
  },
  {
    id: '5',
    category: 'Notifications',
    name: 'Email Notifications Enabled',
    value: true,
    type: 'boolean',
    description: 'Enable email notifications system-wide'
  }
]

export function SystemSettings({ userRole = 'superadmin' }: { userRole?: 'admin' | 'superadmin' }) {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<SystemSetting[]>(mockSettings)
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [showAddIntegrationModal, setShowAddIntegrationModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const tabs = [
    { id: 'general', name: 'General Settings', icon: '⚙️' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'backup', name: 'Backup & Recovery', icon: '💾' }
  ]

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'HRIS': return '👥'
      case 'Calendar': return '📅'
      case 'Email': return '📧'
      case 'SSO': return '🔐'
      case 'API': return '⚡'
      default: return '🔗'
    }
  }

  const handleSettingChange = (id: string, newValue: string | boolean | number) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value: newValue } : setting
    ))
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, SystemSetting[]>)

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl heading-premium text-gray-900">System Settings</h1>
            <p className="text-premium text-gray-600 mt-2">Global system configuration, integrations, and platform management</p>
          </div>
          <button className="btn-premium bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Save All Changes</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-900 shadow-md font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-premium">{tab.name}</span>
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="space-y-6">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category} className="card-premium shadow-xl">
                <div className="px-8 py-6 border-b border-gray-100">
                  <h2 className="text-xl heading-premium text-gray-900">{category} Settings</h2>
                  <p className="text-premium text-gray-600 text-sm mt-1">Configure {category.toLowerCase()} options</p>
                </div>
                <div className="p-8 space-y-6">
                  {categorySettings.map(setting => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="heading-premium text-gray-900">{setting.name}</h3>
                        <p className="text-premium text-gray-600 text-sm mt-1">{setting.description}</p>
                      </div>
                      <div className="ml-6">
                        {setting.type === 'boolean' && (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={setting.value as boolean}
                              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        )}
                        {setting.type === 'text' && (
                          <input
                            type="text"
                            value={setting.value as string}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            className="w-48 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        )}
                        {setting.type === 'number' && (
                          <input
                            type="number"
                            value={setting.value as number}
                            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        )}
                        {setting.type === 'select' && (
                          <select
                            value={setting.value as string}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {setting.options?.map(option => (
                              <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="card-premium shadow-xl">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl heading-premium text-gray-900">System Integrations</h2>
                  <p className="text-premium text-gray-600 text-sm mt-1">Manage third-party integrations and APIs</p>
                </div>
                <button 
                  onClick={() => setShowAddIntegrationModal(true)}
                  className="btn-premium bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transform hover:scale-105 transition-all duration-200"
                >
                  Add Integration
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {integrations.map(integration => (
                <div key={integration.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-xl">{getIntegrationIcon(integration.type)}</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg heading-premium text-gray-900">{integration.name}</h3>
                        <p className="text-premium text-gray-600">{integration.description}</p>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getIntegrationStatusColor(integration.status)}`}>
                            {integration.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700`}>
                            {integration.type}
                          </span>
                          {integration.lastSync && (
                            <span className="text-premium text-gray-500 text-xs">
                              Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleConfigureIntegration(integration)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                      >
                        Configure
                      </button>
                      <button 
                        onClick={() => handleTestIntegration(integration)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                      >
                        Test
                      </button>
                      <button 
                        onClick={() => handleToggleIntegration(integration)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                      >
                        {integration.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-premium shadow-xl">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl heading-premium text-gray-900">Security Overview</h2>
                <p className="text-premium text-gray-600 text-sm mt-1">Current security status and metrics</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">SSL Certificate</h3>
                    <p className="text-premium text-gray-600 text-sm">Valid until Dec 2024</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">Data Encryption</h3>
                    <p className="text-premium text-gray-600 text-sm">AES-256 encryption active</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">Failed Login Attempts</h3>
                    <p className="text-premium text-gray-600 text-sm">12 attempts in last 24h</p>
                  </div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl heading-premium text-gray-900">Security Logs</h2>
                <p className="text-premium text-gray-600 text-sm mt-1">Recent security events</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-premium font-semibold text-gray-900">User login from new IP</p>
                    <p className="text-premium text-gray-600 text-sm">admin@techcorp.com from 192.168.1.100</p>
                    <p className="text-premium text-gray-500 text-xs mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-premium font-semibold text-gray-900">SSL certificate renewed</p>
                    <p className="text-premium text-gray-600 text-sm">Certificate valid until Dec 2024</p>
                    <p className="text-premium text-gray-500 text-xs mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-xl">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-premium font-semibold text-gray-900">Multiple failed login attempts</p>
                    <p className="text-premium text-gray-600 text-sm">IP 192.168.1.50 blocked temporarily</p>
                    <p className="text-premium text-gray-500 text-xs mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-premium shadow-xl">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl heading-premium text-gray-900">Backup Schedule</h2>
                <p className="text-premium text-gray-600 text-sm mt-1">Automated backup configuration</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">Database Backup</h3>
                    <p className="text-premium text-gray-600 text-sm">Daily at 2:00 AM UTC</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">File System Backup</h3>
                    <p className="text-premium text-gray-600 text-sm">Weekly on Sundays at 3:00 AM UTC</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="card-premium shadow-xl">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl heading-premium text-gray-900">Recent Backups</h2>
                <p className="text-premium text-gray-600 text-sm mt-1">Backup history and restore points</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">Database Backup</h3>
                    <p className="text-premium text-gray-600 text-sm">January 15, 2024 at 2:00 AM</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Restore
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">File System Backup</h3>
                    <p className="text-premium text-gray-600 text-sm">January 14, 2024 at 3:00 AM</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Restore
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="heading-premium text-gray-900">Database Backup</h3>
                    <p className="text-premium text-gray-600 text-sm">January 14, 2024 at 2:00 AM</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Restore
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
  
  // Integration Handler Functions
  function handleConfigureIntegration(integration: Integration) {
    setSelectedIntegration(integration)
    setShowConfigureModal(true)
  }
  
  function handleTestIntegration(integration: Integration) {
    alert(`🔍 Testing ${integration.name} integration...\n\nRunning connectivity tests:\n• Authentication check\n• API endpoint validation\n• Data synchronization test\n• Error handling verification\n\nTest results will be available in 30-60 seconds.`)
    
    // Simulate test progress
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate
      if (success) {
        alert(`✅ ${integration.name} integration test completed successfully!\n\n• Connection: OK\n• Authentication: Valid\n• Data sync: Operational\n• Response time: 127ms`)
      } else {
        alert(`❌ ${integration.name} integration test failed!\n\n• Connection: Failed\n• Error: Authentication timeout\n• Action needed: Check credentials and network connectivity`)
      }
    }, 2000)
  }
  
  function handleToggleIntegration(integration: Integration) {
    const newStatus = integration.status === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'active' ? 'enable' : 'disable'
    
    const confirmed = confirm(`⚠️ ${action.charAt(0).toUpperCase() + action.slice(1)} ${integration.name}?\n\nThis will ${action} the integration and may affect connected services.`)
    
    if (confirmed) {
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: newStatus }
          : int
      ))
      
      alert(`✅ ${integration.name} has been ${action}d successfully!`)
    }
  }
}