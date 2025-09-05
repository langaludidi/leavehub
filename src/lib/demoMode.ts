// Demo Mode Management
export interface DemoConfig {
  isDemo: boolean
  demoType: 'employee' | 'admin' | 'superadmin' | 'trial'
  expiresAt?: string
  features: string[]
}

interface MockUser {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
}

interface MockOrganization {
  id: string
  name: string
  slug: string
  industry: string
  timezone: string
  country: string
  subscription_plan: string
  subscription_status: string
  trial_ends_at?: string
}

interface MockMember {
  role: string
  job_title: string
}

interface MockData {
  user: MockUser
  organization: MockOrganization
  member: MockMember
}

export const DEMO_CONFIGS: Record<string, DemoConfig> = {
  employee: {
    isDemo: true,
    demoType: 'employee' as const,
    features: ['leave_requests', 'calendar_view', 'profile_management']
  },
  admin: {
    isDemo: true,
    demoType: 'admin' as const,
    features: ['leave_requests', 'calendar_view', 'profile_management', 'employee_management', 'reports', 'admin_settings']
  },
  superadmin: {
    isDemo: true,
    demoType: 'superadmin' as const,
    features: ['all_features', 'organization_management', 'billing', 'system_settings']
  },
  trial: {
    isDemo: false,
    demoType: 'trial' as const,
    features: ['all_features'],
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }
}

export class DemoModeManager {
  private static instance: DemoModeManager
  private config: DemoConfig | null = null

  static getInstance(): DemoModeManager {
    if (!DemoModeManager.instance) {
      DemoModeManager.instance = new DemoModeManager()
    }
    return DemoModeManager.instance
  }

  // Initialize demo mode
  initializeDemo(type: keyof typeof DEMO_CONFIGS) {
    const config = { ...DEMO_CONFIGS[type] }
    
    if ('expiresAt' in config && config.expiresAt) {
      localStorage.setItem('trialStarted', new Date().toISOString())
    }
    
    localStorage.setItem('demoMode', JSON.stringify(config))
    this.config = config
  }

  // Check if in demo mode
  isDemo(): boolean {
    this.loadConfig()
    return this.config?.isDemo || false
  }

  // Get current demo config
  getConfig(): DemoConfig | null {
    this.loadConfig()
    return this.config
  }

  // Check if feature is available
  hasFeature(feature: string): boolean {
    this.loadConfig()
    if (!this.config) return false
    
    return this.config.features.includes('all_features') || 
           this.config.features.includes(feature)
  }

  // Check if trial is expired
  isTrialExpired(): boolean {
    this.loadConfig()
    if (!this.config?.expiresAt) return false
    
    return new Date() > new Date(this.config.expiresAt)
  }

  // Get trial days remaining
  getTrialDaysRemaining(): number {
    this.loadConfig()
    if (!this.config?.expiresAt) return 0
    
    const now = new Date()
    const expiry = new Date(this.config.expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Clear demo mode
  clearDemo() {
    localStorage.removeItem('demoMode')
    localStorage.removeItem('trialStarted')
    localStorage.removeItem('trialNotificationDismissed')
    this.config = null
  }

  // Load config from localStorage
  private loadConfig() {
    if (this.config) return
    
    const stored = localStorage.getItem('demoMode')
    if (stored) {
      try {
        this.config = JSON.parse(stored)
      } catch (e) {
        console.warn('Failed to parse demo config:', e)
        this.clearDemo()
      }
    }
  }

  // Generate mock data based on demo type
  generateMockData(): MockData {
    const config = this.getConfig()
    if (!config) {
      return {
        user: {
          id: 'demo-user-123',
          email: 'demo@leavehub.com',
          full_name: 'Demo User',
          avatar_url: null
        },
        organization: {
          id: 'demo-org-123',
          name: 'Demo Company',
          slug: 'demo-company',
          industry: 'Technology',
          timezone: 'Africa/Johannesburg',
          country: 'South Africa',
          subscription_plan: 'demo',
          subscription_status: 'active'
        },
        member: { role: 'employee', job_title: 'Demo User' }
      }
    }

    const baseData: MockData = {
      user: {
        id: 'demo-user-123',
        email: 'demo@leavehub.com',
        full_name: 'Demo User',
        avatar_url: null
      },
      organization: {
        id: 'demo-org-123',
        name: 'Demo Company',
        slug: 'demo-company',
        industry: 'Technology',
        timezone: 'Africa/Johannesburg',
        country: 'South Africa',
        subscription_plan: config.demoType === 'trial' ? 'trial' : 'demo',
        subscription_status: 'active',
        trial_ends_at: config.expiresAt
      },
      member: { role: 'employee', job_title: 'Demo User' }
    }

    switch (config.demoType) {
      case 'employee':
        baseData.member = { role: 'employee', job_title: 'Software Developer' }
        break
      case 'admin':
        baseData.member = { role: 'admin', job_title: 'HR Manager' }
        break
      case 'superadmin':
        baseData.member = { role: 'superadmin', job_title: 'System Administrator' }
        break
      case 'trial':
        baseData.member = { role: 'admin', job_title: 'Company Owner' }
        break
    }

    return baseData
  }
}

// Utility functions
export const demoManager = DemoModeManager.getInstance()

export const startDemo = (type: keyof typeof DEMO_CONFIGS) => {
  demoManager.initializeDemo(type)
}

export const isInDemo = () => demoManager.isDemo()

export const hasFeature = (feature: string) => demoManager.hasFeature(feature)

export const getMockUser = (): MockUser | null => {
  try {
    const mockData = demoManager.generateMockData()
    return mockData.user
  } catch {
    return null
  }
}

export const getMockOrganization = (): MockOrganization | null => {
  try {
    const mockData = demoManager.generateMockData()
    return mockData.organization
  } catch {
    return null
  }
}

export const getMockMember = (): MockMember | null => {
  try {
    const mockData = demoManager.generateMockData()
    return mockData.member
  } catch {
    return null
  }
}