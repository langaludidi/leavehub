import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { startLocalTrial } from '../../lib/trialManager'
import { determineAccountType } from './RoleBasedRouter'
import { ExistingUserModal } from '../modals/ExistingUserModal'

interface SignUpForm {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  companyName: string
  companySize: string
  industry: string
  accountType: 'employee' | 'company' | 'affiliate' | 'whitelabel'
  invitationCode?: string
  agreeToTerms: boolean
  agreeToMarketing: boolean
}

export function SignUp() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    companySize: '',
    industry: '',
    accountType: 'company',
    invitationCode: '',
    agreeToTerms: false,
    agreeToMarketing: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showExistingUserModal, setShowExistingUserModal] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const companySizes = [
    '1-10 employees',
    '11-50 employees', 
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ]

  const industries = [
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Non-profit',
    'Government',
    'Other'
  ]

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const validateCurrentStep = () => {
    setError('')
    
    if (currentStep === 1) {
      if (formData.accountType === 'employee' && !formData.invitationCode?.trim()) {
        setError('Invitation code is required for employee accounts')
        return false
      }
      // Validate invitation code format
      if (formData.accountType === 'employee' && formData.invitationCode && !formData.invitationCode.match(/^INV-[A-Z0-9]{6}$/)) {
        setError('Please enter a valid invitation code (format: INV-XXXXXX)')
        return false
      }
    }
    
    if (currentStep === 2) {
      if (!formData.fullName.trim()) {
        setError('Full name is required')
        return false
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Valid email address is required')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }
    
    if (currentStep === 3) {
      if (formData.accountType === 'company' || formData.accountType === 'affiliate' || formData.accountType === 'whitelabel') {
        if (!formData.companyName.trim()) {
          setError('Company name is required')
          return false
        }
        if (!formData.companySize) {
          setError('Company size is required')
          return false
        }
        if (!formData.industry) {
          setError('Industry is required')
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        company_name: formData.companyName,
        company_size: formData.companySize,
        industry: formData.industry,
        account_type: formData.accountType,
        invitation_code: formData.invitationCode,
        confirm: false, // Email confirmation required in production
        email_verified: false
      })
      
      if (error) {
        // Check if error is due to user already exists
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('already exists') ||
            error.code === 'user_already_exists') {
          
          // Show existing user modal
          setError('')
          setShowExistingUserModal(true)
          return
        } else {
          setError(error.message)
        }
      } else {
        // Start local trial tracking for company accounts
        if (formData.accountType === 'company') {
          startLocalTrial()
        }
        setSuccess(true)
      }
    } catch (err: any) {
      // Check if it's a user already exists error from the catch block too
      const errorMessage = err.message || 'An error occurred during registration'
      if (errorMessage.includes('User already registered') || 
          errorMessage.includes('already registered') ||
          errorMessage.includes('already exists')) {
        
        // Show existing user modal
        setError('')
        setShowExistingUserModal(true)
        return
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrial = () => {
    // Navigate based on account type
    switch (formData.accountType) {
      case 'company':
        navigate('/admin')
        break
      case 'affiliate':
        navigate('/affiliate/dashboard')
        break
      case 'whitelabel':
        navigate('/whitelabel/dashboard')
        break
      case 'employee':
      default:
        navigate('/employee')
        break
    }
  }

  const handleExistingUserSignIn = () => {
    setShowExistingUserModal(false)
    navigate('/signin?email=' + encodeURIComponent(formData.email))
  }

  const handleExistingUserCancel = () => {
    setShowExistingUserModal(false)
    setError('An account with this email already exists. Please use a different email or sign in.')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to LeaveHub!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your account has been created successfully! Please check your email and click the verification link to activate your account.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">🎉 14-Day Free Trial Started!</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                You now have full access to all LeaveHub features for 14 days. No credit card required.
              </p>
            </div>
            <button
              onClick={handleStartTrial}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Start Exploring LeaveHub
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">LeaveHub</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Create your account</h2>
          <p className="text-gray-600 dark:text-gray-400">Start your 14-day free trial today</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold ${
              currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-4 sm:w-8 h-1 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold ${
              currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-4 sm:w-8 h-1 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold ${
              currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <div className={`w-4 sm:w-8 h-1 ${currentStep >= 4 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold ${
              currentStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              4
            </div>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-6 px-4 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 sm:py-8 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step 1: Account Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">What type of account do you need?</h3>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      id="company"
                      type="radio"
                      name="accountType"
                      value="company"
                      checked={formData.accountType === 'company'}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                      className="sr-only"
                    />
                    <label htmlFor="company" className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.accountType === 'company' 
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          formData.accountType === 'company' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}>
                          {formData.accountType === 'company' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Company Account</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">For businesses managing employee leave</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="employee"
                      type="radio"
                      name="accountType"
                      value="employee"
                      checked={formData.accountType === 'employee'}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                      className="sr-only"
                    />
                    <label htmlFor="employee" className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.accountType === 'employee' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          formData.accountType === 'employee' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}>
                          {formData.accountType === 'employee' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Employee Account</h4>
                          <p className="text-sm text-gray-600">Join your company's LeaveHub system</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="affiliate"
                      type="radio"
                      name="accountType"
                      value="affiliate"
                      checked={formData.accountType === 'affiliate'}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                      className="sr-only"
                    />
                    <label htmlFor="affiliate" className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.accountType === 'affiliate' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          formData.accountType === 'affiliate' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}>
                          {formData.accountType === 'affiliate' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Affiliate Partner</h4>
                          <p className="text-sm text-gray-600">Earn commission promoting LeaveHub</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="whitelabel"
                      type="radio"
                      name="accountType"
                      value="whitelabel"
                      checked={formData.accountType === 'whitelabel'}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                      className="sr-only"
                    />
                    <label htmlFor="whitelabel" className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.accountType === 'whitelabel' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          formData.accountType === 'whitelabel' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}>
                          {formData.accountType === 'whitelabel' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">White Label Partner</h4>
                          <p className="text-sm text-gray-600">Resell LeaveHub under your brand</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.accountType === 'employee' && (
                  <div>
                    <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Invitation Code *
                    </label>
                    <input
                      id="invitationCode"
                      type="text"
                      value={formData.invitationCode || ''}
                      onChange={(e) => setFormData({ ...formData, invitationCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base font-mono"
                      placeholder="INV-XXXXXX"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter the invitation code provided by your company administrator
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-indigo-600 text-white py-2 px-4 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Enter your work email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Create a password (min 6 characters)"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-indigo-600 text-white py-2 px-4 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 3: Company Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size *
                  </label>
                  <select
                    id="companySize"
                    required
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="">Select company size</option>
                    {companySizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry *
                  </label>
                  <select
                    id="industry"
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  >
                    <option value="">Select industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Terms and Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Final Step</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🎉 Your 14-Day Free Trial Includes:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Unlimited employees</li>
                    <li>• All premium features</li>
                    <li>• Advanced reporting & analytics</li>
                    <li>• Email support</li>
                    <li>• No credit card required</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-900">
                      I agree to the <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</Link> and{' '}
                      <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link> *
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="agreeToMarketing"
                      type="checkbox"
                      checked={formData.agreeToMarketing}
                      onChange={(e) => setFormData({ ...formData, agreeToMarketing: e.target.checked })}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agreeToMarketing" className="ml-2 text-sm text-gray-900">
                      Send me product updates and helpful tips (optional)
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Start Free Trial'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Sign in here
            </Link>
          </div>
          <Link to="/" className="block text-sm text-indigo-600 hover:text-indigo-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Existing User Modal */}
      <ExistingUserModal
        isOpen={showExistingUserModal}
        email={formData.email}
        onSignIn={handleExistingUserSignIn}
        onCancel={handleExistingUserCancel}
      />
    </div>
  )
}