-- Add role field to profiles table
-- Migration: Add user roles for RBAC

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'employee',
    'manager',
    'hr_admin',
    'admin',
    'super_admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'employee' NOT NULL;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add comment to column
COMMENT ON COLUMN profiles.role IS 'User role: employee, manager, hr_admin, admin, or super_admin';

-- Update RLS policies to consider role

-- Policy: Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can update their own profile (excluding role)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    -- Prevent users from changing their own role
    AND (role = (SELECT role FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'))
  );

-- Policy: HR Admins and above can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('hr_admin', 'admin', 'super_admin')
    )
  );

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Managers can read their team members' profiles
CREATE POLICY "Managers can read team profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND p.role IN ('manager', 'hr_admin', 'admin', 'super_admin')
      AND (profiles.department = p.department OR p.role IN ('hr_admin', 'admin', 'super_admin'))
    )
  );

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_clerk_id text)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE clerk_user_id = user_clerk_id LIMIT 1;
$$;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_role_permission(user_clerk_id text, required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_val user_role;
  role_hierarchy int;
  required_hierarchy int;
BEGIN
  -- Get user's role
  SELECT role INTO user_role_val FROM profiles WHERE clerk_user_id = user_clerk_id LIMIT 1;

  -- Define role hierarchy
  role_hierarchy := CASE user_role_val
    WHEN 'employee' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'hr_admin' THEN 3
    WHEN 'admin' THEN 4
    WHEN 'super_admin' THEN 5
    ELSE 0
  END;

  required_hierarchy := CASE required_role
    WHEN 'employee' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'hr_admin' THEN 3
    WHEN 'admin' THEN 4
    WHEN 'super_admin' THEN 5
    ELSE 0
  END;

  RETURN role_hierarchy >= required_hierarchy;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role_permission(text, user_role) TO authenticated;
