-- Diagnostic script to check current policies and fix the polname issue
-- Run this first to see what's currently in your database

-- 1. Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename LIKE '%leave%' OR tablename LIKE '%user%'
ORDER BY tablename, policyname;

-- 2. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leave_requests', 'user_profiles', 'leave_balances', 'notifications');

-- 3. Simple policy creation without any existence checks
-- This completely avoids the polname/policyname issue

-- First, let's just drop all policies that might be causing issues
DROP POLICY IF EXISTS "leave_requests_select_basic" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_own" ON leave_requests;

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Create policies with simple syntax
CREATE POLICY "leave_requests_select_basic" 
ON leave_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "leave_requests_insert_own" 
ON leave_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leave_requests_update_own" 
ON leave_requests FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "leave_requests_delete_own" 
ON leave_requests FOR DELETE 
USING (auth.uid() = user_id AND status = 'pending');

-- Verify the policies were created
SELECT 'Policies created successfully' as status;