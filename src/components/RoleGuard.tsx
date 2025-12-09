'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { UserRole } from '@/types/roles';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallbackPath?: string;
}

const roleHierarchy = {
  [UserRole.EMPLOYEE]: 1,
  [UserRole.MANAGER]: 2,
  [UserRole.HR_ADMIN]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};

/**
 * Client-side role guard component
 * Protects UI components based on user role
 */
export default function RoleGuard({
  children,
  requiredRole,
  fallbackPath = '/dashboard',
}: RoleGuardProps) {
  const { role, isLoading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role) {
      const userRoleLevel = roleHierarchy[role];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        // User doesn't have sufficient role, redirect
        router.push(fallbackPath);
      }
    }
  }, [role, isLoading, requiredRole, fallbackPath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const userRoleLevel = roleHierarchy[role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
          <p className="text-gray-600 mb-6">
            This page requires {requiredRole} role or higher. Your current role is {role}.
          </p>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
