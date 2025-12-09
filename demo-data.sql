-- =====================================================
-- LEAVEHUB DEMO DATA
-- Create a demo company, leave types, and test user
-- =====================================================

-- Step 1: Create Demo Company
INSERT INTO companies (name, slug, work_days_per_week, require_cert_mon_fri)
VALUES ('Demo Company', 'demo-company', 5, false)
RETURNING id;

-- Note: Copy the company UUID returned above and use it in the next steps
-- For now, we'll use a variable approach

-- Step 2: Insert BCEA-Compliant Leave Types for Demo Company
-- Replace the company_id in the SELECT below with your actual company UUID

DO $$
DECLARE
  company_uuid UUID;
BEGIN
  -- Get the demo company ID
  SELECT id INTO company_uuid FROM companies WHERE slug = 'demo-company';

  -- Insert leave types
  INSERT INTO leave_types (company_id, name, code, description, days_per_year, accrual_method, paid, bcea_compliant, color) VALUES
  (company_uuid, 'Annual Leave', 'ANN', '21 days per year (BCEA Section 20)', 21, 'monthly', true, true, '#0D9488'),
  (company_uuid, 'Sick Leave', 'SICK', '30 days per 3-year cycle (BCEA Section 22)', 10, 'none', true, true, '#EF4444'),
  (company_uuid, 'Family Responsibility', 'FAM', '3 days per year (BCEA Section 27)', 3, 'annual', true, true, '#F59E0B'),
  (company_uuid, 'Maternity Leave', 'MAT', '4 months unpaid (BCEA Section 25)', 120, 'none', false, true, '#EC4899'),
  (company_uuid, 'Parental Leave', 'PAR', '10 consecutive days (BCEA Section 25A)', 10, 'none', false, true, '#8B5CF6');
END $$;

-- Step 3: Create Demo User Profile
DO $$
DECLARE
  company_uuid UUID;
BEGIN
  -- Get the demo company ID
  SELECT id INTO company_uuid FROM companies WHERE slug = 'demo-company';

  -- Insert demo user
  INSERT INTO profiles (clerk_user_id, company_id, email, first_name, last_name, role, department, hire_date)
  VALUES ('demo-user-123', company_uuid, 'demo@leavehub.com', 'Demo', 'User', 'employee', 'Engineering', '2024-01-01');
END $$;

-- Step 4: Create Leave Balances for Demo User (2025)
DO $$
DECLARE
  company_uuid UUID;
  demo_user_uuid UUID;
  annual_leave_uuid UUID;
  sick_leave_uuid UUID;
  family_leave_uuid UUID;
BEGIN
  -- Get IDs
  SELECT id INTO company_uuid FROM companies WHERE slug = 'demo-company';
  SELECT id INTO demo_user_uuid FROM profiles WHERE clerk_user_id = 'demo-user-123';
  SELECT id INTO annual_leave_uuid FROM leave_types WHERE company_id = company_uuid AND code = 'ANN';
  SELECT id INTO sick_leave_uuid FROM leave_types WHERE company_id = company_uuid AND code = 'SICK';
  SELECT id INTO family_leave_uuid FROM leave_types WHERE company_id = company_uuid AND code = 'FAM';

  -- Insert leave balances
  INSERT INTO leave_balances (user_id, leave_type_id, year, entitled_days, used_days, cycle_start_date, cycle_end_date) VALUES
  (demo_user_uuid, annual_leave_uuid, 2025, 21, 6, '2025-01-01', '2025-12-31'),
  (demo_user_uuid, sick_leave_uuid, 2025, 10, 2, '2025-01-01', '2027-12-31'),
  (demo_user_uuid, family_leave_uuid, 2025, 3, 1, '2025-01-01', '2025-12-31');
END $$;

-- Step 5: Create Some Sample Leave Requests
DO $$
DECLARE
  demo_user_uuid UUID;
  annual_leave_uuid UUID;
  sick_leave_uuid UUID;
BEGIN
  -- Get IDs
  SELECT id INTO demo_user_uuid FROM profiles WHERE clerk_user_id = 'demo-user-123';
  SELECT id INTO annual_leave_uuid FROM leave_types WHERE code = 'ANN' LIMIT 1;
  SELECT id INTO sick_leave_uuid FROM leave_types WHERE code = 'SICK' LIMIT 1;

  -- Approved annual leave (past)
  INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, working_days, reason, status, approved_at)
  VALUES (demo_user_uuid, annual_leave_uuid, '2025-03-10', '2025-03-14', 5, 5, 'Family vacation', 'approved', NOW() - INTERVAL '2 months');

  -- Pending annual leave (future)
  INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, working_days, reason, status)
  VALUES (demo_user_uuid, annual_leave_uuid, '2025-12-23', '2025-12-27', 5, 3, 'Christmas holiday', 'pending');

  -- Pending sick leave (recent)
  INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, working_days, reason, status)
  VALUES (demo_user_uuid, sick_leave_uuid, '2025-10-15', '2025-10-16', 2, 2, 'Flu', 'pending');
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- View created company
SELECT * FROM companies WHERE slug = 'demo-company';

-- View leave types
SELECT name, code, days_per_year, color FROM leave_types ORDER BY name;

-- View demo user
SELECT clerk_user_id, email, first_name, last_name, role FROM profiles;

-- View leave balances
SELECT
  p.first_name || ' ' || p.last_name as employee,
  lt.name as leave_type,
  lb.entitled_days,
  lb.used_days,
  lb.available_days
FROM leave_balances lb
JOIN profiles p ON lb.user_id = p.id
JOIN leave_types lt ON lb.leave_type_id = lt.id
ORDER BY lt.name;

-- View leave requests
SELECT
  p.first_name || ' ' || p.last_name as employee,
  lt.name as leave_type,
  lr.start_date,
  lr.end_date,
  lr.working_days,
  lr.status,
  lr.reason
FROM leave_requests lr
JOIN profiles p ON lr.user_id = p.id
JOIN leave_types lt ON lr.leave_type_id = lt.id
ORDER BY lr.start_date DESC;
