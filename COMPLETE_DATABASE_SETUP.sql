-- ============================================
-- LeaveHub Complete Database Setup with RBAC
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE ENUM TYPE FOR ROLES
-- ============================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'employee',
    'manager',
    'hr_admin',
    'admin',
    'super_admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert demo company
INSERT INTO companies (id, name, slug, industry, size)
VALUES (
  '12345678-1234-1234-1234-123456789000',
  'Demo Company',
  'demo-company',
  'Technology',
  'small'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. PROFILES TABLE (with role enum)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role user_role DEFAULT 'employee' NOT NULL,
  department VARCHAR(100),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- Add comment to role column
COMMENT ON COLUMN profiles.role IS 'User role: employee, manager, hr_admin, admin, or super_admin';

-- ============================================
-- 4. LEAVE TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  color VARCHAR(7) DEFAULT '#0D9488',
  description TEXT,
  requires_documentation BOOLEAN DEFAULT false,
  max_consecutive_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- Insert default BCEA-compliant leave types
INSERT INTO leave_types (company_id, name, code, color, description, requires_documentation, max_consecutive_days)
VALUES
  ('12345678-1234-1234-1234-123456789000', 'Annual Leave', 'ANN', '#0D9488', '21 consecutive days per year (BCEA compliant)', false, 21),
  ('12345678-1234-1234-1234-123456789000', 'Sick Leave', 'SICK', '#EF4444', '30 days per 3-year cycle (BCEA compliant)', true, NULL),
  ('12345678-1234-1234-1234-123456789000', 'Family Responsibility', 'FAM', '#F59E0B', '3 days per year for family matters', false, 3),
  ('12345678-1234-1234-1234-123456789000', 'Maternity Leave', 'MAT', '#EC4899', '4 consecutive months (BCEA compliant)', true, 120),
  ('12345678-1234-1234-1234-123456789000', 'Paternity Leave', 'PAT', '#3B82F6', '10 consecutive days (BCEA compliant)', true, 10),
  ('12345678-1234-1234-1234-123456789000', 'Adoption Leave', 'ADOP', '#8B5CF6', 'Adoptive parents leave', true, 60),
  ('12345678-1234-1234-1234-123456789000', 'Surrogacy Leave', 'SURR', '#06B6D4', 'Commissioning parents leave', true, 60),
  ('12345678-1234-1234-1234-123456789000', 'Compassionate Leave', 'COMP', '#6B7280', 'Bereavement and family emergencies', false, 5),
  ('12345678-1234-1234-1234-123456789000', 'Study Leave', 'STUDY', '#10B981', 'Educational purposes', false, NULL)
ON CONFLICT (company_id, code) DO NOTHING;

-- ============================================
-- 5. LEAVE BALANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  entitled_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  used_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  available_days DECIMAL(5,2) GENERATED ALWAYS AS (entitled_days - used_days) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, leave_type_id, year)
);

-- ============================================
-- 6. LEAVE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  working_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  document_paths TEXT[] DEFAULT '{}',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================
-- 8. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leave_request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND (role = (SELECT role FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'))
  );

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('hr_admin', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Managers can read team profiles" ON profiles;
CREATE POLICY "Managers can read team profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND p.role IN ('manager', 'hr_admin', 'admin', 'super_admin')
      AND (profiles.department = p.department OR p.role IN ('hr_admin', 'admin', 'super_admin'))
    )
  );

-- LEAVE REQUESTS POLICIES
DROP POLICY IF EXISTS "Users can read own requests" ON leave_requests;
CREATE POLICY "Users can read own requests"
  ON leave_requests FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

DROP POLICY IF EXISTS "Users can create own requests" ON leave_requests;
CREATE POLICY "Users can create own requests"
  ON leave_requests FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_clerk_id text)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE clerk_user_id = user_clerk_id LIMIT 1;
$$;

-- Function to check if user has permission based on role hierarchy
CREATE OR REPLACE FUNCTION has_role_permission(user_clerk_id text, required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_val user_role;
  role_hierarchy int;
  required_hierarchy int;
BEGIN
  SELECT role INTO user_role_val FROM profiles WHERE clerk_user_id = user_clerk_id LIMIT 1;

  role_hierarchy := CASE user_role_val
    WHEN 'employee' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'hr_admin' THEN 3
    WHEN 'admin' THEN 4
    WHEN 'super_admin' THEN 5
    ELSE 0
  END;

  required_hierarchy := CASE required_role
    WHEN 'employee' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'hr_admin' THEN 3
    WHEN 'admin' THEN 4
    WHEN 'super_admin' THEN 5
    ELSE 0
  END;

  RETURN role_hierarchy >= required_hierarchy;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role_permission(text, user_role) TO authenticated;

-- ============================================
-- 11. SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ LeaveHub database setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your user profile by signing up at the app';
  RAISE NOTICE '2. Assign yourself as super_admin:';
  RAISE NOTICE '   UPDATE profiles SET role = ''super_admin'' WHERE email = ''your-email@example.com'';';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You''re ready to use LeaveHub!';
END $$;
