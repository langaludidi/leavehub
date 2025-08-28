import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../components/Toast';
import { reportGenerator, ReportConfig } from '../../lib/reportGenerator';
import {
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  reportType: ReportConfig['reportType'];
  defaultFilters?: Partial<ReportConfig['filters']>;
  color: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'leave_balances',
    name: 'Leave Balances Report',
    description: 'Current leave balances for all employees with accrual and usage details',
    icon: ChartBarIcon,
    reportType: 'leave_balances',
    color: 'blue'
  },
  {
    id: 'leave_requests',
    name: 'Leave Requests Report', 
    description: 'Detailed report of all leave requests with approval status and timelines',
    icon: CalendarDaysIcon,
    reportType: 'leave_requests',
    color: 'green'
  },
  {
    id: 'employee_summary',
    name: 'Employee Summary Report',
    description: 'Comprehensive overview of employee leave usage and current status',
    icon: UsersIcon,
    reportType: 'employee_summary',
    color: 'purple'
  },
  {
    id: 'audit_trail',
    name: 'Audit Trail Report',
    description: 'Security and compliance audit log with all system activities',
    icon: ShieldCheckIcon,
    reportType: 'audit_log',
    color: 'orange'
  },
  {
    id: 'usage_stats',
    name: 'Usage Statistics Report',
    description: 'System usage statistics for billing and performance monitoring',
    icon: DocumentChartBarIcon,
    reportType: 'usage_statistics',
    color: 'indigo'
  }
];

const DATE_PRESETS = [
  { label: 'This Month', start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
  { label: 'Last Month', start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) },
  { label: 'This Year', start: startOfYear(new Date()), end: endOfYear(new Date()) },
  { label: 'Last Year', start: startOfYear(subMonths(new Date(), 12)), end: endOfYear(subMonths(new Date(), 12)) }
];

export default function ReportsCenter() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    format: 'excel',
    includeBranding: true,
    dateRange: {
      start: startOfYear(new Date()).toISOString().split('T')[0],
      end: endOfYear(new Date()).toISOString().split('T')[0]
    }
  });
  const toast = useToast();

  const generateMutation = useMutation({
    mutationFn: async (reportConfig: ReportConfig) => {
      const blob = await reportGenerator.generateReport(reportConfig);
      const filename = `${reportConfig.reportType}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.${reportConfig.format === 'excel' ? 'xlsx' : 'pdf'}`;
      reportGenerator.downloadReport(blob, filename);
      return { filename, size: blob.size };
    },
    onSuccess: ({ filename, size }) => {
      toast(`Report "${filename}" generated successfully (${(size / 1024).toFixed(1)} KB)`, 'success');
    },
    onError: (error: Error) => {
      toast(`Failed to generate report: ${error.message}`, 'error');
    }
  });

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    // Get organization ID (in real app, this would come from auth context)
    const orgId = 'current-org-id'; // TODO: Replace with actual org ID

    const reportConfig: ReportConfig = {
      organizationId: orgId,
      reportType: selectedTemplate.reportType,
      dateRange: config.dateRange!,
      format: config.format!,
      includeBranding: config.includeBranding,
      customTitle: config.customTitle,
      filters: config.filters
    };

    generateMutation.mutate(reportConfig);
  };

  const quickGenerate = async (template: ReportTemplate, format: 'excel' | 'pdf') => {
    const orgId = 'current-org-id'; // TODO: Replace with actual org ID
    
    try {
      const blob = await reportGenerator.generateQuickReport(orgId, template.reportType, format);
      const filename = `${template.reportType}_quick_${format}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      reportGenerator.downloadReport(blob, filename);
      toast(`Quick ${format.toUpperCase()} report generated!`, 'success');
    } catch (error) {
      toast(`Failed to generate quick report: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-950 dark:to-slate-900">
      <div className="container py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Reports Center</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generate comprehensive reports with professional branding in Excel and PDF formats
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Templates */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {REPORT_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate?.id === template.id;
                  
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`card cursor-pointer transition-all ${
                        isSelected 
                          ? `border-${template.color}-500 ring-2 ring-${template.color}-200 dark:ring-${template.color}-800` 
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="card-body">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 bg-${template.color}-100 dark:bg-${template.color}-900/20 rounded-lg`}>
                            <Icon className={`w-6 h-6 text-${template.color}-600 dark:text-${template.color}-400`} />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {template.description}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  quickGenerate(template, 'excel');
                                }}
                                className="text-xs px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                              >
                                Quick Excel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  quickGenerate(template, 'pdf');
                                }}
                                className="text-xs px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                              >
                                Quick PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configuration Panel */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
              
              {selectedTemplate ? (
                <div className="card">
                  <div className="card-body space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Selected Report</h3>
                      <div className={`flex items-center gap-3 p-3 bg-${selectedTemplate.color}-50 dark:bg-${selectedTemplate.color}-900/10 rounded-lg`}>
                        <selectedTemplate.icon className={`w-5 h-5 text-${selectedTemplate.color}-600 dark:text-${selectedTemplate.color}-400`} />
                        <span className="font-medium">{selectedTemplate.name}</span>
                      </div>
                    </div>

                    <div>
                      <label className="label">Custom Title (Optional)</label>
                      <input
                        type="text"
                        value={config.customTitle || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, customTitle: e.target.value }))}
                        className="input"
                        placeholder="Enter custom report title..."
                      />
                    </div>

                    <div>
                      <label className="label">Date Range</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="date"
                          value={config.dateRange?.start || ''}
                          onChange={(e) => setConfig(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange!, start: e.target.value } 
                          }))}
                          className="input"
                        />
                        <input
                          type="date"
                          value={config.dateRange?.end || ''}
                          onChange={(e) => setConfig(prev => ({ 
                            ...prev, 
                            dateRange: { ...prev.dateRange!, end: e.target.value } 
                          }))}
                          className="input"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1">
                        {DATE_PRESETS.map(preset => (
                          <button
                            key={preset.label}
                            onClick={() => setConfig(prev => ({
                              ...prev,
                              dateRange: {
                                start: preset.start.toISOString().split('T')[0],
                                end: preset.end.toISOString().split('T')[0]
                              }
                            }))}
                            className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label">Output Format</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setConfig(prev => ({ ...prev, format: 'excel' }))}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            config.format === 'excel'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <DocumentTextIcon className="w-8 h-8 mx-auto mb-2" />
                          <div className="font-medium">Excel</div>
                          <div className="text-xs text-gray-500">Spreadsheet format</div>
                        </button>
                        <button
                          onClick={() => setConfig(prev => ({ ...prev, format: 'pdf' }))}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            config.format === 'pdf'
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <DocumentArrowDownIcon className="w-8 h-8 mx-auto mb-2" />
                          <div className="font-medium">PDF</div>
                          <div className="text-xs text-gray-500">Document format</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.includeBranding}
                          onChange={(e) => setConfig(prev => ({ ...prev, includeBranding: e.target.checked }))}
                          className="checkbox"
                        />
                        <span className="text-sm">Include LeaveHub branding</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Add professional LeaveHub header and footer to the report
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateReport}
                      disabled={generateMutation.isPending}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <DocumentArrowDownIcon className="w-4 h-4" />
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Select a Report Template
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a report template from the left to configure and generate
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reports Section */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {REPORT_TEMPLATES.slice(0, 3).map((template) => {
                const Icon = template.icon;
                return (
                  <div key={`quick-${template.id}`} className="card">
                    <div className="card-body">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 bg-${template.color}-100 dark:bg-${template.color}-900/20 rounded-lg`}>
                          <Icon className={`w-5 h-5 text-${template.color}-600 dark:text-${template.color}-400`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">This year's data</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => quickGenerate(template, 'excel')}
                          className="btn-secondary text-sm"
                        >
                          📊 Excel
                        </button>
                        <button
                          onClick={() => quickGenerate(template, 'pdf')}
                          className="btn-secondary text-sm"
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}