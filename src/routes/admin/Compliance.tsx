import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ComplianceOverview {
  audit_logs_count: number;
  recent_reports_count: number;
  pending_privacy_requests: number;
  data_retention_policies: number;
  recent_system_events: number;
  compliance_score: number;
}

interface RecentReport {
  id: string;
  report_type: string;
  title: string;
  generated_at: string;
  status: string;
  file_size: number | null;
  generated_by_email: string;
}

interface SystemEvent {
  id: string;
  event_type: string;
  severity: string;
  user_email: string | null;
  timestamp: string;
  event_data: any;
}

async function fetchComplianceOverview(): Promise<ComplianceOverview> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  if (!userProfile?.organization_id) throw new Error('No organization found');

  // Fetch audit logs count (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { count: auditCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userProfile.organization_id)
    .gte('timestamp', thirtyDaysAgo.toISOString());

  // Fetch recent reports count
  const { count: reportsCount } = await supabase
    .from('compliance_reports')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userProfile.organization_id)
    .gte('generated_at', thirtyDaysAgo.toISOString());

  // Fetch pending privacy requests
  const { count: privacyRequestsCount } = await supabase
    .from('privacy_requests')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userProfile.organization_id)
    .eq('status', 'pending');

  // Fetch data retention policies count
  const { count: retentionPoliciesCount } = await supabase
    .from('data_retention_policies')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userProfile.organization_id)
    .eq('is_active', true);

  // Fetch recent system events count (critical/error severity)
  const { count: systemEventsCount } = await supabase
    .from('system_events')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userProfile.organization_id)
    .in('severity', ['error', 'critical'])
    .gte('timestamp', thirtyDaysAgo.toISOString());

  // Calculate simple compliance score
  let score = 100;
  if ((privacyRequestsCount || 0) > 5) score -= 20;
  if ((systemEventsCount || 0) > 10) score -= 15;
  if ((retentionPoliciesCount || 0) < 3) score -= 10;
  if ((auditCount || 0) === 0) score -= 25;

  return {
    audit_logs_count: auditCount || 0,
    recent_reports_count: reportsCount || 0,
    pending_privacy_requests: privacyRequestsCount || 0,
    data_retention_policies: retentionPoliciesCount || 0,
    recent_system_events: systemEventsCount || 0,
    compliance_score: Math.max(score, 0)
  };
}

async function fetchRecentReports(): Promise<RecentReport[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('compliance_reports')
    .select(`
      id,
      report_type,
      title,
      generated_at,
      status,
      file_size,
      generated_by:user_profiles!compliance_reports_generated_by_fkey(user_profiles.user:auth.users(email))
    `)
    .eq('organization_id', userProfile.organization_id)
    .order('generated_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  
  return (data || []).map(report => ({
    ...report,
    generated_by_email: report.generated_by?.user?.email || 'Unknown'
  }));
}

async function fetchRecentSystemEvents(): Promise<SystemEvent[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.user.id)
    .single();

  const { data, error } = await supabase
    .from('system_events')
    .select(`
      id,
      event_type,
      severity,
      timestamp,
      event_data,
      user:auth.users(email)
    `)
    .eq('organization_id', userProfile.organization_id)
    .in('severity', ['warning', 'error', 'critical'])
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) throw error;
  
  return (data || []).map(event => ({
    ...event,
    user_email: event.user?.email || null
  }));
}

const COMPLIANCE_SECTIONS = [
  {
    title: 'Audit Trail',
    description: 'View and export detailed audit logs of all system activities',
    icon: DocumentTextIcon,
    path: '/admin/compliance/audit-trail',
    color: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Privacy Requests',
    description: 'Manage GDPR and privacy-related data requests',
    icon: ShieldCheckIcon,
    path: '/admin/compliance/privacy-requests',
    color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    title: 'Data Retention',
    description: 'Configure data retention policies and automated cleanup',
    icon: ClockIcon,
    path: '/admin/compliance/data-retention',
    color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    title: 'Reports',
    description: 'Generate and download compliance and usage reports',
    icon: ArrowDownTrayIcon,
    path: '/admin/compliance/reports',
    color: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400'
  }
];

export default function Compliance() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['compliance-overview'],
    queryFn: fetchComplianceOverview
  });

  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['recent-compliance-reports'],
    queryFn: fetchRecentReports
  });

  const { data: systemEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['recent-system-events'],
    queryFn: fetchRecentSystemEvents
  });

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'generating': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'error': return 'text-red-500 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (overviewLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold gradient-text">Compliance & Audit</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Monitor compliance, manage data privacy, and generate audit reports
          </p>
        </div>

        {/* Compliance Score & Overview */}
        {overview && (
          <>
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Compliance Score</h2>
                    <div className={`text-4xl font-bold ${getComplianceScoreColor(overview.compliance_score)}`}>
                      {overview.compliance_score}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {overview.compliance_score >= 90 ? 'Excellent' : 
                       overview.compliance_score >= 70 ? 'Good' : 'Needs Attention'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl">
                      {overview.compliance_score >= 90 ? '✓' : 
                       overview.compliance_score >= 70 ? '!' : '⚠'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Audit Events</p>
                      <div className="text-2xl font-bold">{overview.audit_logs_count}</div>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </div>
                    <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Privacy Requests</p>
                      <div className="text-2xl font-bold">{overview.pending_privacy_requests}</div>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                    <ShieldCheckIcon className={`w-8 h-8 ${overview.pending_privacy_requests > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Retention Policies</p>
                      <div className="text-2xl font-bold">{overview.data_retention_policies}</div>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                    <ClockIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">System Issues</p>
                      <div className="text-2xl font-bold">{overview.recent_system_events}</div>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </div>
                    <ExclamationTriangleIcon className={`w-8 h-8 ${overview.recent_system_events > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Compliance Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMPLIANCE_SECTIONS.map((section) => (
            <div
              key={section.title}
              className={`card bg-gradient-to-br ${section.color} ${section.borderColor} border hover:shadow-lg transition-all duration-200 cursor-pointer`}
              onMouseEnter={() => setActiveSection(section.title)}
              onMouseLeave={() => setActiveSection(null)}
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <section.icon className={`w-8 h-8 ${section.iconColor}`} />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {section.description}
                </p>
                
                <Link
                  to={section.path}
                  className="btn-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm"
                >
                  Access {section.title}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Reports</h2>
              <Link to="/admin/compliance/reports" className="text-sm text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="card-body">
              {reportsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentReports && recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">{report.title}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(report.generated_at), 'MMM d, yyyy')} • {formatFileSize(report.file_size)}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getReportStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No reports generated yet</p>
                </div>
              )}
            </div>
          </div>

          {/* System Events */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent System Events</h2>
              <Link to="/admin/compliance/audit-trail" className="text-sm text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="card-body">
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : systemEvents && systemEvents.length > 0 ? (
                <div className="space-y-3">
                  {systemEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(event.severity).replace('text-', 'bg-')}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{event.event_type.replace('_', ' ').toUpperCase()}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(event.timestamp), 'MMM d, HH:mm')}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {event.user_email || 'System'} • {event.severity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-400" />
                  <p>No recent issues</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compliance Info */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/30">
          <div className="card-body">
            <div className="flex gap-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Compliance Features
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>• <strong>Audit Trail:</strong> Complete activity logging with tamper-proof records</p>
                  <p>• <strong>GDPR Compliance:</strong> Data subject rights management and automated responses</p>
                  <p>• <strong>Data Retention:</strong> Automated policy enforcement and secure data deletion</p>
                  <p>• <strong>Reporting:</strong> Customizable compliance reports with export capabilities</p>
                  <p>• <strong>System Monitoring:</strong> Real-time security event tracking and alerting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}