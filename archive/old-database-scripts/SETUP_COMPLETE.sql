-- LeaveHub Complete Database Setup
-- This version handles all edge cases

-- ============================================
-- STEP 1: Create companies table and insert demo company
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

-- Delete existing demo company if it exists (to allow re-insert with correct ID)
DELETE FROM companies WHERE slug = 'demo-company';

-- Insert demo company with specific ID
INSERT INTO companies (id, name, slug, industry, size)
VALUES (
  '12345678-1234-1234-1234-123456789000',
  'Demo Company',
  'demo-company',
  'Technology',
  'small'
);

-- ============================================
-- STEP 2: Create profiles table
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employee',
  department VARCHAR(100),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- STEP 3: Create leave_types table
-- ============================================

CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  color VARCHAR(7) DEFAULT '#0D9488',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  description TEXT,
  requires_documentation BOOLEAN DEFAULT false,
  max_consecutive_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

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
-- STEP 4: Create leave_requests table
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
  CHECK (end_date >= start_date),
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

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
-- STEP 5: Create leave_balances table
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

-- Add computed column for available days
ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS available_days INTEGER GENERATED ALWAYS AS (entitled_days - used_days) STORED;

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
-- STEP 6: Create departments table
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Insert demo departments
INSERT INTO departments (company_id, name, description)
VALUES
  ('12345678-1234-1234-1234-123456789000', 'Engineering', 'Software development and technology'),
  ('12345678-1234-1234-1234-123456789000', 'HR', 'Human resources'),
  ('12345678-1234-1234-1234-123456789000', 'Sales', 'Sales and business development')
ON CONFLICT (company_id, name) DO NOTHING;

-- ============================================
-- STEP 7: Create notifications table
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 8: Create public_holidays table
-- ============================================

CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, date)
);

-- Insert South African public holidays for 2025
INSERT INTO public_holidays (company_id, name, date, is_recurring)
VALUES
  ('12345678-1234-1234-1234-123456789000', 'New Year''s Day', '2025-01-01', true),
  ('12345678-1234-1234-1234-123456789000', 'Human Rights Day', '2025-03-21', true),
  ('12345678-1234-1234-1234-123456789000', 'Good Friday', '2025-04-18', false),
  ('12345678-1234-1234-1234-123456789000', 'Family Day', '2025-04-21', false),
  ('12345678-1234-1234-1234-123456789000', 'Freedom Day', '2025-04-27', true),
  ('12345678-1234-1234-1234-123456789000', 'Workers'' Day', '2025-05-01', true),
  ('12345678-1234-1234-1234-123456789000', 'Youth Day', '2025-06-16', true),
  ('12345678-1234-1234-1234-123456789000', 'National Women''s Day', '2025-08-09', true),
  ('12345678-1234-1234-1234-123456789000', 'Heritage Day', '2025-09-24', true),
  ('12345678-1234-1234-1234-123456789000', 'Day of Reconciliation', '2025-12-16', true),
  ('12345678-1234-1234-1234-123456789000', 'Christmas Day', '2025-12-25', true),
  ('12345678-1234-1234-1234-123456789000', 'Day of Goodwill', '2025-12-26', true)
ON CONFLICT (company_id, date) DO NOTHING;

-- ============================================
-- STEP 9: Create indexes
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

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- ============================================
-- STEP 10: Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo (tighten in production)
DROP POLICY IF EXISTS "Allow all for profiles" ON profiles;
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for leave_types" ON leave_types;
CREATE POLICY "Allow all for leave_types" ON leave_types FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for leave_requests" ON leave_requests;
CREATE POLICY "Allow all for leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for leave_balances" ON leave_balances;
CREATE POLICY "Allow all for leave_balances" ON leave_balances FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for notifications" ON notifications;
CREATE POLICY "Allow all for notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for departments" ON departments;
CREATE POLICY "Allow all for departments" ON departments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for public_holidays" ON public_holidays;
CREATE POLICY "Allow all for public_holidays" ON public_holidays FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STEP 11: Helper Functions
-- ============================================

CREATE OR REPLACE FUNCTION deduct_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_deduct INTEGER,
  p_year INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE leave_balances
  SET used_days = used_days + p_days_to_deduct, updated_at = NOW()
  WHERE user_id = p_user_id AND leave_type_id = p_leave_type_id AND year = p_year;

  IF NOT FOUND THEN
    INSERT INTO leave_balances (user_id, leave_type_id, year, entitled_days, used_days)
    VALUES (p_user_id, p_leave_type_id, p_year, 0, p_days_to_deduct);
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_restore INTEGER,
  p_year INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE leave_balances
  SET used_days = GREATEST(0, used_days - p_days_to_restore), updated_at = NOW()
  WHERE user_id = p_user_id AND leave_type_id = p_leave_type_id AND year = p_year;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 12: Triggers
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

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON leave_balances;
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT '✅ Setup Complete!' AS status;

SELECT 'Tables created:' AS info;
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('companies', 'profiles', 'leave_types', 'leave_requests', 'leave_balances', 'departments', 'notifications', 'public_holidays')
ORDER BY table_name;

SELECT 'Data counts:' AS info;
SELECT 'Companies' AS table_name, COUNT(*) as count FROM companies
UNION ALL SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'Leave Types', COUNT(*) FROM leave_types
UNION ALL SELECT 'Leave Requests', COUNT(*) FROM leave_requests
UNION ALL SELECT 'Leave Balances', COUNT(*) FROM leave_balances
UNION ALL SELECT 'Departments', COUNT(*) FROM departments
UNION ALL SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'Public Holidays', COUNT(*) FROM public_holidays;
