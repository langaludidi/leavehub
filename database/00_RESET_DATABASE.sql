-- ============================================
-- LeaveHub - COMPLETE DATABASE RESET
-- ⚠️  WARNING: This will DELETE ALL DATA!
-- ============================================
-- Run this in Supabase SQL Editor to start fresh
-- ============================================

-- First, drop ALL policies on ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
            'policy_name', r.schemaname, r.tablename);
    END LOOP;

    -- Drop all policies by querying pg_policies
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Drop all triggers
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE',
            r.trigger_name, r.event_object_table);
    END LOOP;
END $$;

-- Drop all tables (in dependency order)
DROP TABLE IF EXISTS paystack_webhooks CASCADE;
DROP TABLE IF EXISTS paystack_customers CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS document_access_logs CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS leave_request_approvals CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS default_leave_types CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS public_holidays CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop any remaining tables we might have missed
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all custom types
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS leave_request_status CASCADE;
DROP TYPE IF EXISTS approval_action CASCADE;
DROP TYPE IF EXISTS document_category CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_leave_balance_on_approval() CASCADE;
DROP FUNCTION IF EXISTS link_medical_certificate_to_leave() CASCADE;
DROP FUNCTION IF EXISTS sync_subscription_status_to_company() CASCADE;
DROP FUNCTION IF EXISTS is_subscription_active(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_active_subscription(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_working_days(DATE, DATE, UUID) CASCADE;
DROP FUNCTION IF EXISTS check_leave_balance(UUID, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_team_members(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_pending_requests_for_manager(UUID) CASCADE;
DROP FUNCTION IF EXISTS initialize_employee_leave_balances(UUID, UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_company_subscription_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_leave_overlap(UUID, DATE, DATE, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_team_availability(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS create_default_leave_types_for_company(UUID) CASCADE;

-- Drop any remaining functions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT routine_name, routine_schema
        FROM information_schema.routines
        WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    ) LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE',
            r.routine_schema, r.routine_name);
    END LOOP;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ DATABASE COMPLETELY WIPED!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Removed:';
  RAISE NOTICE '  ✓ All tables';
  RAISE NOTICE '  ✓ All custom types (enums)';
  RAISE NOTICE '  ✓ All functions';
  RAISE NOTICE '  ✓ All triggers';
  RAISE NOTICE '  ✓ All RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'NEXT STEPS - Run these scripts IN ORDER:';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE '1️⃣  database/01_CORE_SCHEMA.sql';
  RAISE NOTICE '2️⃣  database/02_LEAVE_MANAGEMENT.sql';
  RAISE NOTICE '3️⃣  database/03_DOCUMENTS.sql';
  RAISE NOTICE '4️⃣  database/04_SECURITY_RLS.sql';
  RAISE NOTICE '5️⃣  database/05_FUNCTIONS.sql';
  RAISE NOTICE '6️⃣  database/06_PAYSTACK_SUBSCRIPTIONS.sql';
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
END $$;
