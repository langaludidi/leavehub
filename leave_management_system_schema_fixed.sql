-- CORRECTED Leave Management System Schema
-- This version fixes the polname/policyname issue and uses proper PostgreSQL syntax

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users/profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
    department TEXT,
    position TEXT,
    hire_date DATE,
    manager_id UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create leave types table
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    max_days_per_year INTEGER DEFAULT 0,
    carryover_allowed BOOLEAN DEFAULT FALSE,
    requires_medical_certificate BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leave balances table
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

-- Create leave requests table
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
    
    -- Constraints
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
    is_read BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company policies table (for our new feature)
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

-- Create policy acknowledgments table
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
INSERT INTO leave_types (name, description, max_days_per_year, color) VALUES
('Annual Leave', 'Annual vacation days', 21, '#10B981'),
('Sick Leave', 'Medical leave for illness', 10, '#EF4444'),
('Maternity Leave', 'Maternity leave for new mothers', 120, '#F59E0B'),
('Paternity Leave', 'Paternity leave for new fathers', 10, '#3B82F6'),
('Personal Leave', 'Personal time off', 5, '#8B5CF6'),
('Bereavement Leave', 'Leave for family bereavement', 3, '#6B7280')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies first (avoids the polname error)
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "leave_types_select_all" ON leave_types;
DROP POLICY IF EXISTS "leave_balances_select_own" ON leave_balances;
DROP POLICY IF EXISTS "leave_requests_select_basic" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_admin_all" ON leave_requests;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "company_policies_select_all" ON company_policies;
DROP POLICY IF EXISTS "policy_acknowledgments_select_own" ON policy_acknowledgments;
DROP POLICY IF EXISTS "policy_acknowledgments_insert_own" ON policy_acknowledgments;
DROP POLICY IF EXISTS "policy_acknowledgments_update_own" ON policy_acknowledgments;

-- Create RLS policies for user_profiles
CREATE POLICY "user_profiles_select_own" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for leave_types (read-only for all authenticated users)
CREATE POLICY "leave_types_select_all" ON leave_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for leave_balances
CREATE POLICY "leave_balances_select_own" ON leave_balances
    FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for leave_requests
CREATE POLICY "leave_requests_select_basic" ON leave_requests
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('manager', 'admin')
        )
    );

CREATE POLICY "leave_requests_insert_own" ON leave_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leave_requests_update_own" ON leave_requests
    FOR UPDATE USING (
        (auth.uid() = user_id AND status = 'pending') OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('manager', 'admin')
        )
    );

CREATE POLICY "leave_requests_delete_own" ON leave_requests
    FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Create RLS policies for notifications
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Create RLS policies for company policies (readable by all authenticated users)
CREATE POLICY "company_policies_select_all" ON company_policies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for policy acknowledgments
CREATE POLICY "policy_acknowledgments_select_own" ON policy_acknowledgments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "policy_acknowledgments_insert_own" ON policy_acknowledgments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "policy_acknowledgments_update_own" ON policy_acknowledgments
    FOR UPDATE USING (auth.uid() = user_id);

-- Create useful functions
CREATE OR REPLACE FUNCTION calculate_business_days(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
DECLARE
    business_days INTEGER := 0;
    current_date DATE := start_date;
BEGIN
    WHILE current_date <= end_date LOOP
        IF EXTRACT(dow FROM current_date) NOT IN (0, 6) THEN -- Not Sunday(0) or Saturday(6)
            business_days := business_days + 1;
        END IF;
        current_date := current_date + 1;
    END LOOP;
    
    RETURN business_days;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update leave balances
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE leave_balances 
        SET used_days = used_days + NEW.days_requested,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
        AND leave_type_id = NEW.leave_type_id 
        AND year = EXTRACT(year FROM NEW.start_date);
        
        UPDATE leave_balances 
        SET pending_days = pending_days - NEW.days_requested,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
        AND leave_type_id = NEW.leave_type_id 
        AND year = EXTRACT(year FROM NEW.start_date)
        AND pending_days >= NEW.days_requested;
    END IF;
    
    IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
        UPDATE leave_balances 
        SET pending_days = pending_days + NEW.days_requested,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
        AND leave_type_id = NEW.leave_type_id 
        AND year = EXTRACT(year FROM NEW.start_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS leave_request_status_change ON leave_requests;
CREATE TRIGGER leave_request_status_change
    AFTER UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance_on_approval();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON leave_balances(user_id, year);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_user_policy ON policy_acknowledgments(user_id, policy_id);

-- Final verification
SELECT 'Leave Management System schema created successfully!' as status;