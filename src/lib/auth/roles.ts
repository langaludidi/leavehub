import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { UserRole, getRolePermissions, type RolePermissions } from '@/types/roles';

/**
 * Server-side function to get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return UserRole.EMPLOYEE; // Default to employee on error
    }

    return (data?.role as UserRole) || UserRole.EMPLOYEE;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return UserRole.EMPLOYEE;
  }
}

/**
 * Server-side function to get user permissions
 */
export async function getUserPermissions(): Promise<RolePermissions> {
  const role = await getUserRole();
  return getRolePermissions(role || UserRole.EMPLOYEE);
}

/**
 * Server-side function to check if user has a specific permission
 */
export async function hasPermission(permissionKey: keyof RolePermissions): Promise<boolean> {
  const permissions = await getUserPermissions();
  return permissions[permissionKey] || false;
}

/**
 * Server-side function to check if user has a specific role or higher
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getUserRole();

  if (!userRole) {
    return false;
  }

  const roleHierarchy = {
    [UserRole.EMPLOYEE]: 1,
    [UserRole.MANAGER]: 2,
    [UserRole.HR_ADMIN]: 3,
    [UserRole.ADMIN]: 4,
    [UserRole.SUPER_ADMIN]: 5,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Server-side function to require a specific role
 * Throws an error if the user doesn't have the required role
 */
export async function requireRole(requiredRole: UserRole): Promise<void> {
  const hasRequiredRole = await hasRole(requiredRole);

  if (!hasRequiredRole) {
    const userRole = await getUserRole();
    throw new Error(
      `Unauthorized: Required role '${requiredRole}', but user has role '${userRole}'`
    );
  }
}

/**
 * Server-side function to require a specific permission
 * Throws an error if the user doesn't have the required permission
 */
export async function requirePermission(permissionKey: keyof RolePermissions): Promise<void> {
  const hasRequiredPermission = await hasPermission(permissionKey);

  if (!hasRequiredPermission) {
    throw new Error(`Unauthorized: Missing required permission '${permissionKey}'`);
  }
}
