-- QUICK FIX: Essential tables to stop 404 errors
-- Copy and paste this into Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default organization
INSERT INTO organizations (name) 
SELECT 'Default Organization' 
WHERE NOT EXISTS (SELECT 1 FROM organizations);

-- Create profiles table 
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the missing organization_members table (THIS FIXES THE 404s!)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Allow authenticated users" ON organizations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Allow own org membership" ON organization_members FOR ALL USING (auth.uid() = user_id);

-- Insert demo user into organization_members (fixes the specific 404)
DO $$
DECLARE
    demo_org_id UUID;
BEGIN
    -- Get the organization ID
    SELECT id INTO demo_org_id FROM organizations LIMIT 1;
    
    -- Insert demo user if not exists
    INSERT INTO organization_members (user_id, organization_id, role, is_active)
    SELECT '7aadf3cc-5683-4dea-a444-7f7f46aba1be'::UUID, demo_org_id, 'admin', true
    WHERE NOT EXISTS (
        SELECT 1 FROM organization_members 
        WHERE user_id = '7aadf3cc-5683-4dea-a444-7f7f46aba1be'::UUID
    );
END $$;

SELECT 'Quick fix schema applied - 404 errors should be resolved!' as status;