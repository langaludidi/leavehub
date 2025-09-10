-- READY-TO-USE SUPABASE SQL FIX
-- Copy this entire script and paste it into your Supabase SQL Editor
-- This completely avoids the polname/policyname error

-- Clean slate: Drop all potentially problematic policies
DROP POLICY IF EXISTS "leave_requests_select_basic" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_insert_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_update_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_delete_own" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_admin_all" ON leave_requests;

-- Ensure RLS is enabled
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Create basic user policies
CREATE POLICY "leave_requests_select_basic" 
ON leave_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "leave_requests_insert_own" 
ON leave_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leave_requests_update_own" 
ON leave_requests 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "leave_requests_delete_own" 
ON leave_requests 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'pending');

-- Create admin policy (optional - only if you have user_profiles table)
CREATE POLICY "leave_requests_admin_all" 
ON leave_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- Verification query to confirm policies were created
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has conditions'
    ELSE 'No conditions'
  END as has_conditions
FROM pg_policies 
WHERE tablename = 'leave_requests'
ORDER BY policyname;