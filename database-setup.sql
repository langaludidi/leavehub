-- LeaveHub MVP Database Schema
-- Run this in your Supabase SQL editor

-- Profiles table (if not already exists - typically created by Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table (enhanced)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  timezone TEXT DEFAULT 'UTC',
  country TEXT DEFAULT 'US',
  logo_url TEXT,
  website TEXT,
  address JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave types and policies table
CREATE TABLE IF NOT EXISTS leave_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'annual', 'sick', 'maternity', 'custom'
  description TEXT,
  days_allowed INTEGER NOT NULL DEFAULT 0,
  carryover_days INTEGER DEFAULT 0,
  approval_required BOOLEAN DEFAULT true,
  notice_period_days INTEGER DEFAULT 0,
  max_consecutive_days INTEGER,
  requires_documentation BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval workflows table
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]', -- Array of approval steps
  default_workflow BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company holidays table
CREATE TABLE IF NOT EXISTS company_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  holiday_type TEXT DEFAULT 'public', -- 'public', 'company', 'floating'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, date, name)
);

-- Employee profiles (enhanced)
CREATE TABLE IF NOT EXISTS employee_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  org_id UUID REFERENCES organizations(id),
  job_title TEXT,
  employee_id TEXT,
  hire_date DATE,
  phone TEXT,
  emergency_contact JSONB DEFAULT '{}',
  leave_balances JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members table (if not already exists)  
CREATE TABLE IF NOT EXISTS org_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id),
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  department TEXT,
  manager_id UUID REFERENCES profiles(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- Leave requests table - MAIN TABLE FOR MVP
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'personal', 'maternity', 'bereavement')),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  total_days INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approval_comment TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for leave_requests
CREATE POLICY "Users can view own requests" ON leave_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests" ON leave_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view all requests" ON leave_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can update requests" ON leave_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

-- Additional RLS policies for enhanced role management
CREATE POLICY "Managers can view team requests" ON leave_requests
  FOR SELECT USING (
    -- Manager can see their team's requests
    user_id IN (
      SELECT om.user_id 
      FROM org_members om, org_members manager_om
      WHERE manager_om.user_id = auth.uid()
      AND manager_om.role = 'manager'
      AND om.manager_id = auth.uid()
      AND om.active = true
    )
    OR
    -- Or if they're admin/manager with broader access
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

-- Enable RLS on new tables
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;

-- RLS for org_members table  
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org membership" ON org_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view team members" ON org_members
  FOR SELECT USING (
    manager_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Admins can manage org members" ON org_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for leave_policies
CREATE POLICY "Org members can view leave policies" ON leave_policies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = leave_policies.org_id
      AND active = true
    )
  );

CREATE POLICY "Admins can manage leave policies" ON leave_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = leave_policies.org_id
      AND role = 'admin'
      AND active = true
    )
  );

-- RLS Policies for approval_workflows  
CREATE POLICY "Org members can view workflows" ON approval_workflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = approval_workflows.org_id
      AND active = true
    )
  );

CREATE POLICY "Admins can manage workflows" ON approval_workflows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = approval_workflows.org_id
      AND role = 'admin'
      AND active = true
    )
  );

-- RLS Policies for company_holidays
CREATE POLICY "Org members can view holidays" ON company_holidays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = company_holidays.org_id
      AND active = true
    )
  );

CREATE POLICY "Admins can manage holidays" ON company_holidays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = company_holidays.org_id
      AND role = 'admin'
      AND active = true
    )
  );

-- RLS Policies for employee_profiles
CREATE POLICY "Users can view own profile" ON employee_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON employee_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Managers can view team profiles" ON employee_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = employee_profiles.org_id
      AND role IN ('manager', 'admin')
      AND active = true
    )
  );

-- Insert sample organization (optional)
INSERT INTO organizations (name) VALUES ('Sample Company') ON CONFLICT DO NOTHING;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created_at ON leave_requests(created_at);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at 
      BEFORE UPDATE ON profiles 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Subscription management tables
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Billing events table for audit trail
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  event_type TEXT NOT NULL, -- 'subscription.created', 'payment.succeeded', etc.
  stripe_event_id TEXT UNIQUE,
  amount INTEGER, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for billing limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  metric_type TEXT NOT NULL, -- 'employee_count', 'storage_used', 'api_calls', etc.
  value INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, metric_type, period_start, period_end)
);

-- Enable RLS on billing tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Org admins can view subscription" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = subscriptions.org_id
      AND role = 'admin'
      AND active = true
    )
  );

CREATE POLICY "Org admins can update subscription" ON subscriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = subscriptions.org_id
      AND role = 'admin'
      AND active = true
    )
  );

-- RLS Policies for billing events
CREATE POLICY "Org admins can view billing events" ON billing_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = billing_events.org_id
      AND role = 'admin'
      AND active = true
    )
  );

-- RLS Policies for usage tracking
CREATE POLICY "Org members can view usage" ON usage_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members 
      WHERE user_id = auth.uid() 
      AND org_id = usage_tracking.org_id
      AND role IN ('admin', 'manager')
      AND active = true
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_org_id ON billing_events(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_period ON usage_tracking(org_id, period_start, period_end);

-- Add updated_at trigger to subscriptions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
    CREATE TRIGGER update_subscriptions_updated_at 
      BEFORE UPDATE ON subscriptions 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

COMMENT ON TABLE leave_requests IS 'Core table for managing employee leave requests in LeaveHub MVP';
COMMENT ON COLUMN leave_requests.total_days IS 'Calculated number of days for the leave request';
COMMENT ON COLUMN leave_requests.status IS 'Request status: pending, approved, or denied';
COMMENT ON TABLE subscriptions IS 'Organization subscription and billing management';
COMMENT ON TABLE billing_events IS 'Audit trail for billing events and Stripe webhooks';
COMMENT ON TABLE usage_tracking IS 'Track usage metrics for billing and limits enforcement';