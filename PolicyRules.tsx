import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface PolicyRule {
  id: string;
  organization_id: string;
  rule_name: string;
  rule_type: 'blackout_period' | 'minimum_notice' | 'maximum_duration' | 'required_balance' | 'custom';
  leave_type_ids: string[];
  conditions: Record<string, any>;
  parameters: Record<string, any>;
  error_message: string;
  is_active: boolean;
  leave_types?: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
}

interface PolicyRuleFormData {
  rule_name: string;
  rule_type: 'blackout_period' | 'minimum_notice' | 'maximum_duration' | 'required_balance' | 'custom';
  leave_type_ids: string[];
  conditions: Record<string, any>;
  parameters: Record<string, any>;
  error_message: string;
}

interface LeaveType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

async function fetchPolicyRules(): Promise<PolicyRule[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase
    .from('leave_policy_rules')
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .order('rule_name');

  if (error) throw error;

  // Fetch leave types for each rule
  if (data) {
    const allLeaveTypeIds = [...new Set(data.flatMap(rule => rule.leave_type_ids || []))];
    
    if (allLeaveTypeIds.length > 0) {
      const { data: leaveTypesData } = await supabase
        .from('leave_types')
        .select('id, name, icon, color')
        .in('id', allLeaveTypeIds);

      return data.map(rule => ({
        ...rule,
        leave_types: leaveTypesData?.filter(lt => (rule.leave_type_ids || []).includes(lt.id)) || []
      }));
    }
  }

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
    .select('id, name, icon, color')
    .eq('organization_id', userProfile.organization_id)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

async function createPolicyRule(rule: PolicyRuleFormData): Promise<PolicyRule> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('leave_policy_rules')
    .insert([{
      ...rule,
      organization_id: userProfile.organization_id,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updatePolicyRule(id: string, updates: Partial<PolicyRuleFormData>): Promise<PolicyRule> {
  const { data, error } = await supabase
    .from('leave_policy_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deletePolicyRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('leave_policy_rules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function PolicyRuleForm({ 
  rule, 
  leaveTypes,
  onSave, 
  onCancel 
}: { 
  rule?: PolicyRule;
  leaveTypes: LeaveType[];
  onSave: (data: PolicyRuleFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<PolicyRuleFormData>({
    rule_name: rule?.rule_name || '',
    rule_type: rule?.rule_type || 'blackout_period',
    leave_type_ids: rule?.leave_type_ids || [],
    conditions: rule?.conditions || {},
    parameters: rule?.parameters || {},
    error_message: rule?.error_message || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate default error message if not provided
    if (!formData.error_message) {
      const defaultMessages = {
        blackout_period: 'This leave cannot be taken during the specified blackout period.',
        minimum_notice: 'Insufficient advance notice for this leave request.',
        maximum_duration: 'Leave duration exceeds the maximum allowed.',
        required_balance: 'Insufficient leave balance for this request.',
        custom: 'This leave request violates company policy.'
      };
      formData.error_message = defaultMessages[formData.rule_type];
    }
    
    onSave(formData);
  };

  const renderRuleParameters = () => {
    switch (formData.rule_type) {
      case 'blackout_period':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={formData.parameters.start_date || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, start_date: e.target.value }
                  })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  value={formData.parameters.end_date || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, end_date: e.target.value }
                  })}
                  className="input"
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.parameters.recurring || false}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, recurring: e.target.checked }
                })}
                className="mr-2"
              />
              <label htmlFor="recurring" className="text-sm">
                Recurring annually
              </label>
            </div>
          </div>
        );
        
      case 'minimum_notice':
        return (
          <div>
            <label className="label">Minimum Notice (Days)</label>
            <input
              type="number"
              min="0"
              value={formData.parameters.days || ''}
              onChange={(e) => setFormData({
                ...formData,
                parameters: { ...formData.parameters, days: parseInt(e.target.value) || 0 }
              })}
              className="input"
              required
            />
          </div>
        );
        
      case 'maximum_duration':
        return (
          <div>
            <label className="label">Maximum Duration (Days)</label>
            <input
              type="number"
              min="1"
              value={formData.parameters.max_days || ''}
              onChange={(e) => setFormData({
                ...formData,
                parameters: { ...formData.parameters, max_days: parseInt(e.target.value) || 1 }
              })}
              className="input"
              required
            />
          </div>
        );
        
      case 'required_balance':
        return (
          <div>
            <label className="label">Minimum Balance Required (Days)</label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={formData.parameters.min_balance || ''}
              onChange={(e) => setFormData({
                ...formData,
                parameters: { ...formData.parameters, min_balance: parseFloat(e.target.value) || 0 }
              })}
              className="input"
              required
            />
          </div>
        );
        
      case 'custom':
        return (
          <div>
            <label className="label">Custom Rule Logic</label>
            <textarea
              value={formData.parameters.description || ''}
              onChange={(e) => setFormData({
                ...formData,
                parameters: { ...formData.parameters, description: e.target.value }
              })}
              className="textarea"
              rows={4}
              placeholder="Describe the custom rule logic..."
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {rule ? 'Edit Policy Rule' : 'Add New Policy Rule'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Rule Name *</label>
            <input
              type="text"
              value={formData.rule_name}
              onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
              className="input"
              placeholder="e.g., Holiday Blackout Period"
              required
            />
          </div>

          <div>
            <label className="label">Rule Type *</label>
            <select
              value={formData.rule_type}
              onChange={(e) => setFormData({ 
                ...formData, 
                rule_type: e.target.value as PolicyRuleFormData['rule_type'],
                parameters: {} // Reset parameters when type changes
              })}
              className="select"
              required
            >
              <option value="blackout_period">Blackout Period</option>
              <option value="minimum_notice">Minimum Notice</option>
              <option value="maximum_duration">Maximum Duration</option>
              <option value="required_balance">Required Balance</option>
              <option value="custom">Custom Rule</option>
            </select>
          </div>

          <div>
            <label className="label">Apply to Leave Types</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="all-types"
                  checked={formData.leave_type_ids.length === 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    leave_type_ids: e.target.checked ? [] : [leaveTypes[0]?.id || '']
                  })}
                  className="mr-2"
                />
                <label htmlFor="all-types" className="text-sm font-medium">
                  All Leave Types
                </label>
              </div>
              
              {leaveTypes.map((type) => (
                <div key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`type-${type.id}`}
                    checked={formData.leave_type_ids.includes(type.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          leave_type_ids: [...formData.leave_type_ids, type.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          leave_type_ids: formData.leave_type_ids.filter(id => id !== type.id)
                        });
                      }
                    }}
                    className="mr-2"
                    disabled={formData.leave_type_ids.length === 0} // Disabled when "All Types" is selected
                  />
                  <label htmlFor={`type-${type.id}`} className="text-sm flex items-center gap-2">
                    <span style={{ color: type.color }}>{type.icon}</span>
                    {type.name}
                  </label>
                </div>
              ))}\n            </div>
          </div>

          {renderRuleParameters()}

          <div>
            <label className="label">Error Message *</label>
            <input
              type="text"
              value={formData.error_message}
              onChange={(e) => setFormData({ ...formData, error_message: e.target.value })}
              className="input"
              placeholder="Message shown when this rule is violated"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {rule ? 'Update' : 'Create'} Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PolicyRules() {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<PolicyRule | undefined>();
  const queryClient = useQueryClient();

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ['policy-rules'],
    queryFn: fetchPolicyRules
  });

  const { data: leaveTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['leave-types-for-rules'],
    queryFn: fetchLeaveTypes
  });

  const createMutation = useMutation({
    mutationFn: createPolicyRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-rules'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PolicyRuleFormData> }) => 
      updatePolicyRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-rules'] });
      setShowForm(false);
      setEditingRule(undefined);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePolicyRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-rules'] });
    }
  });

  const handleSave = (formData: PolicyRuleFormData) => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (rule: PolicyRule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleDelete = (rule: PolicyRule) => {
    if (confirm(`Are you sure you want to delete the "${rule.rule_name}" rule?`)) {
      deleteMutation.mutate(rule.id);
    }
  };

  const getRuleTypeDisplay = (type: string) => {
    const types = {
      blackout_period: { label: 'Blackout Period', icon: '🚫', color: 'text-red-600' },
      minimum_notice: { label: 'Minimum Notice', icon: '⏰', color: 'text-yellow-600' },
      maximum_duration: { label: 'Maximum Duration', icon: '📏', color: 'text-blue-600' },
      required_balance: { label: 'Required Balance', icon: '⚖️', color: 'text-green-600' },
      custom: { label: 'Custom Rule', icon: '⚙️', color: 'text-purple-600' }
    };
    return types[type as keyof typeof types] || { label: type, icon: '📋', color: 'text-gray-600' };
  };

  const getRuleDescription = (rule: PolicyRule) => {
    switch (rule.rule_type) {
      case 'blackout_period':
        return `No leave from ${rule.parameters.start_date} to ${rule.parameters.end_date}${rule.parameters.recurring ? ' (recurring annually)' : ''}`;
      case 'minimum_notice':
        return `Requires ${rule.parameters.days} days advance notice`;
      case 'maximum_duration':
        return `Maximum ${rule.parameters.max_days} days per request`;
      case 'required_balance':
        return `Requires minimum ${rule.parameters.min_balance} days balance`;
      case 'custom':
        return rule.parameters.description || 'Custom business rule';
      default:
        return '';
    }
  };

  if (rulesLoading || typesLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
            <h1 className="text-3xl font-bold gradient-text">Policy Rules</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Configure business rules and restrictions for leave requests
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRule(undefined);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
            disabled={!leaveTypes || leaveTypes.length === 0}
          >
            <PlusIcon className="w-4 h-4" />
            Add Policy Rule
          </button>
        </div>

        {/* Rules List */}
        {rules && rules.length > 0 ? (
          <div className="space-y-4">
            {rules.map((rule) => {
              const ruleType = getRuleTypeDisplay(rule.rule_type);
              return (
                <div key={rule.id} className="card hover:shadow-md transition-shadow">
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-lg ${ruleType.color}`}>
                            {ruleType.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{rule.rule_name}</h3>
                            <span className={`text-sm ${ruleType.color}`}>
                              {ruleType.label}
                            </span>
                          </div>
                          {!rule.is_active && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {getRuleDescription(rule)}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Applies to: </span>
                            {rule.leave_type_ids.length === 0 ? (
                              <span className="font-medium">All Leave Types</span>
                            ) : rule.leave_types && rule.leave_types.length > 0 ? (
                              <span className="flex items-center gap-1 flex-wrap">
                                {rule.leave_types.slice(0, 3).map((type, idx) => (
                                  <span key={type.id} className="inline-flex items-center gap-1">
                                    <span style={{ color: type.color }}>{type.icon}</span>
                                    <span>{type.name}</span>
                                    {idx < Math.min(rule.leave_types.length, 3) - 1 && <span>,</span>}
                                  </span>
                                ))}
                                {rule.leave_types.length > 3 && (
                                  <span className="text-gray-500">+{rule.leave_types.length - 3} more</span>
                                )}\n                              </span>
                            ) : (
                              <span className="text-gray-500">No leave types</span>
                            )}
                          </div>
                        </div>
                        
                        {rule.error_message && (
                          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
                            <div className="flex items-start gap-2">
                              <ExclamationTriangleIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <span className="text-red-700 dark:text-red-300">{rule.error_message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Rule"
                        >
                          <PencilIcon className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Delete Rule"
                        >
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : rules && rules.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No Policy Rules Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create policy rules to enforce business requirements and restrictions.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
                disabled={!leaveTypes || leaveTypes.length === 0}
              >
                Create Your First Rule
              </button>
            </div>
          </div>
        ) : null}

        {/* Info Card */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body">
            <div className="flex gap-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  About Policy Rules
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>• <strong>Blackout Periods:</strong> Prevent leave during busy seasons or holidays</p>
                  <p>• <strong>Minimum Notice:</strong> Require advance notice for certain leave types</p>
                  <p>• <strong>Maximum Duration:</strong> Limit consecutive days off</p>
                  <p>• <strong>Required Balance:</strong> Ensure sufficient leave balance before approval</p>
                  <p>• <strong>Custom Rules:</strong> Implement organization-specific policies</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && leaveTypes && (
          <PolicyRuleForm
            rule={editingRule}
            leaveTypes={leaveTypes}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingRule(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}