-- LeaveHub Company Settings & Leave Policies
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. DEPARTMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_departments_company ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON departments(manager_id);

-- ============================================
-- 2. PUBLIC HOLIDAYS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, date)
);

CREATE INDEX IF NOT EXISTS idx_public_holidays_company ON public_holidays(company_id);
CREATE INDEX IF NOT EXISTS idx_public_holidays_date ON public_holidays(date);

-- ============================================
-- 3. LEAVE POLICY SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leave_policy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,

  -- Entitlement settings
  default_days INTEGER NOT NULL DEFAULT 0,
  max_days INTEGER,
  min_days INTEGER DEFAULT 1,

  -- Accrual settings
  accrual_type VARCHAR(50) DEFAULT 'annual', -- annual, monthly, weekly
  accrual_rate DECIMAL(5,2),

  -- Carry over settings
  allow_carryover BOOLEAN DEFAULT false,
  max_carryover_days INTEGER DEFAULT 0,
  carryover_expiry_months INTEGER DEFAULT 3,

  -- Request settings
  min_notice_days INTEGER DEFAULT 0,
  max_consecutive_days INTEGER,
  requires_approval BOOLEAN DEFAULT true,
  requires_documentation BOOLEAN DEFAULT false,

  -- Other settings
  allow_negative_balance BOOLEAN DEFAULT false,
  allow_half_days BOOLEAN DEFAULT true,
  exclude_weekends BOOLEAN DEFAULT true,
  exclude_public_holidays BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, leave_type_id)
);

CREATE INDEX IF NOT EXISTS idx_leave_policy_company ON leave_policy_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_policy_type ON leave_policy_settings(leave_type_id);

-- ============================================
-- 4. COMPANY SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,

  -- General settings
  fiscal_year_start_month INTEGER DEFAULT 1, -- 1=January
  working_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
  working_hours_per_day DECIMAL(4,2) DEFAULT 8.0,
  timezone VARCHAR(100) DEFAULT 'UTC',

  -- Leave settings
  auto_approve_after_days INTEGER,
  allow_overlapping_requests BOOLEAN DEFAULT false,
  require_handover_notes BOOLEAN DEFAULT false,

  -- Notification settings
  notify_managers BOOLEAN DEFAULT true,
  notify_hr BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 3,

  -- Approval workflow
  approval_levels INTEGER DEFAULT 1,
  require_hr_approval BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_settings_company ON company_settings(company_id);

-- ============================================
-- 5. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Update companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;

-- Update leave_types table to have company_id
ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Update profiles table to reference departments
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view departments" ON departments;
CREATE POLICY "Users can view departments" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (true);

-- Public Holidays
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public holidays" ON public_holidays;
CREATE POLICY "Users can view public holidays" ON public_holidays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage public holidays" ON public_holidays;
CREATE POLICY "Admins can manage public holidays" ON public_holidays FOR ALL USING (true);

-- Leave Policy Settings
ALTER TABLE leave_policy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view leave policies" ON leave_policy_settings;
CREATE POLICY "Users can view leave policies" ON leave_policy_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage leave policies" ON leave_policy_settings;
CREATE POLICY "Admins can manage leave policies" ON leave_policy_settings FOR ALL USING (true);

-- Company Settings
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company settings" ON company_settings;
CREATE POLICY "Users can view company settings" ON company_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage company settings" ON company_settings;
CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL USING (true);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to get working days between two dates
CREATE OR REPLACE FUNCTION get_working_days(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  working_days_count INTEGER := 0;
  current_date DATE := p_start_date;
  working_days_array INTEGER[];
  is_working_day BOOLEAN;
  is_holiday BOOLEAN;
BEGIN
  -- Get company working days
  SELECT working_days INTO working_days_array
  FROM company_settings
  WHERE company_id = p_company_id;

  -- Default to Mon-Fri if not set
  IF working_days_array IS NULL THEN
    working_days_array := ARRAY[1,2,3,4,5];
  END IF;

  WHILE current_date <= p_end_date LOOP
    -- Check if it's a working day (1=Monday, 7=Sunday)
    is_working_day := EXTRACT(ISODOW FROM current_date)::INTEGER = ANY(working_days_array);

    -- Check if it's a public holiday
    SELECT EXISTS(
      SELECT 1 FROM public_holidays
      WHERE company_id = p_company_id
      AND date = current_date
    ) INTO is_holiday;

    IF is_working_day AND NOT is_holiday THEN
      working_days_count := working_days_count + 1;
    END IF;

    current_date := current_date + 1;
  END LOOP;

  RETURN working_days_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. INSERT DEMO DATA
-- ============================================

-- Get the first company ID (or create if none exists)
DO $$
DECLARE
  demo_company_id UUID;
BEGIN
  -- Get first existing company
  SELECT id INTO demo_company_id FROM companies LIMIT 1;

  -- If no company exists, create one
  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, slug)
    VALUES ('Demo Company', 'demo-company-' || floor(random() * 10000))
    RETURNING id INTO demo_company_id;
  END IF;

  -- Store it for later use
  CREATE TEMP TABLE IF NOT EXISTS temp_company_id (id UUID);
  DELETE FROM temp_company_id;
  INSERT INTO temp_company_id VALUES (demo_company_id);
END $$;

-- Insert demo departments
INSERT INTO departments (company_id, name, description)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Engineering',
  'Software development and technical operations'
WHERE NOT EXISTS (
  SELECT 1 FROM departments
  WHERE company_id = (SELECT id FROM temp_company_id LIMIT 1)
  AND name = 'Engineering'
);

INSERT INTO departments (company_id, name, description)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Human Resources',
  'People operations and talent management'
WHERE NOT EXISTS (
  SELECT 1 FROM departments
  WHERE company_id = (SELECT id FROM temp_company_id LIMIT 1)
  AND name = 'Human Resources'
);

INSERT INTO departments (company_id, name, description)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Sales',
  'Business development and customer acquisition'
WHERE NOT EXISTS (
  SELECT 1 FROM departments
  WHERE company_id = (SELECT id FROM temp_company_id LIMIT 1)
  AND name = 'Sales'
);

INSERT INTO departments (company_id, name, description)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  'Marketing',
  'Brand and marketing communications'
WHERE NOT EXISTS (
  SELECT 1 FROM departments
  WHERE company_id = (SELECT id FROM temp_company_id LIMIT 1)
  AND name = 'Marketing'
);

-- Insert South African public holidays for 2025
INSERT INTO public_holidays (company_id, name, date, is_recurring)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  name,
  date::DATE,
  is_recurring
FROM (VALUES
  ('New Year''s Day', '2025-01-01', true),
  ('Human Rights Day', '2025-03-21', true),
  ('Good Friday', '2025-04-18', false),
  ('Family Day', '2025-04-21', false),
  ('Freedom Day', '2025-04-27', true),
  ('Workers'' Day', '2025-05-01', true),
  ('Youth Day', '2025-06-16', true),
  ('National Women''s Day', '2025-08-09', true),
  ('Heritage Day', '2025-09-24', true),
  ('Day of Reconciliation', '2025-12-16', true),
  ('Christmas Day', '2025-12-25', true),
  ('Day of Goodwill', '2025-12-26', true)
) AS holidays(name, date, is_recurring)
ON CONFLICT (company_id, date) DO NOTHING;

-- Insert default leave policy settings
INSERT INTO leave_policy_settings (
  company_id,
  leave_type_id,
  default_days,
  allow_carryover,
  max_carryover_days,
  min_notice_days,
  max_consecutive_days,
  exclude_weekends,
  exclude_public_holidays
)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  lt.id,
  CASE
    WHEN lt.code = 'ANN' THEN 21
    WHEN lt.code = 'SICK' THEN 30
    WHEN lt.code = 'FAM' THEN 3
    ELSE 0
  END,
  CASE WHEN lt.code = 'ANN' THEN true ELSE false END,
  CASE WHEN lt.code = 'ANN' THEN 5 ELSE 0 END,
  CASE WHEN lt.code = 'ANN' THEN 14 ELSE 0 END,
  CASE
    WHEN lt.code = 'ANN' THEN 21
    WHEN lt.code = 'MAT' THEN 120
    WHEN lt.code = 'PAT' THEN 10
    ELSE NULL
  END,
  true,
  true
FROM leave_types lt
ON CONFLICT (company_id, leave_type_id) DO NOTHING;

-- Insert default company settings
INSERT INTO company_settings (
  company_id,
  fiscal_year_start_month,
  working_days,
  working_hours_per_day,
  timezone,
  notify_managers,
  notify_hr,
  reminder_days_before,
  approval_levels
)
SELECT
  (SELECT id FROM temp_company_id LIMIT 1),
  1, -- January
  ARRAY[1,2,3,4,5], -- Monday to Friday
  8.0,
  'Africa/Johannesburg',
  true,
  true,
  3,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM company_settings
  WHERE company_id = (SELECT id FROM temp_company_id LIMIT 1)
);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Company settings setup complete!' AS status;
SELECT 'Departments' AS table_name, COUNT(*) as count FROM departments
UNION ALL SELECT 'Public Holidays', COUNT(*) FROM public_holidays
UNION ALL SELECT 'Leave Policies', COUNT(*) FROM leave_policy_settings
UNION ALL SELECT 'Company Settings', COUNT(*) FROM company_settings;
