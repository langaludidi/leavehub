-- LeaveHub Database Setup - SIMPLE VERSION
-- This works with existing tables and fixes foreign key issues

-- ============================================
-- 1. FIX COMPANIES - Use existing or create new
-- ============================================

-- First, let's see what companies exist and use the first one
DO $$
DECLARE
  existing_company_id UUID;
BEGIN
  -- Get first existing company
  SELECT id INTO existing_company_id FROM companies LIMIT 1;

  -- If no company exists, create one
  IF existing_company_id IS NULL THEN
    INSERT INTO companies (id, name, slug)
    VALUES (
      '12345678-1234-1234-1234-123456789000',
      'Demo Company',
      'demo-company-' || floor(random() * 1000)
    );
    existing_company_id := '12345678-1234-1234-1234-123456789000';
  END IF;

  -- Store it for later use
  CREATE TEMP TABLE IF NOT EXISTS temp_company_id (id UUID);
  DELETE FROM temp_company_id;
  INSERT INTO temp_company_id VALUES (existing_company_id);
END $$;

-- Add missing columns to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS size VARCHAR(50);

-- ============================================
-- 2. FIX PROFILES
-- ============================================

-- Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_company_id_fkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Insert demo profiles using the existing company
INSERT INTO profiles (id, clerk_user_id, email, first_name, last_name, role, department, company_id)
SELECT
  '12345678-1234-1234-1234-123456789012',
  'demo-user-123',
  'demo@leavehub.com',
  'Demo',
  'User',
  'employee',
  'Engineering',
  (SELECT id FROM temp_company_id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE clerk_user_id = 'demo-user-123');

INSERT INTO profiles (clerk_user_id, email, first_name, last_name, role, department, company_id)
SELECT
  'team-member-1',
  'jane@leavehub.com',
  'Jane',
  'Smith',
  'employee',
  'Engineering',
  (SELECT id FROM temp_company_id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE clerk_user_id = 'team-member-1');

INSERT INTO profiles (clerk_user_id, email, first_name, last_name, role, department, company_id)
SELECT
  'team-member-2',
  'john@leavehub.com',
  'John',
  'Doe',
  'employee',
  'Engineering',
  (SELECT id FROM temp_company_id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE clerk_user_id = 'team-member-2');

INSERT INTO profiles (clerk_user_id, email, first_name, last_name, role, department, company_id)
SELECT
  'manager-1',
  'manager@leavehub.com',
  'Sarah',
  'Manager',
  'manager',
  'Engineering',
  (SELECT id FROM temp_company_id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE clerk_user_id = 'manager-1');

-- ============================================
-- 3. FIX LEAVE TYPES
-- ============================================

-- Add missing columns
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS requires_documentation BOOLEAN DEFAULT false;
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS max_consecutive_days INTEGER;

-- Insert leave types using existing company
INSERT INTO leave_types (company_id, name, code, color, description, requires_documentation, max_consecutive_days)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Annual Leave',
  'ANN',
  '#0D9488',
  '21 consecutive days per year',
  false,
  21
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'ANN');

INSERT INTO leave_types (company_id, name, code, color, description, requires_documentation)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Sick Leave',
  'SICK',
  '#EF4444',
  '30 days per 3-year cycle',
  true
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'SICK');

INSERT INTO leave_types (company_id, name, code, color, description, max_consecutive_days)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Family Responsibility',
  'FAM',
  '#F59E0B',
  '3 days per year',
  3
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'FAM');

INSERT INTO leave_types (company_id, name, code, color, description, requires_documentation, max_consecutive_days)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Maternity Leave',
  'MAT',
  '#EC4899',
  '4 consecutive months',
  true,
  120
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'MAT');

INSERT INTO leave_types (company_id, name, code, color, description, requires_documentation, max_consecutive_days)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Paternity Leave',
  'PAT',
  '#3B82F6',
  '10 consecutive days',
  true,
  10
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'PAT');

INSERT INTO leave_types (company_id, name, code, color, description, requires_documentation, max_consecutive_days)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Adoption Leave',
  'ADOP',
  '#8B5CF6',
  'Adoptive parents leave',
  true,
  60
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'ADOP');

INSERT INTO leave_types (company_id, name, code, color, description, requires_documentation, max_consecutive_days)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Surrogacy Leave',
  'SURR',
  '#06B6D4',
  'Commissioning parents leave',
  true,
  60
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'SURR');

INSERT INTO leave_types (company_id, name, code, color, description, max_consecutive_days)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Compassionate Leave',
  'COMP',
  '#6B7280',
  'Bereavement',
  5
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'COMP');

INSERT INTO leave_types (company_id, name, code, color, description)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Study Leave',
  'STUDY',
  '#10B981',
  'Educational purposes'
WHERE NOT EXISTS (SELECT 1 FROM leave_types WHERE code = 'STUDY');

-- ============================================
-- 4. LEAVE REQUESTS TABLE
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

-- Add missing columns
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS document_paths TEXT[] DEFAULT '{}';
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reviewer_comments TEXT;

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

-- Insert demo balances
INSERT INTO leave_balances (user_id, leave_type_id, year, entitled_days, used_days)
SELECT
  p.id,
  lt.id,
  2025,
  21,
  6
FROM profiles p
CROSS JOIN leave_types lt
WHERE p.clerk_user_id = 'demo-user-123'
  AND lt.code = 'ANN'
ON CONFLICT (user_id, leave_type_id, year) DO NOTHING;

INSERT INTO leave_balances (user_id, leave_type_id, year, entitled_days, used_days)
SELECT
  p.id,
  lt.id,
  2025,
  10,
  2
FROM profiles p
CROSS JOIN leave_types lt
WHERE p.clerk_user_id = 'demo-user-123'
  AND lt.code = 'SICK'
ON CONFLICT (user_id, leave_type_id, year) DO NOTHING;

INSERT INTO leave_balances (user_id, leave_type_id, year, entitled_days, used_days)
SELECT
  p.id,
  lt.id,
  2025,
  3,
  1
FROM profiles p
CROSS JOIN leave_types lt
WHERE p.clerk_user_id = 'demo-user-123'
  AND lt.code = 'FAM'
ON CONFLICT (user_id, leave_type_id, year) DO NOTHING;

-- ============================================
-- 6. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON leave_balances(user_id, year);

-- ============================================
-- 7. RLS POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view leave types" ON leave_types;
CREATE POLICY "Users can view leave types" ON leave_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view leave requests" ON leave_requests;
CREATE POLICY "Users can view leave requests" ON leave_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert leave requests" ON leave_requests;
CREATE POLICY "Users can insert leave requests" ON leave_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view leave balances" ON leave_balances;
CREATE POLICY "Users can view leave balances" ON leave_balances FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert leave balances" ON leave_balances;
CREATE POLICY "Users can insert leave balances" ON leave_balances FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update leave balances" ON leave_balances;
CREATE POLICY "Users can update leave balances" ON leave_balances FOR UPDATE USING (true);

-- ============================================
-- 8. HELPER FUNCTIONS
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

-- ============================================
-- DONE!
-- ============================================

SELECT '✅ Setup complete!' AS status;
SELECT 'Companies' AS table_name, COUNT(*) as count FROM companies
UNION ALL SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'Leave Types', COUNT(*) FROM leave_types
UNION ALL SELECT 'Leave Balances', COUNT(*) FROM leave_balances;
