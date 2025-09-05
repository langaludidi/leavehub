import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

interface PartnerApplication {
  companyName: string
  contactEmail: string
  contactPhone: string
  website: string
  industry: string
  expectedVolume: string
  revenueShare: string
  brandingRequirements: string
  technicalRequirements: string
  launchTimeline: string
  businessModel: string
  targetMarket: string
  customization: {
    primaryColor: string
    secondaryColor: string
    logoUrl: string
    customDomain: string
    companyDescription: string
    supportEmail: string
    features: string[]
  }
}

export function WhiteLabelOnboarding() {
  const { actualTheme } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [formData, setFormData] = useState<PartnerApplication>({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    industry: '',
    expectedVolume: '',
    revenueShare: '',
    brandingRequirements: '',
    technicalRequirements: '',
    launchTimeline: '',
    businessModel: '',
    targetMarket: '',
    customization: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      logoUrl: '',
      customDomain: '',
      companyDescription: '',
      supportEmail: '',
      features: []
    }
  })

  const steps: OnboardingStep[] = [
    {
      id: '1',
      title: 'Company Information',
      description: 'Basic details about your organization',
      completed: currentStep > 1
    },
    {
      id: '2',
      title: 'Business Requirements',
      description: 'Your specific needs and expectations',
      completed: currentStep > 2
    },
    {
      id: '3',
      title: 'Revenue & Pricing',
      description: 'Partnership terms and revenue sharing',
      completed: currentStep > 3
    },
    {
      id: '4',
      title: 'Customization & Branding',
      description: 'Configure your white label appearance',
      completed: currentStep > 4
    },
    {
      id: '5',
      title: 'Technical Setup',
      description: 'Implementation and domain configuration',
      completed: currentStep > 5
    },
    {
      id: '6',
      title: 'Review & Submit',
      description: 'Final review of your application',
      completed: false
    }
  ]

  const handleInputChange = (field: keyof PartnerApplication, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCustomizationChange = (field: keyof PartnerApplication['customization'], value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      customization: { ...prev.customization, [field]: value }
    }))
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.companyName.trim()) errors.companyName = 'Company name is required'
        if (!formData.contactEmail.trim()) errors.contactEmail = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) errors.contactEmail = 'Invalid email format'
        if (!formData.industry) errors.industry = 'Industry is required'
        break
      case 2:
        if (!formData.expectedVolume) errors.expectedVolume = 'Expected volume is required'
        if (!formData.businessModel) errors.businessModel = 'Business model is required'
        break
      case 3:
        if (!formData.revenueShare) errors.revenueShare = 'Revenue share selection is required'
        if (!formData.launchTimeline) errors.launchTimeline = 'Launch timeline is required'
        break
      case 4:
        if (!formData.customization.supportEmail.trim()) {
          errors.supportEmail = 'Support email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.customization.supportEmail)) {
          errors.supportEmail = 'Invalid email format'
        }
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitApplication = async () => {
    if (!validateStep(5)) return
    
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate tenant ID and subdomain
      const generatedTenantId = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now()
      
      setTenantId(generatedTenantId)
      
      // Save to localStorage
      const tenantData = {
        ...formData,
        tenantId: generatedTenantId,
        status: 'active',
        subdomain: generatedTenantId,
        applicationDate: new Date().toISOString(),
        setupDate: new Date().toISOString()
      }
      
      localStorage.setItem('whiteLabelTenant', JSON.stringify(tenantData))
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('There was an error submitting your application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success page
  if (submitted) {
    const subdomain = formData.customization.customDomain || 
      `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.leavehub.app`
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to LeaveHub White Label!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Congratulations! Your white label instance has been created and is ready to use.
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Your White Label Portal</h3>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <code className="text-lg text-blue-600 font-mono">
              https://{subdomain}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://${subdomain}`)
              alert('Portal URL copied to clipboard!')
            }}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Copy URL
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-900 mb-3">Tenant ID</h3>
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
            <code className="text-xl font-bold text-green-600">{tenantId}</code>
          </div>
          <p className="text-sm text-green-700 mt-2">Use this ID for API access and support</p>
        </div>

        <div 
          className="mx-auto w-full max-w-md p-6 rounded-lg shadow-lg mb-6 text-center text-white"
          style={{ backgroundColor: formData.customization.primaryColor }}
        >
          <h4 className="font-bold text-xl mb-2">{formData.companyName}</h4>
          <p className="text-sm opacity-90">
            {formData.customization.companyDescription || 'Professional leave management solution'}
          </p>
          <div 
            className="mt-3 px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: formData.customization.secondaryColor }}
          >
            Your Custom Portal
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• <strong>Portal Access:</strong> Admin credentials will be sent to {formData.contactEmail}</li>
            <li>• <strong>Domain Setup:</strong> {formData.customization.customDomain ? 'Configure your DNS as instructed' : 'Use the provided subdomain immediately'}</li>
            <li>• <strong>Customization:</strong> Further customize colors, logos, and content</li>
            <li>• <strong>Revenue Share:</strong> {formData.revenueShare} as selected</li>
            <li>• <strong>Support:</strong> Dedicated support via {formData.customization.supportEmail}</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://${subdomain}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Access Your Portal
          </a>
          <a
            href="/whitelabel"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Manage White Label
          </a>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    actualTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    actualTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="https://yourcompany.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    actualTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="contact@yourcompany.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    actualTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="+27 11 123 4567"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select your industry</option>
                <option value="hr-consulting">HR Consulting</option>
                <option value="payroll-services">Payroll Services</option>
                <option value="software-vendor">Software Vendor</option>
                <option value="system-integrator">System Integrator</option>
                <option value="reseller">Technology Reseller</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Expected Client Volume *
              </label>
              <select
                value={formData.expectedVolume}
                onChange={(e) => handleInputChange('expectedVolume', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select expected volume</option>
                <option value="1-10">1-10 clients</option>
                <option value="11-50">11-50 clients</option>
                <option value="51-100">51-100 clients</option>
                <option value="100+">100+ clients</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Business Model *
              </label>
              <select
                value={formData.businessModel}
                onChange={(e) => handleInputChange('businessModel', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select your business model</option>
                <option value="reseller">Reseller - Mark up and resell</option>
                <option value="white-label">White Label - Own branding</option>
                <option value="referral">Referral - Commission based</option>
                <option value="integration">Integration - Add to existing platform</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Target Market
              </label>
              <textarea
                value={formData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Describe your target market, typical client size, and industry focus..."
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg border ${
              actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Revenue Sharing Models
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="revenueShare"
                    value="70-30"
                    checked={formData.revenueShare === '70-30'}
                    onChange={(e) => handleInputChange('revenueShare', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>70/30 Split</strong> - You keep 70% of revenue
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="revenueShare"
                    value="60-40"
                    checked={formData.revenueShare === '60-40'}
                    onChange={(e) => handleInputChange('revenueShare', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>60/40 Split</strong> - You keep 60% of revenue (includes full support)
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="revenueShare"
                    value="50-50"
                    checked={formData.revenueShare === '50-50'}
                    onChange={(e) => handleInputChange('revenueShare', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>50/50 Split</strong> - Equal partnership with co-marketing
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="revenueShare"
                    value="custom"
                    checked={formData.revenueShare === 'custom'}
                    onChange={(e) => handleInputChange('revenueShare', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <strong>Custom</strong> - Let's discuss based on your specific needs
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Launch Timeline *
              </label>
              <select
                value={formData.launchTimeline}
                onChange={(e) => handleInputChange('launchTimeline', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select timeline</option>
                <option value="immediate">Ready to launch immediately</option>
                <option value="1-month">Within 1 month</option>
                <option value="2-3-months">2-3 months</option>
                <option value="3-6-months">3-6 months</option>
                <option value="6-months+">6+ months</option>
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Primary Brand Color
                </label>
                <div className="flex space-x-3">
                  <input
                    type="color"
                    value={formData.customization.primaryColor}
                    onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                    className="w-16 h-12 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.customization.primaryColor}
                    onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
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
                    value={formData.customization.secondaryColor}
                    onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                    className="w-16 h-12 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.customization.secondaryColor}
                    onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
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
                  Company Logo URL
                </label>
                <input
                  type="url"
                  value={formData.customization.logoUrl}
                  onChange={(e) => handleCustomizationChange('logoUrl', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    actualTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="https://yourcompany.com/logo.png"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Support Email *
                </label>
                <input
                  type="email"
                  value={formData.customization.supportEmail}
                  onChange={(e) => handleCustomizationChange('supportEmail', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.supportEmail ? 'border-red-300 bg-red-50' : 
                    actualTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="support@yourcompany.com"
                />
                {validationErrors.supportEmail && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.supportEmail}</p>
                )}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Company Description
              </label>
              <textarea
                value={formData.customization.companyDescription}
                onChange={(e) => handleCustomizationChange('companyDescription', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Brief description of your company for the platform"
              />
            </div>

            {/* Live Preview */}
            <div className={`p-6 rounded-lg border ${
              actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Live Preview
              </h3>
              <div 
                className="mx-auto w-full max-w-md p-6 rounded-lg shadow-lg mb-4 text-center text-white"
                style={{ backgroundColor: formData.customization.primaryColor }}
              >
                <h4 className="font-bold text-xl mb-2">{formData.companyName || 'Your Company'}</h4>
                <p className="text-sm opacity-90">
                  {formData.customization.companyDescription || 'Professional leave management solution'}
                </p>
                <div 
                  className="mt-3 px-4 py-2 rounded text-sm font-medium"
                  style={{ backgroundColor: formData.customization.secondaryColor }}
                >
                  Get Started
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={formData.customization.customDomain}
                onChange={(e) => handleCustomizationChange('customDomain', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="hr.yourcompany.com"
              />
              <p className={`text-xs mt-1 ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Leave blank to use: {formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.leavehub.app
              </p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Technical Requirements
              </label>
              <textarea
                value={formData.technicalRequirements}
                onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Any specific technical integrations, APIs, or customizations needed..."
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${
              actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Application Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Company:</span>
                  <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                    {formData.companyName || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Email:</span>
                  <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                    {formData.contactEmail || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Industry:</span>
                  <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                    {formData.industry || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Expected Volume:</span>
                  <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                    {formData.expectedVolume || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Revenue Share:</span>
                  <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                    {formData.revenueShare || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Timeline:</span>
                  <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                    {formData.launchTimeline || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Primary Color:</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: formData.customization.primaryColor }}
                    />
                    <span className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                      {formData.customization.primaryColor}
                    </span>
                  </div>
                </div>
                <div>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Support Email:</span>
                  <p className={actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                    {formData.customization.supportEmail || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="mx-auto w-full max-w-md p-6 rounded-lg shadow-lg text-center text-white"
              style={{ backgroundColor: formData.customization.primaryColor }}
            >
              <h4 className="font-bold text-xl mb-2">{formData.companyName}</h4>
              <p className="text-sm opacity-90">
                {formData.customization.companyDescription || 'Professional leave management solution'}
              </p>
              <div 
                className="mt-3 px-4 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: formData.customization.secondaryColor }}
              >
                Login to Your Portal
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className={`text-3xl font-bold mb-2 ${
          actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          White Label Partner Application
        </h1>
        <p className={`${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Join our partner program and offer LeaveHub under your own brand
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                parseInt(step.id) <= currentStep
                  ? actualTheme === 'dark'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-blue-600 border-blue-600 text-white'
                  : actualTheme === 'dark'
                    ? 'border-gray-600 text-gray-400'
                    : 'border-gray-300 text-gray-400'
              }`}>
                {step.completed ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-0.5 mx-4 ${
                  parseInt(step.id) < currentStep
                    ? 'bg-blue-600'
                    : actualTheme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className={`text-xl font-semibold ${
            actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {steps[currentStep - 1].title}
          </h2>
          <p className={`text-sm ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className={`p-8 rounded-xl shadow-lg ${
        actualTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-300 dark:border-gray-600">
          <button
            onClick={previousStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                : actualTheme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={submitApplication}
              disabled={isSubmitting}
              className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating Portal...' : 'Create White Label Portal'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}