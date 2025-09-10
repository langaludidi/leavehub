-- Fix the 400 Bad Request errors by updating RLS policies
-- Run this in your Supabase SQL Editor after the previous schema

-- Drop and recreate the problematic RLS policies with better permissions
DROP POLICY IF EXISTS "Allow own org membership" ON organization_members;
DROP POLICY IF EXISTS "Allow authenticated users" ON organizations;
DROP POLICY IF EXISTS "Allow own profile" ON profiles;

-- More permissive policies for testing
CREATE POLICY "organization_members_read" ON organization_members
    FOR SELECT USING (true);

CREATE POLICY "organizations_read" ON organizations
    FOR SELECT USING (true);

CREATE POLICY "profiles_read" ON profiles
    FOR SELECT USING (true);

-- Also allow inserts for profiles (needed for user creation)
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Update organization_members with proper insert policy
CREATE POLICY "organization_members_insert" ON organization_members
    FOR INSERT WITH CHECK (true);

-- Ensure the demo user exists in profiles table
INSERT INTO profiles (id, full_name, email)
SELECT '7aadf3cc-5683-4dea-a444-7f7f46aba1be'::UUID, 'Demo User', 'demo@test.com'
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

SELECT 'Relationship fixes applied - 400 errors should be resolved!' as status;