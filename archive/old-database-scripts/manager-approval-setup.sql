-- =====================================================
-- MANAGER APPROVAL SYSTEM - DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add columns to leave_requests table for approval tracking
ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS approved_by VARCHAR,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS manager_comments TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN leave_requests.approved_by IS 'Clerk user ID of the manager who approved/rejected';
COMMENT ON COLUMN leave_requests.approved_at IS 'Timestamp when the request was approved/rejected';
COMMENT ON COLUMN leave_requests.manager_comments IS 'Optional comments from the manager';

-- =====================================================
-- CREATE FUNCTION TO DEDUCT LEAVE BALANCE
-- =====================================================

CREATE OR REPLACE FUNCTION deduct_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_deduct INTEGER,
  p_year INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update the leave balance for the user
  UPDATE leave_balances
  SET
    used_days = used_days + p_days_to_deduct,
    available_days = entitled_days - (used_days + p_days_to_deduct),
    updated_at = NOW()
  WHERE
    user_id = p_user_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;

  -- If no row was updated, it means the balance doesn't exist yet
  -- This shouldn't normally happen, but we'll log it
  IF NOT FOUND THEN
    RAISE NOTICE 'Leave balance not found for user %, leave type %, year %',
      p_user_id, p_leave_type_id, p_year;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment to the function
COMMENT ON FUNCTION deduct_leave_balance IS 'Deducts leave days from an employee''s balance when a request is approved';

-- =====================================================
-- CREATE FUNCTION TO RESTORE LEAVE BALANCE
-- (For when a request is cancelled or rejected after approval)
-- =====================================================

CREATE OR REPLACE FUNCTION restore_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_restore INTEGER,
  p_year INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Restore the leave balance for the user
  UPDATE leave_balances
  SET
    used_days = GREATEST(0, used_days - p_days_to_restore),
    available_days = entitled_days - GREATEST(0, used_days - p_days_to_restore),
    updated_at = NOW()
  WHERE
    user_id = p_user_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;

  IF NOT FOUND THEN
    RAISE NOTICE 'Leave balance not found for user %, leave type %, year %',
      p_user_id, p_leave_type_id, p_year;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION restore_leave_balance IS 'Restores leave days to an employee''s balance when a request is cancelled';

-- =====================================================
-- CREATE INDEX FOR MANAGER QUERIES
-- =====================================================

-- Index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_leave_requests_status
ON leave_requests(status);

-- Index for faster date filtering
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates
ON leave_requests(start_date, end_date);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id
ON leave_requests(user_id);

-- =====================================================
-- CREATE VIEW FOR MANAGER DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW manager_leave_requests_view AS
SELECT
  lr.id,
  lr.user_id,
  lr.leave_type_id,
  lr.start_date,
  lr.end_date,
  lr.total_days,
  lr.working_days,
  lr.reason,
  lr.status,
  lr.document_paths,
  lr.approved_by,
  lr.approved_at,
  lr.manager_comments,
  lr.created_at,
  lr.updated_at,
  -- Employee details
  p.first_name as employee_first_name,
  p.last_name as employee_last_name,
  p.email as employee_email,
  p.department as employee_department,
  p.company_id,
  -- Leave type details
  lt.name as leave_type_name,
  lt.code as leave_type_code,
  lt.color as leave_type_color,
  -- Manager who approved (if applicable)
  m.first_name as manager_first_name,
  m.last_name as manager_last_name
FROM leave_requests lr
JOIN profiles p ON lr.user_id = p.id
JOIN leave_types lt ON lr.leave_type_id = lt.id
LEFT JOIN profiles m ON lr.approved_by = m.clerk_user_id;

COMMENT ON VIEW manager_leave_requests_view IS 'Convenient view for manager dashboard with all related data joined';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check new columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leave_requests'
AND column_name IN ('approved_by', 'approved_at', 'manager_comments');

-- Check functions were created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('deduct_leave_balance', 'restore_leave_balance')
AND routine_schema = 'public';

-- Check indexes were created
SELECT indexname
FROM pg_indexes
WHERE tablename = 'leave_requests'
AND indexname LIKE 'idx_leave_requests%';

-- Check view was created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'manager_leave_requests_view';
