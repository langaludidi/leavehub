-- =====================================================
-- LEAVEHUB DATABASE SCHEMA
-- BCEA-Compliant Leave Management System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (Clean Slate)
-- =====================================================
DROP TABLE IF EXISTS leave_days CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS public_holidays CASCADE;

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  work_days_per_week INTEGER DEFAULT 5 CHECK (work_days_per_week IN (5, 6)),
  require_cert_mon_fri BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROFILES TABLE (synced from Clerk)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin', 'super_admin')),
  department TEXT,
  hire_date DATE,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEAVE TYPES TABLE
-- =====================================================
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  days_per_year DECIMAL(5,2),
  accrual_method TEXT DEFAULT 'annual' CHECK (accrual_method IN ('monthly', 'daily', 'annual', 'none')),
  carry_over_allowed BOOLEAN DEFAULT FALSE,
  requires_proof BOOLEAN DEFAULT FALSE,
  proof_required_after_days INTEGER DEFAULT 2,
  paid BOOLEAN DEFAULT TRUE,
  bcea_compliant BOOLEAN DEFAULT TRUE,
  color TEXT DEFAULT '#0D9488',
  icon TEXT DEFAULT 'calendar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- =====================================================
-- LEAVE BALANCES TABLE
-- =====================================================
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  entitled_days DECIMAL(5,2) DEFAULT 0,
  used_days DECIMAL(5,2) DEFAULT 0,
  available_days DECIMAL(5,2) GENERATED ALWAYS AS (entitled_days - used_days) STORED,
  carried_over_days DECIMAL(5,2) DEFAULT 0,
  cycle_start_date DATE,
  cycle_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, leave_type_id, year)
);

-- =====================================================
-- LEAVE REQUESTS TABLE
-- =====================================================
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  working_days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  document_url TEXT,
  certificate_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEAVE DAYS TABLE (individual days)
-- =====================================================
CREATE TABLE leave_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leave_request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_working_day BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PUBLIC HOLIDAYS TABLE
-- =====================================================
CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  country_code TEXT DEFAULT 'ZA',
  recurring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, country_code)
);

-- =====================================================
-- SEED: South African Public Holidays 2025
-- =====================================================
INSERT INTO public_holidays (name, date, country_code, recurring) VALUES
('New Year''s Day', '2025-01-01', 'ZA', true),
('Human Rights Day', '2025-03-21', 'ZA', true),
('Good Friday', '2025-04-18', 'ZA', false),
('Family Day', '2025-04-21', 'ZA', false),
('Freedom Day', '2025-04-27', 'ZA', true),
('Workers'' Day', '2025-05-01', 'ZA', true),
('Youth Day', '2025-06-16', 'ZA', true),
('National Women''s Day', '2025-08-09', 'ZA', true),
('Heritage Day', '2025-09-24', 'ZA', true),
('Day of Reconciliation', '2025-12-16', 'ZA', true),
('Christmas Day', '2025-12-25', 'ZA', true),
('Day of Goodwill', '2025-12-26', 'ZA', true)
ON CONFLICT (date, country_code) DO NOTHING;

-- =====================================================
-- SEED: Default Leave Types (BCEA-Compliant)
-- =====================================================
-- Note: Run this after creating a company
-- Replace {company_id} with your actual company UUID

-- INSERT INTO leave_types (company_id, name, code, description, days_per_year, accrual_method, paid, bcea_compliant, color) VALUES
-- ('{company_id}', 'Annual Leave', 'ANN', '21 days per year (BCEA Section 20)', 21, 'monthly', true, true, '#0D9488'),
-- ('{company_id}', 'Sick Leave', 'SICK', '30 days per 3-year cycle (BCEA Section 22)', 10, 'none', true, true, '#EF4444'),
-- ('{company_id}', 'Family Responsibility', 'FAM', '3 days per year (BCEA Section 27)', 3, 'annual', true, true, '#F59E0B'),
-- ('{company_id}', 'Maternity Leave', 'MAT', '4 months unpaid (BCEA Section 25)', 120, 'none', false, true, '#EC4899'),
-- ('{company_id}', 'Parental Leave', 'PAR', '10 consecutive days (BCEA Section 25A)', 10, 'none', false, true, '#8B5CF6');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

-- Companies: Users can only see their own company
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Profiles: Users can view profiles in their company
CREATE POLICY "Users can view profiles in their company"
  ON profiles FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Leave Types: Users can view their company's leave types
CREATE POLICY "Users can view their company leave types"
  ON leave_types FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Leave Balances: Users can view their own balances
CREATE POLICY "Users can view their own leave balances"
  ON leave_balances FOR SELECT
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Leave Requests: Users can view their own requests or their team's requests (if manager)
CREATE POLICY "Users can view relevant leave requests"
  ON leave_requests FOR SELECT
  USING (
    user_id IN (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub')
    OR
    user_id IN (
      SELECT id FROM profiles WHERE manager_id IN (
        SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Public Holidays: Everyone can view
CREATE POLICY "Everyone can view public holidays"
  ON public_holidays FOR SELECT
  USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_days_request_id ON leave_days(leave_request_id);
CREATE INDEX idx_leave_days_date ON leave_days(date);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate working days between two dates
CREATE OR REPLACE FUNCTION calculate_working_days(
  start_date DATE,
  end_date DATE,
  work_days_per_week INTEGER DEFAULT 5
)
RETURNS INTEGER AS $$
DECLARE
  working_days INTEGER := 0;
  loop_date DATE := start_date;
  day_of_week INTEGER;
BEGIN
  WHILE loop_date <= end_date LOOP
    day_of_week := EXTRACT(DOW FROM loop_date);

    -- Check if it's a working day (Mon-Fri for 5-day week, Mon-Sat for 6-day week)
    IF (work_days_per_week = 5 AND day_of_week BETWEEN 1 AND 5) OR
       (work_days_per_week = 6 AND day_of_week BETWEEN 1 AND 6) THEN
      -- Check if it's not a public holiday
      IF NOT EXISTS (SELECT 1 FROM public_holidays WHERE date = loop_date) THEN
        working_days := working_days + 1;
      END IF;
    END IF;

    loop_date := loop_date + 1;
  END LOOP;

  RETURN working_days;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Next steps:
-- 1. Create a company: INSERT INTO companies (name, slug) VALUES ('Your Company', 'your-company');
-- 2. Get the company_id from the companies table
-- 3. Insert default leave types (uncomment the SEED section above and replace {company_id})
-- 4. Create user profiles as they sign up through Clerk
