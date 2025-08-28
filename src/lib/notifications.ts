// Email notification system for LeaveHub
import { supabase } from './supabase';

export interface EmailNotification {
  id?: string;
  to: string;
  from?: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_id?: string;
  variables?: Record<string, any>;
  scheduled_at?: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  notification_type: NotificationType;
  related_entity_id?: string;
  related_entity_type?: 'leave_request' | 'user' | 'organization';
  retry_count?: number;
  error_message?: string;
  created_at?: string;
}

export type NotificationType = 
  | 'leave_request_submitted'
  | 'leave_request_approved'
  | 'leave_request_denied'
  | 'leave_request_cancelled'
  | 'leave_reminder'
  | 'manager_approval_required'
  | 'balance_low_warning'
  | 'policy_update'
  | 'system_maintenance'
  | 'welcome_employee'
  | 'welcome_manager'
  | 'password_reset'
  | 'account_locked';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject_template: string;
  html_template: string;
  text_template?: string;
  variables: string[];
  active: boolean;
  org_specific: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  leave_request_updates: boolean;
  approval_reminders: boolean;
  balance_warnings: boolean;
  policy_updates: boolean;
  digest_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
}

// Email template renderer
export class EmailTemplateRenderer {
  static render(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  static renderSubject(template: string, variables: Record<string, any>): string {
    return this.render(template, variables);
  }

  static renderHtml(template: string, variables: Record<string, any>): string {
    return this.render(template, variables);
  }

  static renderText(template: string, variables: Record<string, any>): string {
    return this.render(template, variables);
  }
}

// Notification queue manager
export class NotificationQueue {
  static async addNotification(notification: Omit<EmailNotification, 'id' | 'created_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .insert([{
          ...notification,
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to queue notification:', error);
      return null;
    }
  }

  static async markAsSent(notificationId: string): Promise<void> {
    await supabase
      .from('email_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notificationId);
  }

  static async markAsFailed(notificationId: string, errorMessage: string, retryCount: number = 0): Promise<void> {
    await supabase
      .from('email_notifications')
      .update({
        status: 'failed',
        error_message: errorMessage,
        retry_count: retryCount
      })
      .eq('id', notificationId);
  }

  static async getPendingNotifications(limit: number = 50): Promise<EmailNotification[]> {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .in('status', ['pending', 'scheduled'])
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async scheduleNotification(
    notification: Omit<EmailNotification, 'id' | 'created_at'>,
    scheduledAt: Date
  ): Promise<string | null> {
    return this.addNotification({
      ...notification,
      status: 'scheduled',
      scheduled_at: scheduledAt.toISOString()
    });
  }
}

// Pre-built notification creators
export class NotificationCreator {
  static async createLeaveRequestNotification(
    type: 'submitted' | 'approved' | 'denied' | 'cancelled',
    leaveRequestId: string,
    employeeEmail: string,
    managerEmail?: string
  ): Promise<void> {
    // Get leave request details
    const { data: request } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles!inner (
          full_name,
          email
        )
      `)
      .eq('id', leaveRequestId)
      .single();

    if (!request) return;

    const employeeName = request.profiles.full_name || request.profiles.email;
    const startDate = new Date(request.start_date).toLocaleDateString();
    const endDate = new Date(request.end_date).toLocaleDateString();
    
    const variables = {
      employee_name: employeeName,
      leave_type: request.leave_type,
      start_date: startDate,
      end_date: endDate,
      total_days: request.total_days,
      reason: request.reason || 'Not specified',
      request_id: request.id,
      company_name: 'Your Organization'
    };

    // Notification to employee
    const employeeNotification: Omit<EmailNotification, 'id' | 'created_at'> = {
      to: employeeEmail,
      subject: `Leave Request ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      html_content: generateLeaveNotificationHTML(type, variables, 'employee'),
      text_content: generateLeaveNotificationText(type, variables, 'employee'),
      status: 'pending',
      notification_type: `leave_request_${type}` as NotificationType,
      related_entity_id: leaveRequestId,
      related_entity_type: 'leave_request'
    };

    await NotificationQueue.addNotification(employeeNotification);

    // Notification to manager (for submissions and updates)
    if (managerEmail && (type === 'submitted' || type === 'cancelled')) {
      const managerNotification: Omit<EmailNotification, 'id' | 'created_at'> = {
        to: managerEmail,
        subject: type === 'submitted' 
          ? 'New Leave Request Requires Approval'
          : `Leave Request ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        html_content: generateLeaveNotificationHTML(type, variables, 'manager'),
        text_content: generateLeaveNotificationText(type, variables, 'manager'),
        status: 'pending',
        notification_type: type === 'submitted' ? 'manager_approval_required' : `leave_request_${type}` as NotificationType,
        related_entity_id: leaveRequestId,
        related_entity_type: 'leave_request'
      };

      await NotificationQueue.addNotification(managerNotification);
    }
  }

  static async createReminderNotification(
    type: 'leave_starting_soon' | 'balance_low' | 'policy_update',
    userEmail: string,
    variables: Record<string, any>
  ): Promise<void> {
    const notification: Omit<EmailNotification, 'id' | 'created_at'> = {
      to: userEmail,
      subject: getReminderSubject(type, variables),
      html_content: generateReminderHTML(type, variables),
      text_content: generateReminderText(type, variables),
      status: 'pending',
      notification_type: 'leave_reminder',
      variables
    };

    await NotificationQueue.addNotification(notification);
  }

  static async createWelcomeNotification(
    userEmail: string,
    userName: string,
    role: 'employee' | 'manager' | 'admin',
    organizationName: string
  ): Promise<void> {
    const variables = {
      user_name: userName,
      organization_name: organizationName,
      role: role,
      login_url: `${window.location.origin}/sign-in`
    };

    const notification: Omit<EmailNotification, 'id' | 'created_at'> = {
      to: userEmail,
      subject: `Welcome to ${organizationName} LeaveHub`,
      html_content: generateWelcomeHTML(role, variables),
      text_content: generateWelcomeText(role, variables),
      status: 'pending',
      notification_type: role === 'employee' ? 'welcome_employee' : 'welcome_manager',
      variables
    };

    await NotificationQueue.addNotification(notification);
  }
}

// Email template generators
function generateLeaveNotificationHTML(
  type: string,
  variables: Record<string, any>,
  recipient: 'employee' | 'manager'
): string {
  const baseStyle = `
    <style>
      .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background: #f8fafc; }
      .card { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #14b8a6; }
      .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      .button { display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
  `;

  const content = recipient === 'employee' 
    ? generateEmployeeNotificationContent(type, variables)
    : generateManagerNotificationContent(type, variables);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Leave Request ${type}</title>
      ${baseStyle}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🏖️ LeaveHub</h1>
          <h2>Leave Request ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>This is an automated message from LeaveHub.</p>
          <p>© ${new Date().getFullYear()} ${variables.company_name}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmployeeNotificationContent(type: string, variables: Record<string, any>): string {
  const messages = {
    submitted: `
      <div class="card">
        <h3>✅ Your leave request has been submitted!</h3>
        <p>Hi ${variables.employee_name},</p>
        <p>Your ${variables.leave_type} leave request has been successfully submitted and is now pending approval.</p>
        <ul>
          <li><strong>Leave Type:</strong> ${variables.leave_type}</li>
          <li><strong>Dates:</strong> ${variables.start_date} - ${variables.end_date}</li>
          <li><strong>Total Days:</strong> ${variables.total_days}</li>
          <li><strong>Reason:</strong> ${variables.reason}</li>
        </ul>
        <p>You'll receive another notification once your request is reviewed.</p>
      </div>
    `,
    approved: `
      <div class="card">
        <h3>🎉 Your leave request has been approved!</h3>
        <p>Hi ${variables.employee_name},</p>
        <p>Great news! Your ${variables.leave_type} leave request has been approved.</p>
        <ul>
          <li><strong>Leave Type:</strong> ${variables.leave_type}</li>
          <li><strong>Dates:</strong> ${variables.start_date} - ${variables.end_date}</li>
          <li><strong>Total Days:</strong> ${variables.total_days}</li>
        </ul>
        <p>Your leave has been added to your calendar (if calendar sync is enabled).</p>
        <p>Enjoy your time off!</p>
      </div>
    `,
    denied: `
      <div class="card">
        <h3>❌ Your leave request was not approved</h3>
        <p>Hi ${variables.employee_name},</p>
        <p>Unfortunately, your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} was not approved.</p>
        <p>Please contact your manager to discuss alternative dates or arrangements.</p>
        <a href="${variables.login_url}" class="button">View Request Details</a>
      </div>
    `,
    cancelled: `
      <div class="card">
        <h3>🔄 Leave request cancelled</h3>
        <p>Hi ${variables.employee_name},</p>
        <p>Your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} has been cancelled.</p>
        <p>If this was not intentional, please contact your manager.</p>
      </div>
    `
  };

  return messages[type as keyof typeof messages] || '';
}

function generateManagerNotificationContent(type: string, variables: Record<string, any>): string {
  if (type === 'submitted') {
    return `
      <div class="card">
        <h3>📋 New leave request requires your approval</h3>
        <p>Hello,</p>
        <p>${variables.employee_name} has submitted a new leave request that requires your approval.</p>
        <ul>
          <li><strong>Employee:</strong> ${variables.employee_name}</li>
          <li><strong>Leave Type:</strong> ${variables.leave_type}</li>
          <li><strong>Dates:</strong> ${variables.start_date} - ${variables.end_date}</li>
          <li><strong>Total Days:</strong> ${variables.total_days}</li>
          <li><strong>Reason:</strong> ${variables.reason}</li>
        </ul>
        <a href="${variables.login_url || '#'}" class="button">Review Request</a>
      </div>
    `;
  }

  return `
    <div class="card">
      <h3>📢 Leave request ${type}</h3>
      <p>Hello,</p>
      <p>${variables.employee_name}'s leave request has been ${type}.</p>
      <ul>
        <li><strong>Employee:</strong> ${variables.employee_name}</li>
        <li><strong>Leave Type:</strong> ${variables.leave_type}</li>
        <li><strong>Dates:</strong> ${variables.start_date} - ${variables.end_date}</li>
        <li><strong>Total Days:</strong> ${variables.total_days}</li>
      </ul>
    </div>
  `;
}

function generateLeaveNotificationText(
  type: string,
  variables: Record<string, any>,
  recipient: 'employee' | 'manager'
): string {
  // Simple text version of the HTML emails
  if (recipient === 'employee') {
    switch (type) {
      case 'submitted':
        return `Hi ${variables.employee_name}, your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} (${variables.total_days} days) has been submitted and is pending approval.`;
      case 'approved':
        return `Hi ${variables.employee_name}, your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} has been approved! Enjoy your time off.`;
      case 'denied':
        return `Hi ${variables.employee_name}, your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} was not approved. Please contact your manager for more details.`;
      case 'cancelled':
        return `Hi ${variables.employee_name}, your ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} has been cancelled.`;
    }
  } else {
    if (type === 'submitted') {
      return `${variables.employee_name} has submitted a ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} (${variables.total_days} days) that requires your approval.`;
    }
    return `${variables.employee_name}'s ${variables.leave_type} leave request for ${variables.start_date} - ${variables.end_date} has been ${type}.`;
  }
  
  return '';
}

function generateReminderHTML(type: string, variables: Record<string, any>): string {
  // Implementation for reminder emails
  return `<p>Reminder: ${type}</p>`;
}

function generateReminderText(type: string, variables: Record<string, any>): string {
  return `Reminder: ${type}`;
}

function getReminderSubject(type: string, variables: Record<string, any>): string {
  switch (type) {
    case 'leave_starting_soon':
      return `Reminder: Your leave starts ${variables.start_date}`;
    case 'balance_low':
      return 'Leave Balance Running Low';
    case 'policy_update':
      return 'Leave Policy Update';
    default:
      return 'LeaveHub Reminder';
  }
}

function generateWelcomeHTML(role: string, variables: Record<string, any>): string {
  return `
    <div class="card">
      <h3>Welcome to LeaveHub!</h3>
      <p>Hi ${variables.user_name},</p>
      <p>Welcome to ${variables.organization_name}'s LeaveHub! You've been added as a ${variables.role}.</p>
      <p>You can now log in and start managing your leave requests.</p>
      <a href="${variables.login_url}" class="button">Get Started</a>
    </div>
  `;
}

function generateWelcomeText(role: string, variables: Record<string, any>): string {
  return `Hi ${variables.user_name}, welcome to ${variables.organization_name}'s LeaveHub! You've been added as a ${variables.role}. You can log in at ${variables.login_url}`;
}