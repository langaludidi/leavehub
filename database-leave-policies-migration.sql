-- Leave Policies and Organization Configuration
-- This migration creates tables for custom leave policies per organization

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Types - customizable per organization
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Vacation", "Sick Leave", "Personal Time"
  code TEXT NOT NULL, -- e.g., "vacation", "sick", "personal" - used in forms/API
  description TEXT,
  color TEXT DEFAULT '#3b82f6', -- for UI display
  icon TEXT DEFAULT '📅', -- emoji or icon name
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  max_consecutive_days INTEGER, -- max days that can be taken consecutively
  min_advance_notice_days INTEGER DEFAULT 0, -- minimum days of advance notice required
  blackout_periods JSONB DEFAULT '[]', -- array of date ranges when this leave type can't be taken
  is_paid BOOLEAN DEFAULT true,
  carries_over BOOLEAN DEFAULT false, -- can unused days carry over to next year
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- Accrual Policies - how leave is earned/allocated
CREATE TABLE IF NOT EXISTS accrual_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  accrual_method TEXT NOT NULL CHECK (accrual_method IN ('monthly', 'yearly', 'per_pay_period', 'manual')),
  accrual_amount DECIMAL(5,2) NOT NULL, -- days/hours earned per period
  max_balance DECIMAL(5,2), -- maximum days/hours that can be accumulated
  waiting_period_days INTEGER DEFAULT 0, -- days before employee starts accruing
  proration_method TEXT DEFAULT 'none' CHECK (proration_method IN ('none', 'monthly', 'daily')),
  anniversary_based BOOLEAN DEFAULT false, -- accrue based on hire date anniversary vs calendar year
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Leave Balances - tracks current balances per employee per leave type
CREATE TABLE IF NOT EXISTS employee_leave_balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID NOT NULL, -- references auth.users
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  current_balance DECIMAL(5,2) DEFAULT 0,
  accrued_this_year DECIMAL(5,2) DEFAULT 0,
  used_this_year DECIMAL(5,2) DEFAULT 0,
  carried_over DECIMAL(5,2) DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(year FROM NOW()),
  last_accrual_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Approval Workflows - define who can approve what
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE, -- null means applies to all leave types
  workflow_name TEXT NOT NULL,
  conditions JSONB DEFAULT '{}', -- conditions for when this workflow applies
  approval_levels JSONB NOT NULL, -- array of approval levels with rules
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Policy Rules - additional business rules
CREATE TABLE IF NOT EXISTS leave_policy_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('blackout_period', 'minimum_notice', 'maximum_duration', 'required_balance', 'custom')),
  leave_type_ids UUID[] DEFAULT '{}', -- applies to specific leave types, empty means all
  conditions JSONB DEFAULT '{}', -- conditions for when rule applies
  parameters JSONB DEFAULT '{}', -- rule-specific parameters
  error_message TEXT, -- message shown when rule is violated
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add organization_id to leave_requests if it doesn't exist
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leave_types_organization ON leave_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_leave_types_active ON leave_types(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_accrual_policies_org_leave_type ON accrual_policies(organization_id, leave_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_balances_employee ON employee_leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_balances_leave_type ON employee_leave_balances(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_org ON approval_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_leave_rules_org ON leave_policy_rules(organization_id);

-- Row Level Security (RLS) policies
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE accrual_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_types
CREATE POLICY "Users can view leave types from their organization" ON leave_types
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage leave types" ON leave_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = leave_types.organization_id
    )
  );

-- RLS Policies for accrual_policies
CREATE POLICY "Users can view accrual policies from their organization" ON accrual_policies
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage accrual policies" ON accrual_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = accrual_policies.organization_id
    )
  );

-- RLS Policies for employee_leave_balances
CREATE POLICY "Users can view their own balances" ON employee_leave_balances
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Admins and managers can view organization balances" ON employee_leave_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.organization_id = up2.organization_id
      WHERE up1.user_id = auth.uid() 
      AND up1.role IN ('admin', 'manager')
      AND up2.user_id = employee_leave_balances.employee_id
    )
  );

CREATE POLICY "Admins can manage all balances" ON employee_leave_balances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.organization_id = up2.organization_id
      WHERE up1.user_id = auth.uid() 
      AND up1.role = 'admin'
      AND up2.user_id = employee_leave_balances.employee_id
    )
  );

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization" ON organizations
  FOR ALL USING (
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Function to get organization's leave types
CREATE OR REPLACE FUNCTION get_organization_leave_types(org_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  code TEXT,
  description TEXT,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN,
  requires_approval BOOLEAN,
  max_consecutive_days INTEGER,
  min_advance_notice_days INTEGER,
  is_paid BOOLEAN,
  carries_over BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lt.id,
    lt.name,
    lt.code,
    lt.description,
    lt.color,
    lt.icon,
    lt.is_active,
    lt.requires_approval,
    lt.max_consecutive_days,
    lt.min_advance_notice_days,
    lt.is_paid,
    lt.carries_over
  FROM leave_types lt
  WHERE lt.organization_id = org_id
    AND lt.is_active = true
  ORDER BY lt.name;
END;
$$;

-- Function to calculate leave balance for an employee
CREATE OR REPLACE FUNCTION calculate_leave_balance(
  emp_id UUID,
  leave_type_id UUID,
  as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance DECIMAL(5,2) := 0;
BEGIN
  -- Get current balance from employee_leave_balances
  SELECT COALESCE(current_balance, 0)
  INTO balance
  FROM employee_leave_balances
  WHERE employee_id = emp_id 
    AND leave_type_id = calculate_leave_balance.leave_type_id
    AND year = EXTRACT(year FROM as_of_date);
  
  RETURN COALESCE(balance, 0);
END;
$$;

-- Create default leave types for organizations that don't have any
CREATE OR REPLACE FUNCTION create_default_leave_types(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if organization already has leave types
  IF EXISTS (SELECT 1 FROM leave_types WHERE organization_id = org_id) THEN
    RETURN;
  END IF;

  -- Insert default leave types
  INSERT INTO leave_types (organization_id, name, code, description, color, icon, requires_approval, is_paid, carries_over, min_advance_notice_days)
  VALUES 
    (org_id, 'Vacation', 'vacation', 'Annual vacation time', '#10b981', '🏖️', true, true, true, 14),
    (org_id, 'Sick Leave', 'sick', 'Medical leave for illness', '#f59e0b', '🤒', false, true, false, 0),
    (org_id, 'Personal Leave', 'personal', 'Personal time off', '#8b5cf6', '👤', true, true, false, 7),
    (org_id, 'Maternity/Paternity Leave', 'maternity', 'Leave for new parents', '#ec4899', '👶', true, true, false, 30),
    (org_id, 'Bereavement Leave', 'bereavement', 'Time off for family loss', '#6b7280', '🕊️', false, true, false, 0);
END;
$$;

-- Trigger to automatically create default leave types for new organizations
CREATE OR REPLACE FUNCTION trigger_create_default_leave_types()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM create_default_leave_types(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_default_leave_types_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_leave_types();