import { requireRole } from '@/lib/auth/roles';
import { UserRole } from '@/types/roles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import RoleBadge from '@/components/RoleBadge';
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Settings,
  Shield,
  Building2,
  ClipboardList,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HRAdminDashboard() {
  // Protect this route - require HR Admin role or higher
  await requireRole(UserRole.HR_ADMIN);

  // Mock data - replace with real data from Supabase
  const stats = {
    totalEmployees: 156,
    pendingRequests: 12,
    activeLeaves: 8,
    policyViolations: 2,
  };

  const recentRequests = [
    { id: 1, employee: 'John Doe', type: 'Annual Leave', days: 5, status: 'pending' },
    { id: 2, employee: 'Jane Smith', type: 'Sick Leave', days: 2, status: 'pending' },
    { id: 3, employee: 'Mike Johnson', type: 'Family Responsibility', days: 1, status: 'approved' },
  ];

  const departments = [
    { name: 'Engineering', employees: 45, activeLeaves: 3 },
    { name: 'Sales', employees: 32, activeLeaves: 2 },
    { name: 'Marketing', employees: 28, activeLeaves: 1 },
    { name: 'Operations', employees: 51, activeLeaves: 2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName="HR Administrator" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HR Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage employees, policies, and organizational leave
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
                <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Leaves</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeLeaves}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Policy Violations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.policyViolations}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pending Requests */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Leave Requests</h2>
                <Link href="/dashboard/hr/requests">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{request.employee}</p>
                      <p className="text-sm text-gray-600">
                        {request.type} - {request.days} days
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' ? (
                        <>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                            Reject
                          </Button>
                          <Button size="sm">Approve</Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Approved</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Department Overview */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Department Overview</h2>
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{dept.name}</p>
                        <p className="text-sm text-gray-600">{dept.employees} employees</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Active Leaves</p>
                      <p className="font-semibold text-gray-900">{dept.activeLeaves}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/dashboard/hr/employees" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="w-4 h-4" />
                    Manage Employees
                  </Button>
                </Link>
                <Link href="/dashboard/hr/policies" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    Leave Policies
                  </Button>
                </Link>
                <Link href="/dashboard/hr/departments" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Building2 className="w-4 h-4" />
                    Departments
                  </Button>
                </Link>
                <Link href="/dashboard/hr/reports" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Reports & Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/settings" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="w-4 h-4" />
                    Company Settings
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-purple-50 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">HR Admin Access</h3>
                  <p className="text-sm text-gray-600">
                    You have full access to manage employees, leave policies, and organizational settings.
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
