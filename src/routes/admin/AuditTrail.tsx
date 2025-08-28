import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  timestamp: string;
  user_email: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  old_values: any;
  new_values: any;
  metadata: any;
}

interface AuditFilters {
  start_date: string;
  end_date: string;
  entity_type: string;
  action: string;
  user_id: string;
  search: string;
}

async function fetchAuditLogs(filters: Partial<AuditFilters>, page: number = 0): Promise<{ logs: AuditLog[], total: number }> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  const pageSize = 50;
  const offset = page * pageSize;

  let query = supabase
    .from('audit_logs')
    .select(`
      id,
      timestamp,
      user:auth.users(email),
      entity_type,
      entity_id,
      action,
      old_values,
      new_values,
      metadata
    `, { count: 'exact' })
    .eq('organization_id', userProfile.organization_id);

  // Apply filters
  if (filters.start_date) {
    query = query.gte('timestamp', filters.start_date);
  }
  if (filters.end_date) {
    query = query.lte('timestamp', filters.end_date);
  }
  if (filters.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  // Apply search
  if (filters.search) {
    query = query.or(`entity_type.ilike.%${filters.search}%,action.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order('timestamp', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  const logs: AuditLog[] = (data || []).map(log => ({
    id: log.id,
    timestamp: log.timestamp,
    user_email: log.user?.email || null,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    action: log.action,
    old_values: log.old_values,
    new_values: log.new_values,
    metadata: log.metadata
  }));

  return { logs, total: count || 0 };
}

async function fetchEntityTypes(): Promise<string[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('entity_type')
    .eq('organization_id', userProfile.organization_id);

  if (error) throw error;

  const uniqueTypes = [...new Set((data || []).map(log => log.entity_type))];
  return uniqueTypes.sort();
}

async function fetchUsers(): Promise<Array<{ id: string; email: string }>> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      user_id,
      user:auth.users(email)
    `)
    .eq('organization_id', userProfile.organization_id);

  if (error) throw error;

  return (data || []).map(profile => ({
    id: profile.user_id,
    email: profile.user?.email || 'Unknown'
  })).sort((a, b) => a.email.localeCompare(b.email));
}

function AuditLogDetail({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const formatJsonDisplay = (obj: any) => {
    if (!obj) return null;
    return JSON.stringify(obj, null, 2);
  };

  const getChangeDescription = () => {
    if (log.action === 'create' && log.new_values) {
      return 'Created new record';
    }
    if (log.action === 'update' && log.old_values && log.new_values) {
      const changes = [];
      const oldObj = log.old_values;
      const newObj = log.new_values;
      
      for (const key in newObj) {
        if (oldObj[key] !== newObj[key]) {
          changes.push(`${key}: ${oldObj[key]} → ${newObj[key]}`);
        }
      }
      return changes.length > 0 ? changes.join(', ') : 'No changes detected';
    }
    if (log.action === 'delete' && log.old_values) {
      return 'Deleted record';
    }
    return log.action;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Audit Log Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-gray-50 dark:bg-gray-700">
              <div className="card-body">
                <h4 className="font-semibold mb-2">Event Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Timestamp:</span> {format(new Date(log.timestamp), 'PPpp')}</div>
                  <div><span className="font-medium">User:</span> {log.user_email || 'System'}</div>
                  <div><span className="font-medium">Action:</span> <span className="capitalize">{log.action}</span></div>
                  <div><span className="font-medium">Entity:</span> {log.entity_type}</div>
                  {log.entity_id && <div><span className="font-medium">Entity ID:</span> {log.entity_id}</div>}
                </div>
              </div>
            </div>

            <div className="card bg-gray-50 dark:bg-gray-700">
              <div className="card-body">
                <h4 className="font-semibold mb-2">Change Summary</h4>
                <div className="text-sm">
                  {getChangeDescription()}
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium">Metadata:</span>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      IP: {log.metadata.ip_address || 'Unknown'} • 
                      Session: {log.metadata.session_id || 'Unknown'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Changes */}
          {(log.old_values || log.new_values) && (
            <div className="space-y-4">
              {log.old_values && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Values</h4>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-xs overflow-x-auto">
                    {formatJsonDisplay(log.old_values)}
                  </pre>
                </div>
              )}
              
              {log.new_values && (
                <div>
                  <h4 className="font-semibold mb-2">New Values</h4>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-xs overflow-x-auto">
                    {formatJsonDisplay(log.new_values)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuditTrail() {
  const [filters, setFilters] = useState<Partial<AuditFilters>>({
    start_date: '',
    end_date: '',
    entity_type: '',
    action: '',
    user_id: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: auditData, isLoading } = useQuery({
    queryKey: ['audit-logs', filters, currentPage],
    queryFn: () => fetchAuditLogs(filters, currentPage)
  });

  const { data: entityTypes } = useQuery({
    queryKey: ['audit-entity-types'],
    queryFn: fetchEntityTypes
  });

  const { data: users } = useQuery({
    queryKey: ['audit-users'],
    queryFn: fetchUsers
  });

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handleExport = async () => {
    try {
      const allData = await fetchAuditLogs(filters, 0);
      const csvContent = [
        ['Timestamp', 'User', 'Entity Type', 'Entity ID', 'Action', 'Changes'],
        ...allData.logs.map(log => [
          format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          log.user_email || 'System',
          log.entity_type,
          log.entity_id || '',
          log.action,
          log.action === 'update' ? 'Data updated' : log.action
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'approve': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'deny': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const totalPages = auditData ? Math.ceil(auditData.total / 50) : 0;

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Audit Trail</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete log of all system activities and changes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={handleExport}
              className="btn-primary flex items-center gap-2"
              disabled={!auditData || auditData.logs.length === 0}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Filter Audit Logs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search logs..."
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Entity Type</label>
                  <select
                    value={filters.entity_type || ''}
                    onChange={(e) => handleFilterChange('entity_type', e.target.value)}
                    className="select"
                  >
                    <option value="">All types</option>
                    {entityTypes?.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Action</label>
                  <select
                    value={filters.action || ''}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="select"
                  >
                    <option value="">All actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="approve">Approve</option>
                    <option value="deny">Deny</option>
                  </select>
                </div>
                <div>
                  <label className="label">User</label>
                  <select
                    value={filters.user_id || ''}
                    onChange={(e) => handleFilterChange('user_id', e.target.value)}
                    className="select"
                  >
                    <option value="">All users</option>
                    {users?.map(user => (
                      <option key={user.id} value={user.id}>{user.email}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {auditData && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {auditData.logs.length} of {auditData.total} audit entries
            </div>
            <div>
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="card">
          <div className="card-body p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : auditData && auditData.logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {auditData.logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span>{log.user_email || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                            <span className="capitalize">{log.entity_type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {log.entity_id ? `ID: ${log.entity_id.substring(0, 8)}...` : 'No entity ID'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                            title="View details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No audit logs found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {Object.values(filters).some(f => f) ? 
                    'Try adjusting your filters to see more results.' : 
                    'Audit logs will appear here as activities occur in the system.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedLog && (
          <AuditLogDetail
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
    </div>
  );
}