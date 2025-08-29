import { supabase } from './supabase';

export interface TrialEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface TrialEmailData {
  org_name: string;
  trial_end_date?: string;
  days_remaining?: number;
  downgraded_to?: string;
  usage_stats?: {
    active_employees: number;
    leave_requests: number;
    reports_generated: number;
  };
}

export class TrialEmailService {
  private static getTrialEmailTemplates(): Record<string, (data: TrialEmailData) => TrialEmailTemplate> {
    return {
      welcome: (data: TrialEmailData) => ({
        subject: `🎉 Welcome to LeaveHub! Your 14-day Pro trial has started`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #00C2CB 0%, #00A8B5 100%); color: white; padding: 30px 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { display: inline-block; background: #00C2CB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .highlight { background: #f0fdff; border-left: 4px solid #00C2CB; padding: 15px; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏖️ Welcome to LeaveHub!</h1>
              <p>Your 14-day Pro trial has started for ${data.org_name}</p>
            </div>
            
            <div class="content">
              <h2>🚀 You're all set up!</h2>
              <p>Congratulations! Your organization is now ready to streamline leave management with LeaveHub's Pro features.</p>
              
              <div class="highlight">
                <h3>✨ What's included in your Pro trial:</h3>
                <ul>
                  <li><strong>Unlimited employees</strong> - no restrictions</li>
                  <li><strong>Advanced reporting</strong> - Excel & PDF exports with branding</li>
                  <li><strong>Document management</strong> - secure file uploads & storage</li>
                  <li><strong>Compliance tools</strong> - POPIA & BCEA compliance features</li>
                  <li><strong>Audit trails</strong> - complete activity logging</li>
                  <li><strong>Custom workflows</strong> - escalations & approvals</li>
                </ul>
              </div>
              
              <h3>🎯 Get started in 3 steps:</h3>
              <ol>
                <li><strong>Invite your team</strong> - Add employees and managers</li>
                <li><strong>Set up policies</strong> - Configure your leave types and rules</li>
                <li><strong>Process requests</strong> - Start managing leave efficiently</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="https://leavehub.co.za/admin" class="button">Access Your Dashboard</a>
              </div>
              
              <p><strong>Trial ends:</strong> ${data.trial_end_date ? new Date(data.trial_end_date).toLocaleDateString('en-ZA') : 'in 14 days'}</p>
              
              <p>Need help getting started? Reply to this email or check our <a href="https://leavehub.co.za/help">Getting Started Guide</a>.</p>
              
              <p>Welcome aboard!<br>The LeaveHub Team 🇿🇦</p>
            </div>
            
            <div class="footer">
              <p>LeaveHub - South African Leave Management<br>
              Built for BCEA compliance & POPIA privacy</p>
            </div>
          </body>
          </html>
        `,
        textContent: `
Welcome to LeaveHub! 🎉

Your 14-day Pro trial has started for ${data.org_name}.

What's included in your Pro trial:
• Unlimited employees - no restrictions
• Advanced reporting - Excel & PDF exports with branding  
• Document management - secure file uploads & storage
• Compliance tools - POPIA & BCEA compliance features
• Audit trails - complete activity logging
• Custom workflows - escalations & approvals

Get started in 3 steps:
1. Invite your team - Add employees and managers
2. Set up policies - Configure your leave types and rules  
3. Process requests - Start managing leave efficiently

Access your dashboard: https://leavehub.co.za/admin

Trial ends: ${data.trial_end_date ? new Date(data.trial_end_date).toLocaleDateString('en-ZA') : 'in 14 days'}

Need help? Reply to this email or visit https://leavehub.co.za/help

Welcome aboard!
The LeaveHub Team 🇿🇦
        `
      }),

      reminder_7: (data: TrialEmailData) => ({
        subject: `⏰ 7 days left in your LeaveHub Pro trial - ${data.org_name}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #00C2CB 0%, #00A8B5 100%); color: white; padding: 30px 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { display: inline-block; background: #00C2CB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .stats { background: #f0fdff; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .stat-item { display: inline-block; margin: 10px 20px 10px 0; }
              .stat-number { font-size: 24px; font-weight: bold; color: #00C2CB; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>⏰ One week left in your trial!</h1>
              <p>Your LeaveHub Pro trial ends in 7 days</p>
            </div>
            
            <div class="content">
              <h2>Hi ${data.org_name} team! 👋</h2>
              <p>You're halfway through your 14-day Pro trial. Here's how you've been using LeaveHub so far:</p>
              
              ${data.usage_stats ? `
              <div class="stats">
                <h3>📊 Your Trial Usage</h3>
                <div class="stat-item">
                  <div class="stat-number">${data.usage_stats.active_employees}</div>
                  <div>Active Employees</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">${data.usage_stats.leave_requests}</div>
                  <div>Leave Requests</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">${data.usage_stats.reports_generated}</div>
                  <div>Reports Generated</div>
                </div>
              </div>
              ` : ''}
              
              <h3>🎯 Make the most of your remaining time:</h3>
              <ul>
                <li>📋 <strong>Test advanced reporting</strong> - Export branded Excel & PDF reports</li>
                <li>📄 <strong>Upload documents</strong> - Try medical certificates & supporting docs</li>
                <li>⚖️ <strong>Check compliance</strong> - Review your BCEA & POPIA compliance score</li>
                <li>🔄 <strong>Set up escalations</strong> - Configure automatic approval workflows</li>
              </ul>
              
              <p><strong>⚡ Ready to continue after your trial?</strong></p>
              <p>Upgrade now to keep all your data and Pro features. Starting from just R149/month.</p>
              
              <div style="text-align: center;">
                <a href="https://leavehub.co.za/billing/upgrade" class="button">Upgrade to Pro</a>
              </div>
              
              <p><strong>Trial ends:</strong> ${data.trial_end_date ? new Date(data.trial_end_date).toLocaleDateString('en-ZA') : 'in 7 days'}</p>
              
              <p>Questions about upgrading? Just reply to this email!</p>
              
              <p>Cheers,<br>The LeaveHub Team 🇿🇦</p>
            </div>
            
            <div class="footer">
              <p>LeaveHub - South African Leave Management</p>
            </div>
          </body>
          </html>
        `,
        textContent: `
⏰ One week left in your LeaveHub Pro trial!

Hi ${data.org_name} team! 

You're halfway through your 14-day Pro trial.

${data.usage_stats ? `
Your Trial Usage:
• ${data.usage_stats.active_employees} Active Employees
• ${data.usage_stats.leave_requests} Leave Requests  
• ${data.usage_stats.reports_generated} Reports Generated
` : ''}

Make the most of your remaining time:
• Test advanced reporting - Export branded Excel & PDF reports
• Upload documents - Try medical certificates & supporting docs
• Check compliance - Review your BCEA & POPIA compliance score
• Set up escalations - Configure automatic approval workflows

Ready to continue after your trial?
Upgrade now to keep all your data and Pro features. Starting from just R149/month.

Upgrade: https://leavehub.co.za/billing/upgrade

Trial ends: ${data.trial_end_date ? new Date(data.trial_end_date).toLocaleDateString('en-ZA') : 'in 7 days'}

Questions? Just reply to this email!

The LeaveHub Team 🇿🇦
        `
      }),

      final_warning_12: (data: TrialEmailData) => ({
        subject: `🚨 URGENT: Your LeaveHub trial expires in 2 days - ${data.org_name}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 16px; }
              .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🚨 URGENT: Trial Expires Soon!</h1>
              <p>Your LeaveHub Pro trial ends in just 2 days</p>
            </div>
            
            <div class="content">
              <h2>Don't lose your progress, ${data.org_name}!</h2>
              
              <div class="warning">
                <h3>⏰ What happens in 2 days:</h3>
                <ul>
                  <li>🔒 <strong>Account downgrades to Free plan</strong> (max 3 employees)</li>
                  <li>📊 <strong>Advanced reporting disabled</strong> - no more Excel/PDF exports</li>
                  <li>📄 <strong>Document uploads blocked</strong> - no more file attachments</li>
                  <li>⚖️ <strong>Compliance tools removed</strong> - audit trails & POPIA features</li>
                  <li>🔄 <strong>Escalations disabled</strong> - manual approvals only</li>
                </ul>
              </div>
              
              <p><strong>💰 Keep everything for just R149/month!</strong></p>
              <p>✅ All your data stays safe<br>
              ✅ Unlimited employees<br>
              ✅ Full Pro features<br>
              ✅ Priority support</p>
              
              <div style="text-align: center;">
                <a href="https://leavehub.co.za/billing/upgrade" class="button">UPGRADE NOW - DON'T LOSE ACCESS</a>
              </div>
              
              <p><strong>Trial ends:</strong> ${data.trial_end_date ? new Date(data.trial_end_date).toLocaleDateString('en-ZA') : 'in 2 days'}</p>
              
              <p>Need help with upgrading? <strong>Call us now:</strong> 011 123 4567</p>
              
              <p>Time is running out!<br>The LeaveHub Team 🇿🇦</p>
            </div>
            
            <div class="footer">
              <p>Don't want these emails? You can't unsubscribe during your trial,<br>
              but they'll stop after you upgrade or your trial ends.</p>
            </div>
          </body>
          </html>
        `,
        textContent: `
🚨 URGENT: Your LeaveHub trial expires in 2 days!

Don't lose your progress, ${data.org_name}!

⏰ What happens in 2 days:
• Account downgrades to Free plan (max 3 employees)
• Advanced reporting disabled - no more Excel/PDF exports
• Document uploads blocked - no more file attachments  
• Compliance tools removed - audit trails & POPIA features
• Escalations disabled - manual approvals only

💰 Keep everything for just R149/month!
✅ All your data stays safe
✅ Unlimited employees  
✅ Full Pro features
✅ Priority support

UPGRADE NOW: https://leavehub.co.za/billing/upgrade

Trial ends: ${data.trial_end_date ? new Date(data.trial_end_date).toLocaleDateString('en-ZA') : 'in 2 days'}

Need help? Call us: 011 123 4567

Time is running out!
The LeaveHub Team 🇿🇦
        `
      }),

      expiry_14: (data: TrialEmailData) => ({
        subject: `😔 Your LeaveHub trial has ended - ${data.org_name} (downgraded to Free)`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { display: inline-block; background: #00C2CB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .downgrade { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>😔 Trial Ended</h1>
              <p>Your LeaveHub Pro trial has expired</p>
            </div>
            
            <div class="content">
              <h2>Hi ${data.org_name} team,</h2>
              <p>Your 14-day LeaveHub Pro trial has ended. We hope you enjoyed the experience!</p>
              
              <div class="downgrade">
                <h3>📉 Your account has been downgraded to Free:</h3>
                <ul>
                  <li>✅ <strong>Basic leave requests</strong> - still available</li>
                  <li>✅ <strong>Up to 3 employees</strong> - no charge</li>
                  <li>✅ <strong>Simple reporting</strong> - basic exports</li>
                  <li>❌ <strong>Advanced features disabled</strong> - document uploads, compliance tools, escalations</li>
                </ul>
                <p><strong>All your data is safe</strong> - nothing has been deleted!</p>
              </div>
              
              <h3>🚀 Ready to unlock your full potential?</h3>
              <p>Upgrade to Pro and get back all the features you tried:</p>
              <ul>
                <li>📊 Advanced Excel & PDF reporting with branding</li>
                <li>📄 Secure document management</li>
                <li>⚖️ Full BCEA & POPIA compliance</li>
                <li>🔄 Automatic escalations & workflows</li>
                <li>👥 Unlimited employees</li>
                <li>🎯 Priority support</li>
              </ul>
              
              <p><strong>Special offer: Upgrade in the next 7 days and get 20% off your first 3 months!</strong></p>
              
              <div style="text-align: center;">
                <a href="https://leavehub.co.za/billing/upgrade?promo=COMEBACK20" class="button">Upgrade Now (20% Off)</a>
              </div>
              
              <p>You can always upgrade later, but this discount expires in 7 days.</p>
              
              <p>Thank you for trying LeaveHub!<br>The LeaveHub Team 🇿🇦</p>
            </div>
            
            <div class="footer">
              <p>Questions about upgrading? Reply to this email or call 011 123 4567</p>
            </div>
          </body>
          </html>
        `,
        textContent: `
😔 Your LeaveHub trial has ended

Hi ${data.org_name} team,

Your 14-day LeaveHub Pro trial has ended. We hope you enjoyed the experience!

📉 Your account has been downgraded to Free:
✅ Basic leave requests - still available
✅ Up to 3 employees - no charge  
✅ Simple reporting - basic exports
❌ Advanced features disabled - document uploads, compliance tools, escalations

All your data is safe - nothing has been deleted!

🚀 Ready to unlock your full potential?
Upgrade to Pro and get back all the features:
• Advanced Excel & PDF reporting with branding
• Secure document management
• Full BCEA & POPIA compliance
• Automatic escalations & workflows  
• Unlimited employees
• Priority support

Special offer: Upgrade in the next 7 days and get 20% off your first 3 months!

Upgrade now: https://leavehub.co.za/billing/upgrade?promo=COMEBACK20

Thank you for trying LeaveHub!
The LeaveHub Team 🇿🇦

Questions? Reply to this email or call 011 123 4567
        `
      })
    };
  }

  static async sendTrialEmail(emailType: string, recipientEmail: string, templateData: TrialEmailData): Promise<boolean> {
    try {
      const templates = this.getTrialEmailTemplates();
      const templateFn = templates[emailType];
      
      if (!templateFn) {
        console.error(`Unknown email type: ${emailType}`);
        return false;
      }

      const template = templateFn(templateData);

      // Use Supabase Edge Function for email sending
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipientEmail,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent,
          type: 'trial_email'
        }
      });

      if (error) {
        console.error('Failed to send trial email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Trial email error:', error);
      return false;
    }
  }

  static async processPendingTrialEmails(): Promise<number> {
    try {
      const { data: pendingEmails, error } = await supabase.rpc('get_pending_trial_emails');
      
      if (error) {
        console.error('Failed to get pending trial emails:', error);
        return 0;
      }

      let sentCount = 0;

      for (const email of pendingEmails || []) {
        const templateData: TrialEmailData = {
          org_name: email.org_name,
          ...(email.template_data as any)
        };

        const sent = await this.sendTrialEmail(email.email_type, email.recipient_email, templateData);
        
        if (sent) {
          await supabase.rpc('mark_trial_email_sent', { email_id: email.id });
          sentCount++;
        } else {
          // Mark as failed and increment attempts
          await supabase
            .from('trial_email_queue')
            .update({ 
              status: 'failed', 
              attempts: supabase.sql`attempts + 1`,
              error_message: 'Failed to send email'
            })
            .eq('id', email.id);
        }
      }

      return sentCount;
    } catch (error) {
      console.error('Error processing trial emails:', error);
      return 0;
    }
  }

  static async getTrialStatus(organizationId: string) {
    try {
      const { data, error } = await supabase.rpc('get_organization_billing_info', {
        org_id: organizationId
      });

      if (error) {
        console.error('Failed to get trial status:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting trial status:', error);
      return null;
    }
  }

  static async startTrial(organizationId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('start_organization_trial', {
        org_id: organizationId
      });

      if (error) {
        console.error('Failed to start trial:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error starting trial:', error);
      return false;
    }
  }

  static async upgradePlan(organizationId: string, newPlan: string, stripeSubscriptionId?: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('upgrade_organization_plan', {
        org_id: organizationId,
        new_plan: newPlan,
        stripe_subscription_id: stripeSubscriptionId
      });

      if (error) {
        console.error('Failed to upgrade plan:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error upgrading plan:', error);
      return false;
    }
  }
}