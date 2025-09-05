-- LeaveHub Complete Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (enhanced)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  employee_id TEXT,
  hire_date DATE,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  timezone TEXT DEFAULT 'UTC',
  country TEXT DEFAULT 'ZA',
  logo_url TEXT,
  website TEXT,
  address JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'trial',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id),
  budget_code TEXT,
  cost_center TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES departments(id),
  role TEXT DEFAULT 'employee', -- 'owner', 'admin', 'manager', 'employee'
  job_title TEXT,
  manager_id UUID REFERENCES profiles(id),
  salary_band TEXT,
  employment_type TEXT DEFAULT 'full-time',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Leave types and policies
CREATE TABLE IF NOT EXISTS leave_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'annual', 'sick', 'maternity', 'paternity', 'study', 'compassionate', 'custom'
  description TEXT,
  days_allowed INTEGER NOT NULL DEFAULT 0,
  days_per_year INTEGER DEFAULT 0,
  carryover_days INTEGER DEFAULT 0,
  max_carryover INTEGER DEFAULT 0,
  accrual_rate DECIMAL DEFAULT 0, -- days per month
  approval_required BOOLEAN DEFAULT true,
  notice_period_days INTEGER DEFAULT 0,
  max_consecutive_days INTEGER,
  min_days_between INTEGER DEFAULT 0,
  requires_documentation BOOLEAN DEFAULT false,
  applicable_to JSONB DEFAULT '{}', -- departments, roles, employment types
  gender_specific TEXT, -- 'male', 'female', 'all'
  is_paid BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'calendar',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  policy_id UUID REFERENCES leave_policies(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  allocated_days DECIMAL DEFAULT 0,
  used_days DECIMAL DEFAULT 0,
  pending_days DECIMAL DEFAULT 0,
  carried_over_days DECIMAL DEFAULT 0,
  last_accrual_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, policy_id, year)
);

-- Approval workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]', -- [{level: 1, approver_type: 'manager', backup_approver_id: uuid}]
  conditions JSONB DEFAULT '{}', -- department, leave_type, days_threshold
  is_default BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests (enhanced)
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  policy_id UUID REFERENCES leave_policies(id) NOT NULL,
  workflow_id UUID REFERENCES approval_workflows(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested DECIMAL NOT NULL,
  half_day_start BOOLEAN DEFAULT false,
  half_day_end BOOLEAN DEFAULT false,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled', 'withdrawn'
  rejection_reason TEXT,
  emergency_contact JSONB,
  handover_notes TEXT,
  coverage_arranged_by UUID REFERENCES profiles(id),
  documents JSONB DEFAULT '[]',
  escalation_level INTEGER DEFAULT 1,
  current_approver_id UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave request approvals
CREATE TABLE IF NOT EXISTS leave_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES profiles(id) NOT NULL,
  level INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'approved', 'rejected', 'delegated'
  comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public holidays
CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  country TEXT DEFAULT 'ZA',
  region TEXT,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'leave_request', 'leave_approved', 'leave_rejected', 'reminder', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  channels JSONB DEFAULT '["web"]', -- ['web', 'email', 'sms', 'slack']
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document storage
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  related_to_type TEXT, -- 'leave_request', 'employee', 'policy'
  related_to_id UUID,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar integrations
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'outlook', 'caldav'
  external_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  calendar_id TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Team capacity planning
CREATE TABLE IF NOT EXISTS team_capacity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_employees INTEGER DEFAULT 0,
  available_employees INTEGER DEFAULT 0,
  on_leave_employees INTEGER DEFAULT 0,
  capacity_percentage DECIMAL DEFAULT 100.0,
  critical_coverage BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, date)
);

-- Reports and analytics
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'leave_summary', 'department_usage', 'trend_analysis', 'compliance'
  parameters JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
  scheduled BOOLEAN DEFAULT false,
  schedule_cron TEXT,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing and subscriptions
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'incomplete'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  seats_included INTEGER DEFAULT 10,
  seats_used INTEGER DEFAULT 0,
  mrr DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POPIA compliance (South African privacy law)
CREATE TABLE IF NOT EXISTS data_consent (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL, -- 'data_processing', 'marketing', 'analytics'
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMPTZ NOT NULL,
  withdrawal_date TIMESTAMPTZ,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  retention_period TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_public_holidays_date ON public_holidays(date);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Insert default South African leave policies
INSERT INTO leave_policies (id, org_id, name, type, description, days_allowed, color, icon) VALUES
(gen_random_uuid(), (SELECT id FROM organizations LIMIT 1), 'Annual Leave', 'annual', 'Annual vacation leave as per BCEA', 21, '#3B82F6', 'sun'),
(gen_random_uuid(), (SELECT id FROM organizations LIMIT 1), 'Sick Leave', 'sick', 'Sick leave as per BCEA (36 days over 3 years)', 12, '#EF4444', 'heart-pulse'),
(gen_random_uuid(), (SELECT id FROM organizations LIMIT 1), 'Maternity Leave', 'maternity', '4 months consecutive maternity leave', 120, '#EC4899', 'baby'),
(gen_random_uuid(), (SELECT id FROM organizations LIMIT 1), 'Paternity Leave', 'paternity', '10 consecutive days paternity leave', 10, '#8B5CF6', 'baby'),
(gen_random_uuid(), (SELECT id FROM organizations LIMIT 1), 'Family Responsibility', 'family', 'Family responsibility leave - 3 days per year', 3, '#F59E0B', 'users'),
(gen_random_uuid(), (SELECT id FROM organizations LIMIT 1), 'Study Leave', 'study', 'Educational purposes leave', 5, '#10B981', 'book-open');

-- Insert South African public holidays for 2025
INSERT INTO public_holidays (org_id, name, date, country) VALUES
((SELECT id FROM organizations LIMIT 1), 'New Year''s Day', '2025-01-01', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Human Rights Day', '2025-03-21', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Good Friday', '2025-04-18', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Family Day', '2025-04-21', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Freedom Day', '2025-04-27', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Workers'' Day', '2025-05-01', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Youth Day', '2025-06-16', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'National Women''s Day', '2025-08-09', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Heritage Day', '2025-09-24', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Day of Reconciliation', '2025-12-16', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Christmas Day', '2025-12-25', 'ZA'),
((SELECT id FROM organizations LIMIT 1), 'Day of Goodwill', '2025-12-26', 'ZA');