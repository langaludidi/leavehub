'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { ROLE_LABELS, UserRole } from '@/types/roles';
import { Shield, Users, Building2, UserCog, User as UserIcon } from 'lucide-react';

const roleIcons = {
  [UserRole.EMPLOYEE]: UserIcon,
  [UserRole.MANAGER]: Users,
  [UserRole.HR_ADMIN]: Building2,
  [UserRole.ADMIN]: UserCog,
  [UserRole.SUPER_ADMIN]: Shield,
};

const roleColors = {
  [UserRole.EMPLOYEE]: 'bg-gray-100 text-gray-700 border-gray-300',
  [UserRole.MANAGER]: 'bg-blue-100 text-blue-700 border-blue-300',
  [UserRole.HR_ADMIN]: 'bg-purple-100 text-purple-700 border-purple-300',
  [UserRole.ADMIN]: 'bg-amber-100 text-amber-700 border-amber-300',
  [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-700 border-red-300',
};

export default function RoleBadge() {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="animate-pulse h-6 w-24 bg-gray-200 rounded-full"></div>
    );
  }

  if (!role) {
    return null;
  }

  const Icon = roleIcons[role];
  const colorClasses = roleColors[role];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${colorClasses}`}>
      <Icon className="w-3.5 h-3.5" />
      {ROLE_LABELS[role]}
    </div>
  );
}
