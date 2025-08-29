import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  InformationCircleIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ComplianceDashboard {
  organization_id: string;
  organization_name: string;
  total_data_subject_requests: number;
  pending_requests: number;
  overdue_requests: number;
  total_incidents: number;
  unresolved_critical_incidents: number;
  active_processing_purposes: number;
  compliance_status: 'compliant' | 'at_risk' | 'non_compliant';
  last_updated: string;
}

interface DataSubjectRequest {
  id: string;
  request_reference: string;
  data_subject_email: string;
  data_subject_name: string;
  request_type: string;
  request_description: string;
  status: string;
  received_at: string;
  due_date: string;
  completed_at?: string;
  assigned_to?: string;
  processing_notes?: string;
}

interface DataIncident {
  id: string;
  incident_reference: string;
  incident_type: string;
  severity_level: string;
  incident_description: string;
  occurred_at: string;
  discovered_at: string;
  contained_at?: string;
  resolved_at?: string;
  regulator_notified: boolean;
  individuals_notified: boolean;
}

const REQUEST_TYPE_LABELS = {
  access: 'Data Access Request',
  rectification: 'Data Correction Request',
  erasure: 'Data Deletion Request',
  restriction: 'Processing Restriction',
  portability: 'Data Portability Request',
  objection: 'Processing Objection',
  consent_withdrawal: 'Consent Withdrawal'
};

const STATUS_LABELS = {
  received: 'Received',
  under_review: 'Under Review',
  additional_info_required: 'Info Required',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected',
  partially_completed: 'Partially Completed'
};

const SEVERITY_COLORS = {
  low: 'green',
  medium: 'yellow',
  high: 'orange',
  critical: 'red'
};

async function fetchComplianceDashboard(): Promise<ComplianceDashboard | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) return null;

  const { data, error } = await supabase
    .from('popia_compliance_dashboard')
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .single();

  if (error) throw error;
  return data;
}

async function fetchDataSubjectRequests(): Promise<DataSubjectRequest[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) return [];

  const { data, error } = await supabase
    .from('data_subject_requests')
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .order('received_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

async function fetchDataIncidents(): Promise<DataIncident[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) return [];

  const { data, error } = await supabase
    .from('data_incidents')
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .order('occurred_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

async function createDataSubjectRequest(requestData: {
  email: string;
  name: string;
  phone?: string;
  requestType: string;
  description: string;
}): Promise<string> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  const { data, error } = await supabase.rpc('create_data_subject_request', {
    p_organization_id: userProfile.organization_id,
    p_email: requestData.email,
    p_name: requestData.name,
    p_request_type: requestData.requestType,
    p_description: requestData.description,
    p_phone: requestData.phone
  });

  if (error) throw error;
  return data;
}

async function updateRequestStatus(requestId: string, status: string, notes?: string): Promise<void> {
  const { error } = await supabase
    .from('data_subject_requests')
    .update({
      status,
      processing_notes: notes,
      updated_at: new Date().toISOString(),
      ...(status === 'completed' && { completed_at: new Date().toISOString() })
    })
    .eq('id', requestId);

  if (error) throw error;
}

function ComplianceStatusCard({ dashboard }: { dashboard: ComplianceDashboard }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'green';
      case 'at_risk': return 'yellow';
      case 'non_compliant': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircleIcon;
      case 'at_risk': return ExclamationTriangleIcon;
      case 'non_compliant': return XCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const StatusIcon = getStatusIcon(dashboard.compliance_status);
  const statusColor = getStatusColor(dashboard.compliance_status);

  return (
    <div className={`card border-l-4 border-l-${statusColor}-500`}>
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-${statusColor}-100 dark:bg-${statusColor}-900/20 rounded-lg`}>
            <StatusIcon className={`w-8 h-8 text-${statusColor}-600 dark:text-${statusColor}-400`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">POPIA Compliance Status</h3>
            <p className={`text-${statusColor}-600 dark:text-${statusColor}-400 font-medium capitalize`}>
              {dashboard.compliance_status.replace('_', ' ')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {format(new Date(dashboard.last_updated), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataSubjectRequestCard({ request, onStatusUpdate }: { 
  request: DataSubjectRequest; 
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(request.processing_notes || '');

  const isOverdue = new Date(request.due_date) < new Date() && !['completed', 'rejected'].includes(request.status);
  const daysRemaining = Math.ceil((new Date(request.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(request.id, newStatus, notes);
    } finally {
      setIsUpdating(false);
      setShowNotes(false);
    }
  };

  return (
    <div className={`card ${isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}>
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{request.request_reference}</h4>
              <span className={`px-2 py-1 text-xs rounded ${
                request.status === 'completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : request.status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  : isOverdue
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
              }`}>
                {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded">
                  OVERDUE
                </span>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div><strong>Type:</strong> {REQUEST_TYPE_LABELS[request.request_type as keyof typeof REQUEST_TYPE_LABELS]}</div>
              <div><strong>Requestor:</strong> {request.data_subject_name} ({request.data_subject_email})</div>
              <div><strong>Received:</strong> {format(new Date(request.received_at), 'MMM dd, yyyy')}</div>
              <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                <strong>Due:</strong> {format(new Date(request.due_date), 'MMM dd, yyyy')} 
                ({daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`})
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
              {request.request_description}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!['completed', 'rejected'].includes(request.status) && (
              <>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Add processing notes"
                >
                  <DocumentCheckIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  title="Mark as completed"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Reject request"
                >
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {showNotes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea w-full"
              rows={3}
              placeholder="Add processing notes (optional)..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="btn-primary text-sm"
              >
                Complete with Notes
              </button>
              <button
                onClick={() => setShowNotes(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewRequestForm({ onSubmit, isSubmitting }: {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    requestType: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="text-lg font-semibold mb-4">New Data Subject Request</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="input"
              />
            </div>
            
            <div>
              <label className="label">Request Type *</label>
              <select
                value={formData.requestType}
                onChange={(e) => setFormData(prev => ({ ...prev, requestType: e.target.value }))}
                className="select"
                required
              >
                <option value="">Select request type...</option>
                {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="label">Request Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="textarea"
              rows={4}
              placeholder="Describe the data subject request in detail..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Creating Request...' : 'Create Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function POPIACompliance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'incidents' | 'new-request'>('overview');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['popia-dashboard'],
    queryFn: fetchComplianceDashboard,
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['data-subject-requests'],
    queryFn: fetchDataSubjectRequests
  });

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['data-incidents'],
    queryFn: fetchDataIncidents
  });

  const createRequestMutation = useMutation({
    mutationFn: createDataSubjectRequest,
    onSuccess: (reference) => {
      queryClient.invalidateQueries({ queryKey: ['data-subject-requests'] });
      queryClient.invalidateQueries({ queryKey: ['popia-dashboard'] });
      toast(`Data subject request ${reference} created successfully`, 'success');
      setShowNewRequestForm(false);
    },
    onError: (error: Error) => {
      toast(`Failed to create request: ${error.message}`, 'error');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status, notes }: { requestId: string; status: string; notes?: string }) =>
      updateRequestStatus(requestId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-subject-requests'] });
      queryClient.invalidateQueries({ queryKey: ['popia-dashboard'] });
      toast('Request status updated successfully', 'success');
    },
    onError: (error: Error) => {
      toast(`Failed to update status: ${error.message}`, 'error');
    }
  });

  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POPIA compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">POPIA Compliance Not Available</h2>
          <p className="text-gray-600">Unable to load compliance dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900">
      <div className="container py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">POPIA Compliance</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Protection of Personal Information Act compliance management
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {dashboard.overdue_requests > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <BellIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {dashboard.overdue_requests} overdue request{dashboard.overdue_requests !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => setShowNewRequestForm(true)}
                className="btn-primary"
              >
                New Request
              </button>
            </div>
          </div>

          {/* Compliance Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <ComplianceStatusCard dashboard={dashboard} />
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Data Subject Requests</h3>
                    <p className="text-2xl font-bold">{dashboard.total_data_subject_requests}</p>
                    <p className="text-sm text-gray-600">{dashboard.pending_requests} pending</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                  <div>
                    <h3 className="font-semibold">Security Incidents</h3>
                    <p className="text-2xl font-bold">{dashboard.total_incidents}</p>
                    <p className="text-sm text-gray-600">{dashboard.unresolved_critical_incidents} critical</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <DocumentCheckIcon className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Processing Activities</h3>
                    <p className="text-2xl font-bold">{dashboard.active_processing_purposes}</p>
                    <p className="text-sm text-gray-600">active purposes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'requests', label: `Requests (${dashboard.total_data_subject_requests})`, icon: UserGroupIcon },
              { key: 'incidents', label: `Incidents (${dashboard.total_incidents})`, icon: ExclamationTriangleIcon }
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-semibold mb-4">POPIA Compliance Overview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Key Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>Data processing purposes documented</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>Legal bases established</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>Data subject rights procedures in place</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>Security incident response ready</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Current Status</h4>
                      <div className="space-y-2 text-sm">
                        <div>Processing Activities: {dashboard.active_processing_purposes} active</div>
                        <div>Pending Requests: {dashboard.pending_requests}</div>
                        <div>Overdue Requests: {dashboard.overdue_requests}</div>
                        <div>Critical Incidents: {dashboard.unresolved_critical_incidents}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requestsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card animate-pulse">
                      <div className="card-body">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !requests || requests.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Data Subject Requests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Data subject requests will appear here when received.
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <DataSubjectRequestCard
                    key={request.id}
                    request={request}
                    onStatusUpdate={(id, status, notes) => updateStatusMutation.mutate({ requestId: id, status, notes })}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4">
              {incidentsLoading ? (
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
              ) : !incidents || incidents.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Security Incidents
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This is good! No data security incidents have been reported.
                  </p>
                </div>
              ) : (
                incidents.map((incident) => {
                  const severityColor = SEVERITY_COLORS[incident.severity_level as keyof typeof SEVERITY_COLORS];
                  const isResolved = incident.resolved_at !== null;
                  
                  return (
                    <div key={incident.id} className={`card border-l-4 border-l-${severityColor}-500`}>
                      <div className="card-body">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{incident.incident_reference}</h4>
                              <span className={`px-2 py-1 text-xs rounded capitalize bg-${severityColor}-100 text-${severityColor}-800 dark:bg-${severityColor}-900/20 dark:text-${severityColor}-300`}>
                                {incident.severity_level}
                              </span>
                              {isResolved ? (
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              ) : (
                                <ClockIcon className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <div><strong>Type:</strong> {incident.incident_type.replace('_', ' ')}</div>
                              <div><strong>Occurred:</strong> {format(new Date(incident.occurred_at), 'MMM dd, yyyy HH:mm')}</div>
                              <div><strong>Discovered:</strong> {format(new Date(incident.discovered_at), 'MMM dd, yyyy HH:mm')}</div>
                              {incident.resolved_at && (
                                <div><strong>Resolved:</strong> {format(new Date(incident.resolved_at), 'MMM dd, yyyy HH:mm')}</div>
                              )}
                            </div>
                            
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              {incident.incident_description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* New Request Modal */}
          {showNewRequestForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">New Data Subject Request</h2>
                    <button
                      onClick={() => setShowNewRequestForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <NewRequestForm
                    onSubmit={(data) => createRequestMutation.mutate(data)}
                    isSubmitting={createRequestMutation.isPending}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}