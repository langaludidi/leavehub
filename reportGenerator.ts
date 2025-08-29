import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from './supabase';

// Extend jsPDF interface for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportConfig {
  organizationId: string;
  reportType: 'leave_balances' | 'leave_requests' | 'audit_log' | 'employee_summary' | 'usage_statistics';
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    employeeIds?: string[];
    leaveTypes?: string[];
    departments?: string[];
    status?: string[];
  };
  format: 'excel' | 'pdf';
  includeBranding?: boolean;
  customTitle?: string;
}

export interface ReportData {
  title: string;
  subtitle: string;
  generatedAt: string;
  organizationName: string;
  data: any[];
  summary?: Record<string, any>;
  metadata: Record<string, any>;
}

export class ReportGenerator {
  private static instance: ReportGenerator;

  private constructor() {}

  static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  async generateReport(config: ReportConfig): Promise<Blob> {
    const reportData = await this.fetchReportData(config);
    
    if (config.format === 'excel') {
      return this.generateExcelReport(reportData, config);
    } else {
      return this.generatePDFReport(reportData, config);
    }
  }

  private async fetchReportData(config: ReportConfig): Promise<ReportData> {
    const { data: organization } = await supabase
      .from('organizations')
      .select('name, branding')
      .eq('id', config.organizationId)
      .single();

    const organizationName = organization?.name || 'Organization';

    switch (config.reportType) {
      case 'leave_balances':
        return this.fetchLeaveBalancesData(config, organizationName);
      case 'leave_requests':
        return this.fetchLeaveRequestsData(config, organizationName);
      case 'audit_log':
        return this.fetchAuditLogData(config, organizationName);
      case 'employee_summary':
        return this.fetchEmployeeSummaryData(config, organizationName);
      case 'usage_statistics':
        return this.fetchUsageStatisticsData(config, organizationName);
      default:
        throw new Error(`Unsupported report type: ${config.reportType}`);
    }
  }

  private async fetchLeaveBalancesData(config: ReportConfig, organizationName: string): Promise<ReportData> {
    let query = supabase
      .from('user_profiles')
      .select(`
        user_id,
        email,
        first_name,
        last_name,
        department,
        user:auth.users(email),
        leave_balances(
          leave_type_code,
          balance,
          accrued_this_year,
          used_this_year,
          carried_over,
          expires_at,
          last_updated
        )
      `)
      .eq('organization_id', config.organizationId);

    if (config.filters?.employeeIds?.length) {
      query = query.in('user_id', config.filters.employeeIds);
    }

    if (config.filters?.departments?.length) {
      query = query.in('department', config.filters.departments);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform data for reporting
    const reportRows = [];
    let totalBalance = 0;
    let totalAccrued = 0;
    let totalUsed = 0;

    for (const employee of data || []) {
      for (const balance of employee.leave_balances || []) {
        if (config.filters?.leaveTypes?.length && 
            !config.filters.leaveTypes.includes(balance.leave_type_code)) {
          continue;
        }

        reportRows.push({
          'Employee Email': employee.user?.email || employee.email,
          'First Name': employee.first_name,
          'Last Name': employee.last_name,
          'Department': employee.department,
          'Leave Type': balance.leave_type_code,
          'Current Balance': balance.balance,
          'Accrued This Year': balance.accrued_this_year,
          'Used This Year': balance.used_this_year,
          'Carried Over': balance.carried_over,
          'Expires At': balance.expires_at ? format(new Date(balance.expires_at), 'yyyy-MM-dd') : '',
          'Last Updated': format(new Date(balance.last_updated), 'yyyy-MM-dd')
        });

        totalBalance += balance.balance;
        totalAccrued += balance.accrued_this_year;
        totalUsed += balance.used_this_year;
      }
    }

    return {
      title: config.customTitle || 'Leave Balances Report',
      subtitle: `From ${format(new Date(config.dateRange.start), 'MMM dd, yyyy')} to ${format(new Date(config.dateRange.end), 'MMM dd, yyyy')}`,
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      organizationName,
      data: reportRows,
      summary: {
        'Total Employees': new Set(data?.map(e => e.user_id)).size,
        'Total Current Balance': totalBalance.toFixed(1),
        'Total Accrued This Year': totalAccrued.toFixed(1),
        'Total Used This Year': totalUsed.toFixed(1)
      },
      metadata: {
        reportType: 'Leave Balances',
        recordCount: reportRows.length,
        dateGenerated: new Date().toISOString()
      }
    };
  }

  private async fetchLeaveRequestsData(config: ReportConfig, organizationName: string): Promise<ReportData> {
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        user:user_profiles!leave_requests_user_id_fkey(
          first_name,
          last_name,
          department,
          user:auth.users(email)
        ),
        approver:user_profiles!leave_requests_approved_by_fkey(
          first_name,
          last_name,
          user:auth.users(email)
        ),
        leave_type:leave_types!left(name, is_paid)
      `)
      .eq('organization_id', config.organizationId)
      .gte('created_at', config.dateRange.start)
      .lte('created_at', config.dateRange.end)
      .order('created_at', { ascending: false });

    if (config.filters?.employeeIds?.length) {
      query = query.in('user_id', config.filters.employeeIds);
    }

    if (config.filters?.leaveTypes?.length) {
      query = query.in('leave_type', config.filters.leaveTypes);
    }

    if (config.filters?.status?.length) {
      query = query.in('status', config.filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform data for reporting
    const reportRows = (data || []).map(request => ({
      'Request ID': request.id.substring(0, 8),
      'Employee Email': request.user?.user?.email,
      'Employee Name': `${request.user?.first_name} ${request.user?.last_name}`,
      'Department': request.user?.department,
      'Leave Type': request.leave_type?.name || request.leave_type,
      'Start Date': format(new Date(request.start_date), 'yyyy-MM-dd'),
      'End Date': format(new Date(request.end_date), 'yyyy-MM-dd'),
      'Total Days': request.total_days,
      'Status': request.status,
      'Is Paid': request.leave_type?.is_paid ? 'Yes' : 'No',
      'Reason': request.reason || '',
      'Approved By': request.approver ? `${request.approver.first_name} ${request.approver.last_name}` : '',
      'Approved At': request.approved_at ? format(new Date(request.approved_at), 'yyyy-MM-dd HH:mm') : '',
      'Created At': format(new Date(request.created_at), 'yyyy-MM-dd HH:mm')
    }));

    // Calculate summary statistics
    const totalDays = reportRows.reduce((sum, row) => sum + (row['Total Days'] || 0), 0);
    const statusCounts = reportRows.reduce((acc, row) => {
      acc[row.Status] = (acc[row.Status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      title: config.customTitle || 'Leave Requests Report',
      subtitle: `From ${format(new Date(config.dateRange.start), 'MMM dd, yyyy')} to ${format(new Date(config.dateRange.end), 'MMM dd, yyyy')}`,
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      organizationName,
      data: reportRows,
      summary: {
        'Total Requests': reportRows.length,
        'Total Days Requested': totalDays,
        'Approved Requests': statusCounts['approved'] || 0,
        'Pending Requests': statusCounts['pending'] || 0,
        'Rejected Requests': statusCounts['rejected'] || 0
      },
      metadata: {
        reportType: 'Leave Requests',
        recordCount: reportRows.length,
        dateGenerated: new Date().toISOString()
      }
    };
  }

  private async fetchAuditLogData(config: ReportConfig, organizationName: string): Promise<ReportData> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:user_profiles(
          first_name,
          last_name,
          user:auth.users(email)
        )
      `)
      .eq('organization_id', config.organizationId)
      .gte('created_at', config.dateRange.start)
      .lte('created_at', config.dateRange.end)
      .order('created_at', { ascending: false })
      .limit(1000); // Limit for performance

    if (error) throw error;

    const reportRows = (data || []).map(log => ({
      'Timestamp': format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'User Email': log.user?.user?.email || 'System',
      'User Name': log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System',
      'Entity Type': log.entity_type,
      'Entity ID': log.entity_id?.substring(0, 8) || '',
      'Action': log.action,
      'IP Address': log.ip_address || '',
      'User Agent': log.user_agent || '',
      'Changes': JSON.stringify(log.new_values || {})
    }));

    return {
      title: config.customTitle || 'Audit Trail Report',
      subtitle: `From ${format(new Date(config.dateRange.start), 'MMM dd, yyyy')} to ${format(new Date(config.dateRange.end), 'MMM dd, yyyy')}`,
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      organizationName,
      data: reportRows,
      summary: {
        'Total Events': reportRows.length,
        'Unique Users': new Set(reportRows.map(r => r['User Email'])).size,
        'System Events': reportRows.filter(r => r['User Email'] === 'System').length
      },
      metadata: {
        reportType: 'Audit Trail',
        recordCount: reportRows.length,
        dateGenerated: new Date().toISOString()
      }
    };
  }

  private async fetchEmployeeSummaryData(config: ReportConfig, organizationName: string): Promise<ReportData> {
    const { data: employees, error } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        email,
        first_name,
        last_name,
        department,
        role,
        created_at,
        user:auth.users(email, created_at),
        leave_requests(id, status, total_days, created_at),
        leave_balances(leave_type_code, balance, used_this_year)
      `)
      .eq('organization_id', config.organizationId);

    if (error) throw error;

    const reportRows = (employees || []).map(emp => {
      const requests = emp.leave_requests || [];
      const balances = emp.leave_balances || [];
      
      const totalRequests = requests.length;
      const totalDaysUsed = requests
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.total_days, 0);
      
      const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

      return {
        'Employee ID': emp.user_id.substring(0, 8),
        'Email': emp.user?.email || emp.email,
        'First Name': emp.first_name,
        'Last Name': emp.last_name,
        'Department': emp.department,
        'Role': emp.role,
        'Join Date': format(new Date(emp.created_at), 'yyyy-MM-dd'),
        'Total Requests': totalRequests,
        'Days Used This Year': totalDaysUsed,
        'Current Balance': totalBalance.toFixed(1),
        'Last Request': requests.length > 0 
          ? format(new Date(requests[0].created_at), 'yyyy-MM-dd') 
          : 'Never'
      };
    });

    return {
      title: config.customTitle || 'Employee Summary Report',
      subtitle: `As of ${format(new Date(), 'MMM dd, yyyy')}`,
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      organizationName,
      data: reportRows,
      summary: {
        'Total Employees': reportRows.length,
        'Total Days Used': reportRows.reduce((sum, r) => sum + r['Days Used This Year'], 0),
        'Average Days Used': (reportRows.reduce((sum, r) => sum + r['Days Used This Year'], 0) / reportRows.length).toFixed(1),
        'Total Current Balance': reportRows.reduce((sum, r) => sum + parseFloat(r['Current Balance']), 0).toFixed(1)
      },
      metadata: {
        reportType: 'Employee Summary',
        recordCount: reportRows.length,
        dateGenerated: new Date().toISOString()
      }
    };
  }

  private async fetchUsageStatisticsData(config: ReportConfig, organizationName: string): Promise<ReportData> {
    // This would integrate with the trial system usage tracking
    const { data: stats, error } = await supabase
      .from('organization_usage_stats')
      .select('*')
      .eq('organization_id', config.organizationId)
      .gte('date', config.dateRange.start)
      .lte('date', config.dateRange.end)
      .order('date');

    if (error) throw error;

    const reportRows = (stats || []).map(stat => ({
      'Date': format(new Date(stat.date), 'yyyy-MM-dd'),
      'Active Users': stat.active_users || 0,
      'Leave Requests': stat.leave_requests_created || 0,
      'Requests Approved': stat.leave_requests_approved || 0,
      'Documents Uploaded': stat.documents_uploaded || 0,
      'API Calls': stat.api_calls || 0,
      'Storage Used (MB)': ((stat.storage_used_bytes || 0) / (1024 * 1024)).toFixed(2)
    }));

    return {
      title: config.customTitle || 'Usage Statistics Report',
      subtitle: `From ${format(new Date(config.dateRange.start), 'MMM dd, yyyy')} to ${format(new Date(config.dateRange.end), 'MMM dd, yyyy')}`,
      generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      organizationName,
      data: reportRows,
      summary: {
        'Reporting Days': reportRows.length,
        'Peak Active Users': Math.max(...reportRows.map(r => r['Active Users'])),
        'Total Requests': reportRows.reduce((sum, r) => sum + r['Leave Requests'], 0),
        'Total Storage (MB)': reportRows.reduce((sum, r) => sum + parseFloat(r['Storage Used (MB)']), 0).toFixed(2)
      },
      metadata: {
        reportType: 'Usage Statistics',
        recordCount: reportRows.length,
        dateGenerated: new Date().toISOString()
      }
    };
  }

  private generateExcelReport(reportData: ReportData, config: ReportConfig): Blob {
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Report Title', reportData.title],
      ['Organization', reportData.organizationName],
      ['Generated At', reportData.generatedAt],
      ['Report Period', reportData.subtitle],
      [''],
      ...Object.entries(reportData.summary || {})
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create data sheet
    if (reportData.data.length > 0) {
      const dataSheet = XLSX.utils.json_to_sheet(reportData.data);
      
      // Add some basic formatting
      const range = XLSX.utils.decode_range(dataSheet['!ref'] || 'A1');
      
      // Auto-width columns
      const colWidths = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxWidth = 10;
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = dataSheet[cellRef];
          if (cell && cell.v) {
            maxWidth = Math.max(maxWidth, cell.v.toString().length);
          }
        }
        colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
      }
      dataSheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private generatePDFReport(reportData: ReportData, config: ReportConfig): Blob {
    const doc = new jsPDF();
    
    // Add branding header
    if (config.includeBranding) {
      // LeaveHub branding
      doc.setFillColor(16, 185, 129); // Emerald green
      doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('LeaveHub', 20, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Leave Management', 20, 26);
    }

    // Report title and info
    doc.setTextColor(0, 0, 0);
    const startY = config.includeBranding ? 45 : 20;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(reportData.title, 20, startY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Organization: ${reportData.organizationName}`, 20, startY + 10);
    doc.text(`${reportData.subtitle}`, 20, startY + 20);
    doc.text(`Generated: ${reportData.generatedAt}`, 20, startY + 30);

    // Summary section
    let currentY = startY + 50;
    if (reportData.summary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, currentY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      currentY += 10;
      
      Object.entries(reportData.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, currentY);
        currentY += 8;
      });
      
      currentY += 10;
    }

    // Data table
    if (reportData.data.length > 0) {
      const tableColumns = Object.keys(reportData.data[0]);
      const tableRows = reportData.data.map(row => 
        tableColumns.map(col => row[col]?.toString() || '')
      );

      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: currentY,
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: [249, 250, 251] 
        },
        margin: { left: 20, right: 20 }
      });
    }

    // Footer with branding
    if (config.includeBranding) {
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          'Generated by LeaveHub - Professional Leave Management System',
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    }

    return doc.output('blob');
  }

  // Utility method for quick report generation
  async generateQuickReport(
    organizationId: string,
    reportType: ReportConfig['reportType'],
    format: 'excel' | 'pdf' = 'excel'
  ): Promise<Blob> {
    const now = new Date();
    const config: ReportConfig = {
      organizationId,
      reportType,
      dateRange: {
        start: startOfYear(now).toISOString(),
        end: endOfYear(now).toISOString()
      },
      format,
      includeBranding: true
    };

    return this.generateReport(config);
  }

  // Method to download report directly
  downloadReport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportGenerator = ReportGenerator.getInstance();