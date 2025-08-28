import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  BellIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface EscalationRule {
  id: string;
  organization_id: string;
  leave_type_code: string | null;
  escalation_hours: number;
  escalation_levels: EscalationLevel[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EscalationLevel {
  level: number;
  escalate_to: string;
  notification_template: string;
  description: string;
}

interface EscalationEvent {
  id: string;
  escalated_at: string;
  escalation_level: number;
  escalated_to: string;
  escalation_reason: string;
  resolved_at: string | null;
  request_id: string;
  employee_email: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  leave_type_name: string;
  reason: string;
  request_status: string;
  organization_name: string;
  hours_escalated: number;
}

async function fetchEscalationRules(): Promise<EscalationRule[]> {
  const { data, error } = await supabase
    .from('escalation_rules')
    .select('*')
    .order('leave_type_code', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

async function fetchActiveEscalations(): Promise<EscalationEvent[]> {
  const { data, error } = await supabase
    .from('escalation_dashboard')
    .select('*')
    .is('resolved_at', null)
    .order('escalated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchEscalationHistory(): Promise<EscalationEvent[]> {
  const { data, error } = await supabase
    .from('escalation_dashboard')
    .select('*')
    .not('resolved_at', 'is', null)
    .order('resolved_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

async function processEscalations(): Promise<number> {
  const { data, error } = await supabase.rpc('process_leave_request_escalations');
  if (error) throw error;
  return data || 0;
}

async function updateEscalationRule(ruleId: string, updates: Partial<EscalationRule>): Promise<void> {
  const { error } = await supabase
    .from('escalation_rules')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', ruleId);

  if (error) throw error;
}

function EscalationRuleCard({ rule, onUpdate }: { rule: EscalationRule; onUpdate: (id: string, updates: Partial<EscalationRule>) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [hours, setHours] = useState(rule.escalation_hours);

  const handleSave = () => {
    onUpdate(rule.id, { escalation_hours: hours });
    setIsEditing(false);
  };

  const toggleActive = () => {
    onUpdate(rule.id, { is_active: !rule.is_active });
  };

  return (
    <div className={`card ${!rule.is_active ? 'opacity-60' : ''}`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">
                {rule.leave_type_code ? rule.leave_type_code.replace('_', ' ').toUpperCase() : 'All Leave Types'}
              </h3>
              <span className={`px-2 py-1 text-xs rounded ${
                rule.is_active 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
              }`}>
                {rule.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="w-4 h-4 text-gray-500" />
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    min={1}
                    max={168}
                    className="w-20 px-2 py-1 text-sm border rounded"
                  />
                  <span className="text-sm text-gray-600">hours</span>
                  <button onClick={handleSave} className="text-sm text-blue-600 hover:underline">
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="text-sm text-gray-600 hover:underline">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Escalate after {rule.escalation_hours} hours</span>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Escalation Levels:</h4>
              {rule.escalation_levels.map((level, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      {level.level}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {level.description} → {level.escalate_to}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleActive}
              className={`p-2 rounded transition-colors ${
                rule.is_active
                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
              title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
            >
              {rule.is_active ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EscalationEventCard({ escalation }: { escalation: EscalationEvent }) {
  const isResolved = escalation.resolved_at !== null;
  const urgencyColor = escalation.escalation_level >= 3 ? 'red' : escalation.escalation_level >= 2 ? 'orange' : 'yellow';

  return (
    <div className={`card border-l-4 border-l-${urgencyColor}-500`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-full bg-${urgencyColor}-100 dark:bg-${urgencyColor}-900/20 flex items-center justify-center`}>
                <span className={`text-xs font-bold text-${urgencyColor}-600 dark:text-${urgencyColor}-400`}>
                  L{escalation.escalation_level}
                </span>
              </div>
              <h4 className="font-medium">{escalation.employee_email}</h4>
              {isResolved ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>📅 {format(new Date(escalation.start_date), 'MMM d')} - {format(new Date(escalation.end_date), 'MMM d, yyyy')}</span>
                <span>🏷️ {escalation.leave_type_name || escalation.leave_type}</span>
              </div>
              <div>📧 Escalated to: {escalation.escalated_to}</div>
              <div>⏰ {Math.round(escalation.hours_escalated)} hours ago</div>
              {escalation.reason && (
                <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  Reason: {escalation.reason}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-medium ${
              isResolved 
                ? 'text-green-600 dark:text-green-400'
                : escalation.request_status === 'pending' 
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-blue-600 dark:text-blue-400'
            }`}>
              {isResolved ? 'Resolved' : escalation.request_status.toUpperCase()}
            </div>
            {isResolved && (
              <div className="text-xs text-gray-500">
                {format(new Date(escalation.resolved_at!), 'MMM d, yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EscalationManagement() {
  const [activeTab, setActiveTab] = useState<'rules' | 'active' | 'history'>('rules');
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ['escalation-rules'],
    queryFn: fetchEscalationRules
  });

  const { data: activeEscalations, isLoading: activeLoading } = useQuery({
    queryKey: ['active-escalations'],
    queryFn: fetchActiveEscalations,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['escalation-history'],
    queryFn: fetchEscalationHistory
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ ruleId, updates }: { ruleId: string; updates: Partial<EscalationRule> }) =>
      updateEscalationRule(ruleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
      toast('Escalation rule updated successfully', 'success');
    },
    onError: (error: Error) => {
      toast(`Failed to update rule: ${error.message}`, 'error');
    }
  });

  const processEscalationsMutation = useMutation({
    mutationFn: processEscalations,
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['active-escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalation-history'] });
      toast(`Processed ${count} escalation(s)`, 'success');
    },
    onError: (error: Error) => {
      toast(`Failed to process escalations: ${error.message}`, 'error');
    }
  });

  const handleUpdateRule = (ruleId: string, updates: Partial<EscalationRule>) => {
    updateRuleMutation.mutate({ ruleId, updates });
  };

  const handleManualProcess = () => {
    processEscalationsMutation.mutate();
  };

  const activeEscalationCount = activeEscalations?.length || 0;
  const urgentCount = activeEscalations?.filter(e => e.escalation_level >= 2).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900">
      <div className="container py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Escalation Management</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor and manage automatic leave request escalations
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {activeEscalationCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <BellIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {activeEscalationCount} active, {urgentCount} urgent
                  </span>
                </div>
              )}
              
              <button
                onClick={handleManualProcess}
                disabled={processEscalationsMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                <CogIcon className="w-4 h-4" />
                {processEscalationsMutation.isPending ? 'Processing...' : 'Process Now'}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            {[
              { key: 'rules', label: 'Escalation Rules', icon: CogIcon },
              { key: 'active', label: `Active Escalations (${activeEscalationCount})`, icon: ExclamationTriangleIcon },
              { key: 'history', label: 'History', icon: ClockIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              {rulesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card animate-pulse">
                      <div className="card-body">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !rules || rules.length === 0 ? (
                <div className="text-center py-12">
                  <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Escalation Rules
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Escalation rules will be created automatically when organizations are set up.
                  </p>
                </div>
              ) : (
                rules.map((rule) => (
                  <EscalationRuleCard
                    key={rule.id}
                    rule={rule}
                    onUpdate={handleUpdateRule}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="card animate-pulse">
                      <div className="card-body">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !activeEscalations || activeEscalations.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Active Escalations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All leave requests are being processed within the required timeframe.
                  </p>
                </div>
              ) : (
                activeEscalations.map((escalation) => (
                  <EscalationEventCard key={escalation.id} escalation={escalation} />
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {historyLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card animate-pulse">
                      <div className="card-body">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !history || history.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Escalation History
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Resolved escalations will appear here.
                  </p>
                </div>
              ) : (
                history.map((escalation) => (
                  <EscalationEventCard key={escalation.id} escalation={escalation} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}