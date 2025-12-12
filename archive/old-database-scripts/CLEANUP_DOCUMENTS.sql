-- =====================================================
-- CLEANUP SCRIPT - Run this FIRST
-- =====================================================
-- This removes any existing documents table and policies

-- Drop existing policies on documents table
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Service role has full access" ON documents;
DROP POLICY IF EXISTS "Authenticated users must use API" ON documents;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role has full access to documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users must use API for documents" ON storage.objects;

-- Drop trigger and function
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop table (this will also drop indexes)
DROP TABLE IF EXISTS documents CASCADE;

-- Remove storage bucket (comment out if you want to keep existing files)
DELETE FROM storage.buckets WHERE id = 'documents';

SELECT 'Cleanup complete! Now run DOCUMENTS_TABLE_SETUP.sql' AS status;
