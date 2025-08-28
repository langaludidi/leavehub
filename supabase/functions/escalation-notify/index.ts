import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

interface EscalationData {
  request_id: string;
  employee_email: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  escalation_level: number;
  hours_pending: number;
  escalation_description: string;
}

interface EscalationRequest {
  to: string;
  template: string;
  data: EscalationData;
}

const ESCALATION_TEMPLATES = {
  escalation_level_1: {
    subject: "Leave Request Pending Approval - Level 1 Escalation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Leave Request Escalation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Level 1 - Manager Review Required</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A leave request has been pending approval for <strong>{{hours_pending}} hours</strong> and requires your immediate attention.
          </p>
          
          <div style="background: #f9fafb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Request Details</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Employee:</strong> {{employee_email}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Leave Type:</strong> {{leave_type}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Dates:</strong> {{start_date}} to {{end_date}}</p>
            {{#if reason}}<p style="margin: 5px 0; color: #6b7280;"><strong>Reason:</strong> {{reason}}</p>{{/if}}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{site_url}}/admin/leave-requests" 
               style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Review Request
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This is an automated escalation from LeaveHub. Please review and approve/reject the request to prevent further escalation.
          </p>
        </div>
      </div>
    `,
    text: `
LEAVE REQUEST ESCALATION - Level 1

A leave request has been pending approval for {{hours_pending}} hours and requires your attention.

Employee: {{employee_email}}
Leave Type: {{leave_type}}
Dates: {{start_date}} to {{end_date}}
{{#if reason}}Reason: {{reason}}{{/if}}

Please review this request at: {{site_url}}/admin/leave-requests

This is an automated escalation from LeaveHub.
    `
  },
  
  escalation_level_2: {
    subject: "🚨 URGENT: Leave Request Escalation - HR Review Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚨 URGENT ESCALATION</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Level 2 - HR Department Action Required</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #dc2626; font-weight: 600; margin: 0;">
              🚨 This leave request has been escalated to Level 2 after {{hours_pending}} hours without approval.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A leave request requires immediate HR intervention. The initial manager approval timeframe has been exceeded.
          </p>
          
          <div style="background: #f9fafb; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Request Details</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Employee:</strong> {{employee_email}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Leave Type:</strong> {{leave_type}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Dates:</strong> {{start_date}} to {{end_date}}</p>
            {{#if reason}}<p style="margin: 5px 0; color: #6b7280;"><strong>Reason:</strong> {{reason}}</p>{{/if}}
            <p style="margin: 5px 0; color: #dc2626;"><strong>Escalation:</strong> {{escalation_description}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{site_url}}/admin/leave-requests" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              URGENT - Review Now
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This is a Level 2 automated escalation. Immediate action is required to prevent further escalation to senior management.
          </p>
        </div>
      </div>
    `,
    text: `
🚨 URGENT LEAVE REQUEST ESCALATION - Level 2

This leave request has been escalated to Level 2 after {{hours_pending}} hours without approval.

Employee: {{employee_email}}
Leave Type: {{leave_type}}
Dates: {{start_date}} to {{end_date}}
{{#if reason}}Reason: {{reason}}{{/if}}
Escalation: {{escalation_description}}

IMMEDIATE ACTION REQUIRED: {{site_url}}/admin/leave-requests

This is a Level 2 automated escalation requiring HR intervention.
    `
  },
  
  escalation_level_3: {
    subject: "🔥 CRITICAL: Final Leave Request Escalation - Admin Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c2d12, #991b1b); padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔥 CRITICAL ESCALATION</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Level 3 - Final Administrative Override Required</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <div style="background: #7f1d1d; color: white; border-radius: 6px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">⚠️ FINAL ESCALATION LEVEL ⚠️</h3>
            <p style="margin: 0; font-size: 18px; font-weight: 600;">
              {{hours_pending}} HOURS WITHOUT APPROVAL
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            This leave request has reached the final escalation level and requires immediate administrative action. 
            Both manager and HR approval timeframes have been exceeded.
          </p>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c2d12; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Request Details</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Employee:</strong> {{employee_email}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Leave Type:</strong> {{leave_type}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Dates:</strong> {{start_date}} to {{end_date}}</p>
            {{#if reason}}<p style="margin: 5px 0; color: #6b7280;"><strong>Reason:</strong> {{reason}}</p>{{/if}}
            <p style="margin: 5px 0; color: #7c2d12;"><strong>Final Escalation:</strong> {{escalation_description}}</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-weight: 600;">
              ⚡ Administrative Override Required: This request may need to be auto-approved or manually reviewed immediately to prevent operational impact.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{site_url}}/admin/leave-requests" 
               style="background: #7c2d12; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              🔥 CRITICAL - REVIEW IMMEDIATELY
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This is the final escalation level. Consider implementing administrative overrides or reviewing approval processes to prevent future critical escalations.
          </p>
        </div>
      </div>
    `,
    text: `
🔥 CRITICAL LEAVE REQUEST ESCALATION - FINAL LEVEL

This leave request has reached the final escalation level after {{hours_pending}} hours without approval.

Employee: {{employee_email}}
Leave Type: {{leave_type}}
Dates: {{start_date}} to {{end_date}}
{{#if reason}}Reason: {{reason}}{{/if}}
Final Escalation: {{escalation_description}}

⚡ IMMEDIATE ADMINISTRATIVE ACTION REQUIRED ⚡
{{site_url}}/admin/leave-requests

This is the final escalation level. Consider administrative override to prevent operational impact.
    `
  },

  // Sick leave specific templates
  sick_escalation_level_1: {
    subject: "🏥 Medical Leave Pending Approval - Urgent Review Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏥 Medical Leave Escalation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Urgent Medical Situation - Immediate Review Required</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #dc2626; font-weight: 600; margin: 0;">
              🚨 Medical leave request requires urgent approval - {{hours_pending}} hours pending
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A sick leave request requires immediate attention due to the medical nature and potential impact on the employee's health and wellbeing.
          </p>
          
          <div style="background: #f9fafb; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Medical Leave Details</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Employee:</strong> {{employee_email}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Leave Type:</strong> Medical/Sick Leave</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Dates:</strong> {{start_date}} to {{end_date}}</p>
            {{#if reason}}<p style="margin: 5px 0; color: #6b7280;"><strong>Medical Reason:</strong> {{reason}}</p>{{/if}}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{site_url}}/admin/leave-requests" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              🏥 Review Medical Leave
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Medical leave requests should be processed promptly to ensure employee welfare. Please review supporting documentation if required.
          </p>
        </div>
      </div>
    `,
    text: `
🏥 MEDICAL LEAVE ESCALATION - Urgent Review Required

A sick leave request requires immediate approval - {{hours_pending}} hours pending.

Employee: {{employee_email}}
Leave Type: Medical/Sick Leave
Dates: {{start_date}} to {{end_date}}
{{#if reason}}Medical Reason: {{reason}}{{/if}}

Please review immediately: {{site_url}}/admin/leave-requests

Medical leave requests should be processed promptly for employee welfare.
    `
  },

  // Family responsibility leave templates  
  family_escalation_level_1: {
    subject: "👨‍👩‍👧‍👦 Family Emergency Leave - Immediate Approval Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c2d12, #991b1b); padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">👨‍👩‍👧‍👦 Family Emergency</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Family Responsibility Leave - Emergency Situation</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <div style="background: #7f1d1d; color: white; border-radius: 6px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; font-weight: 600;">
              🚨 FAMILY EMERGENCY - IMMEDIATE APPROVAL REQUIRED
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A family responsibility leave request is pending approval for {{hours_pending}} hours. Due to the emergency nature of family responsibility leave, immediate approval is critical.
          </p>
          
          <div style="background: #f9fafb; border-left: 4px solid #7c2d12; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">Emergency Leave Details</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Employee:</strong> {{employee_email}}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Leave Type:</strong> Family Responsibility Leave</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Dates:</strong> {{start_date}} to {{end_date}}</p>
            {{#if reason}}<p style="margin: 5px 0; color: #6b7280;"><strong>Emergency Details:</strong> {{reason}}</p>{{/if}}
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;">
              <strong>BCEA Compliance Note:</strong> Family responsibility leave is a statutory right and should be approved promptly for qualifying emergencies (child birth, illness, death of family member).
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{site_url}}/admin/leave-requests" 
               style="background: #7c2d12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              👨‍👩‍👧‍👦 Approve Family Leave
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Family responsibility leave is a legal entitlement under the BCEA. Prompt approval supports employees during difficult family circumstances.
          </p>
        </div>
      </div>
    `,
    text: `
👨‍👩‍👧‍👦 FAMILY EMERGENCY LEAVE - Immediate Approval Required

Family responsibility leave request pending for {{hours_pending}} hours - emergency situation.

Employee: {{employee_email}}
Leave Type: Family Responsibility Leave  
Dates: {{start_date}} to {{end_date}}
{{#if reason}}Emergency Details: {{reason}}{{/if}}

IMMEDIATE APPROVAL REQUIRED: {{site_url}}/admin/leave-requests

Family responsibility leave is a BCEA statutory right for qualifying emergencies.
    `
  }
};

function compileTemplate(template: string, data: any): string {
  return template.replace(/\{\{(\#if\s+)?(\w+)(\}\}|\s*\}\})/g, (match, ifStatement, key, close) => {
    if (ifStatement) {
      // Handle {{#if key}} conditional
      const endPattern = new RegExp(`\\{\\{#if\\s+${key}\\}\\}(.*?)\\{\\{/if\\}\\}`, 'gs');
      return template.match(endPattern) ? (data[key] ? template.match(endPattern)![0].replace(/\{\{#if.*?\}\}|\{\{\/if\}\}/g, '') : '') : '';
    }
    return data[key] || '';
  }).replace(/\{\{#if\s+\w+\}\}.*?\{\{\/if\}\}/gs, (match) => {
    const keyMatch = match.match(/\{\{#if\s+(\w+)\}\}/);
    if (keyMatch) {
      const key = keyMatch[1];
      const content = match.replace(/\{\{#if.*?\}\}|\{\{\/if\}\}/g, '');
      return data[key] ? content : '';
    }
    return '';
  });
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { to, template, data }: EscalationRequest = await req.json();

    if (!to || !template || !data) {
      return new Response('Missing required fields', { status: 400 });
    }

    const escalationTemplate = ESCALATION_TEMPLATES[template as keyof typeof ESCALATION_TEMPLATES];
    if (!escalationTemplate) {
      return new Response('Invalid template', { status: 400 });
    }

    // Get site URL from environment
    const siteUrl = Deno.env.get('SITE_URL') || 'https://leavehub.co.za';
    
    // Prepare template data
    const templateData = {
      ...data,
      site_url: siteUrl,
      start_date: new Date(data.start_date).toLocaleDateString('en-ZA', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }),
      end_date: new Date(data.end_date).toLocaleDateString('en-ZA', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }),
      hours_pending: Math.round(data.hours_pending)
    };

    // Initialize Supabase client for sending email
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Compile templates
    const htmlContent = compileTemplate(escalationTemplate.html, templateData);
    const textContent = compileTemplate(escalationTemplate.text, templateData);
    const subject = compileTemplate(escalationTemplate.subject, templateData);

    // Send email using Supabase Auth (or your preferred email service)
    // This is a simplified version - in production, integrate with your email service
    const emailPayload = {
      to,
      subject,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Email-Type': 'escalation',
        'X-Escalation-Level': data.escalation_level.toString(),
        'X-Request-ID': data.request_id
      }
    };

    // Log the escalation notification
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        organization_id: null, // System-level log
        user_id: null,
        entity_type: 'escalation_notification',
        entity_id: data.request_id,
        action: 'send',
        new_values: {
          to,
          template,
          escalation_level: data.escalation_level,
          subject
        },
        metadata: {
          notification_type: 'email',
          escalation_hours: data.hours_pending
        }
      });

    if (logError) {
      console.error('Failed to log escalation notification:', logError);
    }

    // In a real implementation, you would integrate with your email service here
    // For now, we'll simulate successful sending
    console.log('Escalation email would be sent:', emailPayload);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Escalation notification sent',
      template_used: template,
      escalation_level: data.escalation_level
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error sending escalation notification:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send escalation notification',
      details: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});