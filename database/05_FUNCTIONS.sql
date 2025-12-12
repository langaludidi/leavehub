-- ============================================
-- LeaveHub MVP - Helper Functions
-- Utility functions for leave calculations
-- ============================================

-- ============================================
-- 1. CALCULATE WORKING DAYS (BCEA-compliant)
-- ============================================
CREATE OR REPLACE FUNCTION calculate_working_days(
  start_date DATE,
  end_date DATE,
  company_uuid UUID
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
  working_days DECIMAL(5,2) := 0;
  current_date DATE := start_date;
BEGIN
  -- Loop through each day in the range
  WHILE current_date <= end_date LOOP
    -- Check if it's a weekday (Monday-Friday)
    IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
      -- Check if it's not a public holiday
      IF NOT EXISTS (
        SELECT 1 FROM public_holidays
        WHERE date = current_date
        AND country = 'ZA'
      ) THEN
        working_days := working_days + 1;
      END IF;
    END IF;

    current_date := current_date + 1;
  END LOOP;

  RETURN working_days;
END;
$$;

GRANT EXECUTE ON FUNCTION calculate_working_days(DATE, DATE, UUID) TO authenticated;

-- ============================================
-- 2. CHECK LEAVE BALANCE AVAILABILITY
-- ============================================
CREATE OR REPLACE FUNCTION check_leave_balance(
  user_uuid UUID,
  leave_type_uuid UUID,
  requested_days INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  available DECIMAL(5,2);
BEGIN
  -- Get available days for current year
  SELECT available_days INTO available
  FROM leave_balances
  WHERE user_id = user_uuid
    AND leave_type_id = leave_type_uuid
    AND year = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Return true if enough balance available
  RETURN (available >= requested_days);
END;
$$;

GRANT EXECUTE ON FUNCTION check_leave_balance(UUID, UUID, INTEGER) TO authenticated;

-- ============================================
-- 3. GET TEAM MEMBERS (for managers)
-- ============================================
CREATE OR REPLACE FUNCTION get_team_members(manager_uuid UUID)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  department VARCHAR,
  job_title VARCHAR,
  hire_date DATE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    id,
    email,
    first_name,
    last_name,
    department,
    job_title,
    hire_date
  FROM profiles
  WHERE manager_id = manager_uuid
    AND is_active = true
  ORDER BY last_name, first_name;
$$;

GRANT EXECUTE ON FUNCTION get_team_members(UUID) TO authenticated;

-- ============================================
-- 4. GET PENDING LEAVE REQUESTS FOR MANAGER
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_requests_for_manager(manager_uuid UUID)
RETURNS TABLE (
  request_id UUID,
  employee_name VARCHAR,
  leave_type_name VARCHAR,
  start_date DATE,
  end_date DATE,
  working_days DECIMAL,
  reason TEXT,
  submitted_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    lr.id AS request_id,
    CONCAT(p.first_name, ' ', p.last_name) AS employee_name,
    lt.name AS leave_type_name,
    lr.start_date,
    lr.end_date,
    lr.working_days,
    lr.reason,
    lr.submitted_at
  FROM leave_requests lr
  JOIN profiles p ON p.id = lr.user_id
  JOIN leave_types lt ON lt.id = lr.leave_type_id
  WHERE lr.manager_id = manager_uuid
    AND lr.status = 'pending'
  ORDER BY lr.submitted_at ASC;
$$;

GRANT EXECUTE ON FUNCTION get_pending_requests_for_manager(UUID) TO authenticated;

-- ============================================
-- 5. INITIALIZE LEAVE BALANCES FOR NEW EMPLOYEE
-- ============================================
CREATE OR REPLACE FUNCTION initialize_employee_leave_balances(
  employee_uuid UUID,
  company_uuid UUID,
  hire_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  leave_type_record RECORD;
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  months_worked DECIMAL(5,2);
  pro_rata_days DECIMAL(5,2);
BEGIN
  -- Calculate months worked in current year (for pro-rata calculation)
  IF hire_date > CURRENT_DATE THEN
    -- Future hire date, no balances yet
    RETURN;
  END IF;

  months_worked := EXTRACT(MONTH FROM AGE(
    DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day',
    hire_date
  ));

  -- Loop through all active leave types for the company
  FOR leave_type_record IN
    SELECT * FROM leave_types
    WHERE company_id = company_uuid
      AND is_active = true
  LOOP
    -- Calculate pro-rata annual leave if hired mid-year
    IF leave_type_record.code = 'ANN' THEN
      IF hire_date >= DATE_TRUNC('year', CURRENT_DATE) THEN
        -- Hired this year - pro-rata calculation
        pro_rata_days := (leave_type_record.accrual_rate * months_worked);
      ELSE
        -- Hired before this year - full entitlement
        pro_rata_days := COALESCE(leave_type_record.max_days_per_year, 21);
      END IF;
    ELSE
      -- Other leave types use max_days_per_year
      pro_rata_days := COALESCE(leave_type_record.max_days_per_year, 0);
    END IF;

    -- Insert leave balance for current year
    INSERT INTO leave_balances (
      user_id,
      company_id,
      leave_type_id,
      year,
      entitled_days,
      used_days
    ) VALUES (
      employee_uuid,
      company_uuid,
      leave_type_record.id,
      current_year,
      pro_rata_days,
      0
    )
    ON CONFLICT (user_id, leave_type_id, year) DO NOTHING;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION initialize_employee_leave_balances(UUID, UUID, DATE) TO authenticated;

-- ============================================
-- 6. GET COMPANY SUBSCRIPTION STATUS
-- ============================================
CREATE OR REPLACE FUNCTION get_company_subscription_status(company_uuid UUID)
RETURNS TABLE (
  status subscription_status,
  trial_ends_at TIMESTAMPTZ,
  max_employees INTEGER,
  is_trial BOOLEAN,
  days_remaining INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    subscription_status AS status,
    trial_ends_at,
    max_employees,
    (subscription_status = 'trialing') AS is_trial,
    CASE
      WHEN subscription_status = 'trialing' AND trial_ends_at > NOW()
      THEN EXTRACT(DAY FROM (trial_ends_at - NOW()))::INTEGER
      ELSE 0
    END AS days_remaining
  FROM companies
  WHERE id = company_uuid;
$$;

GRANT EXECUTE ON FUNCTION get_company_subscription_status(UUID) TO authenticated;

-- ============================================
-- 7. CHECK IF LEAVE REQUEST OVERLAPS
-- ============================================
CREATE OR REPLACE FUNCTION check_leave_overlap(
  user_uuid UUID,
  start_date DATE,
  end_date DATE,
  exclude_request_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1 FROM leave_requests
    WHERE user_id = user_uuid
      AND status IN ('pending', 'approved')
      AND (id != exclude_request_id OR exclude_request_id IS NULL)
      AND (
        (start_date BETWEEN leave_requests.start_date AND leave_requests.end_date)
        OR (end_date BETWEEN leave_requests.start_date AND leave_requests.end_date)
        OR (leave_requests.start_date BETWEEN start_date AND end_date)
      )
  );
$$;

GRANT EXECUTE ON FUNCTION check_leave_overlap(UUID, DATE, DATE, UUID) TO authenticated;

-- ============================================
-- 8. GET TEAM AVAILABILITY (for managers)
-- ============================================
CREATE OR REPLACE FUNCTION get_team_availability(
  manager_uuid UUID,
  check_date DATE
)
RETURNS TABLE (
  employee_name VARCHAR,
  is_available BOOLEAN,
  leave_type VARCHAR,
  leave_start DATE,
  leave_end DATE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    CONCAT(p.first_name, ' ', p.last_name) AS employee_name,
    CASE
      WHEN lr.id IS NULL THEN true
      ELSE false
    END AS is_available,
    lt.name AS leave_type,
    lr.start_date AS leave_start,
    lr.end_date AS leave_end
  FROM profiles p
  LEFT JOIN leave_requests lr ON lr.user_id = p.id
    AND lr.status = 'approved'
    AND check_date BETWEEN lr.start_date AND lr.end_date
  LEFT JOIN leave_types lt ON lt.id = lr.leave_type_id
  WHERE p.manager_id = manager_uuid
    AND p.is_active = true
  ORDER BY p.last_name, p.first_name;
$$;

GRANT EXECUTE ON FUNCTION get_team_availability(UUID, DATE) TO authenticated;

-- ============================================
-- 9. AUTO-CREATE LEAVE TYPES FOR NEW COMPANY
-- ============================================
CREATE OR REPLACE FUNCTION create_default_leave_types_for_company(company_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Copy default leave types to new company
  INSERT INTO leave_types (
    company_id,
    name,
    code,
    description,
    color,
    requires_medical_certificate,
    min_days_for_certificate,
    max_days_per_year,
    max_days_per_cycle,
    cycle_months,
    is_paid,
    accrues,
    accrual_rate,
    max_carryover,
    expires_after_months,
    requires_manager_approval,
    requires_hr_approval,
    advance_notice_days,
    is_active,
    is_default
  )
  SELECT
    company_uuid,
    name,
    code,
    description,
    color,
    requires_medical_certificate,
    min_days_for_certificate,
    max_days_per_year,
    max_days_per_cycle,
    cycle_months,
    is_paid,
    accrues,
    accrual_rate,
    max_carryover,
    expires_after_months,
    requires_manager_approval,
    requires_hr_approval,
    advance_notice_days,
    true,  -- is_active
    true   -- is_default
  FROM default_leave_types;
END;
$$;

GRANT EXECUTE ON FUNCTION create_default_leave_types_for_company(UUID) TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Helper functions created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '1. calculate_working_days - BCEA-compliant working day calculator';
  RAISE NOTICE '2. check_leave_balance - Verify sufficient leave balance';
  RAISE NOTICE '3. get_team_members - Get all team members for a manager';
  RAISE NOTICE '4. get_pending_requests_for_manager - Get pending approvals';
  RAISE NOTICE '5. initialize_employee_leave_balances - Auto-create balances for new employees';
  RAISE NOTICE '6. get_company_subscription_status - Check subscription and trial status';
  RAISE NOTICE '7. check_leave_overlap - Detect overlapping leave requests';
  RAISE NOTICE '8. get_team_availability - Check team availability for a date';
  RAISE NOTICE '9. create_default_leave_types_for_company - Auto-create BCEA leave types';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run 06_PAYSTACK_SUBSCRIPTIONS.sql';
  RAISE NOTICE '';
END $$;
