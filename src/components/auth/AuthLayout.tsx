import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Mobile-first responsive container */}
      <div className="flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">LeaveHub</h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-6 px-4 shadow-xl rounded-2xl border border-gray-100 sm:py-8 sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}