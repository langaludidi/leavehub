-- =====================================================
-- DROP ALL TABLES - Run this FIRST to clear old schema
-- =====================================================
-- This will drop all LeaveHub tables in the correct order
-- to avoid foreign key constraint violations

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS public_holidays CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Verify all tables are dropped
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'profiles', 'leave_types', 'leave_balances',
                     'leave_requests', 'public_holidays', 'departments', 'notifications');

-- You should see an empty result set above
-- Now run SETUP_COMPLETE.sql to recreate everything with the correct schema
