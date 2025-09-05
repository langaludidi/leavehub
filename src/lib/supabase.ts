import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Organization {
  id: string
  name: string
  slug: string
  industry?: string
  timezone: string
  country: string
  logo_url?: string
  onboarding_completed: boolean
  subscription_plan: string
  subscription_status: string
  trial_ends_at?: string
  created_at: string
}

export interface Department {
  id: string
  org_id: string
  name: string
  description?: string
  manager_id?: string
  is_active: boolean
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  employee_id?: string
  hire_date?: string
}

export interface LeavePolicy {
  id: string
  org_id: string
  name: string
  type: string
  description?: string
  days_allowed: number
  carryover_days: number
  approval_required: boolean
  notice_period_days: number
  color: string
  icon: string
  active: boolean
}

export interface LeaveRequest {
  id: string
  org_id: string
  user_id: string
  policy_id: string
  start_date: string
  end_date: string
  days_requested: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  submitted_at: string
  approved_by?: string
  approved_at?: string
}

export interface LeaveBalance {
  id: string
  user_id: string
  policy_id: string
  year: number
  allocated_days: number
  used_days: number
  pending_days: number
  carried_over_days: number
}

export interface OrganizationMember {
  id: string
  org_id: string
  user_id: string
  department_id?: string
  role: 'owner' | 'admin' | 'manager' | 'employee'
  job_title?: string
  manager_id?: string
  is_active: boolean
}

// Authentication Service
export const auth = {
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  async signUp(email: string, password: string, metadata?: any) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
  },

  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
  },

  async updatePassword(password: string) {
    return await supabase.auth.updateUser({
      password: password
    })
  },

  async signOut() {
    return await supabase.auth.signOut()
  },

  async getSession() {
    return await supabase.auth.getSession()
  },

  async getUser() {
    return await supabase.auth.getUser()
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Organizations Service
export const organizations = {
  async create(org: Partial<Organization>) {
    return await supabase
      .from('organizations')
      .insert([org])
      .select()
      .single()
  },

  async getById(id: string) {
    return await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()
  },

  async update(id: string, updates: Partial<Organization>) {
    return await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  async getMembers(orgId: string) {
    return await supabase
      .from('organization_members')
      .select(`
        *,
        profiles(*),
        departments(*)
      `)
      .eq('org_id', orgId)
      .eq('is_active', true)
  },

  async addMember(member: Partial<OrganizationMember>) {
    return await supabase
      .from('organization_members')
      .insert([member])
      .select()
      .single()
  }
}

// Departments Service
export const departments = {
  async getAll(orgId: string) {
    return await supabase
      .from('departments')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name')
  },

  async create(department: Partial<Department>) {
    return await supabase
      .from('departments')
      .insert([department])
      .select()
      .single()
  },

  async update(id: string, updates: Partial<Department>) {
    return await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  }
}

// Leave Policies Service
export const leavePolicies = {
  async getAll(orgId: string) {
    return await supabase
      .from('leave_policies')
      .select('*')
      .eq('org_id', orgId)
      .eq('active', true)
      .order('type', { ascending: true })
  },

  async create(policy: Partial<LeavePolicy>) {
    return await supabase
      .from('leave_policies')
      .insert([policy])
      .select()
      .single()
  },

  async update(id: string, updates: Partial<LeavePolicy>) {
    return await supabase
      .from('leave_policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  }
}

// Leave Requests Service
export const leaveRequests = {
  async getAll(orgId: string) {
    return await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles(*),
        leave_policies(*)
      `)
      .eq('org_id', orgId)
      .order('submitted_at', { ascending: false })
  },

  async getByUser(userId: string) {
    return await supabase
      .from('leave_requests')
      .select(`
        *,
        leave_policies(*)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
  },

  async create(request: Partial<LeaveRequest>) {
    return await supabase
      .from('leave_requests')
      .insert([request])
      .select(`
        *,
        leave_policies(*)
      `)
      .single()
  },

  async update(id: string, updates: Partial<LeaveRequest>) {
    return await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        leave_policies(*)
      `)
      .single()
  },

  async approve(id: string, approverId: string) {
    return await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  },

  async reject(id: string, reason?: string) {
    return await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', id)
      .select()
      .single()
  }
}

// Leave Balances Service
export const leaveBalances = {
  async getByUser(userId: string, year?: number) {
    const currentYear = year || new Date().getFullYear()
    return await supabase
      .from('leave_balances')
      .select(`
        *,
        leave_policies(*)
      `)
      .eq('user_id', userId)
      .eq('year', currentYear)
  },

  async updateBalance(userId: string, policyId: string, updates: Partial<LeaveBalance>) {
    const currentYear = new Date().getFullYear()
    return await supabase
      .from('leave_balances')
      .update(updates)
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .eq('year', currentYear)
      .select()
      .single()
  },

  async createOrUpdate(balance: Partial<LeaveBalance>) {
    return await supabase
      .from('leave_balances')
      .upsert([balance])
      .select()
      .single()
  }
}

// Profiles Service
export const profiles = {
  async getById(id: string) {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
  },

  async update(id: string, updates: Partial<Profile>) {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  async getCurrentUserOrg() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    return await supabase
      .from('organization_members')
      .select(`
        *,
        organizations(*),
        profiles(*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
  }
}

// Notifications Service
export const notifications = {
  async getByUser(userId: string) {
    return await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
  },

  async create(notification: any) {
    return await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()
  },

  async markAsRead(id: string) {
    return await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  }
}

// Public Holidays Service
export const publicHolidays = {
  async getAll(orgId: string, year?: number) {
    const currentYear = year || new Date().getFullYear()
    return await supabase
      .from('public_holidays')
      .select('*')
      .eq('org_id', orgId)
      .gte('date', `${currentYear}-01-01`)
      .lt('date', `${currentYear + 1}-01-01`)
      .order('date')
  }
}