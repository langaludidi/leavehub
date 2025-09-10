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
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotFound } from './components/NotFound'

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
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const [policyAcknowledgments, setPolicyAcknowledgments] = useState<{[key: string]: {read: boolean, understood: boolean, acknowledgedAt?: string}}>({})
  
  // Admin-Managed Policies (fetched from admin system)
  const [companyPolicies] = useState([
    // HR Policies
    {
      id: 'admin-hr-policy-001',
      name: 'Employee Leave Policy',
      version: 'v2.1',
      uploadDate: '2024-12-01',
      lastUpdated: '2025-01-15',
      category: 'HR Policy',
      group: 'HR Policy',
      author: 'HR Department',
      mandatory: true,
      status: 'active',
      content: `Employee Leave Policy

This comprehensive policy covers all aspects of employee leave entitlements and procedures.

1. Annual Leave Entitlement
- 21 working days per year for full-time employees
- Pro-rated for part-time employees based on hours worked
- Leave accrues monthly at 1.75 days per month
- Maximum carry-over: 5 days to next year (with approval)

2. Sick Leave Policy
- 30 days per 36-month cycle as per BCEA
- Medical certificate required for absences over 2 consecutive days
- Notify supervisor within 2 hours of absence
- Return-to-work medical clearance required after extended illness

3. Family Responsibility Leave
- 3 days per year for family emergencies
- Birth/adoption of child, serious illness/death of family member
- Must provide supporting documentation
- Cannot be accumulated or carried over

4. Maternity/Paternity Leave
- Maternity: 4 months consecutive leave
- Paternity: 10 consecutive days
- Adoption leave: Same as maternity/paternity
- UIF benefits apply where eligible

5. Study Leave
- Up to 5 days per year for work-related studies
- Must provide proof of examination/course attendance
- Subject to operational requirements
- Academic results may be required

6. Leave Application Process
- Submit requests through LeaveHub system minimum 2 weeks in advance
- Emergency leave: Notify immediately, submit form within 48 hours
- Manager approval required before taking leave
- Arrange adequate coverage for responsibilities

All leave is subject to operational requirements and management approval.

Last updated: January 15, 2025`
    },
    {
      id: 'admin-hr-policy-002',
      name: 'Code of Conduct & Ethics',
      version: 'v1.4',
      uploadDate: '2024-11-20',
      lastUpdated: '2025-01-08',
      category: 'HR Policy',
      group: 'HR Policy',
      author: 'HR Department',
      mandatory: true,
      status: 'active',
      content: `Code of Conduct & Ethics Policy

All employees must adhere to the highest standards of professional and ethical conduct.

1. Professional Standards
- Maintain honesty and integrity in all business dealings
- Treat all colleagues, clients, and stakeholders with respect
- Avoid conflicts of interest and declare potential conflicts
- Maintain confidentiality of proprietary and sensitive information

2. Workplace Behavior
- Foster an inclusive and harassment-free work environment
- Report any incidents of discrimination or inappropriate behavior
- Use company resources responsibly and for business purposes only
- Comply with all health and safety regulations

3. Communication Guidelines
- Use professional language in all business communications
- Respect intellectual property and confidential information
- Social media use must not reflect negatively on the company
- Represent the company positively in all external interactions

4. Compliance Requirements
- Follow all applicable laws, regulations, and company policies
- Complete mandatory training programs within specified timeframes
- Report violations of this code through appropriate channels
- Cooperate fully with internal investigations

5. Disciplinary Actions
Violations may result in:
- Verbal or written warnings
- Mandatory training or counseling
- Suspension with or without pay
- Termination of employment

For questions about this policy, contact HR at hr@company.com

Last updated: January 8, 2025`
    },
    // SHE Policies  
    {
      id: 'admin-she-policy-001',
      name: 'Workplace Safety Guidelines',
      version: 'v1.3',
      uploadDate: '2024-11-15',
      lastUpdated: '2024-12-20',
      category: 'SHE Policy',
      group: 'SHE Policy',
      author: 'Safety Officer',
      mandatory: true,
      status: 'active',
      content: `Workplace Safety, Health & Environmental Guidelines

This policy ensures a safe and healthy work environment for all employees.

1. General Safety Requirements
- Report all accidents, incidents, and near-misses immediately
- Use personal protective equipment (PPE) where required
- Follow all safety signage and instructions
- Participate in safety training and emergency drills

2. Office Safety
- Keep workstations clean and organized
- Report damaged equipment or furniture immediately
- Use proper ergonomic practices for computer work
- Ensure emergency exits remain clear at all times

3. Health and Wellness
- Take regular breaks to prevent fatigue and injury
- Report work-related health concerns to management
- Use proper lifting techniques for heavy items
- Maintain good hygiene practices

4. Environmental Responsibility
- Reduce, reuse, and recycle where possible
- Minimize energy consumption (lights, equipment)
- Properly dispose of waste materials
- Report environmental hazards or spills immediately

5. Emergency Procedures
- Know the location of emergency exits and assembly points
- Understand evacuation procedures for your work area
- Know how to contact emergency services
- Follow instructions from safety wardens during emergencies

6. Incident Reporting
- Report all incidents within 24 hours
- Complete incident report forms accurately
- Cooperate with safety investigations
- Implement corrective actions as required

Safety is everyone's responsibility. Contact the Safety Officer at safety@company.com for questions.

Last updated: December 20, 2024`
    },
    // Operations Policies
    {
      id: 'admin-ops-policy-001',
      name: 'Remote Work Policy',
      version: 'v1.1',
      uploadDate: '2025-01-05',
      lastUpdated: '2025-01-12',
      category: 'Operations Policy',
      group: 'Operations Policy',
      author: 'Operations Manager',
      mandatory: false,
      status: 'active',
      content: `Remote Work Policy

This policy establishes guidelines for flexible work arrangements and remote work.

1. Eligibility Criteria
- Minimum 12 months continuous employment
- Satisfactory performance rating in last review
- Role suitable for remote work
- Manager approval required

2. Work Arrangements
- Hybrid: 2-3 days remote per week maximum
- Fully remote: Exceptional circumstances only
- Core collaboration hours: 9:00 AM - 3:00 PM local time
- Flexible start/end times within business hours

3. Technology Requirements
- Reliable high-speed internet connection (minimum 25Mbps)
- Secure home office setup with adequate lighting
- Company-provided laptop and necessary software
- VPN access for secure connectivity to company systems

4. Performance Expectations
- Maintain same productivity standards as office-based work
- Regular check-ins with supervisor (minimum weekly)
- Attend mandatory meetings and training sessions
- Respond to communications within agreed timeframes

5. Communication Standards
- Use company-approved communication tools (Teams, Email)
- Update calendar with availability and working hours
- Participate actively in team meetings and collaboration sessions
- Maintain professional presence during video calls

6. Application Process
- Submit formal remote work request using company form
- Include proposed schedule and home office setup details
- Trial period of 3 months with performance review
- Ongoing evaluation every 6 months

7. Equipment and Expenses
- Company provides laptop, monitor, and essential equipment
- Employee responsible for internet, utilities, and furniture
- Equipment must be returned upon termination or policy violation

Remote work is a privilege that may be revoked if performance or business needs require.

Last updated: January 12, 2025`
    }
  ])

  // Admin-uploaded files (shared from admin dashboard)
  const [employeeAdminFiles] = useState([
    {
      id: 'file-001',
      fileName: 'Employee Handbook 2025',
      originalName: 'Employee_Handbook_2025.pdf',
      version: 'v2.1',
      dateOfDocument: '2025-01-01',
      dateUploaded: '2025-01-15',
      uploadedBy: 'HR Department',
      fileSize: '2.4 MB',
      fileType: 'PDF',
      description: 'Complete employee handbook with updated policies',
      distributionType: 'all' as const,
      departments: [],
      branches: [],
      specificEmployees: [],
      downloadCount: 47,
      status: 'active' as const
    },
    {
      id: 'file-002',
      fileName: 'Safety Protocol Manual',
      originalName: 'Safety_Protocols_2025.pdf',
      version: 'v1.3',
      dateOfDocument: '2025-01-10',
      dateUploaded: '2025-01-12',
      uploadedBy: 'Safety Department',
      fileSize: '1.8 MB',
      fileType: 'PDF',
      description: 'Updated safety protocols and emergency procedures',
      distributionType: 'department' as const,
      departments: ['Operations', 'Manufacturing'],
      branches: [],
      specificEmployees: [],
      downloadCount: 23,
      status: 'active' as const
    },
    {
      id: 'file-003',
      fileName: 'Remote Work Guidelines',
      originalName: 'Remote_Work_Guidelines.docx',
      version: 'v1.0',
      dateOfDocument: '2025-01-08',
      dateUploaded: '2025-01-10',
      uploadedBy: 'IT Department',
      fileSize: '892 KB',
      fileType: 'DOCX',
      description: 'Guidelines for remote work arrangements and IT policies',
      distributionType: 'all' as const,
      departments: [],
      branches: [],
      specificEmployees: [],
      downloadCount: 35,
      status: 'active' as const
    }
  ])
  
  // Policy handlers
  const handlePolicyClick = (policy: any) => {
    setSelectedPolicy(policy)
    setShowPolicyModal(true)
    // Mark as read when opened
    setPolicyAcknowledgments(prev => ({
      ...prev,
      [policy.id]: { 
        ...prev[policy.id],
        read: true,
        understood: prev[policy.id]?.understood || false
      }
    }))
  }

  const handlePolicyUnderstood = (policyId: string) => {
    setPolicyAcknowledgments(prev => ({
      ...prev,
      [policyId]: { 
        ...prev[policyId],
        read: true,
        understood: true,
        acknowledgedAt: new Date().toISOString()
      }
    }))
  }

  const getPolicyStatus = (policyId: string) => {
    const ack = policyAcknowledgments[policyId]
    if (ack?.understood) return { status: 'understood', color: 'text-green-600 bg-green-100', icon: '✓' }
    if (ack?.read) return { status: 'read', color: 'text-blue-600 bg-blue-100', icon: '👁' }
    return { status: 'unread', color: 'text-gray-600 bg-gray-100', icon: '📄' }
  }
  
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
  
  // Admin-managed notifications (displayed as company announcements)
  const adminNotifications = [
    {
      id: 'notif-001',
      title: 'Welcome New Team Members',
      content: 'Please join us in welcoming our new colleagues who joined this month.',
      type: 'General',
      priority: 'medium',
      dateCreated: '2025-01-15',
      author: 'HR Department',
      status: 'active',
      targetAudience: 'all'
    },
    {
      id: 'notif-002',
      title: 'John Smith Promotion',
      content: 'Congratulations to John Smith on his promotion to Senior Developer.',
      type: 'Promotion',
      priority: 'medium',
      dateCreated: '2025-01-10',
      author: 'Management',
      status: 'active',
      targetAudience: 'all'
    },
    {
      id: 'notif-003',
      title: 'Mary Johnson Memorial Service',
      content: 'We regret to inform you of the passing of Mary Johnson, former Finance Manager. Memorial service details to follow.',
      type: 'Death',
      priority: 'high',
      dateCreated: '2025-01-08',
      author: 'Management',
      status: 'active',
      targetAudience: 'all'
    },
    {
      id: 'notif-004',
      title: 'Employee Contract Changes',
      content: 'Please review the updated employment terms that will take effect next month.',
      type: 'Termination',
      priority: 'high',
      dateCreated: '2025-01-05',
      author: 'HR Department',
      status: 'active',
      targetAudience: 'all'
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
        <DashboardStats 
          role="employee" 
          onDocumentClick={() => setShowDocumentModal(true)}
          stats={[
            {
              name: 'Leave Balance',
              stat: '18.5 days',
              previousStat: '21 days',
              change: '2.5 days used',
              changeType: 'decrease' as const,
              color: 'bg-gradient-to-br from-blue-500 to-blue-600',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              href: '/employee/leave'
            },
            {
              name: 'Documents',
              stat: `${employeeAdminFiles.filter(f => f.status === 'active').length + 4} available`, // 4 is sample documents count
              previousStat: `${employeeAdminFiles.filter(f => f.status === 'active').length + 2} available`,
              change: `${employeeAdminFiles.filter(f => f.status === 'active').length + 2} new files`,
              changeType: 'increase' as const,
              color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              onClick: () => setShowDocumentModal(true)
            },
            {
              name: 'Pending Requests',
              stat: '2',
              previousStat: '1',
              change: '1 new',
              changeType: 'increase' as const,
              color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              href: '/employee/leave'
            },
            {
              name: 'Team Capacity',
              stat: '87%',
              previousStat: '92%',
              change: '5% decrease',
              changeType: 'decrease' as const,
              color: 'bg-gradient-to-br from-green-500 to-emerald-600',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              href: '/employee/calendar'
            },
            {
              name: 'This Month',
              stat: '3 days',
              previousStat: '5 days',
              change: '2 days less',
              changeType: 'increase' as const,
              color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Leave History */}
          <div className="lg:col-span-2">
            <div className="card-premium shadow-xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl lg:text-2xl heading-premium text-gray-900 dark:text-gray-100">📅 Leave History</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your recent leave requests and approvals</p>
                </div>
                <Link to="/employee/leave" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm">View All →</Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="heading-premium text-gray-900 dark:text-gray-100">Annual Leave</p>
                      <p className="text-premium text-gray-600 dark:text-gray-400">Dec 20-24, 2025 • 3 days</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-2 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="heading-premium text-gray-900 dark:text-gray-100">Sick Leave</p>
                      <p className="text-premium text-gray-600 dark:text-gray-400">Nov 15, 2024 • 1 day</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-2 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approved
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="heading-premium text-gray-900 dark:text-gray-100">Personal Leave</p>
                      <p className="text-premium text-gray-600 dark:text-gray-400">Oct 5-6, 2024 • 2 days</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-2 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Notice Board */}
          <div className="card-premium shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl heading-premium text-gray-900 dark:text-gray-100">📢 Company Updates</h3>
              <span className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300 text-xs font-bold px-2 py-1 rounded-full">{adminNotifications.length}</span>
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {adminNotifications.map(notification => (
                <div key={notification.id} className={`p-3 sm:p-4 rounded-xl border-l-4 ${
                  notification.type === 'General' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600' :
                  notification.type === 'Promotion' ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600' :
                  notification.type === 'Death' ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-400 dark:border-gray-600' :
                  notification.type === 'Termination' ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600' :
                  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                    <div className="flex space-x-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        notification.type === 'General' ? 'bg-blue-100 text-blue-700' :
                        notification.type === 'Promotion' ? 'bg-green-100 text-green-700' :
                        notification.type === 'Death' ? 'bg-gray-100 text-gray-700' :
                        notification.type === 'Termination' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {notification.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notification.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{notification.author}</span>
                    <span>{new Date(notification.dateCreated).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Storage Section */}
        <div className="card-premium shadow-xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl lg:text-2xl heading-premium text-gray-900 dark:text-gray-100">📁 Document Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Company documents, policies, and resources</p>
            </div>
            <button 
              onClick={() => setShowDocumentModal(true)}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
            >
              Browse All →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyPolicies.map((policy) => {
              const status = getPolicyStatus(policy.id)
              const categoryColors: {[key: string]: string} = {
                'Legal': 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/30 hover:border-blue-200 dark:hover:border-blue-700 focus:ring-blue-500',
                'HR': 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-200 dark:hover:border-emerald-700 focus:ring-emerald-500',
                'Security': 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-800/30 hover:border-red-200 dark:hover:border-red-700 focus:ring-red-500',
                'Operations': 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-100 dark:border-purple-800/30 hover:border-purple-200 dark:hover:border-purple-700 focus:ring-purple-500'
              }
              const categoryIconColors: {[key: string]: string} = {
                'Legal': 'from-blue-500 to-indigo-600',
                'HR': 'from-emerald-500 to-green-600',
                'Security': 'from-red-500 to-rose-600',
                'Operations': 'from-purple-500 to-indigo-600'
              }
              
              return (
                <div 
                  key={policy.id}
                  onClick={() => handlePolicyClick(policy)}
                  className={`group bg-gradient-to-r ${categoryColors[policy.category] || categoryColors['Legal']} rounded-xl p-4 border hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer`} 
                  tabIndex={0} 
                  role="button"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${categoryIconColors[policy.category] || categoryIconColors['Legal']} rounded-lg flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">{status.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{policy.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{policy.version} • {new Date(policy.lastUpdated).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {policy.mandatory && (
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full font-medium">Required</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <span className="w-2 h-2 mr-1 rounded-full bg-current"></span>
                      {status.status === 'understood' ? 'Acknowledged' : status.status === 'read' ? 'Read' : 'Unread'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{policy.category}</span>
                  </div>
                </div>
              )
            })}
            <div className="group bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer" tabIndex={0} role="button">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Employee Handbook</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Updated Jan 2025</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete guide to company policies and procedures</p>
            </div>

            {/* HR Policies */}
            <div className="group bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer" tabIndex={0} role="button">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">HR Policies</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Updated Dec 2024</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Leave policies, benefits, and HR procedures</p>
            </div>

            {/* IT Guidelines */}
            <div className="group bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer" tabIndex={0} role="button">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">IT Guidelines</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Updated Nov 2024</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Technology usage and security protocols</p>
            </div>

            {/* Forms & Templates */}
            <div className="group bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer" tabIndex={0} role="button">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Forms & Templates</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">28 documents</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Request forms, templates, and applications</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document Modal */}
      <DocumentModal 
        isOpen={showDocumentModal} 
        onClose={() => setShowDocumentModal(false)}
        adminFiles={employeeAdminFiles}
      />

      {/* Policy Modal */}
      {showPolicyModal && selectedPolicy && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${
                  selectedPolicy.category === 'Legal' ? 'from-blue-500 to-indigo-600' :
                  selectedPolicy.category === 'HR' ? 'from-emerald-500 to-green-600' :
                  selectedPolicy.category === 'Security' ? 'from-red-500 to-rose-600' :
                  'from-purple-500 to-indigo-600'
                } rounded-xl flex items-center justify-center`}>
                  <span className="text-white text-lg font-bold">📋</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedPolicy.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPolicy.version} • Updated {new Date(selectedPolicy.lastUpdated).toLocaleDateString()}
                    {selectedPolicy.mandatory && <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full font-medium">Required</span>}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPolicyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96 bg-gray-50 dark:bg-gray-900/50">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {selectedPolicy.content}
              </pre>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                    getPolicyStatus(selectedPolicy.id).color
                  }`}>
                    <span className="w-2 h-2 mr-2 rounded-full bg-current"></span>
                    {getPolicyStatus(selectedPolicy.id).status === 'understood' ? 'Acknowledged' : 
                     getPolicyStatus(selectedPolicy.id).status === 'read' ? 'Read' : 'Unread'}
                  </span>
                  {getPolicyStatus(selectedPolicy.id).status === 'understood' && policyAcknowledgments[selectedPolicy.id]?.acknowledgedAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Acknowledged on {new Date(policyAcknowledgments[selectedPolicy.id].acknowledgedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Category: {selectedPolicy.category}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setShowPolicyModal(false)}
                  className="btn-premium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 px-6 py-2"
                >
                  Close
                </button>
                {getPolicyStatus(selectedPolicy.id).status !== 'understood' && (
                  <button 
                    onClick={() => {
                      handlePolicyUnderstood(selectedPolicy.id)
                      setShowPolicyModal(false)
                    }}
                    className="btn-premium bg-green-600 text-white hover:bg-green-700 px-6 py-2 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>I Understand & Acknowledge</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function AdminDashboard() {
  // State for modals and notifications
  const [showContactModal, setShowContactModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showPlanComparison, setShowPlanComparison] = useState(false)
  const [showNewHiresModal, setShowNewHiresModal] = useState(false)
  const [showNewRequestsModal, setShowNewRequestsModal] = useState(false)
  const [showAvgResponseTimeModal, setShowAvgResponseTimeModal] = useState(false)
  const [showTeamAvailabilityModal, setShowTeamAvailabilityModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showDowngradeModal, setShowDowngradeModal] = useState(false)
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Admin Policy Management State
  const [showPolicyManagementModal, setShowPolicyManagementModal] = useState(false)
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false)
  const [adminPolicies, setAdminPolicies] = useState([
    {
      id: 'admin-hr-policy-001',
      name: 'Employee Leave Policy',
      group: 'HR Policy',
      version: 'v2.1',
      dateCreated: '2024-12-01',
      lastModified: '2025-01-15',
      author: 'HR Department',
      mandatory: true,
      status: 'active',
      content: 'Comprehensive employee leave policy...'
    },
    {
      id: 'admin-she-policy-001', 
      name: 'Workplace Safety Guidelines',
      group: 'SHE Policy',
      version: 'v1.3',
      dateCreated: '2024-11-15',
      lastModified: '2024-12-20',
      author: 'Safety Officer',
      mandatory: true,
      status: 'active',
      content: 'Safety, Health and Environmental guidelines...'
    }
  ])

  // Admin Notification Management State  
  const [showNotificationManagementModal, setShowNotificationManagementModal] = useState(false)
  const [showAddNotificationModal, setShowAddNotificationModal] = useState(false)
  const [adminNotifications, setAdminNotifications] = useState([
    {
      id: 'notif-001',
      title: 'Welcome New Team Members',
      content: 'Please join us in welcoming our new colleagues who joined this month.',
      type: 'General',
      priority: 'medium',
      dateCreated: '2025-01-15',
      author: 'HR Department',
      status: 'active',
      targetAudience: 'all'
    },
    {
      id: 'notif-002',
      title: 'John Smith Promotion',
      content: 'Congratulations to John Smith on his promotion to Senior Developer.',
      type: 'Promotion',
      priority: 'medium',
      dateCreated: '2025-01-10',
      author: 'Management',
      status: 'active',
      targetAudience: 'all'
    }
  ])
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  })
  
  // File Management State
  const [showFileManagementModal, setShowFileManagementModal] = useState(false)
  const [showAddFileModal, setShowAddFileModal] = useState(false)
  const [adminFiles, setAdminFiles] = useState<{
    id: string
    fileName: string
    originalName: string
    version: string
    dateOfDocument?: string
    dateUploaded: string
    uploadedBy: string
    fileSize: string
    fileType: string
    description?: string
    distributionType: 'all' | 'department' | 'branch' | 'specific'
    departments: string[]
    branches: string[]
    specificEmployees: string[]
    downloadCount: number
    status: 'active' | 'inactive'
  }[]>([
    {
      id: 'file-001',
      fileName: 'Employee Handbook 2025',
      originalName: 'Employee_Handbook_2025.pdf',
      version: 'v2.1',
      dateOfDocument: '2025-01-01',
      dateUploaded: '2025-01-15',
      uploadedBy: 'HR Department',
      fileSize: '2.4 MB',
      fileType: 'PDF',
      description: 'Complete employee handbook with updated policies',
      distributionType: 'all',
      departments: [],
      branches: [],
      specificEmployees: [],
      downloadCount: 47,
      status: 'active'
    },
    {
      id: 'file-002',
      fileName: 'Safety Training Materials',
      originalName: 'Safety_Training_Q1_2025.pptx',
      version: 'v1.0',
      dateOfDocument: '2025-01-10',
      dateUploaded: '2025-01-12',
      uploadedBy: 'Safety Officer',
      fileSize: '15.7 MB',
      fileType: 'PowerPoint',
      description: 'Q1 2025 safety training presentation',
      distributionType: 'department',
      departments: ['Operations', 'Manufacturing'],
      branches: [],
      specificEmployees: [],
      downloadCount: 23,
      status: 'active'
    }
  ])
  const [fileForm, setFileForm] = useState<{
    fileName: string
    version: string
    dateOfDocument: string
    description: string
    distributionType: 'all' | 'department' | 'branch' | 'specific'
    departments: string[]
    branches: string[]
    specificEmployees: string[]
    file: File | null
  }>({
    fileName: '',
    version: '',
    dateOfDocument: '',
    description: '',
    distributionType: 'all',
    departments: [],
    branches: [],
    specificEmployees: [],
    file: null
  })

  // Integrations State
  const [integrations, setIntegrations] = useState({
    email: {
      status: 'connected',
      name: 'Email Integration',
      description: 'SMTP configuration for notifications',
      lastSync: '2025-01-15 09:30',
      config: {
        host: 'smtp.office365.com',
        port: '587',
        username: 'notifications@company.com',
        secure: true,
        testEmail: ''
      }
    },
    calendar: {
      status: 'pending',
      name: 'Calendar Sync',
      description: 'Google Calendar & Outlook integration',
      lastSync: 'Never',
      config: {
        googleEnabled: false,
        outlookEnabled: false,
        syncInterval: '15 minutes',
        syncDirection: 'bidirectional'
      }
    },
    hrSystem: {
      status: 'disconnected',
      name: 'HR System',
      description: 'Employee data synchronization',
      lastSync: 'Never',
      config: {
        apiUrl: '',
        apiKey: '',
        syncFrequency: 'daily',
        lastEmployeeSync: 'Never',
        employeeFields: ['name', 'email', 'department', 'position', 'startDate']
      }
    },
    analytics: {
      status: 'connected',
      name: 'Analytics & Reports',
      description: 'Business intelligence integration',
      lastSync: '2025-01-15 08:45',
      config: {
        provider: 'Power BI',
        dashboardUrl: 'https://app.powerbi.com/groups/your-workspace',
        refreshInterval: '1 hour',
        enabledReports: ['leave-analytics', 'employee-metrics', 'department-insights']
      }
    }
  })

  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [integrationForm, setIntegrationForm] = useState<any>({})

  // File Management Handlers
  const handleFileFormChange = (field: string, value: any) => {
    setFileForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileForm(prev => ({
        ...prev,
        file: file,
        fileName: prev.fileName || file.name.split('.')[0]
      }))
    }
  }

  const handleSubmitFile = () => {
    if (!fileForm.fileName || !fileForm.version || !fileForm.file) {
      setNotificationMessage('Please fill in all required fields and select a file')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }

    const newFile: {
      id: string
      fileName: string
      originalName: string
      version: string
      dateOfDocument?: string
      dateUploaded: string
      uploadedBy: string
      fileSize: string
      fileType: string
      description?: string
      distributionType: 'all' | 'department' | 'branch' | 'specific'
      departments: string[]
      branches: string[]
      specificEmployees: string[]
      downloadCount: number
      status: 'active' | 'inactive'
    } = {
      id: `file-${Date.now()}`,
      fileName: fileForm.fileName,
      originalName: fileForm.file.name,
      version: fileForm.version,
      dateOfDocument: fileForm.dateOfDocument || new Date().toISOString().split('T')[0],
      dateUploaded: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current Admin', // This would come from auth context
      fileSize: `${(fileForm.file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: fileForm.file.type.split('/')[1].toUpperCase() || 'FILE',
      description: fileForm.description,
      distributionType: fileForm.distributionType,
      departments: fileForm.departments,
      branches: fileForm.branches,
      specificEmployees: fileForm.specificEmployees,
      downloadCount: 0,
      status: 'active' as const
    }

    setAdminFiles(prev => [...prev, newFile])
    setShowAddFileModal(false)
    setNotificationMessage(`File "${fileForm.fileName}" uploaded successfully and distributed to ${fileForm.distributionType === 'all' ? 'all employees' : fileForm.distributionType}`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)

    // Reset form
    setFileForm({
      fileName: '',
      version: '',
      dateOfDocument: '',
      description: '',
      distributionType: 'all',
      departments: [],
      branches: [],
      specificEmployees: [],
      file: null
    })
  }

  // Integration Handlers
  const handleIntegrationConfig = (integrationKey: string) => {
    setSelectedIntegration(integrationKey)
    setIntegrationForm(integrations[integrationKey as keyof typeof integrations].config)
    setShowIntegrationsModal(true)
  }

  const handleConnectIntegration = (integrationKey: string) => {
    setIntegrations(prev => ({
      ...prev,
      [integrationKey]: {
        ...prev[integrationKey as keyof typeof prev],
        status: 'connected',
        lastSync: new Date().toLocaleString('en-ZA', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit'
        })
      }
    }))
    setNotificationMessage(`${integrations[integrationKey as keyof typeof integrations].name} connected successfully!`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleDisconnectIntegration = (integrationKey: string) => {
    setIntegrations(prev => ({
      ...prev,
      [integrationKey]: {
        ...prev[integrationKey as keyof typeof prev],
        status: 'disconnected',
        lastSync: 'Never'
      }
    }))
    setNotificationMessage(`${integrations[integrationKey as keyof typeof integrations].name} disconnected.`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleSyncIntegration = (integrationKey: string) => {
    if (integrations[integrationKey as keyof typeof integrations].status !== 'connected') {
      setNotificationMessage('Integration must be connected before syncing.')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }

    setNotificationMessage(`Syncing ${integrations[integrationKey as keyof typeof integrations].name}...`)
    setShowNotification(true)
    
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [integrationKey]: {
          ...prev[integrationKey as keyof typeof prev],
          lastSync: new Date().toLocaleString('en-ZA', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit'
          })
        }
      }))
      setNotificationMessage(`${integrations[integrationKey as keyof typeof integrations].name} synced successfully!`)
      setTimeout(() => setShowNotification(false), 3000)
    }, 2000)
  }

  const handleSaveIntegrationConfig = () => {
    if (!selectedIntegration) return

    setIntegrations(prev => ({
      ...prev,
      [selectedIntegration]: {
        ...prev[selectedIntegration as keyof typeof prev],
        config: { ...integrationForm }
      }
    }))

    setShowIntegrationsModal(false)
    setNotificationMessage(`${integrations[selectedIntegration as keyof typeof integrations].name} configuration saved successfully!`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleTestEmailConnection = async () => {
    setNotificationMessage('Testing email connection...')
    setShowNotification(true)
    
    setTimeout(() => {
      setNotificationMessage('Email connection test successful! Test email sent.')
      setTimeout(() => setShowNotification(false), 3000)
    }, 2000)
  }

  // Policy Form State
  const [policyForm, setPolicyForm] = useState({
    name: '',
    group: 'HR Policy',
    version: '',
    content: '',
    mandatory: true,
    author: 'Admin'
  })

  // Notification Form State
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    content: '',
    type: 'General',
    priority: 'medium',
    author: 'Admin',
    targetAudience: 'all'
  })

  // Handlers for pricing actions
  const handleContactSales = () => {
    setShowContactModal(true)
  }

  const handleScheduleCall = () => {
    setShowContactModal(true)
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
    setShowDowngradeModal(true)
  }

  const confirmDowngrade = () => {
    handleDowngrade('Starter Plan')
    setShowDowngradeModal(false)
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
    setShowContactModal(true)
  }

  const handleBillingHistory = () => {
    setNotificationMessage('Opening billing history...')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const handleFeatureComparison = () => {
    setShowPlanComparison(true)
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

  // Admin stats handlers
  const handleNewHiresClick = () => {
    setShowNewHiresModal(true)
  }

  // Policy Form Handlers
  const handlePolicyFormChange = (field: string, value: string | boolean) => {
    setPolicyForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitPolicy = () => {
    if (!policyForm.name || !policyForm.version || !policyForm.content) {
      setNotificationMessage('Please fill in all required fields')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }

    const newPolicy = {
      id: `admin-policy-${Date.now()}`,
      name: policyForm.name,
      group: policyForm.group,
      version: policyForm.version,
      dateCreated: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      author: policyForm.author,
      mandatory: policyForm.mandatory,
      status: 'active',
      content: policyForm.content
    }

    setAdminPolicies(prev => [...prev, newPolicy])
    
    setPolicyForm({
      name: '',
      group: 'HR Policy',
      version: '',
      content: '',
      mandatory: true,
      author: 'Admin'
    })

    setShowAddPolicyModal(false)
    setNotificationMessage(`Policy "${newPolicy.name}" created successfully`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  // Notification Form Handlers
  const handleNotificationFormChange = (field: string, value: string) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitNotification = () => {
    if (!notificationForm.title || !notificationForm.content) {
      setNotificationMessage('Please fill in all required fields')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: notificationForm.title,
      content: notificationForm.content,
      type: notificationForm.type,
      priority: notificationForm.priority,
      dateCreated: new Date().toISOString().split('T')[0],
      author: notificationForm.author,
      status: 'active',
      targetAudience: notificationForm.targetAudience
    }

    setAdminNotifications(prev => [...prev, newNotification])
    
    setNotificationForm({
      title: '',
      content: '',
      type: 'General',
      priority: 'medium',
      author: 'Admin',
      targetAudience: 'all'
    })

    setShowAddNotificationModal(false)
    setNotificationMessage(`Notification "${newNotification.title}" created successfully`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleNewRequestsClick = () => {
    setShowNewRequestsModal(true)
  }

  const handleAvgResponseTimeClick = () => {
    setShowAvgResponseTimeModal(true)
  }

  const handleTeamAvailabilityClick = () => {
    setShowTeamAvailabilityModal(true)
  }

  const handleSubscriptionDetailsClick = () => {
    setShowSubscriptionModal(true)
  }

  // Approval handlers
  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    if (newSelectAll) {
      setSelectedRequests(['john-smith', 'mary-davis'])
    } else {
      setSelectedRequests([])
    }
  }

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => {
      const isSelected = prev.includes(requestId)
      if (isSelected) {
        const newSelected = prev.filter(id => id !== requestId)
        setSelectAll(false)
        return newSelected
      } else {
        const newSelected = [...prev, requestId]
        setSelectAll(newSelected.length === 2) // Total number of requests
        return newSelected
      }
    })
  }

  const handleApproveSelected = () => {
    if (selectedRequests.length === 0) {
      setNotificationMessage('Please select requests to approve')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }
    
    setNotificationMessage(`${selectedRequests.length} request(s) approved successfully!`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
    setSelectedRequests([])
    setSelectAll(false)
  }

  const handleRejectSelected = () => {
    if (selectedRequests.length === 0) {
      setNotificationMessage('Please select requests to reject')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }
    
    setNotificationMessage(`${selectedRequests.length} request(s) rejected successfully!`)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
    setSelectedRequests([])
    setSelectAll(false)
  }

  // Contact form handlers
  const handleContactFormChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContactFormSubmit = () => {
    if (!contactForm.name || !contactForm.email) {
      setNotificationMessage('Please fill in your name and email')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }
    
    setShowContactModal(false)
    setNotificationMessage('Thank you for your interest! Our sales team will contact you within 24 hours.')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: ''
    })
  }

  return (
    <AppShell userRole="admin">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl heading-premium text-gray-900 font-bold">Admin Dashboard</h1>
            <p className="text-premium text-gray-600 text-sm sm:text-base lg:text-lg">Manage leave requests, employees, and organizational policies</p>
          </div>
        </div>

        <div className="mb-8">
          <DashboardStats 
            role="admin" 
            onNewHiresClick={handleNewHiresClick}
            onNewRequestsClick={handleNewRequestsClick}
            onAvgResponseTimeClick={handleAvgResponseTimeClick}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <div className="card-premium shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <div className="px-4 sm:px-6 py-6 border-b border-gray-200">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Pending Approvals</h2>
                  <p className="text-premium text-gray-600 text-sm sm:text-base">Review and approve leave requests</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full self-start sm:self-center">2 pending</span>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <button 
                    onClick={handleApproveSelected}
                    className="btn-premium bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-xs sm:text-sm font-medium"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve Selected ({selectedRequests.length})</span>
                  </button>
                  <button 
                    onClick={handleRejectSelected}
                    className="btn-premium bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-xs sm:text-sm font-medium"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject Selected ({selectedRequests.length})</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={selectedRequests.includes('john-smith')}
                        onChange={() => handleSelectRequest('john-smith')}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 mt-1 flex-shrink-0" 
                      />
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
                    <div className="flex-shrink-0">
                      <div className="flex gap-2">
                        <button className="p-2 sm:p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md" title="Approve">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md" title="Reject">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={selectedRequests.includes('mary-davis')}
                        onChange={() => handleSelectRequest('mary-davis')}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2 mt-1 flex-shrink-0" 
                      />
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
                    <div className="flex-shrink-0">
                      <div className="flex gap-2">
                        <button className="p-2 sm:p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md" title="Approve">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md" title="Reject">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleViewAllPendingRequests}
                  className="w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 py-2 px-3 sm:py-3 sm:px-6 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  View All Pending Requests
                </button>
              </div>
            </div>
          </div>

          <div className="card-premium shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <div className="px-4 sm:px-6 py-6 border-b border-gray-200">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">Team Availability</h2>
                  <p className="text-premium text-gray-600 text-sm sm:text-base">Current team capacity across departments</p>
                </div>
                <button 
                  onClick={handleTeamAvailabilityClick}
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
                <button 
                  onClick={handleSubscriptionDetailsClick} 
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
                >
                  View Details
                </button>
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
                    
                    <div className="pt-4 border-t border-green-200 space-y-4">
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-3xl font-bold text-green-900">R2,499</span>
                        <span className="text-sm text-green-700">/month flat rate</span>
                      </div>
                      <button 
                        onClick={handleContactSales}
                        className="btn-premium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 w-full text-xs sm:text-sm"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Contact Sales</span>
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
                        <button onClick={handleDowngradeClick} className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200">
                          Downgrade
                        </button>
                      </div>
                      <p className="text-xs text-orange-600 mt-2">Save R450/month</p>
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
                  <div className="space-y-4">
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
                      className="btn-premium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 w-auto text-xs sm:text-sm"
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
                <div className="mb-6 space-y-4">
                  <div>
                    <h3 className="text-xl heading-premium text-gray-900 font-bold">All LeaveHub Plans</h3>
                    <p className="text-gray-600 mt-1">Choose the perfect plan for your organization size</p>
                  </div>
                  <button 
                    onClick={handleFeatureComparison} 
                    className="btn-premium bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 w-full sm:w-auto"
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

      {/* Contact Sales Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Sales</h3>
              <button 
                onClick={() => setShowContactModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Fill out the form below and our sales team will contact you within 24 hours to discuss your needs.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleContactFormSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => handleContactFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleContactFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => handleContactFormChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+27 123 456 7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => handleContactFormChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your company name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => handleContactFormChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your requirements, team size, or any specific questions..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowContactModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 py-2 px-3 sm:py-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-2 px-3 sm:py-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Policy</h3>
              <button 
                onClick={() => setShowAddPolicyModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitPolicy(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name *</label>
                  <input
                    type="text"
                    value={policyForm.name}
                    onChange={(e) => handlePolicyFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Employee Code of Conduct"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Policy Group *</label>
                  <select
                    value={policyForm.group}
                    onChange={(e) => handlePolicyFormChange('group', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="HR Policy">HR Policy</option>
                    <option value="SHE Policy">SHE Policy</option>
                    <option value="Operations Policy">Operations Policy</option>
                    <option value="IT Policy">IT Policy</option>
                    <option value="Finance Policy">Finance Policy</option>
                    <option value="Legal Policy">Legal Policy</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version *</label>
                  <input
                    type="text"
                    value={policyForm.version}
                    onChange={(e) => handlePolicyFormChange('version', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., v1.0, v2.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={policyForm.author}
                    onChange={(e) => handlePolicyFormChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., HR Department"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Content *</label>
                <textarea
                  value={policyForm.content}
                  onChange={(e) => handlePolicyFormChange('content', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the full policy content here..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={policyForm.mandatory}
                  onChange={(e) => handlePolicyFormChange('mandatory', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="mandatory" className="ml-2 text-sm text-gray-900">
                  This policy is mandatory for all employees
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddPolicyModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Notification Modal */}
      {showAddNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Notification</h3>
              <button 
                onClick={() => setShowAddNotificationModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitNotification(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => handleNotificationFormChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., New Company Policy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type *</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => handleNotificationFormChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Death">Death</option>
                    <option value="Termination">Termination</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => handleNotificationFormChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={notificationForm.author}
                    onChange={(e) => handleNotificationFormChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., HR Department"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <select
                  value={notificationForm.targetAudience}
                  onChange={(e) => handleNotificationFormChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Employees</option>
                  <option value="managers">Managers Only</option>
                  <option value="departments">Specific Departments</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={notificationForm.content}
                  onChange={(e) => handleNotificationFormChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the notification content here..."
                  required
                />
              </div>

              {/* Preview with color coding */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className={`p-4 rounded-xl border-l-4 ${
                  notificationForm.type === 'General' ? 'bg-blue-50 border-blue-400' :
                  notificationForm.type === 'Promotion' ? 'bg-green-50 border-green-400' :
                  notificationForm.type === 'Death' ? 'bg-gray-50 border-gray-400' :
                  notificationForm.type === 'Termination' ? 'bg-red-50 border-red-400' :
                  'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notificationForm.type === 'General' ? 'bg-blue-100 text-blue-800' :
                        notificationForm.type === 'Promotion' ? 'bg-green-100 text-green-800' :
                        notificationForm.type === 'Death' ? 'bg-gray-100 text-gray-800' :
                        notificationForm.type === 'Termination' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notificationForm.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notificationForm.priority === 'high' ? 'bg-red-100 text-red-800' :
                        notificationForm.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notificationForm.priority}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{notificationForm.title || 'Notification Title'}</h4>
                  <p className="text-sm text-gray-700 mb-2">{notificationForm.content || 'Notification content will appear here...'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>By {notificationForm.author || 'Admin'}</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddNotificationModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-3 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Create Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Admin Policy Management Section */}
        <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">📋 Policy Management</h2>
                <p className="text-premium text-gray-600 text-sm sm:text-base">Create and manage company policies for employees</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowAddPolicyModal(true)} 
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Policy</span>
                </button>
                <button 
                  onClick={() => setShowPolicyManagementModal(true)} 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Manage All
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminPolicies.slice(0, 3).map((policy) => (
                <div key={policy.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      policy.group === 'HR Policy' ? 'bg-green-500' :
                      policy.group === 'SHE Policy' ? 'bg-red-500' :
                      policy.group === 'Operations Policy' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`}>
                      📋
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{policy.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{policy.group} • {policy.version}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">By {policy.author}</span>
                    <span className="text-xs text-gray-500">{new Date(policy.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Notification Management Section */}
        <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">📢 Notification Management</h2>
                <p className="text-premium text-gray-600 text-sm sm:text-base">Create and manage company-wide announcements</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowAddNotificationModal(true)} 
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Notice</span>
                </button>
                <button 
                  onClick={() => setShowNotificationManagementModal(true)} 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Manage All
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {adminNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`p-4 rounded-xl border-l-4 ${
                  notification.type === 'General' ? 'bg-blue-50 border-blue-400' :
                  notification.type === 'Promotion' ? 'bg-green-50 border-green-400' :
                  notification.type === 'Death' ? 'bg-gray-50 border-gray-400' :
                  notification.type === 'Termination' ? 'bg-red-50 border-red-400' :
                  'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notification.type === 'General' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'Promotion' ? 'bg-green-100 text-green-800' :
                        notification.type === 'Death' ? 'bg-gray-100 text-gray-800' :
                        notification.type === 'Termination' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(notification.dateCreated).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                  <p className="text-sm text-gray-700">{notification.content}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">By {notification.author}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      notification.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin File Management Section */}
        <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">📁 File Management</h2>
                <p className="text-premium text-gray-600 text-sm sm:text-base">Upload and distribute documents to employees across your organization</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowAddFileModal(true)} 
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload File</span>
                </button>
                <button 
                  onClick={() => setShowFileManagementModal(true)} 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Manage All
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {adminFiles.slice(0, 3).map((file) => (
                <div key={file.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          file.fileType === 'PDF' ? 'bg-red-100 text-red-600' :
                          file.fileType === 'DOCX' || file.fileType === 'DOC' ? 'bg-blue-100 text-blue-600' :
                          file.fileType === 'XLSX' || file.fileType === 'XLS' ? 'bg-green-100 text-green-600' :
                          file.fileType === 'PPTX' || file.fileType === 'PPT' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{file.fileName}</h4>
                        <p className="text-xs text-gray-500 mt-1">{file.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>Version {file.version}</span>
                          <span>•</span>
                          <span>{file.fileSize}</span>
                          <span>•</span>
                          <span>{file.fileType}</span>
                          <span>•</span>
                          <span>{file.downloadCount} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        file.distributionType === 'all' ? 'bg-green-100 text-green-800' :
                        file.distributionType === 'department' ? 'bg-blue-100 text-blue-800' :
                        file.distributionType === 'branch' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {file.distributionType === 'all' ? 'All Employees' :
                         file.distributionType === 'department' ? `${file.departments.join(', ')}` :
                         file.distributionType === 'branch' ? `${file.branches.join(', ')}` :
                         'Specific Users'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Uploaded by {file.uploadedBy}</span>
                    <span>{new Date(file.dateUploaded).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations Management Section */}
        <div className="card-premium shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl heading-premium text-gray-900 font-bold">🔗 Integrations</h2>
                <p className="text-premium text-gray-600 text-sm sm:text-base">Connect with external systems and tools</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(integrations).map(([key, integration]) => (
                <div key={key} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          key === 'email' ? 'bg-blue-100 text-blue-600' :
                          key === 'calendar' ? 'bg-green-100 text-green-600' :
                          key === 'hrSystem' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {key === 'email' ? '📧' :
                           key === 'calendar' ? '📅' :
                           key === 'hrSystem' ? '👥' :
                           '📊'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            integration.status === 'connected' ? 'bg-green-100 text-green-800' :
                            integration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {integration.status === 'connected' ? '✓ Connected' :
                             integration.status === 'pending' ? '⏳ Pending' :
                             '❌ Disconnected'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Last sync: {integration.lastSync}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {integration.status === 'connected' && (
                      <>
                        <button
                          onClick={() => handleIntegrationConfig(key)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-200 hover:border-blue-300 px-3 py-1 rounded-lg transition-colors"
                        >
                          {key === 'email' ? 'Configure SMTP' :
                           key === 'calendar' ? 'Setup Calendar' :
                           key === 'hrSystem' ? 'Connect HR System' :
                           'View Reports'}
                        </button>
                        <button
                          onClick={() => handleSyncIntegration(key)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium border border-green-200 hover:border-green-300 px-3 py-1 rounded-lg transition-colors"
                        >
                          Sync Now
                        </button>
                        <button
                          onClick={() => handleDisconnectIntegration(key)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 hover:border-red-300 px-3 py-1 rounded-lg transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    )}
                    {integration.status === 'pending' && (
                      <button
                        onClick={() => handleIntegrationConfig(key)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium border border-yellow-200 hover:border-yellow-300 px-3 py-1 rounded-lg transition-colors"
                      >
                        {key === 'calendar' ? 'Setup Calendar' : 'Configure'}
                      </button>
                    )}
                    {integration.status === 'disconnected' && (
                      <>
                        <button
                          onClick={() => handleIntegrationConfig(key)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium border border-purple-200 hover:border-purple-300 px-3 py-1 rounded-lg transition-colors"
                        >
                          {key === 'hrSystem' ? 'Connect HR System' : 'Configure'}
                        </button>
                        <button
                          onClick={() => handleConnectIntegration(key)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium border border-green-200 hover:border-green-300 px-3 py-1 rounded-lg transition-colors"
                        >
                          Connect
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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

      {/* New Hires Modal */}
      {showNewHiresModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Hires (15)</h3>
              <button 
                onClick={() => setShowNewHiresModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Sarah Johnson", department: "Marketing", startDate: "2024-01-15", position: "Marketing Specialist" },
                { name: "Mike Chen", department: "Engineering", startDate: "2024-01-12", position: "Frontend Developer" },
                { name: "Emily Rodriguez", department: "Sales", startDate: "2024-01-10", position: "Account Manager" },
                { name: "David Kim", department: "HR", startDate: "2024-01-08", position: "HR Coordinator" },
                { name: "Lisa Thompson", department: "Engineering", startDate: "2024-01-05", position: "Backend Developer" }
              ].map((hire, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {hire.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{hire.name}</h4>
                      <p className="text-sm text-gray-600">{hire.position} • {hire.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Started</p>
                    <p className="text-sm font-medium text-gray-900">{hire.startDate}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowNewHiresModal(false)}
                className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Requests Modal */}
      {showNewRequestsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">New Requests (6)</h3>
              <button 
                onClick={() => setShowNewRequestsModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Alex Morgan", type: "Annual Leave", dates: "Feb 15-19, 2024", days: "5 days", status: "pending" },
                { name: "Jamie Lee", type: "Sick Leave", dates: "Feb 12, 2024", days: "1 day", status: "pending" },
                { name: "Chris Wilson", type: "Personal Leave", dates: "Feb 20-21, 2024", days: "2 days", status: "pending" },
                { name: "Taylor Brown", type: "Annual Leave", dates: "Mar 1-5, 2024", days: "5 days", status: "pending" },
                { name: "Jordan Davis", type: "Maternity Leave", dates: "Mar 15 - Sep 15, 2024", days: "184 days", status: "pending" },
                { name: "Casey Smith", type: "Annual Leave", dates: "Feb 28, 2024", days: "1 day", status: "pending" }
              ].map((request, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      {request.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{request.name}</h4>
                      <p className="text-sm text-gray-600">{request.type} • {request.dates}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{request.days}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowNewRequestsModal(false)}
                className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Average Response Time Modal */}
      {showAvgResponseTimeModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Response Time Analytics</h3>
              <button 
                onClick={() => setShowAvgResponseTimeModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-green-900 mb-2">Current Average</h4>
                <p className="text-3xl font-bold text-green-600">2.3 hours</p>
                <p className="text-sm text-green-700">26% faster than last month</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Best Response</h4>
                <p className="text-3xl font-bold text-blue-600">15 mins</p>
                <p className="text-sm text-blue-700">By Sarah Johnson</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-900 mb-2">Pending Requests</h4>
                <p className="text-3xl font-bold text-yellow-600">24</p>
                <p className="text-sm text-yellow-700">Average wait: 1.8 hours</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Recent Response Times</h4>
              {[
                { request: "Annual Leave - Mike Chen", responseTime: "45 mins", approver: "Sarah Johnson", date: "Feb 14" },
                { request: "Sick Leave - Emily Rodriguez", responseTime: "1.2 hours", approver: "David Kim", date: "Feb 14" },
                { request: "Personal Leave - Alex Morgan", responseTime: "2.8 hours", approver: "Lisa Thompson", date: "Feb 13" },
                { request: "Annual Leave - Jamie Lee", responseTime: "1.5 hours", approver: "Sarah Johnson", date: "Feb 13" },
                { request: "Maternity Leave - Taylor Brown", responseTime: "3.2 hours", approver: "David Kim", date: "Feb 12" }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.request}</h5>
                    <p className="text-sm text-gray-600">Approved by {item.approver} • {item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.responseTime}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowAvgResponseTimeModal(false)}
                className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Availability Modal */}
      {showTeamAvailabilityModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Team Availability Details</h3>
              <button 
                onClick={() => setShowTeamAvailabilityModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Engineering Team */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-green-900">Engineering</h4>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Staff:</span>
                    <span className="font-semibold">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-green-600">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">On Leave:</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600">Capacity: 80%</p>
                </div>
              </div>

              {/* Marketing Team */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-blue-900">Marketing</h4>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Staff:</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-green-600">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">On Leave:</span>
                    <span className="font-semibold text-red-600">1</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '87.5%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600">Capacity: 87.5%</p>
                </div>
              </div>

              {/* Sales Team */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-purple-900">Sales</h4>
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Staff:</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-green-600">10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">On Leave:</span>
                    <span className="font-semibold text-red-600">2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '83.3%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600">Capacity: 83.3%</p>
                </div>
              </div>

              {/* HR Team */}
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-orange-900">Human Resources</h4>
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Staff:</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-green-600">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">On Leave:</span>
                    <span className="font-semibold text-red-600">0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600">Capacity: 100%</p>
                </div>
              </div>

              {/* Finance Team */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-red-900">Finance</h4>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Staff:</span>
                    <span className="font-semibold">6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-green-600">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">On Leave:</span>
                    <span className="font-semibold text-red-600">2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '66.7%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600">Capacity: 66.7%</p>
                </div>
              </div>

              {/* Operations Team */}
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-indigo-900">Operations</h4>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Staff:</span>
                    <span className="font-semibold">10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-semibold text-green-600">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">On Leave:</span>
                    <span className="font-semibold text-red-600">2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600">Capacity: 80%</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Overall Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">56</p>
                  <p className="text-sm text-gray-600">Total Staff</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">46</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">10</p>
                  <p className="text-sm text-gray-600">On Leave</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">82.1%</p>
                  <p className="text-sm text-gray-600">Overall Capacity</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowTeamAvailabilityModal(false)}
                className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Details Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Subscription Details</h3>
              <button 
                onClick={() => setShowSubscriptionModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Current Plan Overview */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Current Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Plan:</span>
                        <span className="font-semibold text-blue-600">Professional Plan</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Monthly Cost:</span>
                        <span className="font-semibold">R2,450/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Cost per Employee:</span>
                        <span className="font-semibold">R49/employee/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Active Users:</span>
                        <span className="font-semibold">50 / 50</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Billing Cycle:</span>
                        <span className="font-semibold">Monthly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Next Billing:</span>
                        <span className="font-semibold">March 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Account Status:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Contract End:</span>
                        <span className="font-semibold">February 15, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Included Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Up to 50 employees</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Advanced reporting</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Email & chat support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">API access</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Team calendar</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Mobile apps</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Custom policies</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Data export</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">847</div>
                    <div className="text-sm text-gray-600">Leave Requests</div>
                    <div className="text-xs text-gray-500">This year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">98.2%</div>
                    <div className="text-sm text-gray-600">Approval Rate</div>
                    <div className="text-xs text-gray-500">Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">2.3h</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                    <div className="text-xs text-gray-500">Time to approval</div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4">Payment Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Payment Method:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">•••• 4242</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">VISA</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Auto-renewal:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Last Payment:</span>
                    <span className="font-semibold">R2,450 on Feb 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Next Payment:</span>
                    <span className="font-semibold">R2,450 on Mar 15, 2024</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowSubscriptionModal(false)
                  handleBillingHistory()
                }}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 px-6 rounded-lg font-medium transition-all duration-200"
              >
                View Billing History
              </button>
              <button 
                onClick={() => setShowSubscriptionModal(false)}
                className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Confirm Downgrade</h3>
              <button 
                onClick={() => setShowDowngradeModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Downgrade to Starter Plan</h4>
                  <p className="text-sm text-gray-600">This action will reduce your plan features</p>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>Changes that will take effect:</strong>
                </p>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  <li>• Employee limit reduced to 20 users</li>
                  <li>• Monthly cost: R399/month</li>
                  <li>• Some advanced features will be disabled</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-600">
                Are you sure you want to proceed with this downgrade? Our team will contact you to confirm the changes.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDowngrade}
                className="flex-1 bg-orange-600 text-white hover:bg-orange-700 py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showAddFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upload New File</h3>
              <button 
                onClick={() => setShowAddFileModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
                {fileForm.file && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Selected: {fileForm.file.name}
                  </p>
                )}
              </div>

              {/* File Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Name *
                </label>
                <input
                  type="text"
                  value={fileForm.fileName}
                  onChange={(e) => handleFileFormChange('fileName', e.target.value)}
                  placeholder="Enter file display name"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Version *
                </label>
                <input
                  type="text"
                  value={fileForm.version}
                  onChange={(e) => handleFileFormChange('version', e.target.value)}
                  placeholder="e.g., v1.0, v2.1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Date of Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Document (Optional)
                </label>
                <input
                  type="date"
                  value={fileForm.dateOfDocument}
                  onChange={(e) => handleFileFormChange('dateOfDocument', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={fileForm.description}
                  onChange={(e) => handleFileFormChange('description', e.target.value)}
                  placeholder="Brief description of the file"
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Distribution Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Distribution *
                </label>
                <select
                  value={fileForm.distributionType}
                  onChange={(e) => handleFileFormChange('distributionType', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="all">All Employees</option>
                  <option value="department">By Department</option>
                  <option value="branch">By Branch</option>
                  <option value="specific">Specific Employees</option>
                </select>
              </div>

              {/* Department Selection */}
              {fileForm.distributionType === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Departments
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {['HR', 'Operations', 'Finance', 'IT', 'Marketing', 'Sales'].map(dept => (
                      <label key={dept} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={fileForm.departments.includes(dept)}
                          onChange={(e) => {
                            const newDepts = e.target.checked 
                              ? [...fileForm.departments, dept]
                              : fileForm.departments.filter(d => d !== dept)
                            handleFileFormChange('departments', newDepts)
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Branch Selection */}
              {fileForm.distributionType === 'branch' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Branches
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {['Cape Town', 'Johannesburg', 'Durban', 'Port Elizabeth', 'Bloemfontein'].map(branch => (
                      <label key={branch} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={fileForm.branches.includes(branch)}
                          onChange={(e) => {
                            const newBranches = e.target.checked 
                              ? [...fileForm.branches, branch]
                              : fileForm.branches.filter(b => b !== branch)
                            handleFileFormChange('branches', newBranches)
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{branch}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Employees */}
              {fileForm.distributionType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Employees
                  </label>
                  <textarea
                    value={fileForm.specificEmployees.join('\n')}
                    onChange={(e) => handleFileFormChange('specificEmployees', e.target.value.split('\n').filter(email => email.trim()))}
                    placeholder="Enter employee emails, one per line"
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowAddFileModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitFile}
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Management Modal */}
      {showFileManagementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">File Management</h3>
              <button 
                onClick={() => setShowFileManagementModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <button
                onClick={() => setShowAddFileModal(true)}
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Upload New File
              </button>
            </div>

            <div className="space-y-4">
              {adminFiles.map((file) => {
                const getFileTypeIcon = (fileName: string) => {
                  const extension = fileName.split('.').pop()?.toLowerCase() || ''
                  const iconMap: {[key: string]: { icon: string, color: string }} = {
                    pdf: { icon: '📄', color: 'bg-red-100 text-red-600 border-red-200' },
                    doc: { icon: '📝', color: 'bg-blue-100 text-blue-600 border-blue-200' },
                    docx: { icon: '📝', color: 'bg-blue-100 text-blue-600 border-blue-200' },
                    xls: { icon: '📊', color: 'bg-green-100 text-green-600 border-green-200' },
                    xlsx: { icon: '📊', color: 'bg-green-100 text-green-600 border-green-200' },
                    ppt: { icon: '📋', color: 'bg-orange-100 text-orange-600 border-orange-200' },
                    pptx: { icon: '📋', color: 'bg-orange-100 text-orange-600 border-orange-200' },
                    txt: { icon: '📄', color: 'bg-gray-100 text-gray-600 border-gray-200' }
                  }
                  return iconMap[extension] || { icon: '📄', color: 'bg-gray-100 text-gray-600 border-gray-200' }
                }

                const fileType = getFileTypeIcon(file.originalName)
                const getDistributionBadge = (type: string, departments?: string[], branches?: string[]) => {
                  if (type === 'all') return { text: 'All Employees', color: 'bg-blue-100 text-blue-800' }
                  if (type === 'department') return { text: `${departments?.length} Dept(s)`, color: 'bg-green-100 text-green-800' }
                  if (type === 'branch') return { text: `${branches?.length} Branch(es)`, color: 'bg-purple-100 text-purple-800' }
                  if (type === 'specific') return { text: 'Specific Employees', color: 'bg-orange-100 text-orange-800' }
                  return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' }
                }

                const distributionBadge = getDistributionBadge(file.distributionType, file.departments, file.branches)

                return (
                  <div key={file.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${fileType.color}`}>
                          {fileType.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{file.fileName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{file.originalName}</p>
                          {file.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{file.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Version: {file.version}</span>
                            <span>Size: {file.fileSize}</span>
                            <span>Downloads: {file.downloadCount}</span>
                            <span>Uploaded: {file.dateUploaded}</span>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${distributionBadge.color}`}>
                              {distributionBadge.text}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Integrations Configuration Modal */}
      {showIntegrationsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Configure {integrations[selectedIntegration as keyof typeof integrations].name}
              </h3>
              <button 
                onClick={() => setShowIntegrationsModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {selectedIntegration === 'email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      value={integrationForm.host || ''}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, host: e.target.value }))}
                      placeholder="smtp.office365.com"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Port *
                      </label>
                      <input
                        type="text"
                        value={integrationForm.port || ''}
                        onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, port: e.target.value }))}
                        placeholder="587"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Security
                      </label>
                      <select
                        value={integrationForm.secure ? 'true' : 'false'}
                        onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, secure: e.target.value === 'true' }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="true">TLS/STARTTLS</option>
                        <option value="false">None</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username *
                    </label>
                    <input
                      type="email"
                      value={integrationForm.username || ''}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, username: e.target.value }))}
                      placeholder="notifications@yourcompany.com"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Email Address
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="email"
                        value={integrationForm.testEmail || ''}
                        onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, testEmail: e.target.value }))}
                        placeholder="test@yourcompany.com"
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      />
                      <button
                        onClick={handleTestEmailConnection}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </>
              )}

              {selectedIntegration === 'calendar' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Calendar Providers</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={integrationForm.googleEnabled || false}
                            onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, googleEnabled: e.target.checked }))}
                            className="mr-3"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Google Calendar</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={integrationForm.outlookEnabled || false}
                            onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, outlookEnabled: e.target.checked }))}
                            className="mr-3"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Microsoft Outlook</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sync Interval
                        </label>
                        <select
                          value={integrationForm.syncInterval || '15 minutes'}
                          onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, syncInterval: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="5 minutes">5 minutes</option>
                          <option value="15 minutes">15 minutes</option>
                          <option value="30 minutes">30 minutes</option>
                          <option value="1 hour">1 hour</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sync Direction
                        </label>
                        <select
                          value={integrationForm.syncDirection || 'bidirectional'}
                          onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, syncDirection: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="bidirectional">Bidirectional</option>
                          <option value="import">Import Only</option>
                          <option value="export">Export Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedIntegration === 'hrSystem' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      HR System API URL *
                    </label>
                    <input
                      type="url"
                      value={integrationForm.apiUrl || ''}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, apiUrl: e.target.value }))}
                      placeholder="https://api.hrsystem.com/v1"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={integrationForm.apiKey || ''}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter API key"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sync Frequency
                    </label>
                    <select
                      value={integrationForm.syncFrequency || 'daily'}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, syncFrequency: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="manual">Manual Only</option>
                    </select>
                  </div>
                </>
              )}

              {selectedIntegration === 'analytics' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Analytics Provider
                    </label>
                    <select
                      value={integrationForm.provider || 'Power BI'}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, provider: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="Power BI">Microsoft Power BI</option>
                      <option value="Tableau">Tableau</option>
                      <option value="Google Analytics">Google Analytics</option>
                      <option value="Custom">Custom Dashboard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dashboard URL
                    </label>
                    <input
                      type="url"
                      value={integrationForm.dashboardUrl || ''}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, dashboardUrl: e.target.value }))}
                      placeholder="https://app.powerbi.com/groups/your-workspace"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Refresh Interval
                    </label>
                    <select
                      value={integrationForm.refreshInterval || '1 hour'}
                      onChange={(e) => setIntegrationForm((prev: any) => ({ ...prev, refreshInterval: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="4 hours">4 hours</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setShowIntegrationsModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveIntegrationConfig}
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Save Configuration
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
      <ErrorBoundary>
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
        <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App