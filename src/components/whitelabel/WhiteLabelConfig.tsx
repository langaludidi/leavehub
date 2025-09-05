import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface TenantConfig {
  basic: {
    tenantName: string
    subdomain: string
    customDomain: string
    description: string
  }
  branding: {
    primaryColor: string
    secondaryColor: string
    logoUrl: string
    faviconUrl: string
    customCss: string
  }
  features: {
    maxUsers: number
    customReports: boolean
    apiAccess: boolean
    ssoEnabled: boolean
    webhooksEnabled: boolean
    customFields: boolean
    advancedWorkflows: boolean
  }
  integrations: {
    emailProvider: string
    smsProvider: string
    storageProvider: string
    analyticsProvider: string
  }
  notifications: {
    fromEmail: string
    fromName: string
    supportEmail: string
    customTemplates: boolean
  }
}

const defaultConfig: TenantConfig = {
  basic: {
    tenantName: '',
    subdomain: '',
    customDomain: '',
    description: ''
  },
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logoUrl: '',
    faviconUrl: '',
    customCss: ''
  },
  features: {
    maxUsers: 100,
    customReports: false,
    apiAccess: false,
    ssoEnabled: false,
    webhooksEnabled: false,
    customFields: false,
    advancedWorkflows: false
  },
  integrations: {
    emailProvider: 'sendgrid',
    smsProvider: 'twilio',
    storageProvider: 'aws-s3',
    analyticsProvider: 'google-analytics'
  },
  notifications: {
    fromEmail: '',
    fromName: '',
    supportEmail: '',
    customTemplates: false
  }
}

export function WhiteLabelConfig() {
  const { actualTheme } = useTheme()
  const [config, setConfig] = useState<TenantConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState('basic')
  const [previewMode, setPreviewMode] = useState(false)

  const updateConfig = (section: keyof TenantConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '🏢' },
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'features', label: 'Features', icon: '⚙️' },
    { id: 'integrations', label: 'Integrations', icon: '🔌' },
    { id: 'notifications', label: 'Notifications', icon: '📧' }
  ]

  const renderBasicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Tenant Name *
          </label>
          <input
            type="text"
            value={config.basic.tenantName}
            onChange={(e) => updateConfig('basic', 'tenantName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Acme Corp HR Solutions"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Subdomain *
          </label>
          <div className="flex">
            <input
              type="text"
              value={config.basic.subdomain}
              onChange={(e) => updateConfig('basic', 'subdomain', e.target.value)}
              className={`flex-1 px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                actualTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="acme-corp"
            />
            <span className={`px-3 py-3 border border-l-0 rounded-r-lg ${
              actualTheme === 'dark'
                ? 'bg-gray-600 border-gray-600 text-gray-300'
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}>
              .leavehub.app
            </span>
          </div>
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Custom Domain (Optional)
        </label>
        <input
          type="text"
          value={config.basic.customDomain}
          onChange={(e) => updateConfig('basic', 'customDomain', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="hr.acmecorp.com"
        />
        <p className={`text-xs mt-1 ${
          actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Point your domain's CNAME record to: proxy.leavehub.app
        </p>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Description
        </label>
        <textarea
          value={config.basic.description}
          onChange={(e) => updateConfig('basic', 'description', e.target.value)}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="A brief description of this tenant instance"
        />
      </div>
    </div>
  )

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Primary Color
          </label>
          <div className="flex space-x-3">
            <input
              type="color"
              value={config.branding.primaryColor}
              onChange={(e) => updateConfig('branding', 'primaryColor', e.target.value)}
              className="w-16 h-12 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.branding.primaryColor}
              onChange={(e) => updateConfig('branding', 'primaryColor', e.target.value)}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                actualTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Secondary Color
          </label>
          <div className="flex space-x-3">
            <input
              type="color"
              value={config.branding.secondaryColor}
              onChange={(e) => updateConfig('branding', 'secondaryColor', e.target.value)}
              className="w-16 h-12 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.branding.secondaryColor}
              onChange={(e) => updateConfig('branding', 'secondaryColor', e.target.value)}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                actualTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Logo URL
          </label>
          <input
            type="url"
            value={config.branding.logoUrl}
            onChange={(e) => updateConfig('branding', 'logoUrl', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Favicon URL
          </label>
          <input
            type="url"
            value={config.branding.faviconUrl}
            onChange={(e) => updateConfig('branding', 'faviconUrl', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="https://example.com/favicon.ico"
          />
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Custom CSS
        </label>
        <textarea
          value={config.branding.customCss}
          onChange={(e) => updateConfig('branding', 'customCss', e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder=".custom-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }"
        />
      </div>
    </div>
  )

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Maximum Users
        </label>
        <input
          type="number"
          value={config.features.maxUsers}
          onChange={(e) => updateConfig('features', 'maxUsers', parseInt(e.target.value) || 0)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          min="1"
          max="10000"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'customReports', label: 'Custom Reports', description: 'Allow custom report generation' },
          { key: 'apiAccess', label: 'API Access', description: 'Enable REST API access' },
          { key: 'ssoEnabled', label: 'Single Sign-On', description: 'SAML/OAuth SSO integration' },
          { key: 'webhooksEnabled', label: 'Webhooks', description: 'Event-based webhooks' },
          { key: 'customFields', label: 'Custom Fields', description: 'Custom form fields' },
          { key: 'advancedWorkflows', label: 'Advanced Workflows', description: 'Complex approval workflows' }
        ].map(feature => (
          <div key={feature.key} className={`p-4 rounded-lg border ${
            actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className={`font-medium ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {feature.label}
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.features[feature.key as keyof typeof config.features] as boolean}
                  onChange={(e) => updateConfig('features', feature.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className={`text-xs ${
              actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Email Provider
          </label>
          <select
            value={config.integrations.emailProvider}
            onChange={(e) => updateConfig('integrations', 'emailProvider', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">Amazon SES</option>
            <option value="smtp">Custom SMTP</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            SMS Provider
          </label>
          <select
            value={config.integrations.smsProvider}
            onChange={(e) => updateConfig('integrations', 'smsProvider', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="twilio">Twilio</option>
            <option value="clicksend">ClickSend</option>
            <option value="messagemedia">MessageMedia</option>
            <option value="none">Disabled</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Storage Provider
          </label>
          <select
            value={config.integrations.storageProvider}
            onChange={(e) => updateConfig('integrations', 'storageProvider', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="aws-s3">Amazon S3</option>
            <option value="google-cloud">Google Cloud Storage</option>
            <option value="azure-blob">Azure Blob Storage</option>
            <option value="local">Local Storage</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Analytics Provider
          </label>
          <select
            value={config.integrations.analyticsProvider}
            onChange={(e) => updateConfig('integrations', 'analyticsProvider', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="google-analytics">Google Analytics</option>
            <option value="mixpanel">Mixpanel</option>
            <option value="amplitude">Amplitude</option>
            <option value="none">Disabled</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            From Email *
          </label>
          <input
            type="email"
            value={config.notifications.fromEmail}
            onChange={(e) => updateConfig('notifications', 'fromEmail', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="noreply@acmecorp.com"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            From Name
          </label>
          <input
            type="text"
            value={config.notifications.fromName}
            onChange={(e) => updateConfig('notifications', 'fromName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Acme Corp HR Team"
          />
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Support Email
        </label>
        <input
          type="email"
          value={config.notifications.supportEmail}
          onChange={(e) => updateConfig('notifications', 'supportEmail', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            actualTheme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="support@acmecorp.com"
        />
      </div>
      <div className={`p-4 rounded-lg border ${
        actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <label className={`font-medium ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Custom Email Templates
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.notifications.customTemplates}
              onChange={(e) => updateConfig('notifications', 'customTemplates', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <p className={`text-xs ${
          actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Allow custom branding in email templates
        </p>
      </div>
    </div>
  )

  const renderPreview = () => (
    <div className={`p-6 rounded-lg border-2 border-dashed ${
      actualTheme === 'dark' ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
    }`}>
      <div className="text-center">
        <h3 className={`text-lg font-semibold mb-2 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Configuration Preview
        </h3>
        <div 
          className="mx-auto w-full max-w-md p-4 rounded-lg shadow-lg mb-4"
          style={{ backgroundColor: config.branding.primaryColor }}
        >
          <div className="text-white text-center">
            <h4 className="font-bold text-lg">{config.basic.tenantName || 'Your Tenant Name'}</h4>
            <p className="text-sm opacity-90">
              {config.basic.subdomain ? `${config.basic.subdomain}.leavehub.app` : 'subdomain.leavehub.app'}
            </p>
          </div>
        </div>
        <div className="text-sm space-y-1">
          <p className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            <strong>Max Users:</strong> {config.features.maxUsers}
          </p>
          <p className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            <strong>Features Enabled:</strong>{' '}
            {Object.entries(config.features)
              .filter(([key, value]) => key !== 'maxUsers' && value)
              .length} of 6
          </p>
        </div>
      </div>
    </div>
  )

  const saveConfiguration = () => {
    console.log('Saving white label configuration:', config)
    alert('Configuration saved successfully!')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            White Label Configuration
          </h1>
          <p className={`${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Configure your white label tenant settings
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
              previewMode
                ? 'bg-blue-600 text-white border-blue-600'
                : actualTheme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={saveConfiguration}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {previewMode ? (
        renderPreview()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? actualTheme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : actualTheme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={`p-8 rounded-xl shadow-lg ${
              actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              {activeTab === 'basic' && renderBasicTab()}
              {activeTab === 'branding' && renderBrandingTab()}
              {activeTab === 'features' && renderFeaturesTab()}
              {activeTab === 'integrations' && renderIntegrationsTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}