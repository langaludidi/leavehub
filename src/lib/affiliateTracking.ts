import { supabase } from './supabase'

export interface ReferralData {
  affiliateCode: string
  sourceUrl?: string
  userAgent?: string
  ipAddress?: string
}

export interface AffiliateStats {
  totalReferrals: number
  activeReferrals: number
  totalCommissionsEarned: number
  totalCommissionsPaid: number
  pendingCommissions: number
  conversionRate: number
  clicksThisMonth: number
  signupsThisMonth: number
}

export class AffiliateTracker {
  private static REFERRAL_COOKIE_KEY = 'leavehub_referral'
  private static REFERRAL_COOKIE_DAYS = 30

  static trackReferralClick(referralData: ReferralData): void {
    // Store referral information in localStorage/cookies for attribution
    const referralInfo = {
      code: referralData.affiliateCode,
      timestamp: Date.now(),
      sourceUrl: referralData.sourceUrl || window.location.href
    }

    // Store in localStorage (fallback for cookies)
    localStorage.setItem(this.REFERRAL_COOKIE_KEY, JSON.stringify(referralInfo))

    // Store in cookie for cross-domain tracking
    this.setCookie(this.REFERRAL_COOKIE_KEY, JSON.stringify(referralInfo), this.REFERRAL_COOKIE_DAYS)

    // Track the click in database
    this.recordReferralClick(referralData)
  }

  static async recordReferralClick(referralData: ReferralData): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('track_referral_click', {
        ref_code: referralData.affiliateCode,
        source_url: referralData.sourceUrl,
        user_agent_str: referralData.userAgent || navigator.userAgent,
        ip_addr: await this.getClientIP()
      })

      if (error) {
        console.error('Error tracking referral click:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error recording referral click:', error)
      return null
    }
  }

  static getReferralInfo(): { code: string; timestamp: number; sourceUrl: string } | null {
    try {
      // Try localStorage first
      const stored = localStorage.getItem(this.REFERRAL_COOKIE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Check if referral is still valid (within 30 days)
        if (Date.now() - parsed.timestamp < this.REFERRAL_COOKIE_DAYS * 24 * 60 * 60 * 1000) {
          return parsed
        }
      }

      // Try cookie as fallback
      const cookieValue = this.getCookie(this.REFERRAL_COOKIE_KEY)
      if (cookieValue) {
        const parsed = JSON.parse(cookieValue)
        if (Date.now() - parsed.timestamp < this.REFERRAL_COOKIE_DAYS * 24 * 60 * 60 * 1000) {
          return parsed
        }
      }

      return null
    } catch (error) {
      console.error('Error getting referral info:', error)
      return null
    }
  }

  static async convertReferral(orgId: string): Promise<boolean> {
    const referralInfo = this.getReferralInfo()
    if (!referralInfo) {
      return false
    }

    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          org_id: orgId,
          status: 'converted',
          conversion_date: new Date().toISOString()
        })
        .eq('referral_code', referralInfo.code)
        .eq('status', 'pending')

      if (error) {
        console.error('Error converting referral:', error)
        return false
      }

      // Update affiliate stats
      await this.updateAffiliateStats(referralInfo.code, 'conversion')

      // Clear referral info after conversion
      this.clearReferralInfo()

      return true
    } catch (error) {
      console.error('Error converting referral:', error)
      return false
    }
  }

  static async calculateCommission(
    subscriptionId: string,
    amount: number,
    affiliateId: string
  ): Promise<void> {
    try {
      // Get affiliate commission rate
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('commission_rate')
        .eq('id', affiliateId)
        .single()

      if (affiliateError || !affiliate) {
        console.error('Error fetching affiliate:', affiliateError)
        return
      }

      const commissionAmount = (amount * affiliate.commission_rate) / 100

      // Record commission
      const { error: commissionError } = await supabase
        .from('commission_tracking')
        .insert({
          affiliate_id: affiliateId,
          subscription_id: subscriptionId,
          commission_type: 'recurring',
          subscription_amount: amount,
          commission_rate: affiliate.commission_rate,
          commission_amount: commissionAmount,
          commission_month: new Date().toISOString().slice(0, 7) + '-01' // First day of current month
        })

      if (commissionError) {
        console.error('Error recording commission:', commissionError)
        return
      }

      // Update affiliate total commissions
      const { error: updateError } = await supabase.rpc(
        'update_affiliate_commissions',
        { affiliate_id: affiliateId, commission_amount: commissionAmount }
      )

      if (updateError) {
        console.error('Error updating affiliate commissions:', updateError)
      }
    } catch (error) {
      console.error('Error calculating commission:', error)
    }
  }

  static async getAffiliateStats(affiliateId: string): Promise<AffiliateStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_affiliate_stats', {
        affiliate_id: affiliateId
      })

      if (error) {
        console.error('Error fetching affiliate stats:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting affiliate stats:', error)
      return null
    }
  }

  static async getAffiliateReferrals(affiliateId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          status,
          conversion_date,
          created_at,
          organizations (
            name
          ),
          commission_tracking (
            commission_amount
          )
        `)
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching affiliate referrals:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting affiliate referrals:', error)
      return []
    }
  }

  private static async updateAffiliateStats(affiliateCode: string, type: 'click' | 'signup' | 'conversion'): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const updateField = type === 'click' ? 'clicks' : type === 'signup' ? 'signups' : 'conversions'
      
      const { error } = await supabase.rpc('update_daily_affiliate_stats', {
        affiliate_code: affiliateCode,
        stat_date: today,
        stat_type: updateField
      })

      if (error) {
        console.error('Error updating affiliate stats:', error)
      }
    } catch (error) {
      console.error('Error updating affiliate stats:', error)
    }
  }

  private static setCookie(name: string, value: string, days: number): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  private static getCookie(name: string): string | null {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  private static clearReferralInfo(): void {
    localStorage.removeItem(this.REFERRAL_COOKIE_KEY)
    this.setCookie(this.REFERRAL_COOKIE_KEY, '', -1)
  }

  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting client IP:', error)
      return '0.0.0.0'
    }
  }
}

// URL parameter tracking for referrals
export function initializeReferralTracking(): void {
  // Check for referral code in URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const refCode = urlParams.get('ref')
  
  if (refCode) {
    // Track the referral click
    AffiliateTracker.trackReferralClick({
      affiliateCode: refCode,
      sourceUrl: document.referrer || 'direct'
    })
    
    // Clean URL (remove ref parameter)
    urlParams.delete('ref')
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
    window.history.replaceState({}, document.title, newUrl)
  }
}

// Hook for React components
export function useReferralTracking() {
  return {
    trackReferral: AffiliateTracker.trackReferralClick,
    convertReferral: AffiliateTracker.convertReferral,
    getReferralInfo: AffiliateTracker.getReferralInfo
  }
}