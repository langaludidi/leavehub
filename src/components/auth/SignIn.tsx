import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { detectUserRole } from './RoleBasedRouter'

export function SignIn() {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})
  const [fromSignup, setFromSignup] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  // Handle pre-filled email from signup redirect
  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: decodeURIComponent(emailFromUrl) }))
      setFromSignup(true)
      // Clear the URL parameter
      window.history.replaceState({}, '', '/signin')
    }
  }, [searchParams])
  
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 6) return 'Password must be at least 6 characters'
        return ''
      default:
        return ''
    }
  }
  
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) errors[key] = error
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Validate on blur if field has been touched
    if (touched[name]) {
      const error = validateField(name, value)
      setFieldErrors(prev => ({ ...prev, [name]: error }))
    }
  }
  
  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const value = formData[name as keyof typeof formData]
    const error = validateField(name, value)
    setFieldErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')

    // Add timeout to prevent infinite spinning
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Login is taking too long. Please check your connection and try again.')
    }, 10000) // 10 second timeout

    try {
      console.log('Attempting to sign in with:', formData.email)
      const result = await signIn(formData.email, formData.password)
      
      clearTimeout(timeoutId)
      
      const { data, error } = result
      
      if (error) {
        console.error('SignIn error:', error)
        setError(error.message || 'Invalid email or password')
        return
      }

      if (data?.user) {
        console.log('Sign in successful:', data.user.email)
        
        // Navigate directly to dashboard - let the AuthContext handle role detection
        console.log('Redirecting to dashboard...')
        navigate('/employee')
      } else {
        setError('Authentication failed - no user data received')
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error('SignIn catch block error:', err)
      setError(err.message || 'An error occurred during sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSignIn = () => {
    // Demo mode - skip authentication
    localStorage.setItem('demoMode', 'true')
    navigate('/employee')
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">LeaveHub</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Sign in to your account</h2>
          <p className="text-gray-600">Welcome back! Please sign in to continue.</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-xl rounded-2xl border border-gray-100 sm:py-8 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              {error.includes('Invalid login credentials') && (
                <p className="text-xs text-red-500 mt-1">
                  If you just signed up, please check your email for a confirmation link.
                </p>
              )}
            </div>
          )}

          {fromSignup && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Account Already Exists</p>
                  <p className="text-xs text-blue-600 mt-1">
                    We found an existing account with this email. Please sign in with your password.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={`appearance-none relative block w-full px-3 py-2 sm:py-3 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm sm:text-base transition-colors ${
                  fieldErrors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                className={`appearance-none relative block w-full px-3 py-2 sm:py-3 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:z-10 text-sm sm:text-base transition-colors ${
                  fieldErrors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="Enter your password"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* Demo Mode Button */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full flex justify-center py-2 px-4 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Continue with Demo Mode
              </button>
              
              {/* Test Login Button */}
              <button
                type="button"
                onClick={() => {
                  setFormData({ email: 'demo@test.com', password: 'password123' })
                  // Auto-submit the form
                  setTimeout(() => {
                    const form = document.querySelector('form')
                    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                  }, 100)
                }}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 sm:py-3 border border-green-300 text-sm sm:text-base font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
              >
                Test Real Authentication (demo@test.com)
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to LeaveHub?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-2 px-4 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-2">
          <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors">
            ← Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/support" className="hover:text-gray-700">Get Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}