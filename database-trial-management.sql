-- Trial Management and Billing System
-- South Africa MVP specific trial and billing features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update organizations table with trial and billing info
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_plan TEXT DEFAULT 'free' CHECK (billing_plan IN ('free', 'lite', 'pro', 'trial'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_trial_active BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_emails_sent JSONB DEFAULT '{}'; -- Track which trial emails have been sent
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS next_billing_date DATE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active' CHECK (billing_status IN ('active', 'past_due', 'canceled', 'incomplete'));

-- Trial Email Queue table - for managing automated trial emails
CREATE TABLE IF NOT EXISTS trial_email_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'reminder_7', 'final_warning_12', 'expiry_14')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  recipient_email TEXT NOT NULL,
  template_data JSONB DEFAULT '{}',
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Stats table - track usage for billing decisions
CREATE TABLE IF NOT EXISTS organization_usage_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_employees INTEGER DEFAULT 0,
  leave_requests_submitted INTEGER DEFAULT 0,
  leave_requests_approved INTEGER DEFAULT 0,
  documents_uploaded INTEGER DEFAULT 0,
  reports_generated INTEGER DEFAULT 0,
  admin_logins INTEGER DEFAULT 0,
  employee_logins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, stat_date)
);

-- Billing Events table - track all billing-related events
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'trial_started', 'trial_ended', 'upgraded', 'downgraded', 'payment_success', 'payment_failed'
  event_data JSONB DEFAULT '{}',
  stripe_event_id TEXT, -- Stripe webhook event ID if applicable
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trial_email_queue_scheduled ON trial_email_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_organizations_trial_active ON organizations(is_trial_active) WHERE is_trial_active = true;
CREATE INDEX IF NOT EXISTS idx_usage_stats_org_date ON organization_usage_stats(organization_id, stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_billing_events_org ON billing_events(organization_id, processed_at DESC);

-- Function to start trial for an organization
CREATE OR REPLACE FUNCTION start_organization_trial(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_start TIMESTAMPTZ := NOW();
  trial_end TIMESTAMPTZ := NOW() + INTERVAL '14 days';
  admin_user RECORD;
BEGIN
  -- Update organization with trial info
  UPDATE organizations 
  SET 
    trial_start_date = trial_start,
    trial_end_date = trial_end,
    billing_plan = 'trial',
    is_trial_active = true,
    trial_emails_sent = '{}'::jsonb
  WHERE id = org_id;

  -- Get organization admin for email
  SELECT up.user_id, u.email, o.name as org_name
  INTO admin_user
  FROM user_profiles up
  JOIN auth.users u ON u.id = up.user_id
  JOIN organizations o ON o.id = up.organization_id
  WHERE up.organization_id = org_id 
    AND up.role = 'admin'
  LIMIT 1;

  -- Schedule trial emails
  INSERT INTO trial_email_queue (organization_id, email_type, scheduled_for, recipient_email, template_data)
  VALUES 
    -- Welcome email (immediate)
    (org_id, 'welcome', trial_start + INTERVAL '1 minute', admin_user.email, 
     jsonb_build_object('org_name', admin_user.org_name, 'trial_end_date', trial_end)),
    
    -- Day 7 reminder
    (org_id, 'reminder_7', trial_start + INTERVAL '7 days', admin_user.email,
     jsonb_build_object('org_name', admin_user.org_name, 'days_remaining', 7, 'trial_end_date', trial_end)),
    
    -- Day 12 final warning
    (org_id, 'final_warning_12', trial_start + INTERVAL '12 days', admin_user.email,
     jsonb_build_object('org_name', admin_user.org_name, 'days_remaining', 2, 'trial_end_date', trial_end)),
    
    -- Day 14 expiry notice
    (org_id, 'expiry_14', trial_end, admin_user.email,
     jsonb_build_object('org_name', admin_user.org_name, 'downgraded_to', 'free'));

  -- Log billing event
  INSERT INTO billing_events (organization_id, event_type, event_data)
  VALUES (org_id, 'trial_started', jsonb_build_object('trial_start', trial_start, 'trial_end', trial_end));
END;
$$;

-- Function to end trial and downgrade to free plan
CREATE OR REPLACE FUNCTION end_organization_trial(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_employee_count INTEGER;
BEGIN
  -- Get current employee count
  SELECT COUNT(*) INTO current_employee_count
  FROM user_profiles
  WHERE organization_id = org_id;

  -- Update organization
  UPDATE organizations 
  SET 
    billing_plan = 'free',
    is_trial_active = false,
    employee_count = current_employee_count
  WHERE id = org_id;

  -- Cancel any pending trial emails
  UPDATE trial_email_queue 
  SET status = 'cancelled'
  WHERE organization_id = org_id 
    AND status = 'pending';

  -- Log billing event
  INSERT INTO billing_events (organization_id, event_type, event_data)
  VALUES (org_id, 'trial_ended', jsonb_build_object('downgraded_to', 'free', 'employee_count', current_employee_count));
END;
$$;

-- Function to upgrade organization plan
CREATE OR REPLACE FUNCTION upgrade_organization_plan(
  org_id UUID,
  new_plan TEXT,
  stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_plan TEXT;
BEGIN
  -- Get current plan
  SELECT billing_plan INTO old_plan FROM organizations WHERE id = org_id;

  -- Update organization
  UPDATE organizations 
  SET 
    billing_plan = new_plan,
    is_trial_active = false,
    billing_status = 'active',
    next_billing_date = CASE 
      WHEN new_plan != 'free' THEN CURRENT_DATE + INTERVAL '1 month'
      ELSE NULL
    END
  WHERE id = org_id;

  -- Cancel trial emails if upgrading from trial
  IF old_plan = 'trial' THEN
    UPDATE trial_email_queue 
    SET status = 'cancelled'
    WHERE organization_id = org_id 
      AND status = 'pending';
  END IF;

  -- Log billing event
  INSERT INTO billing_events (organization_id, event_type, event_data)
  VALUES (org_id, 'upgraded', jsonb_build_object(
    'from_plan', old_plan, 
    'to_plan', new_plan,
    'stripe_subscription_id', stripe_subscription_id
  ));
END;
$$;

-- Function to get pending trial emails that need to be sent
CREATE OR REPLACE FUNCTION get_pending_trial_emails()
RETURNS TABLE (
  id UUID,
  organization_id UUID,
  email_type TEXT,
  recipient_email TEXT,
  template_data JSONB,
  org_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    teq.id,
    teq.organization_id,
    teq.email_type,
    teq.recipient_email,
    teq.template_data,
    o.name as org_name
  FROM trial_email_queue teq
  JOIN organizations o ON o.id = teq.organization_id
  WHERE teq.status = 'pending'
    AND teq.scheduled_for <= NOW()
    AND o.is_trial_active = true
  ORDER BY teq.scheduled_for ASC;
END;
$$;

-- Function to mark trial email as sent
CREATE OR REPLACE FUNCTION mark_trial_email_sent(email_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE trial_email_queue
  SET 
    status = 'sent',
    sent_at = NOW()
  WHERE id = email_id;
END;
$$;

-- Function to check and process expired trials
CREATE OR REPLACE FUNCTION process_expired_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER := 0;
  org_record RECORD;
BEGIN
  -- Find expired trials
  FOR org_record IN 
    SELECT id, name
    FROM organizations
    WHERE is_trial_active = true
      AND trial_end_date <= NOW()
  LOOP
    -- End the trial
    PERFORM end_organization_trial(org_record.id);
    expired_count := expired_count + 1;
  END LOOP;

  RETURN expired_count;
END;
$$;

-- Function to get organization billing info
CREATE OR REPLACE FUNCTION get_organization_billing_info(org_id UUID)
RETURNS TABLE (
  billing_plan TEXT,
  is_trial_active BOOLEAN,
  trial_days_remaining INTEGER,
  employee_count INTEGER,
  plan_limits JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_limits JSONB;
BEGIN
  -- Define plan limits
  SELECT 
    CASE o.billing_plan
      WHEN 'free' THEN '{"max_employees": 3, "features": ["basic_leave_requests", "basic_reporting"]}'::jsonb
      WHEN 'lite' THEN '{"max_employees": 10, "features": ["basic_leave_requests", "basic_reporting", "document_upload", "approvals"]}'::jsonb  
      WHEN 'pro' THEN '{"max_employees": -1, "features": ["all_features", "advanced_reporting", "compliance", "api_access"]}'::jsonb
      WHEN 'trial' THEN '{"max_employees": -1, "features": ["all_features", "advanced_reporting", "compliance", "api_access"]}'::jsonb
      ELSE '{}'::jsonb
    END INTO plan_limits
  FROM organizations o
  WHERE o.id = org_id;

  RETURN QUERY
  SELECT 
    o.billing_plan,
    o.is_trial_active,
    CASE 
      WHEN o.is_trial_active AND o.trial_end_date > NOW() THEN 
        EXTRACT(DAY FROM o.trial_end_date - NOW())::INTEGER
      ELSE 0
    END as trial_days_remaining,
    (SELECT COUNT(*)::INTEGER FROM user_profiles WHERE organization_id = org_id) as employee_count,
    plan_limits
  FROM organizations o
  WHERE o.id = org_id;
END;
$$;

-- Trigger to update employee count when users are added/removed
CREATE OR REPLACE FUNCTION update_organization_employee_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE organizations 
    SET employee_count = (
      SELECT COUNT(*) FROM user_profiles WHERE organization_id = NEW.organization_id
    )
    WHERE id = NEW.organization_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE organizations 
    SET employee_count = (
      SELECT COUNT(*) FROM user_profiles WHERE organization_id = OLD.organization_id
    )
    WHERE id = OLD.organization_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS update_employee_count_trigger ON user_profiles;
CREATE TRIGGER update_employee_count_trigger
  AFTER INSERT OR DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_employee_count();

-- Function to create daily usage stats
CREATE OR REPLACE FUNCTION create_daily_usage_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO organization_usage_stats (
    organization_id,
    stat_date,
    active_employees,
    leave_requests_submitted,
    leave_requests_approved,
    admin_logins,
    employee_logins
  )
  SELECT 
    o.id as organization_id,
    CURRENT_DATE as stat_date,
    (SELECT COUNT(*) FROM user_profiles WHERE organization_id = o.id) as active_employees,
    (SELECT COUNT(*) FROM leave_requests lr 
     JOIN user_profiles up ON up.user_id = lr.user_id
     WHERE up.organization_id = o.id 
       AND lr.created_at::date = CURRENT_DATE) as leave_requests_submitted,
    (SELECT COUNT(*) FROM leave_requests lr 
     JOIN user_profiles up ON up.user_id = lr.user_id
     WHERE up.organization_id = o.id 
       AND lr.status = 'approved' 
       AND lr.updated_at::date = CURRENT_DATE) as leave_requests_approved,
    0 as admin_logins, -- To be updated by login tracking
    0 as employee_logins
  FROM organizations o
  ON CONFLICT (organization_id, stat_date) 
  DO UPDATE SET
    active_employees = EXCLUDED.active_employees,
    leave_requests_submitted = EXCLUDED.leave_requests_submitted,
    leave_requests_approved = EXCLUDED.leave_requests_approved;
END;
$$;