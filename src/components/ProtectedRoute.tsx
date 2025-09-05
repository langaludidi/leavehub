import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageLoading } from './ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole = [], 
  fallbackPath = '/signin' 
}: ProtectedRouteProps) {
  const { user, member, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Check role requirements
  if (requiredRole.length > 0 && member && !requiredRole.includes(member.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoading />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}