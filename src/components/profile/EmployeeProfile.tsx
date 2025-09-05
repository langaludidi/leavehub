import React, { useState } from 'react'
import { AppShell } from '../layout/AppShell'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  employeeId: string
  startDate: string
  manager: string
  annualLeaveBalance: number
  sickLeaveBalance: number
  personalLeaveBalance: number
}

export function EmployeeProfile({ userRole = 'employee' }: { userRole?: 'employee' | 'admin' | 'superadmin' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '+27 11 123 4567',
    department: 'Engineering',
    position: 'Senior Developer',
    employeeId: 'EMP001',
    startDate: '2022-01-15',
    manager: 'Sarah Johnson',
    annualLeaveBalance: 18.5,
    sickLeaveBalance: 10,
    personalLeaveBalance: 3
  })

  const [formData, setFormData] = useState(profileData)

  const handleSave = () => {
    setProfileData(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(profileData)
    setIsEditing(false)
  }

  return (
    <AppShell userRole={userRole}>
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl heading-premium text-gray-900">My Profile</h1>
            <p className="text-premium text-gray-600 mt-2">Manage your personal information and preferences</p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-premium bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={handleCancel}
                  className="btn-premium bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="btn-premium bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 shadow-lg"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="card-premium shadow-xl">
            <div className="p-8 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl font-bold">
                  {formData.firstName[0]}{formData.lastName[0]}
                </span>
              </div>
              <h2 className="text-2xl heading-premium text-gray-900 mb-2">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-premium text-gray-600 mb-1">{formData.position}</p>
              <p className="text-premium text-gray-500 text-sm">{formData.department}</p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Employee ID</div>
                <div className="heading-premium text-gray-900">{formData.employeeId}</div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2 card-premium shadow-xl">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl heading-premium text-gray-900">Personal Information</h2>
              <p className="text-premium text-gray-600 text-sm mt-1">Your contact details and work information</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-premium text-gray-900 py-3">{profileData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-premium text-gray-900 py-3">{profileData.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-premium text-gray-900 py-3">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-premium text-gray-900 py-3">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                  <p className="text-premium text-gray-900 py-3">{profileData.position}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Manager</label>
                  <p className="text-premium text-gray-900 py-3">{profileData.manager}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <p className="text-premium text-gray-900 py-3">
                    {new Date(profileData.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="card-premium shadow-xl">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl heading-premium text-gray-900">Leave Balance</h2>
            <p className="text-premium text-gray-600 text-sm mt-1">Your current leave entitlements</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl heading-premium text-gray-900">{profileData.annualLeaveBalance}</div>
                    <div className="text-premium text-gray-600">Annual Leave Days</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl heading-premium text-gray-900">{profileData.sickLeaveBalance}</div>
                    <div className="text-premium text-gray-600">Sick Leave Days</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl heading-premium text-gray-900">{profileData.personalLeaveBalance}</div>
                    <div className="text-premium text-gray-600">Personal Leave Days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}