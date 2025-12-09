import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
// Use a placeholder if not configured to prevent module load errors
const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');

interface LeaveRequestNotificationData {
  employeeName: string;
  employeeEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  reason: string;
  requestId: string;
  managerEmail: string;
  managerName?: string;
}

/**
 * Send email notification to manager when a new leave request is submitted
 */
export async function sendLeaveRequestNotification(data: LeaveRequestNotificationData) {
  // Skip if no Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Leave Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0D9488; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Leave Request</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${data.managerName || 'Manager'},
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${data.employeeName}</strong> has submitted a new leave request that requires your approval.
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #0D9488; font-size: 18px;">Request Details</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Employee:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.employeeName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Leave Type:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.leaveType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Start Date:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDate(data.startDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>End Date:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDate(data.endDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Duration:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.workingDays} working day${data.workingDays !== 1 ? 's' : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Reason:</strong></td>
                  <td style="padding: 10px 0;">${data.reason}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/manager/requests/${data.requestId}"
                 style="background-color: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review Request
              </a>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Please review and approve or reject this request at your earliest convenience.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated notification from LeaveHub<br>
              © ${new Date().getFullYear()} LeaveHub. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LeaveHub <onboarding@resend.dev>',
      to: [data.managerEmail],
      subject: `New Leave Request from ${data.employeeName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', emailData);
    return { success: true, data: emailData };

  } catch (error) {
    console.error('Error in sendLeaveRequestNotification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send email notification to employee when their leave request is approved/rejected
 */
export async function sendLeaveRequestStatusNotification(
  employeeEmail: string,
  employeeName: string,
  leaveType: string,
  status: 'approved' | 'rejected',
  managerName: string,
  startDate: string,
  endDate: string,
  comments?: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const statusColor = status === 'approved' ? '#10B981' : '#EF4444';
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Leave Request ${statusText}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${statusColor}; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Leave Request ${statusText}</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${employeeName},
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Your <strong>${leaveType}</strong> request has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong> by ${managerName}.
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Leave Period:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}</p>
              ${comments ? `<p><strong>Manager's Comments:</strong><br>${comments}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                 style="background-color: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated notification from LeaveHub<br>
              © ${new Date().getFullYear()} LeaveHub. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LeaveHub <onboarding@resend.dev>',
      to: [employeeEmail],
      subject: `Leave Request ${statusText}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending status notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: emailData };

  } catch (error) {
    console.error('Error in sendLeaveRequestStatusNotification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
