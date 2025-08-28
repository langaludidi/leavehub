import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AccrualPolicy {
  id: string;
  organization_id: string;
  leave_type_id: string;
  policy_name: string;
  accrual_method: 'monthly' | 'yearly' | 'per_pay_period' | 'manual';
  accrual_amount: number;
  max_balance: number | null;
  waiting_period_days: number;
  proration_method: 'none' | 'monthly' | 'daily';
  anniversary_based: boolean;
  is_active: boolean;
  leave_type?: {
    name: string;
    code: string;
    color: string;
    icon: string;
  };
}

interface AccrualPolicyFormData {
  leave_type_id: string;
  policy_name: string;
  accrual_method: 'monthly' | 'yearly' | 'per_pay_period' | 'manual';
  accrual_amount: number;
  max_balance: number | null;
  waiting_period_days: number;
  proration_method: 'none' | 'monthly' | 'daily';
  anniversary_based: boolean;
}

interface LeaveType {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
}

async function fetchAccrualPolicies(): Promise<AccrualPolicy[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase
    .from('accrual_policies')
    .select(`
      *,
      leave_type:leave_types(
        name,
        code,
        color,
        icon
      )
    `)
    .eq('organization_id', userProfile.organization_id)
    .order('policy_name');

  if (error) throw error;
  return data || [];
}

async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('leave_types')
    .select('id, name, code, color, icon')
    .eq('organization_id', userProfile.organization_id)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

async function createAccrualPolicy(policy: AccrualPolicyFormData): Promise<AccrualPolicy> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('accrual_policies')
    .insert([{
      ...policy,
      organization_id: userProfile.organization_id,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateAccrualPolicy(id: string, updates: Partial<AccrualPolicyFormData>): Promise<AccrualPolicy> {
  const { data, error } = await supabase
    .from('accrual_policies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteAccrualPolicy(id: string): Promise<void> {
  const { error } = await supabase
    .from('accrual_policies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function AccrualPolicyForm({ 
  policy, 
  leaveTypes,
  onSave, 
  onCancel 
}: { 
  policy?: AccrualPolicy;
  leaveTypes: LeaveType[];
  onSave: (data: AccrualPolicyFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<AccrualPolicyFormData>({
    leave_type_id: policy?.leave_type_id || '',
    policy_name: policy?.policy_name || '',
    accrual_method: policy?.accrual_method || 'yearly',
    accrual_amount: policy?.accrual_amount || 0,
    max_balance: policy?.max_balance || null,
    waiting_period_days: policy?.waiting_period_days || 0,
    proration_method: policy?.proration_method || 'none',
    anniversary_based: policy?.anniversary_based || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getAccrualDescription = () => {
    const { accrual_method, accrual_amount, anniversary_based } = formData;
    const period = anniversary_based ? 'anniversary year' : 'calendar year';
    
    switch (accrual_method) {
      case 'yearly':
        return `${accrual_amount} days granted at the beginning of each ${period}`;
      case 'monthly':
        return `${accrual_amount} days earned each month (${accrual_amount * 12} days per ${period})`;
      case 'per_pay_period':
        return `${accrual_amount} days earned per pay period`;
      case 'manual':
        return 'Balances are manually assigned by administrators';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {policy ? 'Edit Accrual Policy' : 'Add New Accrual Policy'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Leave Type *</label>
              <select
                value={formData.leave_type_id}
                onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                className="select"
                required
              >
                <option value="">Select leave type...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Policy Name *</label>
              <input
                type="text"
                value={formData.policy_name}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                className="input"
                placeholder="e.g., Standard Vacation Policy"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Accrual Method *</label>
              <select
                value={formData.accrual_method}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  accrual_method: e.target.value as AccrualPolicyFormData['accrual_method']
                })}
                className="select"
                required
              >
                <option value="yearly">Yearly Grant</option>
                <option value="monthly">Monthly Accrual</option>
                <option value="per_pay_period">Per Pay Period</option>
                <option value="manual">Manual Assignment</option>
              </select>
            </div>
            <div>
              <label className="label">
                {formData.accrual_method === 'manual' ? 'Initial Amount' : 'Accrual Amount'} *
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.accrual_amount}
                onChange={(e) => setFormData({ ...formData, accrual_amount: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
          </div>

          {formData.accrual_method !== 'manual' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Accrual Preview</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    {getAccrualDescription()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Maximum Balance</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.max_balance || ''}
                onChange={(e) => setFormData({ ...formData, max_balance: e.target.value ? parseFloat(e.target.value) : null })}
                className="input"
                placeholder="No limit"
              />
            </div>
            <div>
              <label className="label">Waiting Period (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.waiting_period_days}
                onChange={(e) => setFormData({ ...formData, waiting_period_days: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>
          </div>

          {formData.accrual_method !== 'manual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Proration Method</label>
                <select
                  value={formData.proration_method}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    proration_method: e.target.value as AccrualPolicyFormData['proration_method']
                  })}
                  className="select"
                >
                  <option value="none">No proration</option>
                  <option value="monthly">Monthly proration</option>
                  <option value="daily">Daily proration</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="anniversary_based"
                  checked={formData.anniversary_based}
                  onChange={(e) => setFormData({ ...formData, anniversary_based: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="anniversary_based" className="text-sm font-medium">
                  Anniversary-based accrual
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {policy ? 'Update' : 'Create'} Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccrualPolicies() {
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AccrualPolicy | undefined>();
  const queryClient = useQueryClient();

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['accrual-policies'],
    queryFn: fetchAccrualPolicies
  });

  const { data: leaveTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['leave-types-for-policies'],
    queryFn: fetchLeaveTypes
  });

  const createMutation = useMutation({
    mutationFn: createAccrualPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accrual-policies'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AccrualPolicyFormData> }) => 
      updateAccrualPolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accrual-policies'] });
      setShowForm(false);
      setEditingPolicy(undefined);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccrualPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accrual-policies'] });
    }
  });

  const handleSave = (formData: AccrualPolicyFormData) => {
    if (editingPolicy) {
      updateMutation.mutate({ id: editingPolicy.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (policy: AccrualPolicy) => {
    setEditingPolicy(policy);
    setShowForm(true);
  };

  const handleDelete = (policy: AccrualPolicy) => {
    if (confirm(`Are you sure you want to delete the "${policy.policy_name}" policy?`)) {
      deleteMutation.mutate(policy.id);
    }
  };

  const getMethodDisplay = (method: string) => {
    const methods = {
      yearly: 'Yearly Grant',
      monthly: 'Monthly Accrual',
      per_pay_period: 'Per Pay Period',
      manual: 'Manual Assignment'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (policiesLoading || typesLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Accrual Policies</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Configure how employees earn and accumulate leave time
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPolicy(undefined);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
            disabled={!leaveTypes || leaveTypes.length === 0}
          >
            <PlusIcon className="w-4 h-4" />
            Add Accrual Policy
          </button>
        </div>

        {/* No Leave Types Warning */}
        {leaveTypes && leaveTypes.length === 0 && (
          <div className="card border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="card-body">
              <div className="flex gap-3">
                <InformationCircleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    No Leave Types Available
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    You need to create leave types before you can set up accrual policies.
                  </p>
                  <a 
                    href="/admin/leave-types" 
                    className="text-sm text-yellow-800 dark:text-yellow-200 underline mt-2 inline-block"
                  >
                    Go to Leave Types →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Policies List */}
        {policies && policies.length > 0 ? (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="card hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {policy.leave_type && (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                          style={{ backgroundColor: policy.leave_type.color }}
                        >
                          {policy.leave_type.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{policy.policy_name}</h3>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                            {policy.leave_type?.name}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Method:</span>
                            <span className="ml-2 font-medium">{getMethodDisplay(policy.accrual_method)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                            <span className="ml-2 font-medium">
                              {policy.accrual_amount} {policy.accrual_amount === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                          {policy.max_balance && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Max Balance:</span>
                              <span className="ml-2 font-medium">
                                {policy.max_balance} {policy.max_balance === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {(policy.waiting_period_days > 0 || policy.anniversary_based || policy.proration_method !== 'none') && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {policy.waiting_period_days > 0 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                                {policy.waiting_period_days} day waiting period
                              </span>
                            )}
                            {policy.anniversary_based && (
                              <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">
                                Anniversary-based
                              </span>
                            )}
                            {policy.proration_method !== 'none' && (
                              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                                {policy.proration_method} proration
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(policy)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Edit Policy"
                      >
                        <PencilIcon className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(policy)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Delete Policy"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : policies && policies.length === 0 && leaveTypes && leaveTypes.length > 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Accrual Policies Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create accrual policies to define how employees earn leave time.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Create Your First Policy
              </button>
            </div>
          </div>
        ) : null}

        {/* Form Modal */}
        {showForm && leaveTypes && (
          <AccrualPolicyForm
            policy={editingPolicy}
            leaveTypes={leaveTypes}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingPolicy(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}