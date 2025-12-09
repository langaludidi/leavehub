'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserRole, getRolePermissions, type RolePermissions } from '@/types/roles';
import { createClient } from '@/lib/supabase/client';

interface UseUserRoleReturn {
  role: UserRole | null;
  permissions: RolePermissions | null;
  isLoading: boolean;
  error: Error | null;
  refreshRole: () => Promise<void>;
}

/**
 * Hook to get the current user's role and permissions
 */
export function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserRole = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('clerk_user_id', user.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch user role: ${fetchError.message}`);
      }

      const userRole = (data?.role as UserRole) || UserRole.EMPLOYEE;
      setRole(userRole);
      setPermissions(getRolePermissions(userRole));
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching user role:', err);
      // Default to employee role on error
      setRole(UserRole.EMPLOYEE);
      setPermissions(getRolePermissions(UserRole.EMPLOYEE));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchUserRole();
    }
  }, [user?.id, isLoaded]);

  return {
    role,
    permissions,
    isLoading,
    error,
    refreshRole: fetchUserRole,
  };
}

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permissionKey: keyof RolePermissions): boolean {
  const { permissions, isLoading } = useUserRole();

  if (isLoading || !permissions) {
    return false;
  }

  return permissions[permissionKey] || false;
}

/**
 * Hook to check if user has a specific role or higher
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const { role, isLoading } = useUserRole();

  if (isLoading || !role) {
    return false;
  }

  const roleHierarchy = {
    [UserRole.EMPLOYEE]: 1,
    [UserRole.MANAGER]: 2,
    [UserRole.HR_ADMIN]: 3,
    [UserRole.ADMIN]: 4,
    [UserRole.SUPER_ADMIN]: 5,
  };

  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}
