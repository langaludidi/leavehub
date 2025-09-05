import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface RoleBasedRouterProps {
  userRole?: string
  organizationType?: string
}

export function RoleBasedRouter({ userRole, organizationType }: RoleBasedRouterProps) {
  const { user, member, organization } = useAuth()

  // If no user is authenticated, redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  // Determine role from context or props
  const role = userRole || member?.role || 'employee'
  const orgType = organizationType || organization?.subscription_plan || 'standard'

  // Route based on role
  switch (role) {
    case 'superadmin':
      return <Navigate to="/superadmin" replace />
    
    case 'admin':
      return <Navigate to="/admin" replace />
    
    case 'affiliate':
      return <Navigate to="/affiliate/dashboard" replace />
    
    case 'whitelabel':
      return <Navigate to="/whitelabel/dashboard" replace />
    
    case 'employee':
    default:
      return <Navigate to="/employee" replace />
  }
}

// Role detection utility
export function detectUserRole(email: string, memberData?: any, orgData?: any): string {
  // SuperAdmin detection
  const superAdminDomains = ['@leavehub.com', '@leavehub.co.za']
  if (superAdminDomains.some(domain => email.toLowerCase().includes(domain))) {
    return 'superadmin'
  }

  // Check member role from database
  if (memberData?.role) {
    return memberData.role
  }

  // Check organization type
  if (orgData?.organization_type) {
    switch (orgData.organization_type) {
      case 'affiliate':
        return 'affiliate'
      case 'whitelabel':
        return 'whitelabel'
      default:
        break
    }
  }

  // Default to employee
  return 'employee'
}

// Account type determination for signup
export function determineAccountType(email: string, companyName: string, selectedType?: string): {
  accountType: 'employee' | 'company' | 'affiliate' | 'whitelabel'
  organizationType: 'standard' | 'affiliate' | 'whitelabel'
  defaultRole: string
} {
  const emailLower = email.toLowerCase()
  const companyLower = companyName.toLowerCase()

  // Explicit type selection
  if (selectedType) {
    switch (selectedType) {
      case 'affiliate':
        return {
          accountType: 'affiliate',
          organizationType: 'affiliate',
          defaultRole: 'affiliate'
        }
      case 'whitelabel':
        return {
          accountType: 'whitelabel',
          organizationType: 'whitelabel',
          defaultRole: 'whitelabel'
        }
      case 'company':
        return {
          accountType: 'company',
          organizationType: 'standard',
          defaultRole: 'admin'
        }
      default:
        break
    }
  }

  // Auto-detect based on email/company
  if (emailLower.includes('@leavehub.com') || emailLower.includes('@leavehub.co.za')) {
    return {
      accountType: 'company',
      organizationType: 'standard',
      defaultRole: 'superadmin'
    }
  }

  // Affiliate/partner keywords
  const affiliateKeywords = ['marketing', 'partner', 'affiliate', 'reseller']
  if (affiliateKeywords.some(keyword => 
    companyLower.includes(keyword) || emailLower.includes(keyword)
  )) {
    return {
      accountType: 'affiliate',
      organizationType: 'affiliate',
      defaultRole: 'affiliate'
    }
  }

  // White label keywords
  const whitelabelKeywords = ['agency', 'solutions', 'consulting', 'systems']
  if (whitelabelKeywords.some(keyword => 
    companyLower.includes(keyword) || emailLower.includes(keyword)
  )) {
    return {
      accountType: 'whitelabel',
      organizationType: 'whitelabel',
      defaultRole: 'whitelabel'
    }
  }

  // Default to company admin
  return {
    accountType: 'company',
    organizationType: 'standard',
    defaultRole: 'admin'
  }
}