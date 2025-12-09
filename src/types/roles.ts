/**
 * User Role Types for LeaveHub
 * Defines the 5 distinct user experiences in the system
 */

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  HR_ADMIN = 'hr_admin',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export type UserRoleType = `${UserRole}`;

/**
 * Role Display Names
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: 'Employee',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.HR_ADMIN]: 'HR Administrator',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SUPER_ADMIN]: 'Super Admin',
};

/**
 * Role Descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: 'Submit leave requests, view balances, and manage personal documents',
  [UserRole.MANAGER]: 'Approve team leave requests, view team calendars, and manage team members',
  [UserRole.HR_ADMIN]: 'Manage employees, leave policies, and access comprehensive reports',
  [UserRole.ADMIN]: 'Manage organization settings, users, and access organization analytics',
  [UserRole.SUPER_ADMIN]: 'Platform-wide operations, multi-tenant management, and system configuration',
};

/**
 * Role Permissions
 */
export interface RolePermissions {
  // Leave Management
  canSubmitLeaveRequests: boolean;
  canApproveLeaveRequests: boolean;
  canManageAllLeaveRequests: boolean;

  // User Management
  canViewTeamMembers: boolean;
  canManageTeamMembers: boolean;
  canManageAllUsers: boolean;

  // Settings & Configuration
  canAccessSettings: boolean;
  canManageCompanySettings: boolean;
  canManageLeavePolicies: boolean;
  canManageDepartments: boolean;
  canManageHolidays: boolean;

  // Reports & Analytics
  canViewTeamReports: boolean;
  canViewOrganizationReports: boolean;
  canViewPlatformAnalytics: boolean;

  // Documents
  canUploadDocuments: boolean;
  canManageCompanyDocuments: boolean;

  // AI Features
  canAccessAIPlanner: boolean;
  canAccessAIInsights: boolean;

  // Admin Features
  canManageOrganizations: boolean;
  canManageSystemSettings: boolean;
  canAccessSuperAdminPanel: boolean;
}

/**
 * Get permissions for a given role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  const basePermissions: RolePermissions = {
    canSubmitLeaveRequests: false,
    canApproveLeaveRequests: false,
    canManageAllLeaveRequests: false,
    canViewTeamMembers: false,
    canManageTeamMembers: false,
    canManageAllUsers: false,
    canAccessSettings: false,
    canManageCompanySettings: false,
    canManageLeavePolicies: false,
    canManageDepartments: false,
    canManageHolidays: false,
    canViewTeamReports: false,
    canViewOrganizationReports: false,
    canViewPlatformAnalytics: false,
    canUploadDocuments: false,
    canManageCompanyDocuments: false,
    canAccessAIPlanner: false,
    canAccessAIInsights: false,
    canManageOrganizations: false,
    canManageSystemSettings: false,
    canAccessSuperAdminPanel: false,
  };

  switch (role) {
    case UserRole.EMPLOYEE:
      return {
        ...basePermissions,
        canSubmitLeaveRequests: true,
        canUploadDocuments: true,
        canAccessAIPlanner: true,
      };

    case UserRole.MANAGER:
      return {
        ...basePermissions,
        canSubmitLeaveRequests: true,
        canApproveLeaveRequests: true,
        canViewTeamMembers: true,
        canManageTeamMembers: true,
        canViewTeamReports: true,
        canUploadDocuments: true,
        canAccessAIPlanner: true,
        canAccessAIInsights: true,
      };

    case UserRole.HR_ADMIN:
      return {
        ...basePermissions,
        canSubmitLeaveRequests: true,
        canManageAllLeaveRequests: true,
        canManageAllUsers: true,
        canAccessSettings: true,
        canManageCompanySettings: true,
        canManageLeavePolicies: true,
        canManageDepartments: true,
        canManageHolidays: true,
        canViewOrganizationReports: true,
        canUploadDocuments: true,
        canManageCompanyDocuments: true,
        canAccessAIPlanner: true,
        canAccessAIInsights: true,
      };

    case UserRole.ADMIN:
      return {
        ...basePermissions,
        canSubmitLeaveRequests: true,
        canManageAllLeaveRequests: true,
        canManageAllUsers: true,
        canAccessSettings: true,
        canManageCompanySettings: true,
        canManageLeavePolicies: true,
        canManageDepartments: true,
        canManageHolidays: true,
        canViewOrganizationReports: true,
        canUploadDocuments: true,
        canManageCompanyDocuments: true,
        canAccessAIPlanner: true,
        canAccessAIInsights: true,
      };

    case UserRole.SUPER_ADMIN:
      return {
        ...basePermissions,
        canSubmitLeaveRequests: true,
        canApproveLeaveRequests: true,
        canManageAllLeaveRequests: true,
        canViewTeamMembers: true,
        canManageTeamMembers: true,
        canManageAllUsers: true,
        canAccessSettings: true,
        canManageCompanySettings: true,
        canManageLeavePolicies: true,
        canManageDepartments: true,
        canManageHolidays: true,
        canViewTeamReports: true,
        canViewOrganizationReports: true,
        canViewPlatformAnalytics: true,
        canUploadDocuments: true,
        canManageCompanyDocuments: true,
        canAccessAIPlanner: true,
        canAccessAIInsights: true,
        canManageOrganizations: true,
        canManageSystemSettings: true,
        canAccessSuperAdminPanel: true,
      };

    default:
      return basePermissions;
  }
}

/**
 * Check if a role has higher or equal privileges than another
 */
export function hasHigherOrEqualRole(userRole: UserRole, requiredRole: UserRole): boolean {
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
 * Get default landing page for role
 */
export function getDefaultDashboardRoute(role: UserRole): string {
  switch (role) {
    case UserRole.EMPLOYEE:
      return '/dashboard';
    case UserRole.MANAGER:
      return '/dashboard/manager';
    case UserRole.HR_ADMIN:
      return '/dashboard/hr';
    case UserRole.ADMIN:
      return '/dashboard/admin';
    case UserRole.SUPER_ADMIN:
      return '/dashboard/super-admin';
    default:
      return '/dashboard';
  }
}
