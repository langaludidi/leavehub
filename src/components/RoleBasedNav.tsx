'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { UserRole } from '@/types/roles';
import {
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Settings,
  BarChart3,
  CheckSquare,
  Sparkles,
  Building2,
  Shield,
  Home
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  minRole?: UserRole; // Minimum role required to see this item
  permission?: string; // Optional: specific permission required
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    label: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
  {
    label: 'AI Planner',
    href: '/dashboard/ai-planner',
    icon: Sparkles,
  },
  // Manager and above
  {
    label: 'Team',
    href: '/dashboard/manager',
    icon: Users,
    minRole: UserRole.MANAGER,
  },
  {
    label: 'Approvals',
    href: '/dashboard/manager/requests',
    icon: CheckSquare,
    minRole: UserRole.MANAGER,
  },
  // HR Admin and above
  {
    label: 'HR Panel',
    href: '/dashboard/hr',
    icon: Building2,
    minRole: UserRole.HR_ADMIN,
  },
  // Admin and above
  {
    label: 'Admin',
    href: '/dashboard/admin',
    icon: Shield,
    minRole: UserRole.ADMIN,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    minRole: UserRole.ADMIN,
  },
  // Super Admin only
  {
    label: 'Super Admin',
    href: '/dashboard/super-admin',
    icon: Shield,
    minRole: UserRole.SUPER_ADMIN,
  },
  {
    label: 'Analytics',
    href: '/dashboard/super-admin/analytics',
    icon: BarChart3,
    minRole: UserRole.SUPER_ADMIN,
  },
];

const roleHierarchy = {
  [UserRole.EMPLOYEE]: 1,
  [UserRole.MANAGER]: 2,
  [UserRole.HR_ADMIN]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};

export default function RoleBasedNav() {
  const pathname = usePathname();
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <nav className="hidden md:flex items-center gap-1">
        <div className="animate-pulse flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded" />
          ))}
        </div>
      </nav>
    );
  }

  const userRoleLevel = role ? roleHierarchy[role] : 0;

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.minRole) {
      return true; // No role requirement
    }
    const requiredLevel = roleHierarchy[item.minRole];
    return userRoleLevel >= requiredLevel;
  });

  return (
    <nav className="hidden md:flex items-center gap-1">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
