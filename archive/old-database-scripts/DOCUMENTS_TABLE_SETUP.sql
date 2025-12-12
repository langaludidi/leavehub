-- =====================================================
-- DOCUMENT MANAGEMENT SYSTEM - DATABASE SETUP
-- =====================================================
-- This script creates the documents table and storage bucket
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Create documents table
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- ============================================
-- STEP 2: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Note: Since we're using Clerk auth (not Supabase auth), we handle authentication
-- in the API layer. RLS is enabled as a security layer, but the API uses an admin
-- client to bypass these policies. These policies prevent direct database access.

-- Policy: Allow service role (API) to do everything
CREATE POLICY "Service role has full access"
  ON documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users have no direct access (must go through API)
CREATE POLICY "Authenticated users must use API"
  ON documents
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================
-- STEP 3: Create updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 4: Create storage bucket
-- ============================================

-- Create documents bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: Storage bucket RLS policies
-- ============================================

-- Note: Same as documents table - we use Clerk auth via API layer.
-- The API uses admin/service role client to manage storage.

-- Policy: Service role has full access to documents bucket
CREATE POLICY "Service role has full access to documents"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');

-- Policy: Authenticated users have no direct access (must go through API)
CREATE POLICY "Authenticated users must use API for documents"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'documents'
) AS documents_table_exists;

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'documents';

-- Success message
SELECT 'Documents system setup complete!' AS status;
