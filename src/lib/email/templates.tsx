import * as React from 'react';

interface EmailTemplateProps {
  name?: string;
  [key: string]: any;
}

// Base email layout
export const EmailLayout = ({ children }: { children: React.ReactNode }) => (
  <html>
    <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f5f5f5' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f5f5' }}>
        <tr>
          <td align="center" style={{ padding: '40px 20px' }}>
            <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Header */}
              <tr>
                <td style={{ backgroundColor: '#0f766e', padding: '32px', textAlign: 'center' }}>
                  <h1 style={{ margin: 0, color: '#ffffff', fontSize: '28px', fontWeight: 'bold' }}>
                    LeaveHub
                  </h1>
                  <p style={{ margin: '8px 0 0', color: '#ccfbf1', fontSize: '14px' }}>
                    🇿🇦 BCEA-Compliant Leave Management
                  </p>
                </td>
              </tr>
              {/* Content */}
              <tr>
                <td style={{ padding: '40px 32px' }}>
                  {children}
                </td>
              </tr>
              {/* Footer */}
              <tr>
                <td style={{ backgroundColor: '#f9fafb', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6b7280' }}>
                    © {new Date().getFullYear()} LeaveHub. Made for South African Businesses.
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    Visit us at <a href="https://leavehub.co.za" style={{ color: '#0f766e', textDecoration: 'none' }}>leavehub.co.za</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
);

// Leave Request Submitted (for employee)
export const LeaveRequestSubmittedEmail = ({
  name,
  leaveType,
  startDate,
  endDate,
  days
}: EmailTemplateProps) => (
  <EmailLayout>
    <h2 style={{ margin: '0 0 16px', fontSize: '24px', color: '#111827' }}>
      Leave Request Submitted ✓
    </h2>
    <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {name},
    </p>
    <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Your leave request has been successfully submitted and is pending approval.
    </p>
    <table width="100%" cellPadding="12" cellSpacing="0" style={{ backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Leave Type:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {leaveType}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Start Date:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {startDate}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>End Date:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {endDate}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280' }}>
          <strong style={{ color: '#111827' }}>Total Days:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', textAlign: 'right' }}>
          {days} days
        </td>
      </tr>
    </table>
    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
      You'll receive an email notification once your manager or HR has reviewed your request.
    </p>
    <table width="100%" cellPadding="0" cellSpacing="0">
      <tr>
        <td align="center">
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            View Dashboard
          </a>
        </td>
      </tr>
    </table>
  </EmailLayout>
);

// Leave Request Pending Approval (for manager/HR)
export const LeaveRequestPendingApprovalEmail = ({
  managerName,
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  reason
}: EmailTemplateProps) => (
  <EmailLayout>
    <h2 style={{ margin: '0 0 16px', fontSize: '24px', color: '#111827' }}>
      New Leave Request Pending Approval
    </h2>
    <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {managerName},
    </p>
    <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      <strong>{employeeName}</strong> has submitted a new leave request that requires your approval.
    </p>
    <table width="100%" cellPadding="12" cellSpacing="0" style={{ backgroundColor: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td style={{ fontSize: '14px', color: '#78350f' }}>
          ⏰ <strong>Action Required:</strong> Please review and approve or reject this request.
        </td>
      </tr>
    </table>
    <table width="100%" cellPadding="12" cellSpacing="0" style={{ backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Employee:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {employeeName}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Leave Type:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {leaveType}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Period:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {startDate} - {endDate}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Total Days:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {days} days
        </td>
      </tr>
      <tr>
        <td colSpan={2} style={{ fontSize: '14px', color: '#6b7280', paddingTop: '12px' }}>
          <strong style={{ color: '#111827', display: 'block', marginBottom: '8px' }}>Reason:</strong>
          <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
            {reason}
          </div>
        </td>
      </tr>
    </table>
    <table width="100%" cellPadding="0" cellSpacing="0">
      <tr>
        <td align="center">
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/manager/requests`} style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Review Request
          </a>
        </td>
      </tr>
    </table>
  </EmailLayout>
);

// Leave Request Approved
export const LeaveRequestApprovedEmail = ({
  name,
  leaveType,
  startDate,
  endDate,
  days,
  approverName
}: EmailTemplateProps) => (
  <EmailLayout>
    <h2 style={{ margin: '0 0 16px', fontSize: '24px', color: '#059669' }}>
      ✓ Leave Request Approved
    </h2>
    <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {name},
    </p>
    <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Great news! Your leave request has been <strong style={{ color: '#059669' }}>approved</strong> by {approverName}.
    </p>
    <table width="100%" cellPadding="12" cellSpacing="0" style={{ backgroundColor: '#d1fae5', border: '2px solid #059669', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td style={{ fontSize: '14px', color: '#065f46' }}>
          ✓ <strong>Approved:</strong> Your leave has been confirmed. Enjoy your time off!
        </td>
      </tr>
    </table>
    <table width="100%" cellPadding="12" cellSpacing="0" style={{ backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Leave Type:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {leaveType}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Period:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {startDate} - {endDate}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280' }}>
          <strong style={{ color: '#111827' }}>Total Days:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', textAlign: 'right' }}>
          {days} days
        </td>
      </tr>
    </table>
    <table width="100%" cellPadding="0" cellSpacing="0">
      <tr>
        <td align="center">
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar`} style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            View Calendar
          </a>
        </td>
      </tr>
    </table>
  </EmailLayout>
);

// Leave Request Rejected
export const LeaveRequestRejectedEmail = ({
  name,
  leaveType,
  startDate,
  endDate,
  days,
  approverName,
  rejectionReason
}: EmailTemplateProps) => (
  <EmailLayout>
    <h2 style={{ margin: '0 0 16px', fontSize: '24px', color: '#dc2626' }}>
      Leave Request Not Approved
    </h2>
    <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {name},
    </p>
    <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Unfortunately, your leave request could not be approved at this time.
    </p>
    <table width="100%" cellPadding="12" cellSpacing="0" style={{ backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td style={{ fontSize: '14px', color: '#7f1d1d' }}>
          <strong>Status:</strong> Not Approved by {approverName}
        </td>
      </tr>
    </table>
    <table width="100%" cellPadding="12" cellSpacing="0" style={{ backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Leave Type:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {leaveType}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Period:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {startDate} - {endDate}
        </td>
      </tr>
      <tr>
        <td style={{ fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
          <strong style={{ color: '#111827' }}>Total Days:</strong>
        </td>
        <td style={{ fontSize: '14px', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
          {days} days
        </td>
      </tr>
      {rejectionReason && (
        <tr>
          <td colSpan={2} style={{ fontSize: '14px', color: '#6b7280', paddingTop: '12px' }}>
            <strong style={{ color: '#111827', display: 'block', marginBottom: '8px' }}>Reason:</strong>
            <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
              {rejectionReason}
            </div>
          </td>
        </tr>
      )}
    </table>
    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
      Please contact your manager or HR if you have any questions about this decision.
    </p>
    <table width="100%" cellPadding="0" cellSpacing="0">
      <tr>
        <td align="center">
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            View Dashboard
          </a>
        </td>
      </tr>
    </table>
  </EmailLayout>
);

// Welcome Email
export const WelcomeEmail = ({ name }: EmailTemplateProps) => (
  <EmailLayout>
    <h2 style={{ margin: '0 0 16px', fontSize: '24px', color: '#111827' }}>
      Welcome to LeaveHub! 🎉
    </h2>
    <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Hi {name},
    </p>
    <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
      Welcome to LeaveHub - South Africa's BCEA-compliant leave management system!
    </p>
    <table width="100%" cellPadding="16" cellSpacing="0" style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', marginBottom: '24px' }}>
      <tr>
        <td>
          <h3 style={{ margin: '0 0 12px', fontSize: '18px', color: '#0f766e' }}>
            🇿🇦 Made for South African Businesses
          </h3>
          <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#374151', fontSize: '14px', lineHeight: '1.8' }}>
            <li>Fully BCEA compliant</li>
            <li>South African public holidays included</li>
            <li>Local business practices and labor law</li>
            <li>Support for all SA leave types</li>
          </ul>
        </td>
      </tr>
    </table>
    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
      You can now submit leave requests, view your leave balance, and manage your time off all in one place.
    </p>
    <table width="100%" cellPadding="0" cellSpacing="0">
      <tr>
        <td align="center">
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
  </EmailLayout>
);
