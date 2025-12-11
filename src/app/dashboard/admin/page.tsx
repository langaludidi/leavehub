import { requireRole } from '@/lib/auth/roles';
import { UserRole } from '@/types/roles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import RoleBadge from '@/components/RoleBadge';
import {
  Users,
  Settings,
  Shield,
  Building2,
  Database,
  Activity,
  Globe,
  Lock,
  Bell,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Protect this route - require Admin role or higher
  await requireRole(UserRole.ADMIN);

  // Mock data - replace with real data from Supabase
  const stats = {
    totalUsers: 156,
    organizations: 1,
    systemUptime: '99.9%',
    activeIntegrations: 3,
  };

  const systemHealth = [
    { name: 'Database', status: 'healthy', uptime: '100%' },
    { name: 'API', status: 'healthy', uptime: '99.9%' },
    { name: 'Authentication', status: 'healthy', uptime: '100%' },
    { name: 'Background Jobs', status: 'healthy', uptime: '99.8%' },
  ];

  const recentActivity = [
    { id: 1, action: 'User role updated', user: 'admin@leavehub.com', time: '2 minutes ago' },
    { id: 2, action: 'Company settings modified', user: 'admin@leavehub.com', time: '15 minutes ago' },
    { id: 3, action: 'New department created', user: 'hr@leavehub.com', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName="Administrator" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Organization settings, user management, and system configuration
              </p>
            </div>
            <RoleBadge />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Organizations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.organizations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">System Uptime</p>
                <p className="text-3xl font-bold text-gray-900">{stats.systemUptime}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Integrations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeIntegrations}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - System Health & Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health</h2>
              <div className="space-y-4">
                {systemHealth.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {service.status}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
              <div className="space-y-3">
                <Link href="/dashboard/admin/users" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="w-4 h-4" />
                    User Management
                  </Button>
                </Link>
                <Link href="/dashboard/admin/roles" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="w-4 h-4" />
                    Role Assignment
                  </Button>
                </Link>
                <Link href="/dashboard/admin/organizations" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Building2 className="w-4 h-4" />
                    Organizations
                  </Button>
                </Link>
                <Link href="/dashboard/settings" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="w-4 h-4" />
                    System Settings
                  </Button>
                </Link>
                <Link href="/dashboard/admin/integrations" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Zap className="w-4 h-4" />
                    Integrations
                  </Button>
                </Link>
                <Link href="/dashboard/admin/security" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Lock className="w-4 h-4" />
                    Security
                  </Button>
                </Link>
                <Link href="/dashboard/admin/notifications" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Admin Access</h3>
                  <p className="text-sm text-gray-600">
                    You have administrative access to manage the organization, users, and system settings.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
