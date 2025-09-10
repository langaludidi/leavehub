-- COMPLETE LeaveHub Database Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table first
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    website TEXT,
    industry TEXT,
    size_category TEXT,
    subscription_plan TEXT DEFAULT 'trial',
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a default organization if none exists
INSERT INTO organizations (id, name, slug, created_at)
SELECT uuid_generate_v4(), 'Default Organization', 'default-org', NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1);

-- Create profiles table (maps to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization_members table (this was missing!)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin', 'owner')),
    department TEXT,
    position TEXT,
    hire_date DATE,
    salary DECIMAL(12,2),
    manager_id UUID REFERENCES organization_members(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Create leave_types table
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    max_days_per_year INTEGER DEFAULT 0,
    carryover_allowed BOOLEAN DEFAULT FALSE,
    requires_medical_certificate BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leave_balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    allocated_days DECIMAL(5,2) DEFAULT 0,
    used_days DECIMAL(5,2) DEFAULT 0,
    pending_days DECIMAL(5,2) DEFAULT 0,
    remaining_days DECIMAL(5,2) GENERATED ALWAYS AS (allocated_days - used_days - pending_days) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, leave_type_id, year)
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    medical_certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (end_date >= start_date),
    CHECK (days_requested > 0)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    category TEXT DEFAULT 'General' CHECK (category IN ('General', 'Death', 'Promotion', 'Termination', 'Leave', 'System')),
    is_read BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_policies table
CREATE TABLE IF NOT EXISTS company_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    policy_group TEXT NOT NULL,
    version TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    mandatory BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    date_created DATE DEFAULT CURRENT_DATE,
    last_modified DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create policy_acknowledgments table
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES company_policies(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    understood BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, policy_id)
);

-- Insert default leave types
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get the first organization ID
    SELECT id INTO default_org_id FROM organizations LIMIT 1;
    
    IF default_org_id IS NOT NULL THEN
        INSERT INTO leave_types (organization_id, name, description, max_days_per_year, color) 
        SELECT default_org_id, v.name, v.description, v.max_days_per_year, v.color FROM (VALUES
            ('Annual Leave', 'Annual vacation days', 21, '#10B981'),
            ('Sick Leave', 'Medical leave for illness', 10, '#EF4444'),
            ('Maternity Leave', 'Maternity leave for new mothers', 120, '#F59E0B'),
            ('Paternity Leave', 'Paternity leave for new fathers', 10, '#3B82F6'),
            ('Personal Leave', 'Personal time off', 5, '#8B5CF6'),
            ('Bereavement Leave', 'Leave for family bereavement', 3, '#6B7280')
        ) AS v(name, description, max_days_per_year, color)
        WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = v.name AND organization_id = default_org_id);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "organizations_select_member" ON organizations;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "organization_members_select_own_org" ON organization_members;
DROP POLICY IF EXISTS "leave_types_select_org" ON leave_types;
DROP POLICY IF EXISTS "leave_balances_select_own" ON leave_balances;
DROP POLICY IF EXISTS "leave_requests_select_basic" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_own" ON leave_requests;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "company_policies_select_all" ON company_policies;
DROP POLICY IF EXISTS "policy_acknowledgments_select_own" ON policy_acknowledgments;
DROP POLICY IF EXISTS "policy_acknowledgments_insert_own" ON policy_acknowledgments;
DROP POLICY IF EXISTS "policy_acknowledgments_update_own" ON policy_acknowledgments;

-- Create RLS policies
-- Organizations
CREATE POLICY "organizations_select_member" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organizations.id 
            AND organization_members.user_id = auth.uid()
            AND organization_members.is_active = true
        )
    );

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Organization Members
CREATE POLICY "organization_members_select_own_org" ON organization_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM organization_members om 
            WHERE om.organization_id = organization_members.organization_id 
            AND om.user_id = auth.uid() 
            AND om.role IN ('manager', 'admin', 'owner')
            AND om.is_active = true
        )
    );

CREATE POLICY "organization_members_insert_admin" ON organization_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om 
            WHERE om.organization_id = organization_members.organization_id 
            AND om.user_id = auth.uid() 
            AND om.role IN ('admin', 'owner')
            AND om.is_active = true
        )
    );

-- Leave Types
CREATE POLICY "leave_types_select_org" ON leave_types
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = leave_types.organization_id 
            AND organization_members.user_id = auth.uid()
            AND organization_members.is_active = true
        )
    );

-- Leave Balances
CREATE POLICY "leave_balances_select_own" ON leave_balances
    FOR SELECT USING (auth.uid() = user_id);

-- Leave Requests
CREATE POLICY "leave_requests_select_basic" ON leave_requests
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.user_id = auth.uid() 
            AND organization_members.role IN ('manager', 'admin', 'owner')
            AND organization_members.is_active = true
        )
    );

CREATE POLICY "leave_requests_insert_own" ON leave_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leave_requests_update_own" ON leave_requests
    FOR UPDATE USING (
        (auth.uid() = user_id AND status = 'pending') OR
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.user_id = auth.uid() 
            AND organization_members.role IN ('manager', 'admin', 'owner')
            AND organization_members.is_active = true
        )
    );

CREATE POLICY "leave_requests_delete_own" ON leave_requests
    FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Notifications
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Company Policies
CREATE POLICY "company_policies_select_all" ON company_policies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy Acknowledgments
CREATE POLICY "policy_acknowledgments_select_own" ON policy_acknowledgments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "policy_acknowledgments_insert_own" ON policy_acknowledgments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "policy_acknowledgments_update_own" ON policy_acknowledgments
    FOR UPDATE USING (auth.uid() = user_id);

SELECT 'Complete LeaveHub database schema created successfully!' as status;