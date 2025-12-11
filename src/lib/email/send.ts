import { resend, FROM_EMAIL } from './resend';
import {
  LeaveRequestSubmittedEmail,
  LeaveRequestPendingApprovalEmail,
  LeaveRequestApprovedEmail,
  LeaveRequestRejectedEmail,
  WelcomeEmail,
} from './templates';
import { render } from '@react-email/render';

interface LeaveRequestEmailData {
  employeeName: string;
  employeeEmail: string;
  managerName?: string;
  managerEmail?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  approverName?: string;
  rejectionReason?: string;
}

/**
 * Send email when employee submits a leave request
 */
export async function sendLeaveRequestSubmitted(data: LeaveRequestEmailData) {
  try {
    const emailHtml = await render(LeaveRequestSubmittedEmail({
      name: data.employeeName,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
    }));

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.employeeEmail],
      subject: 'Leave Request Submitted - Pending Approval',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending leave request submitted email:', error);
      return { success: false, error };
    }

    console.log('✓ Leave request submitted email sent:', result?.id);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send leave request submitted email:', error);
    return { success: false, error };
  }
}

/**
 * Send email to manager/HR when leave request needs approval
 */
export async function sendLeaveRequestPendingApproval(data: LeaveRequestEmailData) {
  if (!data.managerEmail || !data.managerName) {
    console.warn('Manager email or name not provided, skipping approval email');
    return { success: false, error: 'Manager details not provided' };
  }

  try {
    const emailHtml = await render(LeaveRequestPendingApprovalEmail({
      managerName: data.managerName,
      employeeName: data.employeeName,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason || 'No reason provided',
    }));

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.managerEmail],
      subject: `New Leave Request from ${data.employeeName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending pending approval email:', error);
      return { success: false, error };
    }

    console.log('✓ Pending approval email sent to manager:', result?.id);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send pending approval email:', error);
    return { success: false, error };
  }
}

/**
 * Send email when leave request is approved
 */
export async function sendLeaveRequestApproved(data: LeaveRequestEmailData) {
  if (!data.approverName) {
    console.warn('Approver name not provided');
    return { success: false, error: 'Approver name not provided' };
  }

  try {
    const emailHtml = await render(LeaveRequestApprovedEmail({
      name: data.employeeName,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      approverName: data.approverName,
    }));

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.employeeEmail],
      subject: '✓ Your Leave Request Has Been Approved',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending approval email:', error);
      return { success: false, error };
    }

    console.log('✓ Leave request approved email sent:', result?.id);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send approval email:', error);
    return { success: false, error };
  }
}

/**
 * Send email when leave request is rejected
 */
export async function sendLeaveRequestRejected(data: LeaveRequestEmailData) {
  if (!data.approverName) {
    console.warn('Approver name not provided');
    return { success: false, error: 'Approver name not provided' };
  }

  try {
    const emailHtml = await render(LeaveRequestRejectedEmail({
      name: data.employeeName,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      approverName: data.approverName,
      rejectionReason: data.rejectionReason,
    }));

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.employeeEmail],
      subject: 'Leave Request Update',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending rejection email:', error);
      return { success: false, error };
    }

    console.log('✓ Leave request rejection email sent:', result?.id);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(name: string, email: string) {
  try {
    const emailHtml = await render(WelcomeEmail({ name }));

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Welcome to LeaveHub! 🎉',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('✓ Welcome email sent:', result?.id);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(to: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'LeaveHub Email Test',
      html: '<h1>Email Configuration Successful!</h1><p>Your Resend integration is working correctly.</p>',
    });

    if (error) {
      console.error('Error sending test email:', error);
      return { success: false, error };
    }

    console.log('✓ Test email sent:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return { success: false, error };
  }
}
