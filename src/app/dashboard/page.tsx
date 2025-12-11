import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  const supabase = await createClient();

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('clerk_user_id', userId)
    .single();

  // If no profile exists, redirect to onboarding
  if (profileError || !profile) {
    console.log('No profile found for user:', userId, '- redirecting to onboarding');
    redirect('/onboarding');
  }

  console.log('✓ Profile loaded:', profile.email, 'Role:', profile.role);

  // Fetch leave balances for current year
  const currentYear = new Date().getFullYear();
  const { data: leaveBalances, error: balancesError } = await supabase
    .from('leave_balances')
    .select(`
      *,
      leave_types (
        name,
        code,
        color
      )
    `)
    .eq('user_id', profile.id)
    .eq('year', currentYear);

  if (balancesError) {
    console.error('Error fetching leave balances:', balancesError);
  }

  // Fetch recent leave requests
  const { data: leaveRequests, error: requestsError } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (
        name,
        code,
        color
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (requestsError) {
    console.error('Error fetching leave requests:', requestsError);
  }

  console.log('✓ Data loaded - Balances:', leaveBalances?.length || 0, 'Requests:', leaveRequests?.length || 0);

  // Calculate totals
  const totalDaysRemaining = leaveBalances?.reduce((sum, lb) => sum + (lb.available_days || 0), 0) || 0;
  const totalDaysTaken = leaveBalances?.reduce((sum, lb) => sum + (lb.used_days || 0), 0) || 0;
  const pendingRequests = leaveRequests?.filter(lr => lr.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <DashboardHeader
        userId={userId}
        userName={`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.firstName || 'User'}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.first_name || user.firstName || 'there'}! 👋
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
          <h2 className="text-xl font-semibold mb-4">Leave Balances ({currentYear})</h2>
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
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No leave balances set up yet.</p>
              <p className="text-sm text-gray-500">
                Contact your HR admin to set up your leave entitlements.
              </p>
            </div>
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
            <Link href="/dashboard/ai-planner">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Plan Leave (AI)
              </Button>
            </Link>
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
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No leave requests yet.
              </p>
              <Link href="/dashboard/leave/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Your First Request
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
