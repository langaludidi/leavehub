-- =====================================================
-- DOCUMENT MANAGEMENT - FINAL SETUP
-- =====================================================
-- This script safely sets up documents without breaking existing tables
-- =====================================================

-- Drop existing document-specific policies only
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Service role has full access" ON documents;
DROP POLICY IF EXISTS "Authenticated users must use API" ON documents;
DROP POLICY IF EXISTS "api_full_access" ON documents;
DROP POLICY IF EXISTS "no_direct_access" ON documents;

-- Drop existing storage policies for documents bucket
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Service role has full access to documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users must use API for documents" ON storage.objects;
DROP POLICY IF EXISTS "api_storage_full_access" ON storage.objects;
DROP POLICY IF EXISTS "no_direct_storage_access" ON storage.objects;

-- Drop trigger (not the function - other tables use it)
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;

-- Drop table if exists
DROP TABLE IF EXISTS documents CASCADE;

-- =====================================================
-- Create documents table
-- =====================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100),
  category VARCHAR(50) DEFAULT 'other',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (file_size > 0),
  CHECK (category IN ('medical_certificate', 'supporting_document', 'contract', 'identification', 'other'))
);

-- Create indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Create trigger (reuse existing function)
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Enable RLS with correct policies
-- =====================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow API (service role) full access - this bypasses RLS
CREATE POLICY "api_full_access"
  ON documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Storage bucket setup
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS - allow service role full access
CREATE POLICY "api_storage_full_access"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');

-- =====================================================
-- Verification
-- =====================================================
SELECT 'Documents table exists: ' ||
  EXISTS (SELECT FROM pg_tables WHERE tablename = 'documents')::text;

SELECT 'Storage bucket exists: ' ||
  EXISTS (SELECT FROM storage.buckets WHERE id = 'documents')::text;

SELECT 'RLS enabled: ' ||
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'documents')::text;

SELECT 'Setup complete!' AS status;
