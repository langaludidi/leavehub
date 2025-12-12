-- ============================================
-- LeaveHub MVP - Core Schema
-- Companies, Profiles, Leave Types
-- ============================================

-- ============================================
-- 1. CREATE CUSTOM TYPES
-- ============================================

-- User Roles (5 distinct roles as per MVP)
CREATE TYPE user_role AS ENUM (
  'employee',      -- Standard employee
  'manager',       -- Team manager
  'hr_admin',      -- HR administrator
  'admin',         -- Organization admin
  'super_admin'    -- Platform super admin
);

-- Subscription Status
CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid'
);

-- ============================================
-- 2. COMPANIES TABLE (Multi-tenant)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company Information
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50),  -- '1-10', '11-50', '51-200', '201-500', '501+'

  -- Subscription & Trial
  subscription_status subscription_status DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  max_employees INTEGER DEFAULT 10,  -- Starter plan limit

  -- Branding (future)
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#17B2A7',  -- Teal

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);

-- ============================================
-- 3. PROFILES TABLE (Users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,

  -- Clerk Integration
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,

  -- Personal Information
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),

  -- Employment Details
  role user_role DEFAULT 'employee' NOT NULL,
  department VARCHAR(100),
  employee_number VARCHAR(50),
  job_title VARCHAR(100),
  manager_id UUID REFERENCES profiles(id),  -- Direct manager

  -- Employment Dates
  hire_date DATE,
  termination_date DATE,
  is_active BOOLEAN DEFAULT true,

  -- Leave Settings
  annual_leave_days INTEGER DEFAULT 21,  -- BCEA minimum
  sick_leave_cycle_start DATE,  -- For 3-year sick leave cycle

  -- Metadata
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_manager_id ON profiles(manager_id);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- ============================================
-- 4. LEAVE TYPES TABLE
-- ============================================
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,

  -- Leave Type Information
  name VARCHAR(100) NOT NULL,  -- 'Annual Leave', 'Sick Leave', etc.
  code VARCHAR(20) NOT NULL,   -- 'ANN', 'SICK', 'FAM', etc.
  description TEXT,
  color VARCHAR(7) DEFAULT '#17B2A7',  -- For calendar display

  -- BCEA Rules
  requires_medical_certificate BOOLEAN DEFAULT false,
  min_days_for_certificate INTEGER,  -- e.g., 2 days for sick leave
  max_days_per_year INTEGER,
  max_days_per_cycle INTEGER,  -- For sick leave (30 days per 3 years)
  cycle_months INTEGER,  -- 36 months for sick leave cycle

  -- Accrual Settings
  is_paid BOOLEAN DEFAULT true,
  accrues BOOLEAN DEFAULT true,
  accrual_rate DECIMAL(5,2),  -- Days per month
  max_carryover INTEGER,  -- Max days to carry over to next year
  expires_after_months INTEGER,  -- Months before carried-over days expire

  -- Approval Settings
  requires_manager_approval BOOLEAN DEFAULT true,
  requires_hr_approval BOOLEAN DEFAULT false,
  advance_notice_days INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,  -- System default leave types

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, code)
);

CREATE INDEX idx_leave_types_company_id ON leave_types(company_id);
CREATE INDEX idx_leave_types_is_active ON leave_types(is_active);

-- ============================================
-- 5. PUBLIC HOLIDAYS TABLE (South Africa)
-- ============================================
CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Holiday Information
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  year INTEGER NOT NULL,

  -- Location
  country VARCHAR(2) DEFAULT 'ZA',  -- ISO country code
  is_national BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(date, country)
);

CREATE INDEX idx_public_holidays_date ON public_holidays(date);
CREATE INDEX idx_public_holidays_year ON public_holidays(year);

-- ============================================
-- 6. INSERT DEFAULT LEAVE TYPES
-- ============================================
-- Note: These will be copied for each new company during onboarding

CREATE TABLE default_leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  requires_medical_certificate BOOLEAN DEFAULT false,
  min_days_for_certificate INTEGER,
  max_days_per_year INTEGER,
  max_days_per_cycle INTEGER,
  cycle_months INTEGER,
  is_paid BOOLEAN DEFAULT true,
  accrues BOOLEAN DEFAULT true,
  accrual_rate DECIMAL(5,2),
  max_carryover INTEGER,
  expires_after_months INTEGER,
  requires_manager_approval BOOLEAN DEFAULT true,
  requires_hr_approval BOOLEAN DEFAULT false,
  advance_notice_days INTEGER DEFAULT 0
);

-- Insert BCEA-compliant default leave types
INSERT INTO default_leave_types (name, code, description, color, max_days_per_year, accrual_rate, max_carryover, expires_after_months, advance_notice_days) VALUES
('Annual Leave', 'ANN', 'BCEA-compliant annual leave - minimum 21 consecutive days per year', '#0D9488', 21, 1.75, 5, 12, 14),
('Sick Leave', 'SICK', 'BCEA-compliant sick leave - 30 days per 3-year cycle', '#EF4444', NULL, NULL, NULL, NULL, 0),
('Family Responsibility', 'FAM', 'BCEA-compliant family responsibility leave - 3 days per year', '#F59E0B', 3, 0, 0, NULL, 0),
('Maternity Leave', 'MAT', 'Maternity leave - 4 consecutive months', '#EC4899', 120, 0, 0, NULL, 30),
('Paternity Leave', 'PAT', 'Paternity leave - 10 consecutive days', '#8B5CF6', 10, 0, 0, NULL, 7),
('Study Leave', 'STUDY', 'Study leave for approved courses', '#3B82F6', NULL, NULL, NULL, NULL, 30),
('Unpaid Leave', 'UNPAID', 'Unpaid leave', '#6B7280', NULL, NULL, NULL, NULL, 14);

-- Update sick leave with cycle settings
UPDATE default_leave_types
SET max_days_per_cycle = 30,
    cycle_months = 36,
    requires_medical_certificate = true,
    min_days_for_certificate = 2
WHERE code = 'SICK';

-- ============================================
-- 7. INSERT SOUTH AFRICAN PUBLIC HOLIDAYS 2025
-- ============================================
INSERT INTO public_holidays (name, date, year, country) VALUES
('New Year''s Day', '2025-01-01', 2025, 'ZA'),
('Human Rights Day', '2025-03-21', 2025, 'ZA'),
('Good Friday', '2025-04-18', 2025, 'ZA'),
('Family Day', '2025-04-21', 2025, 'ZA'),
('Freedom Day', '2025-04-27', 2025, 'ZA'),
('Workers'' Day', '2025-05-01', 2025, 'ZA'),
('Youth Day', '2025-06-16', 2025, 'ZA'),
('National Women''s Day', '2025-08-09', 2025, 'ZA'),
('Heritage Day', '2025-09-24', 2025, 'ZA'),
('Day of Reconciliation', '2025-12-16', 2025, 'ZA'),
('Christmas Day', '2025-12-25', 2025, 'ZA'),
('Day of Goodwill', '2025-12-26', 2025, 'ZA')
ON CONFLICT (date, country) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Core schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- companies table';
  RAISE NOTICE '- profiles table (with 5 user roles)';
  RAISE NOTICE '- leave_types table';
  RAISE NOTICE '- default_leave_types table (7 BCEA-compliant types)';
  RAISE NOTICE '- public_holidays table (2025 SA holidays)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run 02_LEAVE_MANAGEMENT.sql';
  RAISE NOTICE '';
END $$;
