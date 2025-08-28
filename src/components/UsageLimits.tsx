import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { PRICING_PLANS, type PricingPlan } from '../lib/stripe';
import { useUserRole } from './RequireRole';

interface UsageData {
  employee_count: number;
  storage_used: number; // in MB
  api_calls_month: number;
}

interface SubscriptionWithUsage {
  plan: PricingPlan;
  status: string;
  usage: UsageData;
}

export default function UsageLimits() {
  const { data: userRole } = useUserRole();

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['subscription-usage', userRole?.orgId],
    queryFn: async (): Promise<SubscriptionWithUsage | null> => {
      if (!userRole?.orgId) return null;

      // Get subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('org_id', userRole.orgId)
        .eq('status', 'active')
        .single();

      if (!subscription) return null;

      // Get current usage metrics
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Get employee count
      const { count: employeeCount } = await supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', userRole.orgId)
        .eq('active', true);

      // Get usage tracking data for current month
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('metric_type, value')
        .eq('org_id', userRole.orgId)
        .gte('period_start', firstDayOfMonth.toISOString().split('T')[0])
        .lte('period_end', lastDayOfMonth.toISOString().split('T')[0]);

      const usage: UsageData = {
        employee_count: employeeCount || 0,
        storage_used: usageData?.find(u => u.metric_type === 'storage_used')?.value || 0,
        api_calls_month: usageData?.find(u => u.metric_type === 'api_calls')?.value || 0,
      };

      return {
        plan: subscription.plan as PricingPlan,
        status: subscription.status,
        usage
      };
    },
    enabled: !!userRole?.orgId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading || !subscriptionData) {
    return null; // or a loading skeleton
  }

  const planLimits = PRICING_PLANS[subscriptionData.plan].limits;
  
  const getUsagePercentage = (used: number, limit: string | number): number => {
    if (typeof limit === 'string' && limit === 'unlimited') return 0;
    const numLimit = typeof limit === 'number' ? limit : parseInt(limit);
    return Math.min((used / numLimit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const employeeUsage = getUsagePercentage(subscriptionData.usage.employee_count, planLimits.employees);
  const storageUsageGB = subscriptionData.usage.storage_used / 1024; // Convert MB to GB
  const storageLimit = typeof planLimits.storage === 'string' ? 
    parseInt(planLimits.storage.replace('GB', '')) : 0;
  const storageUsage = getUsagePercentage(storageUsageGB, storageLimit);

  return (
    <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800/30">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">
            Usage & Limits
          </h3>
          <span className="text-sm px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full font-medium">
            {PRICING_PLANS[subscriptionData.plan].name} Plan
          </span>
        </div>

        <div className="space-y-4">
          {/* Employee Count */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Team Members
              </span>
              <span className={`text-sm font-medium ${getUsageColor(employeeUsage)}`}>
                {subscriptionData.usage.employee_count} / {planLimits.employees}
              </span>
            </div>
            {typeof planLimits.employees === 'number' && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    employeeUsage >= 90 ? 'bg-red-500' :
                    employeeUsage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(employeeUsage, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Storage Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Storage
              </span>
              <span className={`text-sm font-medium ${getUsageColor(storageUsage)}`}>
                {storageUsageGB.toFixed(1)}GB / {planLimits.storage}
              </span>
            </div>
            {typeof planLimits.storage === 'string' && planLimits.storage !== 'unlimited' && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    storageUsage >= 90 ? 'bg-red-500' :
                    storageUsage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(storageUsage, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* API Calls (if applicable) */}
          {subscriptionData.usage.api_calls_month > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Calls (This Month)
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {subscriptionData.usage.api_calls_month.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Upgrade prompt if approaching limits */}
          {(employeeUsage >= 75 || storageUsage >= 75) && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Approaching Limits
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                You're using {Math.max(employeeUsage, storageUsage).toFixed(0)}% of your plan limits.
              </p>
              <button className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors">
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}