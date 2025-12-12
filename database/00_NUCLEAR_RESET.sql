-- ============================================
-- LeaveHub - NUCLEAR DATABASE RESET
-- ⚠️  THIS WILL DESTROY EVERYTHING IN PUBLIC SCHEMA!
-- ============================================
-- Use this if the regular reset doesn't work
-- ============================================

-- Drop the entire public schema (this removes EVERYTHING)
DROP SCHEMA IF EXISTS public CASCADE;

-- Recreate the public schema
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '💥 NUCLEAR RESET COMPLETE!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'The entire public schema has been dropped and recreated.';
  RAISE NOTICE 'Your database is now completely empty and ready for setup.';
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
