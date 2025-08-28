import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  TagIcon, 
  ClipboardDocumentListIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PolicyOverview {
  leave_types: {
    total: number;
    active: number;
    inactive: number;
  };
  accrual_policies: {
    total: number;
    by_method: Record<string, number>;
  };
  policy_rules: {
    total: number;
    by_type: Record<string, number>;
  };
}

async function fetchPolicyOverview(): Promise<PolicyOverview> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  // Fetch leave types stats
  const { data: leaveTypes } = await supabase
    .from('leave_types')
    .select('is_active')
    .eq('organization_id', userProfile.organization_id);

  // Fetch accrual policies stats
  const { data: accrualPolicies } = await supabase
    .from('accrual_policies')
    .select('accrual_method')
    .eq('organization_id', userProfile.organization_id);

  // Fetch policy rules stats
  const { data: policyRules } = await supabase
    .from('leave_policy_rules')
    .select('rule_type')
    .eq('organization_id', userProfile.organization_id);

  return {
    leave_types: {
      total: leaveTypes?.length || 0,
      active: leaveTypes?.filter(lt => lt.is_active).length || 0,
      inactive: leaveTypes?.filter(lt => !lt.is_active).length || 0
    },
    accrual_policies: {
      total: accrualPolicies?.length || 0,
      by_method: accrualPolicies?.reduce((acc, ap) => {
        acc[ap.accrual_method] = (acc[ap.accrual_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    },
    policy_rules: {
      total: policyRules?.length || 0,
      by_type: policyRules?.reduce((acc, pr) => {
        acc[pr.rule_type] = (acc[pr.rule_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    }
  };
}

const POLICY_SECTIONS = [
  {
    title: 'Leave Types',
    description: 'Configure the types of leave available in your organization',
    icon: TagIcon,
    path: '/admin/leave-types',
    color: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    features: [
      'Custom leave categories',
      'Approval requirements',
      'Advance notice rules',
      'Paid/unpaid settings'
    ]
  },
  {
    title: 'Accrual Policies',
    description: 'Define how employees earn and accumulate leave time',
    icon: ClipboardDocumentListIcon,
    path: '/admin/accrual-policies',
    color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    features: [
      'Monthly/yearly accrual',
      'Maximum balance limits',
      'Proration methods',
      'Anniversary-based earning'
    ]
  },
  {
    title: 'Policy Rules',
    description: 'Set business rules and restrictions for leave requests',
    icon: ShieldCheckIcon,
    path: '/admin/policy-rules',
    color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    features: [
      'Blackout periods',
      'Minimum notice requirements',
      'Maximum duration limits',
      'Balance requirements'
    ]
  }
];

export default function LeavePolicies() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { data: overview, isLoading } = useQuery({
    queryKey: ['policy-overview'],
    queryFn: fetchPolicyOverview
  });

  const getMethodDisplay = (method: string) => {
    const methods = {
      yearly: 'Yearly Grant',
      monthly: 'Monthly Accrual',
      per_pay_period: 'Per Pay Period',
      manual: 'Manual Assignment'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getRuleTypeDisplay = (type: string) => {
    const types = {
      blackout_period: 'Blackout Period',
      minimum_notice: 'Minimum Notice',
      maximum_duration: 'Maximum Duration',
      required_balance: 'Required Balance',
      custom: 'Custom Rule'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPolicyStatus = () => {
    if (!overview) return { status: 'loading', message: 'Loading...', color: 'text-gray-500' };

    const { leave_types, accrual_policies } = overview;
    
    if (leave_types.total === 0) {
      return {
        status: 'incomplete',
        message: 'No leave types configured',
        color: 'text-red-600',
        icon: ExclamationTriangleIcon
      };
    }
    
    if (leave_types.active === 0) {
      return {
        status: 'incomplete',
        message: 'No active leave types',
        color: 'text-yellow-600',
        icon: ExclamationTriangleIcon
      };
    }
    
    if (accrual_policies.total === 0) {
      return {
        status: 'partial',
        message: 'Leave types configured, consider adding accrual policies',
        color: 'text-yellow-600',
        icon: InformationCircleIcon
      };
    }
    
    return {
      status: 'complete',
      message: 'Leave policies are properly configured',
      color: 'text-green-600',
      icon: CheckCircleIcon
    };
  };

  const policyStatus = getPolicyStatus();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leave Policy Configuration</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Configure your organization's leave policies, types, and business rules
          </p>
        </div>

        {/* Policy Status */}
        <div className="card border-l-4" style={{
          borderLeftColor: policyStatus.status === 'complete' ? '#10b981' : 
                           policyStatus.status === 'partial' ? '#f59e0b' : '#ef4444'
        }}>
          <div className="card-body">
            <div className="flex items-center gap-3">
              {policyStatus.icon && <policyStatus.icon className={`w-6 h-6 ${policyStatus.color}`} />}
              <div>
                <h3 className="font-semibold">Configuration Status</h3>
                <p className={`text-sm ${policyStatus.color}`}>{policyStatus.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Leave Types</h3>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {overview.leave_types.active}
                    </div>
                    <p className="text-sm text-gray-500">
                      {overview.leave_types.total > overview.leave_types.active && 
                        `+${overview.leave_types.inactive} inactive`
                      }
                    </p>
                  </div>
                  <TagIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Accrual Policies</h3>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {overview.accrual_policies.total}
                    </div>
                    <p className="text-sm text-gray-500">
                      {Object.entries(overview.accrual_policies.by_method)[0] && 
                        `Most: ${getMethodDisplay(Object.entries(overview.accrual_policies.by_method)[0][0])}`
                      }
                    </p>
                  </div>
                  <ClipboardDocumentListIcon className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Policy Rules</h3>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {overview.policy_rules.total}
                    </div>
                    <p className="text-sm text-gray-500">
                      {Object.entries(overview.policy_rules.by_type)[0] && 
                        `Most: ${getRuleTypeDisplay(Object.entries(overview.policy_rules.by_type)[0][0])}`
                      }
                    </p>
                  </div>
                  <ShieldCheckIcon className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Policy Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {POLICY_SECTIONS.map((section) => (
            <div
              key={section.title}
              className={`card bg-gradient-to-br ${section.color} ${section.borderColor} border hover:shadow-lg transition-all duration-200 cursor-pointer`}
              onMouseEnter={() => setActiveSection(section.title)}
              onMouseLeave={() => setActiveSection(null)}
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <section.icon className={`w-8 h-8 ${section.iconColor}`} />
                  <ArrowRightIcon className={`w-5 h-5 transition-transform duration-200 ${
                    activeSection === section.title ? 'transform translate-x-1' : ''
                  } ${section.iconColor}`} />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {section.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {section.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className={`w-1 h-1 rounded-full ${section.iconColor.replace('text-', 'bg-')}`} />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  to={section.path}
                  className={`btn-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm`}
                >
                  Configure {section.title}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Setup Guide */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Setup Guide</h2>
            <p className="card-subtle">Follow these steps to configure your leave policies</p>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                  overview?.leave_types.total > 0 ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Create Leave Types</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Start by defining the types of leave your organization offers (vacation, sick, personal, etc.)
                  </p>
                  <Link to="/admin/leave-types" className="text-sm text-blue-600 hover:underline">
                    Configure Leave Types →
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                  overview?.accrual_policies.total > 0 ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Set Up Accrual Policies</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Define how employees earn leave time - yearly grants, monthly accrual, or custom rules
                  </p>
                  <Link to="/admin/accrual-policies" className="text-sm text-blue-600 hover:underline">
                    Configure Accrual Policies →
                  </Link>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                  overview?.policy_rules.total > 0 ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Add Policy Rules (Optional)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Create business rules like blackout periods, minimum notice requirements, and balance restrictions
                  </p>
                  <Link to="/admin/policy-rules" className="text-sm text-blue-600 hover:underline">
                    Configure Policy Rules →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}