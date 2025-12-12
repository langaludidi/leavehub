-- =====================================================
-- SUPABASE STORAGE SETUP FOR LEAVE DOCUMENTS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create storage bucket for leave documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('leave-documents', 'leave-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own leave documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'leave-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own documents
CREATE POLICY "Users can view their own leave documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'leave-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow managers and admins to view all documents
CREATE POLICY "Managers and admins can view all leave documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'leave-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.clerk_user_id = auth.jwt() ->> 'sub'
    AND profiles.role IN ('manager', 'admin')
  )
);

-- Policy: Allow users to delete their own documents (if leave request not yet submitted)
CREATE POLICY "Users can delete their own leave documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'leave-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- UPDATE LEAVE_REQUESTS TABLE TO STORE DOCUMENT PATHS
-- =====================================================

-- Add document_paths column to leave_requests table if it doesn't exist
ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS document_paths TEXT[] DEFAULT '{}';

-- Add comment explaining the column
COMMENT ON COLUMN leave_requests.document_paths IS 'Array of storage paths for uploaded supporting documents';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check bucket was created
SELECT * FROM storage.buckets WHERE id = 'leave-documents';

-- Check policies were created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%leave documents%';
