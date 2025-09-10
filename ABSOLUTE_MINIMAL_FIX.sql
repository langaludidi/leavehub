-- ABSOLUTE MINIMAL FIX - Copy this EXACTLY into Supabase SQL Editor

-- Step 1: Disable all security
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;  
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Add the demo user
INSERT INTO profiles (id, full_name, email)
VALUES ('7aadf3cc-5683-4dea-a444-7f7f46aba1be', 'Demo User', 'demo@test.com')
ON CONFLICT (id) DO NOTHING;