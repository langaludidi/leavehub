import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function NotFound() {
  const location = useLocation()

  const isAuthRoute = location.pathname.startsWith('/auth')
  const isEmployeeRoute = location.pathname.startsWith('/employee')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isSuperAdminRoute = location.pathname.startsWith('/superadmin')

  const getSuggestedRoutes = () => {
    if (isEmployeeRoute) {
      return [
        { path: '/employee', label: 'Employee Dashboard' },
        { path: '/employee/leave', label: 'My Leave Requests' },
        { path: '/employee/calendar', label: 'Team Calendar' },
        { path: '/employee/profile', label: 'My Profile' }
      ]
    }
    if (isAdminRoute) {
      return [
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/admin/leave', label: 'Leave Management' },
        { path: '/admin/employees', label: 'Employee Management' },
        { path: '/admin/reports', label: 'Reports & Analytics' }
      ]
    }
    if (isSuperAdminRoute) {
      return [
        { path: '/superadmin', label: 'SuperAdmin Dashboard' },
        { path: '/superadmin/organizations', label: 'Organizations' },
        { path: '/superadmin/analytics', label: 'System Analytics' }
      ]
    }
    return [
      { path: '/', label: 'Home Page' },
      { path: '/signin', label: 'Sign In' },
      { path: '/signup', label: 'Sign Up' }
    ]
  }

  const suggestedRoutes = getSuggestedRoutes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-indigo-600 mb-6">
            <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0M13 16.447V21h-2v-4.553z"/>
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            The page you're looking for doesn't exist.
          </p>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Requested URL:</div>
            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-red-600 dark:text-red-400">
              {location.pathname}
            </code>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Suggested Pages
            </h3>
            <div className="space-y-2">
              {suggestedRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                >
                  {route.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ← Go Back
                </button>
                <Link
                  to="/"
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  🏠 Home Page
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>If you believe this is an error, please contact support.</p>
            <p className="mt-1">
              LeaveHub v1.0 • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}