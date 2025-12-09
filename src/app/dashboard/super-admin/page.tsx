import { requireRole } from '@/lib/auth/roles';
import { UserRole } from '@/types/roles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import RoleBadge from '@/components/RoleBadge';
import {
  Users,
  Building2,
  Globe,
  Database,
  Server,
  Shield,
  Settings,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
  // Protect this route - require Super Admin role
  await requireRole(UserRole.SUPER_ADMIN);

  // Mock data - replace with real data from Supabase
  const platformStats = {
    totalOrganizations: 15,
    totalUsers: 1847,
    monthlyRevenue: 'R 45,280',
    activeSubscriptions: 14,
  };

  const organizations = [
    { name: 'Demo Company', users: 156, plan: 'Professional', status: 'active', mrr: 'R 10,296' },
    { name: 'Tech Solutions Ltd', users: 245, plan: 'Enterprise', status: 'active', mrr: 'R 26,215' },
    { name: 'Marketing Agency', users: 89, plan: 'Starter', status: 'active', mrr: 'R 3,649' },
  ];

  const systemMetrics = [
    { name: 'API Response Time', value: '45ms', status: 'good' },
    { name: 'Database Load', value: '23%', status: 'good' },
    { name: 'Error Rate', value: '0.01%', status: 'good' },
    { name: 'Storage Used', value: '47GB', status: 'good' },
  ];

  const recentAlerts = [
    { id: 1, type: 'warning', message: 'High API usage detected for Demo Company', time: '5 min ago' },
    { id: 2, type: 'info', message: 'New organization signup: Tech Solutions Ltd', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName="Super Administrator" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Platform-wide operations, multi-tenant management, and system configuration
              </p>
            </div>
            <RoleBadge />
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Organizations</p>
                <p className="text-3xl font-bold text-gray-900">{platformStats.totalOrganizations}</p>
                <p className="text-xs text-green-600 mt-1">↑ 2 this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{platformStats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">↑ 156 this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{platformStats.monthlyRevenue}</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% vs last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{platformStats.activeSubscriptions}</p>
                <p className="text-xs text-gray-500 mt-1">1 trial</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Organizations & System Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organizations */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
                <Link href="/dashboard/super-admin/organizations">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {organizations.map((org, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{org.name}</p>
                        <p className="text-sm text-gray-600">{org.users} users • {org.plan} plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{org.mrr}/mo</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600 capitalize">{org.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Metrics */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">{metric.name}</p>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Alerts */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Alerts</h2>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Super Admin Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Management</h2>
              <div className="space-y-3">
                <Link href="/dashboard/super-admin/organizations" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Building2 className="w-4 h-4" />
                    Manage Organizations
                  </Button>
                </Link>
                <Link href="/dashboard/super-admin/users" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="w-4 h-4" />
                    All Users
                  </Button>
                </Link>
                <Link href="/dashboard/super-admin/billing" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <DollarSign className="w-4 h-4" />
                    Billing & Revenue
                  </Button>
                </Link>
                <Link href="/dashboard/super-admin/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Platform Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Admin</h2>
              <div className="space-y-3">
                <Link href="/dashboard/super-admin/system" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Server className="w-4 h-4" />
                    System Settings
                  </Button>
                </Link>
                <Link href="/dashboard/super-admin/database" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Database className="w-4 h-4" />
                    Database Management
                  </Button>
                </Link>
                <Link href="/dashboard/super-admin/security" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="w-4 h-4" />
                    Security & Compliance
                  </Button>
                </Link>
                <Link href="/dashboard/super-admin/api" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Globe className="w-4 h-4" />
                    API Management
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Super Admin Access</h3>
                  <p className="text-sm text-gray-600">
                    You have unrestricted access to all platform features, organizations, and system settings.
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
