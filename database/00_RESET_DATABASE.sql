-- ============================================
-- LeaveHub - COMPLETE DATABASE RESET
-- ⚠️  WARNING: This will DELETE ALL DATA!
-- ============================================
-- Run this in Supabase SQL Editor to start fresh
-- ============================================

-- Drop all policies first (they depend on tables)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.tablename || '_policy') || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Drop all tables
DROP TABLE IF EXISTS paystack_webhooks CASCADE;
DROP TABLE IF EXISTS paystack_customers CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS document_access_logs CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS leave_request_approvals CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS public_holidays CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS leave_request_status CASCADE;
DROP TYPE IF EXISTS approval_action CASCADE;
DROP TYPE IF EXISTS document_category CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS is_subscription_active(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_subscription_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_working_days(DATE, DATE, UUID) CASCADE;
DROP FUNCTION IF EXISTS check_leave_balance(UUID, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_team_members(UUID) CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Database completely reset!';
  RAISE NOTICE '';
  RAISE NOTICE 'All tables, types, functions, and policies have been dropped.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run 01_CORE_SCHEMA.sql';
  RAISE NOTICE '2. Run 02_LEAVE_MANAGEMENT.sql';
  RAISE NOTICE '3. Run 03_DOCUMENTS.sql';
  RAISE NOTICE '4. Run 04_SECURITY_RLS.sql';
  RAISE NOTICE '5. Run 05_FUNCTIONS.sql';
  RAISE NOTICE '';
END $$;
