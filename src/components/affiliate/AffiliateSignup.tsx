import React, { useState } from 'react'

interface AffiliateSignupForm {
  fullName: string
  email: string
  phone: string
  website: string
  marketingExperience: string
  audienceSize: string
  marketingChannels: string[]
  motivation: string
  paymentMethod: 'paypal' | 'bank_transfer'
  paymentDetails: string
  agreeToTerms: boolean
  agreeToPromotionGuidelines: boolean
}

const marketingChannelOptions = [
  'Social Media (Facebook, Instagram, Twitter)',
  'Email Marketing',
  'Content Marketing/Blogging',
  'YouTube/Video Content',
  'Paid Advertising (Google Ads, Facebook Ads)',
  'LinkedIn Network',
  'Industry Events/Conferences',
  'Word of Mouth/Personal Network',
  'SEO/Organic Search',
  'Other'
]

export function AffiliateSignup() {
  const [formData, setFormData] = useState<AffiliateSignupForm>({
    fullName: '',
    email: '',
    phone: '',
    website: '',
    marketingExperience: '',
    audienceSize: '',
    marketingChannels: [],
    motivation: '',
    paymentMethod: 'paypal',
    paymentDetails: '',
    agreeToTerms: false,
    agreeToPromotionGuidelines: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Partial<AffiliateSignupForm>>({})
  const [referralCode, setReferralCode] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      marketingChannels: checked 
        ? [...prev.marketingChannels, channel]
        : prev.marketingChannels.filter(c => c !== channel)
    }))
  }

  const validateForm = () => {
    const errors: Partial<AffiliateSignupForm> = {}
    
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.marketingExperience) errors.marketingExperience = 'Marketing experience is required'
    if (!formData.audienceSize) errors.audienceSize = 'Audience size is required'
    if (formData.marketingChannels.length === 0) errors.marketingChannels = ['Please select at least one marketing channel']
    if (!formData.motivation.trim()) errors.motivation = 'Please tell us about your motivation'
    if (!formData.paymentDetails.trim()) errors.paymentDetails = 'Payment details are required'
    if (!formData.agreeToTerms) errors.agreeToTerms = false
    if (!formData.agreeToPromotionGuidelines) errors.agreeToPromotionGuidelines = false
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setValidationErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate referral code
      const code = formData.fullName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase() + Math.floor(Math.random() * 10000)
      
      setReferralCode(code)
      
      // Save to localStorage for demo purposes
      const affiliateData = {
        ...formData,
        id: Date.now().toString(),
        referralCode: code,
        status: 'pending',
        commissionRate: 25,
        totalEarnings: 0,
        applicationDate: new Date().toISOString()
      }
      
      localStorage.setItem('affiliateProfile', JSON.stringify(affiliateData))
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting affiliate application:', error)
      alert('There was an error submitting your application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to LeaveHub Affiliates!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Congratulations! Your affiliate application has been approved. You can start earning commissions immediately.
        </p>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-900 mb-3">Your Referral Code</h3>
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
            <code className="text-2xl font-bold text-green-600">{referralCode}</code>
          </div>
          <p className="text-sm text-green-700 mt-2">Use this code in your referral links</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Your Referral Link</h3>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <code className="text-sm text-blue-600 break-all">
              https://leavehub.co.za?ref={referralCode}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://leavehub.co.za?ref=${referralCode}`)
              alert('Referral link copied to clipboard!')
            }}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Copy Link
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• <strong>25% Commission:</strong> Earn on every successful referral for 12 months</li>
            <li>• <strong>Marketing Materials:</strong> Access banners, templates, and content</li>
            <li>• <strong>Real-time Tracking:</strong> Monitor your clicks, conversions, and earnings</li>
            <li>• <strong>Monthly Payouts:</strong> Automatic payments via your preferred method</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/affiliate"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Go to Dashboard
          </a>
          <a
            href="/affiliate/materials"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Get Marketing Materials
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Join the LeaveHub Affiliate Program</h1>
        <p className="text-lg text-gray-600">
          Earn 25% commission on every successful referral. Help businesses streamline their leave management.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Partner with LeaveHub?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">25% Commission</h3>
            <p className="text-gray-600 text-sm">Recurring monthly commission for 12 months</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Easy to Sell</h3>
            <p className="text-gray-600 text-sm">High-quality product that businesses actually need</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Full Support</h3>
            <p className="text-gray-600 text-sm">Marketing materials, training, and dedicated support</p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website/Portfolio
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://your-website.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Marketing Experience */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Experience</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Marketing Experience *
                </label>
                <select
                  name="marketingExperience"
                  value={formData.marketingExperience}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-3">2-3 years</option>
                  <option value="4-5">4-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience/Network Size *
                </label>
                <select
                  name="audienceSize"
                  value={formData.audienceSize}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select audience size</option>
                  <option value="<1000">Less than 1,000</option>
                  <option value="1000-5000">1,000 - 5,000</option>
                  <option value="5000-10000">5,000 - 10,000</option>
                  <option value="10000-50000">10,000 - 50,000</option>
                  <option value="50000+">50,000+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Marketing Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Marketing Channels You Use *
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {marketingChannelOptions.map((channel) => (
                <label key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.marketingChannels.includes(channel)}
                    onChange={(e) => handleChannelChange(channel, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{channel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to become a LeaveHub affiliate? *
            </label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about your motivation and how you plan to promote LeaveHub..."
            />
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.paymentMethod === 'paypal' ? 'PayPal Email' : 'Bank Account Details'} *
                </label>
                <input
                  type="text"
                  name="paymentDetails"
                  value={formData.paymentDetails}
                  onChange={handleInputChange}
                  required
                  placeholder={formData.paymentMethod === 'paypal' ? 'your@paypal-email.com' : 'Bank name, account number, etc.'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleCheckboxChange}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label className="ml-2 text-sm text-gray-700">
                I agree to the <a href="/affiliate-terms" className="text-blue-600 hover:underline">Affiliate Terms and Conditions</a> *
              </label>
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToPromotionGuidelines"
                checked={formData.agreeToPromotionGuidelines}
                onChange={handleCheckboxChange}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label className="ml-2 text-sm text-gray-700">
                I agree to follow the <a href="/promotion-guidelines" className="text-blue-600 hover:underline">Promotion Guidelines</a> *
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}