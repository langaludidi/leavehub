import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { TrialEmailService } from '../../lib/trialEmails';
import { 
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FireIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { format, differenceInDays } from 'date-fns';

interface TrialStatus {
  billing_plan: string;
  is_trial_active: boolean;
  trial_days_remaining: number;
  employee_count: number;
  plan_limits: {
    max_employees: number;
    features: string[];
  };
}

interface UsageStats {
  active_employees: number;
  leave_requests_submitted: number;
  leave_requests_approved: number;
  reports_generated: number;
  trial_start_date: string;
}

async function fetchTrialStatus(): Promise<TrialStatus | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase.rpc('get_organization_billing_info', {
    org_id: userProfile.organization_id
  });

  if (error) throw error;
  return data?.[0] || null;
}

async function fetchUsageStats(): Promise<UsageStats> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data: orgData } = await supabase
    .from('organizations')
    .select('trial_start_date')
    .eq('id', userProfile.organization_id)
    .single();

  // Get recent usage stats
  const { data: statsData } = await supabase
    .from('organization_usage_stats')
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .order('stat_date', { ascending: false })
    .limit(7);

  // Aggregate stats
  const totalStats = statsData?.reduce((acc, stat) => ({
    leave_requests_submitted: acc.leave_requests_submitted + stat.leave_requests_submitted,
    leave_requests_approved: acc.leave_requests_approved + stat.leave_requests_approved,
    reports_generated: acc.reports_generated + stat.reports_generated,
    active_employees: Math.max(acc.active_employees, stat.active_employees)
  }), {
    leave_requests_submitted: 0,
    leave_requests_approved: 0,
    reports_generated: 0,
    active_employees: 0
  });

  return {
    active_employees: totalStats?.active_employees || 0,
    leave_requests_submitted: totalStats?.leave_requests_submitted || 0,
    leave_requests_approved: totalStats?.leave_requests_approved || 0,
    reports_generated: totalStats?.reports_generated || 0,
    trial_start_date: orgData?.trial_start_date || new Date().toISOString()
  };
}

async function startTrial(): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) return false;

  return await TrialEmailService.startTrial(userProfile.organization_id);
}

async function upgradeToPlan(plan: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) return false;

  return await TrialEmailService.upgradePlan(userProfile.organization_id, plan);
}

const PLAN_PRICING = {
  free: { price: 0, name: 'Free', maxEmployees: 3 },
  lite: { price: 149, name: 'Lite', maxEmployees: 10 },
  pro: { price: 299, name: 'Pro', maxEmployees: -1 }
};

export default function TrialManagement() {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const queryClient = useQueryClient();

  const { data: trialStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['trial-status'],
    queryFn: fetchTrialStatus
  });

  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: fetchUsageStats
  });

  const startTrialMutation = useMutation({
    mutationFn: startTrial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-status'] });
    }
  });

  const upgradeMutation = useMutation({
    mutationFn: (plan: string) => upgradeToPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-status'] });
    }
  });

  const getTrialStatusColor = () => {
    if (!trialStatus?.is_trial_active) return 'text-gray-600';
    if (trialStatus.trial_days_remaining <= 2) return 'text-red-600';
    if (trialStatus.trial_days_remaining <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrialStatusIcon = () => {
    if (!trialStatus?.is_trial_active) return CheckCircleIcon;
    if (trialStatus.trial_days_remaining <= 2) return ExclamationTriangleIcon;
    if (trialStatus.trial_days_remaining <= 7) return ClockIcon;
    return CheckCircleIcon;
  };

  const getPlanRecommendation = () => {
    if (!trialStatus) return 'pro';
    if (trialStatus.employee_count <= 3) return 'free';
    if (trialStatus.employee_count <= 10) return 'lite';
    return 'pro';
  };

  if (statusLoading || statsLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getTrialStatusIcon();

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Trial & Billing</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your subscription and monitor trial usage
          </p>
        </div>

        {/* Trial Status Card */}
        {trialStatus && (
          <div className="card border-l-4" style={{
            borderLeftColor: trialStatus.is_trial_active ? 
              (trialStatus.trial_days_remaining <= 2 ? '#dc2626' : 
               trialStatus.trial_days_remaining <= 7 ? '#f59e0b' : '#10b981') : 
              '#6b7280'
          }}>
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                  <StatusIcon className={`w-8 h-8 ${getTrialStatusColor()}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">
                    {trialStatus.is_trial_active ? 
                      `Trial Active - ${trialStatus.trial_days_remaining} days remaining` :
                      `Current Plan: ${trialStatus.billing_plan.charAt(0).toUpperCase() + trialStatus.billing_plan.slice(1)}`
                    }
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {trialStatus.is_trial_active ?
                      `Your Pro trial ${trialStatus.trial_days_remaining <= 2 ? 'expires very soon' : 'is active'}` :
                      `You have ${trialStatus.employee_count} employees on the ${trialStatus.billing_plan} plan`
                    }
                  </p>
                </div>
                {trialStatus.is_trial_active && trialStatus.trial_days_remaining <= 7 && (
                  <div className="text-right">
                    <button
                      onClick={() => upgradeMutation.mutate(getPlanRecommendation())}
                      disabled={upgradeMutation.isPending}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Usage Stats */}
        {usageStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Employees</p>
                    <div className="text-2xl font-bold text-blue-600">{usageStats.active_employees}</div>
                    <p className="text-xs text-gray-500">
                      {trialStatus?.plan_limits.max_employees === -1 ? 'Unlimited' : 
                       `${trialStatus?.plan_limits.max_employees} max`}
                    </p>
                  </div>
                  <UserGroupIcon className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Leave Requests</p>
                    <div className="text-2xl font-bold text-green-600">{usageStats.leave_requests_submitted}</div>
                    <p className="text-xs text-gray-500">
                      {usageStats.leave_requests_approved} approved
                    </p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reports Generated</p>
                    <div className="text-2xl font-bold text-purple-600">{usageStats.reports_generated}</div>
                    <p className="text-xs text-gray-500">Last 7 days</p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-purple-600 opacity-20" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trial Days Used</p>
                    <div className="text-2xl font-bold text-orange-600">
                      {trialStatus?.is_trial_active ? 
                        Math.max(0, 14 - trialStatus.trial_days_remaining) : 
                        'N/A'
                      }
                    </div>
                    <p className="text-xs text-gray-500">of 14 days</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-orange-600 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Trial Section */}
        {trialStatus && !trialStatus.is_trial_active && trialStatus.billing_plan === 'free' && (
          <div className="card bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <FireIcon className="w-12 h-12 text-teal-600" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-teal-800 dark:text-teal-200 mb-2">
                    🚀 Start Your 14-Day Pro Trial
                  </h3>
                  <p className="text-teal-700 dark:text-teal-300 mb-4">
                    Unlock all premium features: unlimited employees, advanced reporting, document management, and compliance tools.
                  </p>
                  <button
                    onClick={() => startTrialMutation.mutate()}
                    disabled={startTrialMutation.isPending}
                    className="btn-primary bg-teal-600 hover:bg-teal-700"
                  >
                    {startTrialMutation.isPending ? 'Starting Trial...' : 'Start Free Trial'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Choose Your Plan</h2>
            <p className="card-subtle">Select the plan that fits your organization</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(PLAN_PRICING).map(([planKey, plan]) => {
                const isRecommended = getPlanRecommendation() === planKey;
                const isCurrent = trialStatus?.billing_plan === planKey || 
                                 (trialStatus?.is_trial_active && planKey === 'pro');

                return (
                  <div
                    key={planKey}
                    className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedPlan === planKey
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    } ${isRecommended ? 'ring-2 ring-teal-200' : ''}`}
                    onClick={() => setSelectedPlan(planKey)}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-teal-500 text-white px-3 py-1 text-xs rounded-full">
                          Recommended
                        </span>
                      </div>
                    )}
                    
                    {isCurrent && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                          Current
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold mb-1">
                        {plan.price === 0 ? 'Free' : `R${plan.price}`}
                      </div>
                      {plan.price > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">/month</div>
                      )}
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {plan.maxEmployees === -1 ? 'Unlimited employees' : `Up to ${plan.maxEmployees} employees`}
                      </div>

                      <div className="text-left space-y-2 mb-6">
                        {planKey === 'free' && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Basic leave requests</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Simple reporting</span>
                            </div>
                          </>
                        )}
                        
                        {planKey === 'lite' && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Everything in Free</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Document uploads</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Approval workflows</span>
                            </div>
                          </>
                        )}
                        
                        {planKey === 'pro' && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Everything in Lite</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Advanced reporting & branding</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Compliance & audit tools</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>Priority support</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPlan !== trialStatus?.billing_plan && !trialStatus?.is_trial_active && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => upgradeMutation.mutate(selectedPlan)}
                  disabled={upgradeMutation.isPending}
                  className="btn-primary"
                >
                  {upgradeMutation.isPending ? 'Processing...' : 
                   selectedPlan === 'free' ? 'Downgrade to Free' :
                   `Upgrade to ${PLAN_PRICING[selectedPlan as keyof typeof PLAN_PRICING].name}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Billing History */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Billing History</h2>
            <p className="card-subtle">Recent billing events and transactions</p>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-gray-500">
              <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No billing history yet</p>
              <p className="text-sm">Transactions will appear here once you upgrade</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}