-- LeaveHub Database Setup SQL (Works with existing tables)
-- Copy and paste this into Supabase SQL Editor

-- ============================================
-- 1. COMPANIES TABLE - Add missing columns
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS size VARCHAR(50);

-- Insert demo company if it doesn't exist
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
-- 2. PROFILES TABLE - Add missing columns
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Insert demo profile
INSERT INTO profiles (id, clerk_user_id, email, first_name, last_name, role, department, company_id)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  'demo-user-123',
  'demo@leavehub.com',
  'Demo',
  'User',
  'employee',
  'Engineering',
  '12345678-1234-1234-1234-123456789000'
)
ON CONFLICT (clerk_user_id) DO NOTHING;

-- Insert demo team members
INSERT INTO profiles (clerk_user_id, email, first_name, last_name, role, department, company_id)
VALUES
  ('team-member-1', 'jane@leavehub.com', 'Jane', 'Smith', 'employee', 'Engineering', '12345678-1234-1234-1234-123456789000'),
  ('team-member-2', 'john@leavehub.com', 'John', 'Doe', 'employee', 'Engineering', '12345678-1234-1234-1234-123456789000'),
  ('manager-1', 'manager@leavehub.com', 'Sarah', 'Manager', 'manager', 'Engineering', '12345678-1234-1234-1234-123456789000')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- ============================================
-- 3. LEAVE TYPES TABLE - Add missing columns
-- ============================================
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  color VARCHAR(7) DEFAULT '#0D9488',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS requires_documentation BOOLEAN DEFAULT false;
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS max_consecutive_days INTEGER;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leave_types_company_id_code_key'
  ) THEN
    ALTER TABLE leave_types ADD CONSTRAINT leave_types_company_id_code_key UNIQUE(company_id, code);
  END IF;
END $$;

-- Insert default leave types for demo company
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
-- 4. LEAVE REQUESTS TABLE - Add missing columns
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS document_paths TEXT[] DEFAULT '{}';
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reviewer_comments TEXT;

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_dates'
  ) THEN
    ALTER TABLE leave_requests ADD CONSTRAINT valid_dates CHECK (end_date >= start_date);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_status'
  ) THEN
    ALTER TABLE leave_requests ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));
  END IF;
END $$;

-- Insert demo leave requests
INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, working_days, reason, status)
SELECT
  p.id,
  lt.id,
  '2025-12-23'::DATE,
  '2025-12-27'::DATE,
  5,
  3,
  'Christmas holiday',
  'approved'
FROM profiles p
CROSS JOIN leave_types lt
WHERE p.clerk_user_id = 'demo-user-123'
  AND lt.code = 'ANN'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, working_days, reason, status)
SELECT
  p.id,
  lt.id,
  '2025-11-10'::DATE,
  '2025-11-14'::DATE,
  5,
  5,
  'Family vacation',
  'approved'
FROM profiles p
CROSS JOIN leave_types lt
WHERE p.clerk_user_id = 'team-member-1'
  AND lt.code = 'ANN'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, working_days, reason, status)
SELECT
  p.id,
  lt.id,
  '2025-11-01'::DATE,
  '2025-11-03'::DATE,
  3,
  2,
  'Personal matters',
  'approved'
FROM profiles p
CROSS JOIN leave_types lt
WHERE p.clerk_user_id = 'team-member-2'
  AND lt.code = 'FAM'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. LEAVE BALANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  entitled_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, leave_type_id, year)
);

-- Insert demo balances for demo user
INSERT INTO leave_balances (user_id, leave_type_id, year, entitled_days, used_days)
SELECT
  p.id,
  lt.id,
  2025,
  CASE
    WHEN lt.code = 'ANN' THEN 21
    WHEN lt.code = 'SICK' THEN 10
    WHEN lt.code = 'FAM' THEN 3
    ELSE 0
  END,
  CASE
    WHEN lt.code = 'ANN' THEN 6
    WHEN lt.code = 'SICK' THEN 2
    WHEN lt.code = 'FAM' THEN 1
    ELSE 0
  END
FROM profiles p
CROSS JOIN leave_types lt
WHERE p.clerk_user_id = 'demo-user-123'
  AND lt.code IN ('ANN', 'SICK', 'FAM')
ON CONFLICT (user_id, leave_type_id, year) DO NOTHING;

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department, company_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_status ON leave_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_leave_balances_user ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON leave_balances(user_id, year);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can view leave types" ON leave_types;
CREATE POLICY "Users can view leave types" ON leave_types
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view leave requests" ON leave_requests;
CREATE POLICY "Users can view leave requests" ON leave_requests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own leave requests" ON leave_requests;
CREATE POLICY "Users can insert their own leave requests" ON leave_requests
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own leave requests" ON leave_requests;
CREATE POLICY "Users can update their own leave requests" ON leave_requests
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can view leave balances" ON leave_balances;
CREATE POLICY "Users can view leave balances" ON leave_balances
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert leave balances" ON leave_balances;
CREATE POLICY "Users can insert leave balances" ON leave_balances
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update leave balances" ON leave_balances;
CREATE POLICY "Users can update leave balances" ON leave_balances
  FOR UPDATE USING (true);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to deduct leave balance
CREATE OR REPLACE FUNCTION deduct_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_deduct INTEGER,
  p_year INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE leave_balances
  SET
    used_days = used_days + p_days_to_deduct,
    updated_at = NOW()
  WHERE
    user_id = p_user_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;

  IF NOT FOUND THEN
    INSERT INTO leave_balances (user_id, leave_type_id, year, entitled_days, used_days)
    VALUES (p_user_id, p_leave_type_id, p_year, 0, p_days_to_deduct);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to restore leave balance
CREATE OR REPLACE FUNCTION restore_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_restore INTEGER,
  p_year INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE leave_balances
  SET
    used_days = GREATEST(0, used_days - p_days_to_restore),
    updated_at = NOW()
  WHERE
    user_id = p_user_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON leave_balances;
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Setup complete! Tables updated:' AS message;
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('companies', 'profiles', 'leave_types', 'leave_requests', 'leave_balances')
ORDER BY table_name;

SELECT 'Demo data counts:' AS message;
SELECT 'Companies' AS table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Leave Types', COUNT(*) FROM leave_types
UNION ALL
SELECT 'Leave Requests', COUNT(*) FROM leave_requests
UNION ALL
SELECT 'Leave Balances', COUNT(*) FROM leave_balances;
