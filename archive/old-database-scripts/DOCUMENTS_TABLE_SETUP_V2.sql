-- =====================================================
-- DOCUMENT MANAGEMENT SYSTEM - DATABASE SETUP V2
-- =====================================================
-- Run this in Supabase SQL Editor after cleanup
-- =====================================================

-- STEP 1: Create the trigger function first (before table)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: Create documents table
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

-- =====================================================
-- STEP 3: Create indexes
-- =====================================================
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- =====================================================
-- STEP 4: Create trigger
-- =====================================================
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: Enable RLS
-- =====================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow API (service role) full access
CREATE POLICY "api_full_access"
  ON documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Block direct browser access
CREATE POLICY "no_direct_access"
  ON documents
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- STEP 6: Create storage bucket
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 7: Storage RLS policies
-- =====================================================
CREATE POLICY "api_storage_full_access"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "no_direct_storage_access"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT
  'Documents table created: ' ||
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'documents'
  )::text AS status;

SELECT
  'Storage bucket created: ' ||
  EXISTS (
    SELECT FROM storage.buckets WHERE id = 'documents'
  )::text AS bucket_status;

SELECT 'Setup complete!' AS final_status;
