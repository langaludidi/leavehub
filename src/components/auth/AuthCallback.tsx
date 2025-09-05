import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session after callback
        const { data: { session }, error } = await auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          setTimeout(() => navigate('/signin'), 3000)
          return
        }

        if (session) {
          console.log('Auth callback successful, redirecting...')
          // Redirect to dashboard
          navigate('/employee')
        } else {
          setError('No session found')
          setTimeout(() => navigate('/signin'), 3000)
        }
      } catch (err: any) {
        console.error('Callback handling error:', err)
        setError(err.message)
        setTimeout(() => navigate('/signin'), 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">LeaveHub</h1>
          <p className="text-gray-600">Completing authentication...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">LeaveHub</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 mb-2">Authentication Error</p>
            <p className="text-sm text-red-500">{error}</p>
            <p className="text-xs text-gray-500 mt-2">Redirecting to sign in...</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}