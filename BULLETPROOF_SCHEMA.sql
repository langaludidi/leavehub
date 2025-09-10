-- BULLETPROOF Leave Management System Schema
-- This version checks actual column structures before creating policies

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, let's handle the organizations table and constraint
DO $$
DECLARE
    default_org_id UUID;
    org_exists BOOLEAN := FALSE;
BEGIN
  -- Check if organizations table exists and get/create a valid org_id
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
    -- Get existing org_id from organizations table
    SELECT id INTO default_org_id FROM organizations LIMIT 1;
    
    IF default_org_id IS NULL THEN
      -- Create a default organization if none exists
      INSERT INTO organizations (id, name, created_at) 
      VALUES (uuid_generate_v4(), 'Default Organization', NOW()) 
      RETURNING id INTO default_org_id;
    END IF;
    org_exists := TRUE;
  ELSE
    -- If no organizations table, we'll work without org_id constraint
    default_org_id := NULL;
  END IF;

  -- Store the org_id for later use
  CREATE TEMP TABLE IF NOT EXISTS temp_org_info (org_id UUID);
  DELETE FROM temp_org_info;
  INSERT INTO temp_org_info (org_id) VALUES (default_org_id);
  
END $$;

-- Check and create/alter leave_types table
DO $$
DECLARE
    default_org_id UUID;
BEGIN
  -- Get the org_id we stored
  SELECT org_id INTO default_org_id FROM temp_org_info LIMIT 1;
  
  -- Check if leave_types table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leave_types') THEN
    -- Create table if it doesn't exist
    IF default_org_id IS NOT NULL THEN
      CREATE TABLE leave_types (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES organizations(id),
        name TEXT NOT NULL,
        description TEXT,
        max_days_per_year INTEGER DEFAULT 0,
        carryover_allowed BOOLEAN DEFAULT FALSE,
        requires_medical_certificate BOOLEAN DEFAULT FALSE,
        color TEXT DEFAULT '#3B82F6',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    ELSE
      CREATE TABLE leave_types (
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
    END IF;
  ELSE
    -- Add missing columns to existing table
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'description') THEN
      ALTER TABLE leave_types ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'max_days_per_year') THEN
      ALTER TABLE leave_types ADD COLUMN max_days_per_year INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'carryover_allowed') THEN
      ALTER TABLE leave_types ADD COLUMN carryover_allowed BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'requires_medical_certificate') THEN
      ALTER TABLE leave_types ADD COLUMN requires_medical_certificate BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'color') THEN
      ALTER TABLE leave_types ADD COLUMN color TEXT DEFAULT '#3B82F6';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'is_active') THEN
      ALTER TABLE leave_types ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'created_at') THEN
      ALTER TABLE leave_types ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Create other tables only if they don't exist
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

-- Create new tables for company policies feature
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

-- Insert default leave types safely
DO $$
DECLARE
    default_org_id UUID;
    has_org_constraint BOOLEAN := FALSE;
BEGIN
  -- Get the org_id we stored
  SELECT org_id INTO default_org_id FROM temp_org_info LIMIT 1;
  
  -- Check if org_id column exists and has a foreign key constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc 
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'leave_types' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'org_id'
  ) THEN
    has_org_constraint := TRUE;
  END IF;
  
  -- Insert data based on constraints and available columns
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_types' AND column_name = 'description') THEN
    IF has_org_constraint AND default_org_id IS NOT NULL THEN
      -- Insert with valid org_id
      INSERT INTO leave_types (org_id, name, description, max_days_per_year, color) 
      SELECT default_org_id, v.name, v.description, v.max_days_per_year, v.color FROM (VALUES
        ('Annual Leave', 'Annual vacation days', 21, '#10B981'),
        ('Sick Leave', 'Medical leave for illness', 10, '#EF4444'),
        ('Maternity Leave', 'Maternity leave for new mothers', 120, '#F59E0B'),
        ('Paternity Leave', 'Paternity leave for new fathers', 10, '#3B82F6'),
        ('Personal Leave', 'Personal time off', 5, '#8B5CF6'),
        ('Bereavement Leave', 'Leave for family bereavement', 3, '#6B7280')
      ) AS v(name, description, max_days_per_year, color)
      WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = v.name);
    ELSE
      -- Insert without org_id (let it be NULL or use existing values)
      INSERT INTO leave_types (name, description, max_days_per_year, color) 
      SELECT v.name, v.description, v.max_days_per_year, v.color FROM (VALUES
        ('Annual Leave', 'Annual vacation days', 21, '#10B981'),
        ('Sick Leave', 'Medical leave for illness', 10, '#EF4444'),
        ('Maternity Leave', 'Maternity leave for new mothers', 120, '#F59E0B'),
        ('Paternity Leave', 'Paternity leave for new fathers', 10, '#3B82F6'),
        ('Personal Leave', 'Personal time off', 5, '#8B5CF6'),
        ('Bereavement Leave', 'Leave for family bereavement', 3, '#6B7280')
      ) AS v(name, description, max_days_per_year, color)
      WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE name = v.name);
    END IF;
  END IF;
END $$;

-- Clean up temp table
DROP TABLE IF EXISTS temp_org_info;

-- Enable Row Level Security on all tables safely
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leave_types') THEN
    ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leave_balances') THEN
    ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leave_requests') THEN
    ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_policies') THEN
    ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'policy_acknowledgments') THEN
    ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Clean up any existing policies first (avoids the polname error)
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "leave_types_select_all" ON leave_types;
DROP POLICY IF EXISTS "leave_balances_select_own" ON leave_balances;
DROP POLICY IF EXISTS "leave_requests_select_basic" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_own" ON leave_requests;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_select_all" ON notifications;
DROP POLICY IF EXISTS "company_policies_select_all" ON company_policies;
DROP POLICY IF EXISTS "policy_acknowledgments_select_own" ON policy_acknowledgments;
DROP POLICY IF EXISTS "policy_acknowledgments_insert_own" ON policy_acknowledgments;
DROP POLICY IF EXISTS "policy_acknowledgments_update_own" ON policy_acknowledgments;

-- Create RLS policies only if tables exist with correct columns
DO $$
BEGIN
  -- User profiles policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') AND
     EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
    CREATE POLICY "user_profiles_select_own" ON user_profiles
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "user_profiles_update_own" ON user_profiles
        FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Leave types policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leave_types') THEN
    CREATE POLICY "leave_types_select_all" ON leave_types
        FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- Leave balances policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leave_balances') AND
     EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_balances' AND column_name = 'user_id') THEN
    CREATE POLICY "leave_balances_select_own" ON leave_balances
        FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Leave requests policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leave_requests') AND
     EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'user_id') THEN
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
  END IF;

  -- Notifications policies - check what columns actually exist
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') AND
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_public') THEN
      -- Notifications table has user_id and is_public columns
      CREATE POLICY "notifications_select_own" ON notifications
          FOR SELECT USING (auth.uid() = user_id OR is_public = true);
    ELSE
      -- Fallback: allow all authenticated users to read notifications
      CREATE POLICY "notifications_select_all" ON notifications
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
  END IF;

  -- Company policies policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_policies') THEN
    CREATE POLICY "company_policies_select_all" ON company_policies
        FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- Policy acknowledgments policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'policy_acknowledgments') AND
     EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'policy_acknowledgments' AND column_name = 'user_id') THEN
    CREATE POLICY "policy_acknowledgments_select_own" ON policy_acknowledgments
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "policy_acknowledgments_insert_own" ON policy_acknowledgments
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "policy_acknowledgments_update_own" ON policy_acknowledgments
        FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

SELECT 'Bulletproof Leave Management System schema created successfully!' as status;