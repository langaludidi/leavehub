import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { auth, profiles, Organization, OrganizationMember } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: any | null
  organization: Organization | null
  member: OrganizationMember | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (password: string) => Promise<any>
  updateProfile: (updates: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [member, setMember] = useState<OrganizationMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Get initial session
    auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      
      if (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
        return
      }
      
      if (session?.user) {
        console.log('Initial session found:', session.user.email)
        setUser(session.user)
        loadUserData(session.user.id)
      } else {
        console.log('No initial session found')
        setLoading(false)
      }
    }).catch(err => {
      if (!mounted) return
      console.error('Session check failed:', err)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state change:', event, session?.user?.email || 'no user')
      
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setOrganization(null)
        setMember(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for:', userId)
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User data loading timeout')), 5000)
      })
      
      const loadDataPromise = profiles.getCurrentUserOrg()
      
      // Race between data loading and timeout
      const userOrgResponse = await Promise.race([loadDataPromise, timeoutPromise])
      console.log('User org response:', userOrgResponse)
      
      const userOrg = userOrgResponse && typeof userOrgResponse === 'object' && 'data' in userOrgResponse
        ? userOrgResponse.data
        : userOrgResponse
      
      if (userOrg && typeof userOrg === 'object') {
        console.log('User organization data found:', userOrg)
        if ('profiles' in userOrg) setProfile(userOrg.profiles as any)
        if ('organizations' in userOrg) setOrganization(userOrg.organizations as any)
        if ('role' in userOrg && 'user_id' in userOrg && 'org_id' in userOrg) {
          setMember(userOrg as any)
        } else {
          setMember({ id: 'demo-member', role: 'employee', user_id: userId, org_id: 'demo', is_active: true })
        }
      } else {
        console.log('No organization data found for user, creating default member')
        // Create default member for demo purposes
        setMember({ id: 'demo-member', role: 'admin', user_id: userId, org_id: 'demo', is_active: true })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Set default data for demo
      console.log('Setting default user data for demo')
      setMember({ id: 'demo-member', role: 'admin', user_id: userId, org_id: 'demo', is_active: true })
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await auth.signIn(email, password)
      if (result.error) {
        console.error('Sign in error:', result.error)
        throw new Error(result.error.message)
      }
      return result
    } catch (error) {
      console.error('Auth context sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await auth.signUp(email, password, metadata)
      if (result.error) {
        console.error('Sign up error:', result.error)
        throw new Error(result.error.message)
      }
      return result
    } catch (error) {
      console.error('Auth context sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    await auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      const result = await auth.resetPassword(email)
      if (result.error) {
        console.error('Reset password error:', result.error)
        throw new Error(result.error.message)
      }
      return result
    } catch (error) {
      console.error('Auth context reset password error:', error)
      throw error
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const result = await auth.updatePassword(password)
      if (result.error) {
        console.error('Update password error:', result.error)
        throw new Error(result.error.message)
      }
      return result
    } catch (error) {
      console.error('Auth context update password error:', error)
      throw error
    }
  }

  const updateProfile = async (updates: any) => {
    if (!user) return null
    const result = await profiles.update(user.id, updates)
    if (result.data) {
      setProfile(result.data)
    }
    return result
  }

  const value = {
    user,
    profile,
    organization,
    member,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}