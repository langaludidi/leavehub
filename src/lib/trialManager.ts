import { supabase } from './supabase'

export interface TrialStatus {
  isTrialActive: boolean
  daysRemaining: number
  trialEndDate: string | null
  planLimits: {
    maxEmployees: number
    features: string[]
  }
  billingPlan: string
  nextBillingDate: string | null
  hasExpiredTrial: boolean
}

export class TrialManager {
  private static instance: TrialManager
  
  static getInstance(): TrialManager {
    if (!TrialManager.instance) {
      TrialManager.instance = new TrialManager()
    }
    return TrialManager.instance
  }

  // Start trial for new organization
  async startTrial(organizationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('start_organization_trial', {
        org_id: organizationId
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Set local trial tracking
      localStorage.setItem('trialStarted', new Date().toISOString())
      localStorage.removeItem('trialNotificationDismissed')

      return { success: true }
    } catch (err: any) {
      console.error('Error starting trial:', err)
      return { success: false, error: err.message || 'Failed to start trial' }
    }
  }

  // Get current trial status
  async getTrialStatus(organizationId: string): Promise<TrialStatus | null> {
    try {
      const { data, error } = await supabase.rpc('get_organization_billing_info', {
        org_id: organizationId
      })

      if (error) {
        console.error('Error getting trial status:', error)
        return null
      }

      if (!data || data.length === 0) {
        return null
      }

      const orgData = data[0]
      
      return {
        isTrialActive: orgData.is_trial_active,
        daysRemaining: orgData.trial_days_remaining || 0,
        trialEndDate: orgData.trial_end_date,
        planLimits: orgData.plan_limits || { maxEmployees: 3, features: [] },
        billingPlan: orgData.billing_plan,
        nextBillingDate: orgData.next_billing_date,
        hasExpiredTrial: orgData.trial_days_remaining <= 0 && orgData.is_trial_active === false
      }
    } catch (err) {
      console.error('Error fetching trial status:', err)
      return null
    }
  }

  // Check if trial should show notifications
  shouldShowTrialNotification(status: TrialStatus): boolean {
    if (!status.isTrialActive) return false
    
    // Show notification for last 7 days of trial
    return status.daysRemaining <= 7 && status.daysRemaining > 0
  }

  // Get notification urgency level
  getNotificationUrgency(daysRemaining: number): 'info' | 'warning' | 'critical' {
    if (daysRemaining <= 1) return 'critical'
    if (daysRemaining <= 3) return 'warning'
    return 'info'
  }

  // End trial and downgrade
  async endTrial(organizationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('end_organization_trial', {
        org_id: organizationId
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Clear local trial tracking
      localStorage.removeItem('trialStarted')
      localStorage.removeItem('trialNotificationDismissed')

      return { success: true }
    } catch (err: any) {
      console.error('Error ending trial:', err)
      return { success: false, error: err.message || 'Failed to end trial' }
    }
  }

  // Upgrade organization plan
  async upgradePlan(
    organizationId: string, 
    newPlan: string, 
    stripeSubscriptionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('upgrade_organization_plan', {
        org_id: organizationId,
        new_plan: newPlan,
        stripe_subscription_id: stripeSubscriptionId
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Clear trial notifications since user upgraded
      localStorage.removeItem('trialNotificationDismissed')

      return { success: true }
    } catch (err: any) {
      console.error('Error upgrading plan:', err)
      return { success: false, error: err.message || 'Failed to upgrade plan' }
    }
  }

  // Check for expired trials (for admin/background processes)
  async processExpiredTrials(): Promise<{ processed: number; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('process_expired_trials')

      if (error) {
        return { processed: 0, error: error.message }
      }

      return { processed: data || 0 }
    } catch (err: any) {
      console.error('Error processing expired trials:', err)
      return { processed: 0, error: err.message || 'Failed to process expired trials' }
    }
  }

  // Get pending trial emails (for email service)
  async getPendingTrialEmails(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_pending_trial_emails')

      if (error) {
        console.error('Error getting pending trial emails:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Error fetching pending trial emails:', err)
      return []
    }
  }

  // Mark trial email as sent
  async markTrialEmailSent(emailId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('mark_trial_email_sent', {
        email_id: emailId
      })

      return !error
    } catch (err) {
      console.error('Error marking trial email as sent:', err)
      return false
    }
  }

  // Create daily usage stats
  async createDailyUsageStats(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('create_daily_usage_stats')
      return !error
    } catch (err) {
      console.error('Error creating daily usage stats:', err)
      return false
    }
  }

  // Local trial tracking (for demo/development)
  getLocalTrialStatus(): { 
    isActive: boolean
    daysRemaining: number 
    startDate: string | null
  } {
    const trialStarted = localStorage.getItem('trialStarted')
    
    if (!trialStarted) {
      return { isActive: false, daysRemaining: 0, startDate: null }
    }

    const startDate = new Date(trialStarted)
    const endDate = new Date(startDate.getTime() + (14 * 24 * 60 * 60 * 1000))
    const now = new Date()
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      isActive: daysRemaining > 0,
      daysRemaining: Math.max(0, daysRemaining),
      startDate: trialStarted
    }
  }

  // Start local trial (for demo/development)
  startLocalTrial(): void {
    localStorage.setItem('trialStarted', new Date().toISOString())
    localStorage.removeItem('trialNotificationDismissed')
  }

  // Clear local trial
  clearLocalTrial(): void {
    localStorage.removeItem('trialStarted')
    localStorage.removeItem('trialNotificationDismissed')
  }
}

// Singleton instance
export const trialManager = TrialManager.getInstance()

// Utility functions
export const getTrialStatus = (organizationId: string) => 
  trialManager.getTrialStatus(organizationId)

export const startTrial = (organizationId: string) => 
  trialManager.startTrial(organizationId)

export const shouldShowTrialNotification = (status: TrialStatus) =>
  trialManager.shouldShowTrialNotification(status)

export const getLocalTrialStatus = () => 
  trialManager.getLocalTrialStatus()

export const startLocalTrial = () => 
  trialManager.startLocalTrial()