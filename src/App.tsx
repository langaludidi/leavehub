import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SignIn } from './components/auth/SignIn'
import { SignUp } from './components/auth/SignUp'
import { ForgotPassword } from './components/auth/ForgotPassword'
import { ResetPassword } from './components/auth/ResetPassword'
import { AuthCallback } from './components/auth/AuthCallback'
import { PRICING_PLANS, formatPrice, getPlanById } from './lib/pricing'
import { DocumentModal } from './components/modals/DocumentModal'
import { AppShell } from './components/layout/AppShell'
import { DashboardStats } from './components/dashboard/DashboardStats'
import { LeaveManagement } from './components/leave/LeaveManagement'
import { TeamCalendar } from './components/calendar/TeamCalendar'
import { EmployeeProfile } from './components/profile/EmployeeProfile'
import { EmployeeManagement } from './components/admin/EmployeeManagement'
import { InviteEmployees } from './components/admin/InviteEmployees'
import { ReportsAnalytics } from './components/admin/ReportsAnalytics'
import { AdminSettings } from './components/admin/AdminSettings'
import { OrganizationManagement } from './components/superadmin/OrganizationManagement'
import { SystemAnalytics } from './components/superadmin/SystemAnalytics'
import { BillingManagement } from './components/superadmin/BillingManagement'
import { SystemSettings } from './components/superadmin/SystemSettings'
import { AffiliateDashboard } from './components/affiliate/AffiliateDashboard'
import { AffiliateSignup } from './components/affiliate/AffiliateSignup'
import { WhiteLabelDashboard } from './components/whitelabel/WhiteLabelDashboard'
import { WhiteLabelOnboarding } from './components/whitelabel/WhiteLabelOnboarding'
import { TenantManagement } from './components/whitelabel/TenantManagement'
import { WhiteLabelConfig } from './components/whitelabel/WhiteLabelConfig'
import { initializeReferralTracking } from './lib/affiliateTracking'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { startDemo } from './lib/demoMode'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()
  
  const handleDemoAccess = (demoType: 'employee' | 'admin' | 'superadmin') => {
    startDemo(demoType)
    navigate(`/${demoType}`)
  }

  const handleTrialStart = () => {
    navigate('/signup')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-200">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle variant="dropdown" showLabel />
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium transition-colors duration-200">
              <span className="mr-2">🚀</span>
              LeaveHub is Live!
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl heading-premium text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 transition-colors duration-200 leading-tight">
            Complete Leave Management
            <span className="text-indigo-600 dark:text-indigo-400 block sm:inline"> System</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-premium text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto transition-colors duration-200 leading-relaxed">
            Streamline your organization's leave management with our comprehensive platform. 
            Built for modern workplaces with powerful admin controls and intuitive employee experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
            <button
              onClick={handleTrialStart}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <span>Start 14-Day Free Trial</span>
              <svg className="ml-2 -mr-1 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <Link
              to="/signin"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg sm:rounded-xl hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 text-sm sm:text-base"
            >
              <span>Sign In</span>
            </Link>
          </div>

          {/* Quick Access Buttons - Real Activities */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 px-4 sm:px-0">
            <Link
              to="/signin"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm"
            >
              <svg className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Employee Portal
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors text-xs sm:text-sm"
            >
              <svg className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
              </svg>
              Admin Dashboard
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors text-xs sm:text-sm"
            >
              <svg className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              SuperAdmin
            </Link>
            <Link
              to="/affiliate/signup"
              className="inline-flex items-center justify-center px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 transition-colors text-xs sm:text-sm"
            >
              <svg className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Affiliate
            </Link>
            <Link
              to="/whitelabel/onboarding"
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors text-xs sm:text-sm"
            >
              <svg className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              White Label
            </Link>
          </div>

          {/* Affiliate Program Link */}
          <div className="text-center mb-16">
            <Link
              to="/affiliate/signup"
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Join our Affiliate Program - Earn 25% Commission
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-title heading-premium text-gray-900 dark:text-gray-100 mb-2 transition-colors">Employee Portal</h3>
            <p className="text-small text-premium text-gray-600 dark:text-gray-300 transition-colors">Submit and track leave requests with ease</p>
          </div>

          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
              </svg>
            </div>
            <h3 className="text-title heading-premium text-gray-900 dark:text-gray-100 mb-2 transition-colors">Admin Dashboard</h3>
            <p className="text-small text-premium text-gray-600 dark:text-gray-300 transition-colors">Manage teams and approve requests efficiently</p>
          </div>

          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-title heading-premium text-gray-900 dark:text-gray-100 mb-2 transition-colors">SuperAdmin Control</h3>
            <p className="text-small text-premium text-gray-600 dark:text-gray-300 transition-colors">Complete system oversight and analytics</p>
          </div>

          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-title heading-premium text-gray-900 dark:text-gray-100 mb-2 transition-colors">Role-Based Access</h3>
            <p className="text-small text-premium text-gray-600 dark:text-gray-300 transition-colors">Secure permissions for every user level</p>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mx-4 sm:mx-0">
          <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 mb-4 sm:mb-6 text-center">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/signin"
              className="group block p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg w-full"
            >
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base heading-premium text-blue-900 text-center group-hover:text-blue-800">Employee Portal</h3>
              <p className="text-xs sm:text-sm text-premium text-blue-700 text-center mt-1">Submit leave requests</p>
            </Link>

            <Link
              to="/signin"
              className="group block p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg w-full"
            >
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base heading-premium text-green-900 text-center group-hover:text-green-800">Admin Dashboard</h3>
              <p className="text-xs sm:text-sm text-premium text-green-700 text-center mt-1">Manage your team</p>
            </Link>

            <Link
              to="/signin"
              className="group block p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg w-full"
            >
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base heading-premium text-purple-900 text-center group-hover:text-purple-800">SuperAdmin</h3>
              <p className="text-xs sm:text-sm text-premium text-purple-700 text-center mt-1">System management</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignInPage() {
  return <SignIn />
}

function SignUpPage() {
  return <SignUp />
}

function ForgotPasswordPage() {
  return <ForgotPassword />
}

function ResetPasswordPage() {
  return <ResetPassword />
}

function AuthCallbackPage() {
  return <AuthCallback />
}

function EmployeeDashboard() {
  const { user, member } = useAuth()
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  
  // Motivational affirmations
  const affirmations = [
    "Today is full of possibilities! 🌟",
    "You're making great progress! 🚀", 
    "Your dedication makes a difference! 💪",
    "Keep up the excellent work! ⭐",
    "You're valued and appreciated! 🙌",
    "Today is a fresh start! ✨",
    "Your potential is limitless! 🌈",
    "You're creating positive impact! 💫"
  ]
  
  // Company announcements
  const announcements = [
    {
      id: 1,
      title: "New Remote Work Policy",
      content: "Effective Monday, hybrid work arrangements are now available for all employees. Submit your request through HR.",
      date: "2025-01-15",
      priority: "high",
      author: "HR Department"
    },
    {
      id: 2, 
      title: "Team Building Event - Feb 20th",
      content: "Join us for our annual team building day at Silverstar Resort. Registration closes February 10th.",
      date: "2025-01-12",
      priority: "medium",
      author: "Events Committee"
    },
    {
      id: 3,
      title: "Q1 Performance Reviews",
      content: "Performance review cycles begin March 1st. Please update your goals and achievements in the system.",
      date: "2025-01-10", 
      priority: "medium",
      author: "Management"
    }
  ]
  
  const getRandomAffirmation = () => {
    const today = new Date().getDay()
    return affirmations[today % affirmations.length]
  }
  
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon" 
    return "Good evening"
  }
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const isAdmin = member?.role === 'admin' || member?.role === 'owner'
  
  return (
    <AppShell userRole="employee">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Personalized Greeting */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl heading-premium mb-3">
                {getTimeOfDayGreeting()}, {userName}! 
              </h1>
              <p className="text-xl text-indigo-100 mb-4">{getRandomAffirmation()}</p>
              <p className="text-indigo-200">Here's your dashboard overview for today</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/employee/leave" className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/30 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 border border-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Leave Request</span>
              </Link>
              <Link to="/employee/profile" className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/20 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 border border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>My Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <DashboardStats role="employee" onDocumentClick={() => setShowDocumentModal(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Leave Requests */}
          <div className="lg:col-span-2">
            <div className="card-premium shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl heading-premium text-gray-900">Recent Activity</h3>
                <Link to="/employee/leave" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">View All →</Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                  <div>
                    <p className="heading-premium text-gray-900">Annual Leave</p>
                    <p className="text-premium text-gray-600">Dec 20-24, 2024 • 3 days</p>
                  </div>
                  <span className="px-3 py-2 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div>
                    <p className="heading-premium text-gray-900">Sick Leave</p>
                    <p className="text-premium text-gray-600">Nov 15, 2024 • 1 day</p>
                  </div>
                  <span className="px-3 py-2 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Notice Board */}
          <div className="card-premium shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl heading-premium text-gray-900">📢 Company Updates</h3>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{announcements.length}</span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {announcements.map(announcement => (
                <div key={announcement.id} className={`p-4 rounded-xl border-l-4 ${
                  announcement.priority === 'high' ? 'bg-red-50 border-red-400' : 
                  announcement.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' : 
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{announcement.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                      announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{announcement.author}</span>
                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Controls Section - Only visible to admins */}
        {isAdmin && (
          <div className="card-premium shadow-xl p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl heading-premium text-gray-900">Admin Controls</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/employees" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-gray-200 hover:border-blue-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Manage Employees</h4>
                <p className="text-gray-600 text-sm">View and manage team members</p>
              </Link>

              <Link to="/admin/leave" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-gray-200 hover:border-green-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Leave Approvals</h4>
                <p className="text-gray-600 text-sm">Review pending requests</p>
              </Link>

              <Link to="/admin/reports" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-gray-200 hover:border-purple-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Reports</h4>
                <p className="text-gray-600 text-sm">Analytics & insights</p>
              </Link>

              <Link to="/admin/settings" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-gray-200 hover:border-orange-300">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Settings</h4>
                <p className="text-gray-600 text-sm">System configuration</p>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Document Modal */}
      <DocumentModal 
        isOpen={showDocumentModal} 
        onClose={() => setShowDocumentModal(false)} 
      />
    </AppShell>
  )
}

function AdminDashboard() {
  // State for modals and notifications
  const [showContactModal, setShowContactModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showPlanComparison, setShowPlanComparison] = useState(false)

  // Handlers for pricing actions
  const handleContactSales = () => {
    setShowContactModal(true)
  }

  const handleScheduleCall = () => {
    setNotificationMessage('Sales call scheduled! We\'ll contact you within 24 hours.')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleUpgrade = (planName: string) => {
    setNotificationMessage(`Upgrade to ${planName} initiated. Redirecting to billing...`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleDowngrade = (planName?: string) => {
    const plan = planName || 'Starter Plan'
    setNotificationMessage(`Downgrade to ${plan} requested. Our team will contact you to confirm.`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleDowngradeClick = () => {
    handleDowngrade('Starter Plan')
  }

  const handleViewComparison = () => {
    setShowPlanComparison(true)
  }

  const handleViewAddons = () => {
    setNotificationMessage('Add-ons marketplace opening...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const handleContactSupport = () => {
    setNotificationMessage('Support ticket created. Check your email for updates.')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleBillingHistory = () => {
    setNotificationMessage('Opening billing history...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const handleFeatureComparison = () => {
    setNotificationMessage('Opening detailed feature comparison...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const handleViewAllAddons = () => {
    setNotificationMessage('Add-ons marketplace opening...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const handleViewAllPendingRequests = () => {
    setNotificationMessage('Redirecting to leave requests dashboard...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleViewDetails = () => {
    setNotificationMessage('Opening detailed view...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleViewAllSubscriptionChanges = () => {
    setNotificationMessage('Loading subscription history...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  return (
    <AppShell userRole="admin">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6 sm:mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl heading-premium text-gray-900 font-bold">Admin Dashboard</h1>
            <p className="text-premium text-gray-600 text-sm sm:text-base lg:text-lg">Manage leave requests, employees, and organizational policies</p>
          </div>
        </div>

        <DashboardStats role="admin" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Pending Approvals</h2>
                  <p className="text-premium text-gray-600 text-sm sm:text-base">Review and approve leave requests</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full self-start sm:self-center">2 pending</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                <button className="btn-premium bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Approve Selected</span>
                </button>
                <button className="btn-premium bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm">Reject Selected</span>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
                      <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 mt-1 flex-shrink-0" />
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg">
                          JS
                        </div>
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="heading-premium text-gray-900 font-bold text-base sm:text-lg truncate">John Smith</p>
                        <p className="text-premium text-gray-700 font-medium text-sm sm:text-base">Annual Leave • 5 days</p>
                        <p className="text-premium text-gray-500 text-xs sm:text-sm">Dec 20-24, 2024</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3 flex-shrink-0">
                      <button className="p-2 sm:p-3 text-green-600 hover:bg-green-50 rounded-lg sm:rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
                      <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 mt-1 flex-shrink-0" />
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg">
                          MD
                        </div>
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="heading-premium text-gray-900 font-bold text-base sm:text-lg truncate">Mary Davis</p>
                        <p className="text-premium text-gray-700 font-medium text-sm sm:text-base">Maternity Leave • 90 days</p>
                        <p className="text-premium text-gray-500 text-xs sm:text-sm">Jan 15 - Apr 15, 2025</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3 flex-shrink-0">
                      <button className="p-2 sm:p-3 text-green-600 hover:bg-green-50 rounded-lg sm:rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleViewAllPendingRequests}
                  className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  View All Pending Requests
                </button>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Team Availability</h2>
                  <p className="text-premium text-gray-600 text-sm sm:text-base">Current team capacity across departments</p>
                </div>
                <button 
                  onClick={handleViewDetails}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 self-start sm:self-center"
                >
                  View Details
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-premium font-semibold text-gray-900 text-sm sm:text-base">Engineering Team</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">12</span>
                      <span className="text-gray-500 text-sm sm:text-base">/15 available</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 sm:h-3 rounded-full shadow-sm transition-all duration-500" style={{width: '80%'}}></div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-600">80% capacity</div>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-premium font-semibold text-gray-900 text-sm sm:text-base">Marketing Team</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">8</span>
                      <span className="text-gray-500 text-sm sm:text-base">/8 available</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 sm:h-3 rounded-full shadow-sm transition-all duration-500" style={{width: '100%'}}></div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-600">100% capacity</div>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                      <span className="text-premium font-semibold text-gray-900 text-sm sm:text-base">Sales Team</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">6</span>
                      <span className="text-gray-500 text-sm sm:text-base">/10 available</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 sm:h-3 rounded-full shadow-sm transition-all duration-500" style={{width: '60%'}}></div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-600">60% capacity</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Subscription Management */}
        <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Your Subscription</h2>
                <p className="text-premium text-gray-600 text-sm sm:text-base">Manage your company's LeaveHub subscription plan</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleBillingHistory} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Billing History</span>
                  <span className="sm:hidden">Billing</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Current Plan */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium">ACTIVE</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-1">🚀 Pro Plan</h3>
                <p className="text-xs sm:text-sm text-blue-700">R849/month • Up to 50 employees (≈R17/employee)</p>
                <p className="text-xs text-blue-600 mt-2">Next billing: Dec 15, 2024</p>
              </div>

              {/* Usage Stats */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-green-900">25/50</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-green-900 mb-1">Employee Usage</h3>
                <p className="text-xs sm:text-sm text-green-700">50% of your plan capacity</p>
                <div className="mt-2 bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-1/2"></div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-2xl border border-purple-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-purple-900">2</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-purple-900 mb-1">Active Add-ons</h3>
                <p className="text-xs sm:text-sm text-purple-700">Advanced Analytics + API Access</p>
              </div>
            </div>

            {/* Upgrade Opportunities */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Available Upgrades & Options</h3>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Explore ways to enhance your LeaveHub experience</p>
                  </div>
                  <button 
                    onClick={handleViewComparison} 
                    className="btn-premium bg-indigo-600 text-white hover:bg-indigo-700 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 self-start sm:self-center"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="hidden sm:inline">Compare Plans</span>
                    <span className="sm:hidden">Compare</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Enterprise Plan Upgrade */}
                  <div className="lg:col-span-2 p-4 sm:p-6 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-lg sm:text-2xl">🏢</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg sm:text-xl font-bold text-green-900">Enterprise Plan</h4>
                          <p className="text-xs sm:text-sm text-green-700">Perfect for unlimited employees (≈R5/employee at 500 staff, R2.50/employee at 1,000 staff)</p>
                        </div>
                      </div>
                      <div className="self-start sm:text-right">
                        <span className="text-xs bg-green-200 text-green-800 px-2 sm:px-3 py-1 rounded-full font-semibold">Best Value</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 text-sm sm:text-base">Enterprise-grade compliance and support for larger organizations. Everything HR needs to scale confidently.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800 font-medium">Unlimited employees</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800 font-medium">Dedicated account manager</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800 font-medium">Custom workflows & approvals</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800 font-medium">API access & integrations</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800 font-medium">Advanced reporting & analytics</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-green-800 font-medium">Dedicated support SLA</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-green-200">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-green-900">R2,499</span>
                        <span className="text-sm text-green-700">/month flat rate</span>
                      </div>
                      <button 
                        onClick={handleContactSales}
                        className="btn-premium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Contact Sales</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Plan Options & Downgrades */}
                  <div className="space-y-4">
                    {/* Downgrade Option */}
                    <div className="p-4 border border-orange-200 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🌱</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-orange-900">Starter Plan</h5>
                          <p className="text-xs text-orange-700">Up to 20 employees (≈R20/employee)</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-900">R399/month</span>
                        <button className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200">
                          Downgrade
                        </button>
                      </div>
                      <p className="text-xs text-orange-600 mt-2">Save R450/month</p>
                    </div>

                    {/* Add-ons Section */}
                    <div className="p-4 border border-indigo-200 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-bold text-indigo-900">Available Add-ons</h5>
                          <p className="text-xs text-indigo-700">Enhance your current plan</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="text-indigo-800 font-medium">Advanced Analytics</span>
                          <span className="text-indigo-600 font-bold">+R199/mo</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="text-indigo-800 font-medium">Priority Support</span>
                          <span className="text-indigo-600 font-bold">+R99/mo</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="text-indigo-800 font-medium">Custom Integrations</span>
                          <span className="text-indigo-600 font-bold">+R299/mo</span>
                        </div>
                      </div>
                      
                      <button onClick={handleViewAllAddons} className="w-full mt-3 bg-indigo-600 text-white hover:bg-indigo-700 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200">
                        View All Add-ons
                      </button>
                    </div>

                    {/* Support Section */}
                    <div className="p-4 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h5 className="font-bold text-gray-900 text-xs mb-1">Need Help?</h5>
                        <p className="text-xs text-gray-600 mb-3">Our team can help you choose the right plan</p>
                        <button onClick={handleContactSupport} className="w-full bg-gray-600 text-white hover:bg-gray-700 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200">
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom CTA */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Questions about upgrading?</p>
                        <p className="text-sm text-blue-700">Our sales team can help you find the perfect plan and migration path.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleScheduleCall} 
                      className="btn-premium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Schedule Call</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Subscription Changes */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl heading-premium text-gray-900 font-bold">Recent Subscription Changes</h3>
                  <button 
                    onClick={handleViewAllSubscriptionChanges}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">TechCorp Solutions</p>
                        <p className="text-sm text-green-700">Upgraded to Enterprise Plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-900 font-bold">+R1,650/mo</span>
                      <p className="text-xs text-green-600">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Creative Agency Ltd</p>
                        <p className="text-sm text-blue-700">Added Premium Support Package</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-900 font-bold">+R299/mo</span>
                      <p className="text-xs text-blue-600">5 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-orange-900">Startup Inc</p>
                        <p className="text-sm text-orange-700">Downgraded to Starter Plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-900 font-bold">-R550/mo</span>
                      <p className="text-xs text-orange-600">1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Pricing Overview */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl heading-premium text-gray-900 font-bold">All LeaveHub Plans</h3>
                    <p className="text-gray-600 mt-1">Choose the perfect plan for your organization size</p>
                  </div>
                  <button 
                    onClick={handleFeatureComparison} 
                    className="btn-premium bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>View Feature Comparison</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Free Plan */}
                  <div className="p-4 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="text-center mb-4">
                      <div className="text-2xl mb-2">🆓</div>
                      <h4 className="font-bold text-gray-900">Free Plan</h4>
                      <p className="text-xs text-gray-600 mb-2">For tiny teams and startups</p>
                      <div className="text-2xl font-bold text-gray-900">R0</div>
                      <p className="text-xs text-gray-600">3 users • R0/employee</p>
                    </div>
                    <div className="space-y-2 text-xs text-gray-700 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>3 employees included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Leave requests & approvals</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Employee balances dashboard</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>SA public holidays preloaded</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>BCEA compliance</span>
                      </div>
                    </div>
                    <button className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-xs font-medium cursor-not-allowed">
                      Employee Limit Reached
                    </button>
                  </div>

                  {/* Starter Plan */}
                  <div className="p-4 border border-orange-200 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-md transition-all duration-200">
                    <div className="text-center mb-4">
                      <div className="text-2xl mb-2">🌱</div>
                      <h4 className="font-bold text-orange-900">Starter Plan</h4>
                      <p className="text-xs text-orange-700 mb-2">Perfect for growing teams</p>
                      <div className="text-2xl font-bold text-orange-900">R399</div>
                      <p className="text-xs text-orange-700">20 users • ≈R20/employee</p>
                    </div>
                    <div className="space-y-2 text-xs text-orange-800 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Up to 20 employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Up to 20 employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Escalations (auto after 72h)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Document uploads</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Branded reports (Excel & PDF)</span>
                      </div>
                    </div>
                    <button onClick={handleDowngradeClick} className="w-full bg-orange-600 text-white hover:bg-orange-700 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200">
                      Downgrade to Starter
                    </button>
                  </div>

                  {/* Professional Plan - Current */}
                  <div className="p-4 border-2 border-blue-300 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-200 relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">CURRENT</span>
                    </div>
                    <div className="text-center mb-4 mt-2">
                      <div className="text-2xl mb-2">🚀</div>
                      <h4 className="font-bold text-blue-900">Pro Plan</h4>
                      <p className="text-xs text-blue-700 mb-2">Built for SMEs & mid-size companies</p>
                      <div className="text-2xl font-bold text-blue-900">R849</div>
                      <p className="text-xs text-blue-700">50 users • ≈R17/employee</p>
                    </div>
                    <div className="space-y-2 text-xs text-blue-800 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Up to 50 employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Up to 50 employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Compliance dashboard</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Balance adjustments</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Priority email support</span>
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-xs font-medium cursor-not-allowed">
                      Current Plan
                    </button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="p-4 border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-200">
                    <div className="text-center mb-4">
                      <div className="text-2xl mb-2">🏢</div>
                      <h4 className="font-bold text-green-900">Enterprise Plan</h4>
                      <p className="text-xs text-green-700 mb-2">Enterprise-grade compliance</p>
                      <div className="text-2xl font-bold text-green-900">R2,499</div>
                      <p className="text-xs text-green-700">unlimited • ≈R5/employee at 500</p>
                    </div>
                    <div className="space-y-2 text-xs text-green-800 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited employees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Dedicated account manager</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Custom workflows</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>API access & integrations</span>
                      </div>
                    </div>
                    <button onClick={handleContactSales} className="w-full bg-green-600 text-white hover:bg-green-700 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200">
                      Contact Sales
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">All plans include BCEA compliance</p>
                      <p className="text-xs text-indigo-700 mt-1">South African Basic Conditions of Employment Act compliant leave types, accruals, and reporting are included in every plan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{notificationMessage}</span>
        </div>
      )}

      {/* Contact Modal (placeholder) */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Sales</h3>
            <p className="text-gray-600 mb-6">Our sales team will contact you within 24 hours to discuss your Enterprise Plan upgrade.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowContactModal(false)} 
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowContactModal(false)
                  setNotificationMessage('Sales team contacted! We\'ll reach out within 24 hours.')
                  setShowNotification(true)
                  setTimeout(() => setShowNotification(false), 3000)
                }}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Contact Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Comparison Modal */}
      {showPlanComparison && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Plan Comparison</h3>
              <button 
                onClick={() => setShowPlanComparison(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Free Plan */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🆓</div>
                  <h4 className="text-xl font-bold text-gray-900">Free Plan</h4>
                  <p className="text-gray-600 text-sm">For tiny teams</p>
                  <div className="text-2xl font-bold text-gray-900 mt-2">R0</div>
                  <p className="text-gray-600 text-sm">3 users</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Basic leave tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simple approvals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Email notifications</span>
                  </div>
                </div>
              </div>
              
              {/* Starter Plan */}
              <div className="border-2 border-orange-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🌱</div>
                  <h4 className="text-xl font-bold text-orange-900">Starter Plan</h4>
                  <p className="text-orange-600 text-sm">Growing teams</p>
                  <div className="text-2xl font-bold text-orange-900 mt-2">R399</div>
                  <p className="text-orange-600 text-sm">20 users • ≈R20/employee</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>All Free features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced leave policies</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Calendar integration</span>
                  </div>
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className="border-2 border-blue-300 rounded-xl p-6 relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">CURRENT</span>
                </div>
                <div className="text-center mb-4 mt-2">
                  <div className="text-3xl mb-2">🚀</div>
                  <h4 className="text-xl font-bold text-blue-900">Pro Plan</h4>
                  <p className="text-blue-600 text-sm">Mid-size companies</p>
                  <div className="text-2xl font-bold text-blue-900 mt-2">R849</div>
                  <p className="text-blue-600 text-sm">50 users • ≈R17/employee</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>All Starter features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced reporting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>API access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Priority support</span>
                  </div>
                </div>
              </div>
              
              {/* Enterprise Plan */}
              <div className="border-2 border-green-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🏢</div>
                  <h4 className="text-xl font-bold text-green-900">Enterprise Plan</h4>
                  <p className="text-green-600 text-sm">Large organizations</p>
                  <div className="text-2xl font-bold text-green-900 mt-2">R2,499</div>
                  <p className="text-green-600 text-sm">Unlimited • ≈R5/employee at 500</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>All Pro features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited employees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>24/7 support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dedicated account manager</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => setShowPlanComparison(false)}
                className="bg-gray-600 text-white hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function SuperAdminDashboard() {
  const superAdminStats = [
    {
      name: 'Total Organizations',
      stat: '47',
      previousStat: '42',
      change: '+12% growth',
      changeType: 'increase' as const,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/superadmin/organizations'
    },
    {
      name: 'Platform Revenue',
      stat: 'R48,320',
      previousStat: 'R39,580',
      change: '+22% this month',
      changeType: 'increase' as const,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      href: '/superadmin/billing'
    },
    {
      name: 'Active Users',
      stat: '12,847',
      previousStat: '10,420',
      change: '+23% this month',
      changeType: 'increase' as const,
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/superadmin/analytics'
    },
    {
      name: 'System Health',
      stat: '99.97%',
      previousStat: '99.94%',
      change: '+0.03% uptime',
      changeType: 'increase' as const,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/superadmin/settings'
    },
    {
      name: 'Affiliate Partners',
      stat: '127',
      previousStat: '98',
      change: '+30% new partners',
      changeType: 'increase' as const,
      color: 'bg-gradient-to-br from-pink-500 to-rose-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/affiliate'
    },
    {
      name: 'White Label Tenants',
      stat: '23',
      previousStat: '18',
      change: '+28% growth',
      changeType: 'increase' as const,
      color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/whitelabel'
    }
  ]

  return (
    <AppShell userRole="superadmin">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl heading-premium text-gray-900 mb-2">Platform Overview</h1>
            <p className="text-premium text-gray-600 text-lg">Monitor and manage your entire LeaveHub ecosystem</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/superadmin/settings" className="btn-premium bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <span>System Settings</span>
            </Link>
            <Link to="/superadmin/analytics" className="btn-premium bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-teal-700 shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </Link>
          </div>
        </div>

        {/* Core Platform Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl heading-premium text-gray-900 mb-6">Platform Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {superAdminStats.slice(0, 4).map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-200`}>
                    {React.cloneElement(item.icon, { className: "w-5 h-5 text-white" })}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.name}</h3>
                  <p className="text-2xl heading-premium text-gray-900 font-bold">{item.stat}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.changeType === 'increase' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.changeType === 'increase' ? '↗' : '↘'} {item.change}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Monetization Systems */}
        <div className="mb-8">
          <h2 className="text-2xl heading-premium text-gray-900 mb-6">Revenue Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {superAdminStats.slice(4, 6).map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-20 h-20 ${item.color} rounded-3xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200`}>
                    {React.cloneElement(item.icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <div className="text-right">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.name === 'Affiliate Partners' 
                        ? 'Manage affiliate program and commission tracking'
                        : 'Configure white label instances and tenant management'
                      }
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl heading-premium text-gray-900 font-bold">{item.stat}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        item.changeType === 'increase' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.changeType === 'increase' ? '↗' : '↘'} {item.change}
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                      Manage
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Organizations Performance */}
          <div className="xl:col-span-2">
            <div className="card-premium shadow-2xl rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl heading-premium">Top Organizations</h2>
                    <p className="text-blue-100 mt-1">Revenue performance leaders</p>
                  </div>
                  <Link to="/superadmin/organizations" className="text-white hover:text-blue-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { name: 'TechCorp Solutions', plan: 'Enterprise', employees: 247, revenue: 2890, growth: '+15%', color: 'from-blue-500 to-blue-600' },
                  { name: 'MegaCorp Industries', plan: 'Enterprise', employees: 425, revenue: 3210, growth: '+8%', color: 'from-green-500 to-green-600' },
                  { name: 'SmallBiz Co.', plan: 'Professional', employees: 89, revenue: 1450, growth: '+12%', color: 'from-purple-500 to-purple-600' }
                ].map((org, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${org.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">{org.name.split(' ').map(word => word[0]).join('')}</span>
                      </div>
                      <div>
                        <h3 className="heading-premium text-lg text-gray-900">{org.name}</h3>
                        <p className="text-premium text-gray-600">{org.plan} • {org.employees} employees</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl heading-premium text-gray-900 font-bold">R{org.revenue.toLocaleString()}</p>
                      <p className="text-green-600 font-medium text-sm">{org.growth} this month</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Activity */}
          <div className="card-premium shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h2 className="text-xl heading-premium">System Activity</h2>
                  <p className="text-purple-100 mt-1">Real-time platform events</p>
                </div>
                <Link to="/superadmin/analytics" className="text-white hover:text-purple-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {[
                { type: 'signup', message: 'New organization signup', detail: 'TechCorp Solutions joined', time: '2 hours ago', color: 'bg-blue-500' },
                { type: 'payment', message: 'Payment processed', detail: 'MegaCorp Industries - R3,210', time: '4 hours ago', color: 'bg-green-500' },
                { type: 'maintenance', message: 'System maintenance', detail: 'Database optimization completed', time: '6 hours ago', color: 'bg-yellow-500' },
                { type: 'alert', message: 'Alert resolved', detail: 'High CPU usage on Server-03', time: '8 hours ago', color: 'bg-red-500' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className={`w-3 h-3 ${activity.color} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-premium font-semibold text-gray-900 truncate">{activity.message}</p>
                    <p className="text-premium text-gray-600 text-sm truncate">{activity.detail}</p>
                    <p className="text-premium text-gray-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-premium shadow-xl rounded-3xl p-8">
          <h2 className="text-2xl heading-premium text-gray-900 mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/superadmin/organizations" className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-premium text-gray-900 group-hover:text-blue-600 transition-colors">Manage Organizations</h3>
                  <p className="text-sm text-gray-600">Add, edit, or monitor organizations</p>
                </div>
              </div>
            </Link>

            <Link to="/superadmin/billing" className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-premium text-gray-900 group-hover:text-green-600 transition-colors">Billing & Revenue</h3>
                  <p className="text-sm text-gray-600">Monitor payments and subscriptions</p>
                </div>
              </div>
            </Link>

            <Link to="/superadmin/settings" className="group p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <div>
                  <h3 className="heading-premium text-gray-900 group-hover:text-purple-600 transition-colors">System Settings</h3>
                  <p className="text-sm text-gray-600">Configure platform settings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function LeaveRequestsPage() {
  return (
    <AppShell userRole="employee">
      <LeaveManagement userRole="employee" />
    </AppShell>
  )
}

function AdminLeaveManagementPage() {
  return (
    <AppShell userRole="admin">
      <LeaveManagement userRole="admin" />
    </AppShell>
  )
}

// Employee Pages
function EmployeeCalendarPage() {
  return <TeamCalendar userRole="employee" />
}

function EmployeeProfilePage() {
  return <EmployeeProfile userRole="employee" />
}

// Admin Pages
function AdminEmployeesPage() {
  return <EmployeeManagement userRole="admin" />
}
function AdminInviteEmployeesPage() {
  return <InviteEmployees userRole="admin" />
}

function AdminReportsPage() {
  return <ReportsAnalytics userRole="admin" />
}

function AdminSettingsPage() {
  return <AdminSettings userRole="admin" />
}

// SuperAdmin Pages
function SuperAdminOrganizationsPage() {
  return <OrganizationManagement userRole="superadmin" />
}

function SuperAdminAnalyticsPage() {
  return <SystemAnalytics userRole="superadmin" />
}

function SuperAdminBillingPage() {
  return <BillingManagement userRole="superadmin" />
}

function SuperAdminSettingsPage() {
  return <SystemSettings userRole="superadmin" />
}

function AffiliateDashboardPage() {
  return (
    <AppShell>
      <AffiliateDashboard />
    </AppShell>
  )
}

function AffiliateSignupPage() {
  return (
    <AppShell>
      <AffiliateSignup />
    </AppShell>
  )
}

// White Label Pages
function WhiteLabelDashboardPage() {
  return (
    <AppShell userRole="superadmin">
      <WhiteLabelDashboard />
    </AppShell>
  )
}

function WhiteLabelOnboardingPage() {
  return (
    <AppShell>
      <WhiteLabelOnboarding />
    </AppShell>
  )
}

function TenantManagementPage() {
  return (
    <AppShell userRole="superadmin">
      <TenantManagement />
    </AppShell>
  )
}

function WhiteLabelConfigPage() {
  return (
    <AppShell userRole="superadmin">
      <WhiteLabelConfig />
    </AppShell>
  )
}

function App() {
  // Initialize referral tracking on app load
  useEffect(() => {
    initializeReferralTracking()
  }, [])
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
        <Routes>
        <Route path="/" element={
          <React.Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
            <HomePage />
          </React.Suspense>
        } />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/leave" element={<LeaveRequestsPage />} />
        <Route path="/employee/calendar" element={<EmployeeCalendarPage />} />
        <Route path="/employee/profile" element={<EmployeeProfilePage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/leave" element={<AdminLeaveManagementPage />} />
        <Route path="/admin/employees" element={<AdminEmployeesPage />} />
        <Route path="/admin/invite" element={<AdminInviteEmployeesPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        
        {/* SuperAdmin Routes */}
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/organizations" element={<SuperAdminOrganizationsPage />} />
        <Route path="/superadmin/analytics" element={<SuperAdminAnalyticsPage />} />

        {/* Affiliate Routes */}
        <Route path="/affiliate" element={<AffiliateDashboardPage />} />
        <Route path="/affiliate/signup" element={<AffiliateSignupPage />} />
        <Route path="/affiliate/dashboard" element={<AffiliateDashboardPage />} />

        {/* White Label Routes */}
        <Route path="/whitelabel" element={<WhiteLabelDashboardPage />} />
        <Route path="/whitelabel/dashboard" element={<WhiteLabelDashboardPage />} />
        <Route path="/whitelabel/onboarding" element={<WhiteLabelOnboardingPage />} />
        <Route path="/whitelabel/tenants" element={<TenantManagementPage />} />
        <Route path="/whitelabel/config" element={<WhiteLabelConfigPage />} />
        <Route path="/superadmin/billing" element={<SuperAdminBillingPage />} />
        <Route path="/superadmin/settings" element={<SuperAdminSettingsPage />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}>
          <h1>Page Not Found</h1>
          <p>Current path: {window.location.pathname}</p>
          <p>This is a React Router 404 - the page component might be missing or there's an error.</p>
          <a href="/" style={{color: 'blue', textDecoration: 'underline'}}>Go Home</a>
        </div>} />
        </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App