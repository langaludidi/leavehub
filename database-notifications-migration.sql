-- Email Notifications System Migration
-- Creates tables and functions for automated email notifications

-- Email notifications queue table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  from_email TEXT DEFAULT 'noreply@leavehub.com',
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_id UUID,
  variables JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'scheduled')),
  notification_type TEXT NOT NULL,
  related_entity_id UUID,
  related_entity_type TEXT CHECK (related_entity_type IN ('leave_request', 'user', 'organization')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  variables TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  org_specific BOOLEAN DEFAULT false,
  org_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, org_id)
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  leave_request_updates BOOLEAN DEFAULT true,
  approval_reminders BOOLEAN DEFAULT true,
  balance_warnings BOOLEAN DEFAULT true,
  policy_updates BOOLEAN DEFAULT true,
  digest_frequency TEXT DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification history for audit and analytics
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  notification_type TEXT NOT NULL,
  delivery_method TEXT DEFAULT 'email',
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification rules for automated triggers
CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL, -- 'leave_request_submitted', 'leave_approved', etc.
  conditions JSONB DEFAULT '{}', -- JSON conditions for when to trigger
  template_id UUID REFERENCES email_templates(id),
  recipients JSONB NOT NULL, -- Who receives the notification
  delay_minutes INTEGER DEFAULT 0, -- Delay before sending
  active BOOLEAN DEFAULT true,
  org_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all notification tables
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_notifications
CREATE POLICY "Users can view own notifications" ON email_notifications
  FOR SELECT USING (
    to_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all notifications" ON email_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin')
    )
  );

CREATE POLICY "System can insert notifications" ON email_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update notifications" ON email_notifications
  FOR UPDATE USING (true);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for notification_history
CREATE POLICY "Users can view own history" ON notification_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view org history" ON notification_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin')
    )
  );

-- RLS Policies for email_templates
CREATE POLICY "Users can view templates" ON email_templates
  FOR SELECT USING (
    active = true AND (
      org_specific = false OR 
      org_id IN (
        SELECT org_id FROM org_members 
        WHERE user_id = auth.uid() 
        AND active = true
      )
    )
  );

CREATE POLICY "Admins can manage templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND (org_id = email_templates.org_id OR email_templates.org_specific = false)
    )
  );

-- RLS Policies for notification_rules
CREATE POLICY "Admins can manage rules" ON notification_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = notification_rules.org_id
      AND role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_scheduled_at ON email_notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_related_entity ON email_notifications(related_entity_type, related_entity_id);

CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_history_type ON notification_history(notification_type);

CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);

-- Add updated_at triggers
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_notifications_updated_at') THEN
    CREATE TRIGGER update_email_notifications_updated_at 
      BEFORE UPDATE ON email_notifications 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_templates_updated_at') THEN
    CREATE TRIGGER update_email_templates_updated_at 
      BEFORE UPDATE ON email_templates 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_preferences_updated_at') THEN
    CREATE TRIGGER update_notification_preferences_updated_at 
      BEFORE UPDATE ON notification_preferences 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_rules_updated_at') THEN
    CREATE TRIGGER update_notification_rules_updated_at 
      BEFORE UPDATE ON notification_rules 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default email templates
INSERT INTO email_templates (name, type, subject_template, html_template, text_template, variables, org_specific) VALUES
(
  'Leave Request Submitted',
  'leave_request_submitted',
  'Leave Request Submitted - {{leave_type}}',
  '<!DOCTYPE html><html><head><style>.container{max-width:600px;margin:0 auto;font-family:Arial,sans-serif;}.header{background:#14b8a6;color:white;padding:20px;text-align:center;}.content{padding:20px;background:#f8fafc;}.card{background:white;padding:20px;border-radius:8px;border-left:4px solid #14b8a6;}</style></head><body><div class="container"><div class="header"><h1>LeaveHub</h1><h2>Leave Request Submitted</h2></div><div class="content"><div class="card"><h3>Your leave request has been submitted</h3><p>Hi {{employee_name}},</p><p>Your {{leave_type}} leave request has been successfully submitted.</p><ul><li><strong>Dates:</strong> {{start_date}} - {{end_date}}</li><li><strong>Total Days:</strong> {{total_days}}</li><li><strong>Reason:</strong> {{reason}}</li></ul><p>You''ll receive another notification once your request is reviewed.</p></div></div></div></body></html>',
  'Hi {{employee_name}}, your {{leave_type}} leave request for {{start_date}} - {{end_date}} ({{total_days}} days) has been submitted and is pending approval.',
  ARRAY['employee_name', 'leave_type', 'start_date', 'end_date', 'total_days', 'reason'],
  false
),
(
  'Leave Request Approved',
  'leave_request_approved', 
  'Leave Request Approved - {{leave_type}}',
  '<!DOCTYPE html><html><head><style>.container{max-width:600px;margin:0 auto;font-family:Arial,sans-serif;}.header{background:#10b981;color:white;padding:20px;text-align:center;}.content{padding:20px;background:#f8fafc;}.card{background:white;padding:20px;border-radius:8px;border-left:4px solid #10b981;}</style></head><body><div class="container"><div class="header"><h1>LeaveHub</h1><h2>Leave Request Approved</h2></div><div class="content"><div class="card"><h3>🎉 Your leave request has been approved!</h3><p>Hi {{employee_name}},</p><p>Great news! Your {{leave_type}} leave request has been approved.</p><ul><li><strong>Dates:</strong> {{start_date}} - {{end_date}}</li><li><strong>Total Days:</strong> {{total_days}}</li></ul><p>Enjoy your time off!</p></div></div></div></body></html>',
  'Hi {{employee_name}}, your {{leave_type}} leave request for {{start_date}} - {{end_date}} has been approved! Enjoy your time off.',
  ARRAY['employee_name', 'leave_type', 'start_date', 'end_date', 'total_days'],
  false
),
(
  'Manager Approval Required',
  'manager_approval_required',
  'New Leave Request Requires Approval - {{employee_name}}',
  '<!DOCTYPE html><html><head><style>.container{max-width:600px;margin:0 auto;font-family:Arial,sans-serif;}.header{background:#f59e0b;color:white;padding:20px;text-align:center;}.content{padding:20px;background:#f8fafc;}.card{background:white;padding:20px;border-radius:8px;border-left:4px solid #f59e0b;}.button{display:inline-block;padding:12px 24px;background:#f59e0b;color:white;text-decoration:none;border-radius:6px;}</style></head><body><div class="container"><div class="header"><h1>LeaveHub</h1><h2>Approval Required</h2></div><div class="content"><div class="card"><h3>📋 New leave request requires your approval</h3><p>Hello,</p><p>{{employee_name}} has submitted a new leave request that requires your approval.</p><ul><li><strong>Employee:</strong> {{employee_name}}</li><li><strong>Leave Type:</strong> {{leave_type}}</li><li><strong>Dates:</strong> {{start_date}} - {{end_date}}</li><li><strong>Total Days:</strong> {{total_days}}</li><li><strong>Reason:</strong> {{reason}}</li></ul><a href="{{approval_url}}" class="button">Review Request</a></div></div></div></body></html>',
  '{{employee_name}} has submitted a {{leave_type}} leave request for {{start_date}} - {{end_date}} ({{total_days}} days) that requires your approval. Reason: {{reason}}',
  ARRAY['employee_name', 'leave_type', 'start_date', 'end_date', 'total_days', 'reason', 'approval_url'],
  false
),
(
  'Welcome Employee',
  'welcome_employee',
  'Welcome to {{organization_name}} LeaveHub',
  '<!DOCTYPE html><html><head><style>.container{max-width:600px;margin:0 auto;font-family:Arial,sans-serif;}.header{background:#6366f1;color:white;padding:20px;text-align:center;}.content{padding:20px;background:#f8fafc;}.card{background:white;padding:20px;border-radius:8px;border-left:4px solid #6366f1;}.button{display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:6px;}</style></head><body><div class="container"><div class="header"><h1>LeaveHub</h1><h2>Welcome!</h2></div><div class="content"><div class="card"><h3>Welcome to LeaveHub!</h3><p>Hi {{user_name}},</p><p>Welcome to {{organization_name}}''s LeaveHub! You can now log in and start managing your leave requests.</p><p>With LeaveHub, you can:</p><ul><li>Submit and track leave requests</li><li>View your leave balance</li><li>Sync with your calendar</li><li>Receive automatic notifications</li></ul><a href="{{login_url}}" class="button">Get Started</a></div></div></div></body></html>',
  'Hi {{user_name}}, welcome to {{organization_name}}''s LeaveHub! You can log in at {{login_url}} to start managing your leave requests.',
  ARRAY['user_name', 'organization_name', 'login_url'],
  false
) ON CONFLICT (name, org_id) DO NOTHING;

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM profiles 
WHERE NOT EXISTS (
  SELECT 1 FROM notification_preferences WHERE user_id = profiles.id
);

-- Function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification preferences when a new profile is created
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'create_user_notification_preferences') THEN
    CREATE TRIGGER create_user_notification_preferences
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION create_notification_preferences_for_user();
  END IF;
END $$;

-- Function to queue leave request notifications
CREATE OR REPLACE FUNCTION queue_leave_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  employee_email TEXT;
  employee_name TEXT;
  manager_email TEXT;
  template_type TEXT;
  notification_vars JSONB;
BEGIN
  -- Get employee details
  SELECT email, COALESCE(full_name, email) INTO employee_email, employee_name
  FROM profiles WHERE id = NEW.user_id;
  
  -- Get manager email (simplified - in practice you'd have proper manager relationships)
  SELECT email INTO manager_email
  FROM profiles p 
  JOIN org_members om ON p.id = om.user_id
  WHERE om.role = 'manager' 
  AND om.org_id = (
    SELECT org_id FROM org_members WHERE user_id = NEW.user_id LIMIT 1
  )
  LIMIT 1;

  -- Build notification variables
  notification_vars := jsonb_build_object(
    'employee_name', employee_name,
    'leave_type', NEW.leave_type,
    'start_date', NEW.start_date::text,
    'end_date', NEW.end_date::text,
    'total_days', NEW.total_days,
    'reason', COALESCE(NEW.reason, 'Not specified'),
    'approval_url', 'https://leavehub.app/approvals'
  );

  -- Handle different trigger scenarios
  IF TG_OP = 'INSERT' THEN
    -- New request submitted - notify employee and manager
    INSERT INTO email_notifications (to_email, subject, html_content, text_content, notification_type, related_entity_id, related_entity_type, variables)
    SELECT 
      employee_email,
      EmailTemplateRenderer.renderSubject(subject_template, notification_vars),
      EmailTemplateRenderer.renderHtml(html_template, notification_vars),
      EmailTemplateRenderer.renderText(text_template, notification_vars),
      'leave_request_submitted',
      NEW.id,
      'leave_request',
      notification_vars
    FROM email_templates 
    WHERE type = 'leave_request_submitted' AND active = true LIMIT 1;
    
    -- Notify manager
    IF manager_email IS NOT NULL THEN
      INSERT INTO email_notifications (to_email, subject, html_content, text_content, notification_type, related_entity_id, related_entity_type, variables)
      SELECT 
        manager_email,
        'New Leave Request Requires Approval - ' || employee_name,
        EmailTemplateRenderer.renderHtml(html_template, notification_vars),
        EmailTemplateRenderer.renderText(text_template, notification_vars),
        'manager_approval_required',
        NEW.id,
        'leave_request',
        notification_vars
      FROM email_templates 
      WHERE type = 'manager_approval_required' AND active = true LIMIT 1;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Status changed - notify employee
    IF NEW.status = 'approved' THEN
      template_type := 'leave_request_approved';
    ELSIF NEW.status = 'denied' THEN
      template_type := 'leave_request_denied';
    END IF;
    
    IF template_type IS NOT NULL THEN
      INSERT INTO email_notifications (to_email, subject, html_content, text_content, notification_type, related_entity_id, related_entity_type, variables)
      SELECT 
        employee_email,
        'Leave Request ' || INITCAP(NEW.status) || ' - ' || NEW.leave_type,
        COALESCE(html_template, 'Your leave request has been ' || NEW.status),
        COALESCE(text_template, 'Your leave request has been ' || NEW.status),
        template_type,
        NEW.id,
        'leave_request',
        notification_vars
      FROM email_templates 
      WHERE type = template_type AND active = true 
      LIMIT 1;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for leave request notifications
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leave_request_notification_trigger') THEN
    CREATE TRIGGER leave_request_notification_trigger
      AFTER INSERT OR UPDATE ON leave_requests
      FOR EACH ROW
      EXECUTE FUNCTION queue_leave_request_notification();
  END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE email_notifications IS 'Queue for outbound email notifications';
COMMENT ON TABLE email_templates IS 'Reusable email templates with variable substitution';
COMMENT ON TABLE notification_preferences IS 'User-specific notification settings and preferences';
COMMENT ON TABLE notification_history IS 'Audit trail for sent notifications and delivery tracking';
COMMENT ON TABLE notification_rules IS 'Automated notification rules and triggers';

COMMENT ON COLUMN email_notifications.retry_count IS 'Number of delivery attempts for failed notifications';
COMMENT ON COLUMN notification_preferences.digest_frequency IS 'How often to send digest emails: immediate, daily, weekly, never';
COMMENT ON COLUMN notification_preferences.quiet_hours_start IS 'Local time to start quiet hours (no notifications)';
COMMENT ON COLUMN notification_rules.conditions IS 'JSON conditions for when to trigger this rule';