-- Quick fix for companies issue
-- Run this FIRST, then run the main setup

-- Drop the unique constraint temporarily to allow insert
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_slug_key;

-- Delete any existing demo company
DELETE FROM companies WHERE slug = 'demo-company';

-- Now insert with the specific ID we need
INSERT INTO companies (id, name, slug, industry, size)
VALUES (
  '12345678-1234-1234-1234-123456789000',
  'Demo Company',
  'demo-company',
  'Technology',
  'small'
);

-- Re-add the unique constraint
ALTER TABLE companies ADD CONSTRAINT companies_slug_key UNIQUE (slug);

-- Verify it worked
SELECT * FROM companies;
