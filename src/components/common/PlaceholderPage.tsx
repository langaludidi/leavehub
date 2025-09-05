import React from 'react'
import { AppShell } from '../layout/AppShell'

interface PlaceholderPageProps {
  title: string
  description: string
  userRole: 'employee' | 'admin' | 'superadmin'
  icon?: React.ReactNode
  comingSoon?: boolean
}

export function PlaceholderPage({ 
  title, 
  description, 
  userRole, 
  icon, 
  comingSoon = true 
}: PlaceholderPageProps) {
  return (
    <AppShell userRole={userRole}>
      <div className="min-h-full flex items-center justify-center py-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl w-full space-y-12 text-center">
          <div className="space-y-8">
            {icon && (
              <div className="mx-auto h-32 w-32 text-indigo-500 mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                {icon}
              </div>
            )}
            <div className="space-y-4">
              <h2 className="text-4xl heading-premium text-gray-900">
                {title}
              </h2>
              <p className="text-lg text-premium text-gray-600 max-w-lg mx-auto leading-relaxed">
                {description}
              </p>
            </div>
            
            {comingSoon && (
              <div className="pt-4">
                <span className="inline-flex items-center px-8 py-4 rounded-2xl text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                  <span className="mr-3 text-xl">🚀</span>
                  Coming Soon
                </span>
              </div>
            )}
          </div>
          
          <div className="card-premium shadow-2xl p-12 text-left">
            <h3 className="text-2xl heading-premium text-gray-900 mb-8 text-center">What to expect</h3>
            <div className="space-y-6">
              {title.includes('Calendar') && (
                <>
                  <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Team availability overview</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Real-time visibility into team schedules</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Leave request calendar integration</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Seamless integration with leave requests</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Holiday and public holiday tracking</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Automatic holiday management and tracking</p>
                    </div>
                  </div>
                </>
              )}
              
              {title.includes('Profile') && (
                <>
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Personal information management</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Update your details and preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Leave balance tracking</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Monitor your available leave days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Notification preferences</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Customize how you receive updates</p>
                    </div>
                  </div>
                </>
              )}
              
              {title.includes('Employee Management') && (
                <>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Employee directory and profiles</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Comprehensive employee information system</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Department and team organization</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Structure teams and departments efficiently</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Role and permission management</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Control access with granular permissions</p>
                    </div>
                  </div>
                </>
              )}
              
              {title.includes('Reports') && (
                <>
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Leave utilization reports</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Detailed analysis of leave patterns and usage</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Team productivity analytics</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Insights into team performance and capacity</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Compliance and audit trails</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Maintain regulatory compliance with detailed logs</p>
                    </div>
                  </div>
                </>
              )}
              
              {title.includes('Settings') && (
                <>
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Leave policies configuration</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Define and customize leave policies for your organization</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Approval workflow setup</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Configure multi-step approval processes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-premium font-semibold text-gray-900">Integration management</h4>
                      <p className="text-premium text-gray-600 text-sm mt-1">Connect with HR systems and third-party tools</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="text-center pt-8">
            <div className="inline-flex items-center px-6 py-3 bg-gray-100 rounded-full">
              <span className="text-premium text-gray-600 font-medium">
                🔧 This feature is being actively developed and will be available soon.
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}