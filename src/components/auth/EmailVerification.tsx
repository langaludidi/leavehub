import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function EmailVerification() {
  const [searchParams] = useSearchParams()
  const [verificationState, setVerificationState] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyEmail()
    } else if (!user?.email_confirmed_at) {
      // User is logged in but email not verified
      setVerificationState('error')
      setError('Please check your email for the verification link')
    } else {
      // User is already verified, redirect
      navigate('/')
    }
  }, [token, email, user])

  const verifyEmail = async () => {
    try {
      setVerificationState('verifying')
      
      // Simulate API call for email verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would call your auth service
      // const { error } = await verifyEmailToken(token, email)
      
      // Simulate success/error randomly for demo
      const isSuccess = Math.random() > 0.2 // 80% success rate
      
      if (isSuccess) {
        setVerificationState('success')
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/signin?verified=true')
        }, 3000)
      } else {
        setVerificationState('expired')
        setError('This verification link has expired or is invalid')
      }
      
    } catch (err: any) {
      setVerificationState('error')
      setError(err.message || 'Failed to verify email address')
    }
  }

  const handleResendVerification = async () => {
    if (!user?.email && !email) {
      setError('No email address found')
      return
    }

    setResendLoading(true)
    setError('')
    
    try {
      // Use the email from URL params if available, otherwise use user's email
      const emailToResend = email || user?.email
      
      if (emailToResend) {
        // TODO: Implement resendVerification in AuthContext
        console.log('Resending verification to:', emailToResend)
        setResendSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

  const renderContent = () => {
    switch (verificationState) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verifying your email...</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your email address has been verified. You can now access all features of your LeaveHub account.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 dark:text-green-300">
                🎉 You're all set! Redirecting you to sign in...
              </p>
            </div>
            <Link
              to="/signin?verified=true"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-block text-center"
            >
              Continue to Sign In
            </Link>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verification Link Expired</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This verification link has expired or is no longer valid. Please request a new verification email.
            </p>
            
            {resendSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ New verification email sent! Check your inbox.
                </p>
              </div>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {resendLoading ? 'Sending...' : 'Send New Verification Email'}
              </button>
            )}
            
            <Link
              to="/signin"
              className="block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        )

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'We encountered an issue verifying your email address.'}
            </p>
            
            {resendSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ New verification email sent! Check your inbox.
                </p>
              </div>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendLoading || (!user?.email && !email)}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
            
            <div className="space-y-2">
              <Link
                to="/signin"
                className="block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
              >
                Back to Sign In
              </Link>
              <Link
                to="/support"
                className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Need help? Contact Support
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">LeaveHub</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 sm:py-10 sm:px-10">
          {error && verificationState !== 'expired' && verificationState !== 'error' && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  )
}