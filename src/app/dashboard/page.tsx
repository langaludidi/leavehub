import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Hardcoded demo data for now since Supabase fetch is having issues
  const profile = {
    id: '12345678-1234-1234-1234-123456789012',
    clerk_user_id: 'demo-user-123',
    email: 'demo@leavehub.com',
    first_name: 'Demo',
    last_name: 'User',
    role: 'employee',
    department: 'Engineering'
  };

  console.log('Using hardcoded profile:', profile);

  // Hardcoded leave balances - matching real Supabase data
  const leaveBalances = [
    {
      id: '1',
      user_id: profile.id,
      year: 2025,
      entitled_days: 21,
      used_days: 6,
      available_days: 15,
      leave_types: {
        name: 'Annual Leave',
        code: 'ANN',
        color: '#0D9488'
      }
    },
    {
      id: '2',
      user_id: profile.id,
      year: 2025,
      entitled_days: 10,
      used_days: 2,
      available_days: 8,
      leave_types: {
        name: 'Sick Leave',
        code: 'SICK',
        color: '#EF4444'
      }
    },
    {
      id: '3',
      user_id: profile.id,
      year: 2025,
      entitled_days: 3,
      used_days: 1,
      available_days: 2,
      leave_types: {
        name: 'Family Responsibility',
        code: 'FAM',
        color: '#F59E0B'
      }
    }
  ];

  // Hardcoded leave requests - matching real Supabase data
  const leaveRequests = [
    {
      id: '1',
      user_id: profile.id,
      start_date: '2025-12-23',
      end_date: '2025-12-27',
      working_days: 3,
      status: 'pending',
      reason: 'Christmas holiday',
      leave_types: {
        name: 'Annual Leave',
        code: 'ANN',
        color: '#0D9488'
      }
    },
    {
      id: '2',
      user_id: profile.id,
      start_date: '2025-10-15',
      end_date: '2025-10-16',
      working_days: 2,
      status: 'pending',
      reason: 'Flu',
      leave_types: {
        name: 'Sick Leave',
        code: 'SICK',
        color: '#EF4444'
      }
    },
    {
      id: '3',
      user_id: profile.id,
      start_date: '2025-03-10',
      end_date: '2025-03-14',
      working_days: 5,
      status: 'approved',
      reason: 'Family vacation',
      leave_types: {
        name: 'Annual Leave',
        code: 'ANN',
        color: '#0D9488'
      }
    }
  ];

  console.log('Loaded hardcoded data - Balances:', leaveBalances.length, 'Requests:', leaveRequests.length);

  // Calculate totals
  const annualLeave = leaveBalances?.find(lb => lb.leave_types?.code === 'ANN');
  const totalDaysRemaining = leaveBalances?.reduce((sum, lb) => sum + (lb.available_days || 0), 0) || 0;
  const totalDaysTaken = leaveBalances?.reduce((sum, lb) => sum + (lb.used_days || 0), 0) || 0;
  const pendingRequests = leaveRequests?.filter(lr => lr.status === 'pending').length || 0;

  const user = {
    firstName: profile?.first_name || 'Demo',
    lastName: profile?.last_name || 'User',
    emailAddresses: [{ emailAddress: profile?.email }]
  };
  const userId = profile?.clerk_user_id || 'demo-user-123';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <DashboardHeader
        userId={userId}
        userName={`${user?.firstName || 'Demo'} ${user?.lastName || 'User'}`}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Here&apos;s your leave management dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">
                {Math.round(totalDaysRemaining)}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Days Remaining</h3>
            <p className="text-sm text-gray-600">Total leave balance</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <span className="text-2xl font-bold text-warning">
                {pendingRequests}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Pending Requests</h3>
            <p className="text-sm text-gray-600">Awaiting approval</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <span className="text-2xl font-bold text-success">
                {Math.round(totalDaysTaken)}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Days Taken</h3>
            <p className="text-sm text-gray-600">This year</p>
          </Card>
        </div>

        {/* Leave Balances */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Leave Balances (2025)</h2>
          {leaveBalances && leaveBalances.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {leaveBalances.map((balance) => {
                const percentage = balance.entitled_days
                  ? ((balance.available_days || 0) / balance.entitled_days) * 100
                  : 0;

                return (
                  <div
                    key={balance.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${balance.leave_types?.color}15`,
                            color: balance.leave_types?.color,
                          }}
                        >
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{balance.leave_types?.name}</h3>
                          <p className="text-xs text-gray-500">{balance.leave_types?.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: balance.leave_types?.color }}>
                          {Math.round(balance.available_days || 0)}
                        </p>
                        <p className="text-xs text-gray-500">days left</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: balance.leave_types?.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Used: {balance.used_days || 0} days</span>
                      <span>Entitled: {balance.entitled_days || 0} days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No leave balances found.</p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/leave/new">
              <Button className="bg-primary hover:bg-primary/90">
                <FileText className="w-4 h-4 mr-2" />
                New Leave Request
              </Button>
            </Link>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Plan Leave (AI)
            </Button>
            <Link href="/dashboard/calendar">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Leave Requests</h2>
          {leaveRequests && leaveRequests.length > 0 ? (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${request.leave_types?.color}15`,
                        color: request.leave_types?.color,
                      }}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{request.leave_types?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(request.start_date).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(request.end_date).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        ({request.working_days} days)
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved'
                          ? 'bg-success/10 text-success'
                          : request.status === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : request.status === 'rejected'
                          ? 'bg-error/10 text-error'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              No recent activity. Submit your first leave request to get started!
            </p>
          )}
        </Card>

        {/* Data Info (for testing) */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-900">
            📊 Demo Data Loaded
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            Using realistic demo data that matches your Supabase database.
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Department:</strong> {profile?.department}</p>
            <p><strong>Leave Types:</strong> Annual, Sick, Family Responsibility</p>
            <p><strong>Total Available:</strong> {Math.round(totalDaysRemaining)} days</p>
            <p><strong>Pending Requests:</strong> {pendingRequests}</p>
          </div>
        </Card>
      </main>
    </div>
  );
}
