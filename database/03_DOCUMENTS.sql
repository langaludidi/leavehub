-- ============================================
-- LeaveHub MVP - Document Management
-- Secure document storage and access control
-- ============================================

-- ============================================
-- 1. DOCUMENT CATEGORY ENUM
-- ============================================
CREATE TYPE document_category AS ENUM (
  'medical_certificate',
  'contract',
  'identity_document',
  'proof_of_address',
  'leave_document',
  'payslip',
  'performance_review',
  'disciplinary',
  'other'
);

-- ============================================
-- 2. DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- Employee who owns the document

  -- Document Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category document_category NOT NULL,

  -- File Information
  file_url TEXT NOT NULL,  -- Supabase Storage URL
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,  -- Size in bytes
  file_type VARCHAR(100),  -- MIME type
  storage_path TEXT NOT NULL,  -- Path in Supabase Storage

  -- Related Entities
  leave_request_id UUID REFERENCES leave_requests(id) ON DELETE SET NULL,  -- If attached to leave request

  -- Access Control
  is_private BOOLEAN DEFAULT true,  -- Only owner and admins can see
  is_verified BOOLEAN DEFAULT false,  -- Verified by HR/Admin

  -- Metadata
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_leave_request_id ON documents(leave_request_id);

-- ============================================
-- 3. DOCUMENT ACCESS LOGS TABLE (Audit)
-- ============================================
CREATE TABLE document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  accessed_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,

  -- Access Information
  action VARCHAR(50) NOT NULL,  -- 'view', 'download', 'delete', 'update'
  ip_address VARCHAR(50),
  user_agent TEXT,

  -- Metadata
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_accessed_by ON document_access_logs(accessed_by);
CREATE INDEX idx_document_access_logs_accessed_at ON document_access_logs(accessed_at);

-- ============================================
-- 4. TRIGGER: UPDATE TIMESTAMPS
-- ============================================
CREATE TRIGGER trigger_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. TRIGGER: AUTO-LINK MEDICAL CERTIFICATES
-- ============================================
CREATE OR REPLACE FUNCTION link_medical_certificate_to_leave()
RETURNS TRIGGER AS $$
BEGIN
  -- If a medical certificate is uploaded and there's a pending sick leave request
  -- for the same user that requires a certificate, link them
  IF NEW.category = 'medical_certificate' AND NEW.owner_id IS NOT NULL THEN
    UPDATE leave_requests
    SET
      medical_certificate_uploaded = true,
      medical_certificate_url = NEW.file_url,
      updated_at = NOW()
    WHERE
      user_id = NEW.owner_id
      AND requires_medical_certificate = true
      AND medical_certificate_uploaded = false
      AND status = 'pending'
      AND start_date >= CURRENT_DATE - INTERVAL '7 days'  -- Recent requests
    RETURNING id INTO NEW.leave_request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_link_medical_certificate
BEFORE INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION link_medical_certificate_to_leave();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Document Management schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- documents table (9 document categories)';
  RAISE NOTICE '- document_access_logs table (audit trail)';
  RAISE NOTICE '- Auto-linking trigger for medical certificates';
  RAISE NOTICE '- Timestamp update triggers';
  RAISE NOTICE '';
  RAISE NOTICE 'Document categories:';
  RAISE NOTICE '  - Medical Certificate';
  RAISE NOTICE '  - Contract';
  RAISE NOTICE '  - Identity Document';
  RAISE NOTICE '  - Proof of Address';
  RAISE NOTICE '  - Leave Document';
  RAISE NOTICE '  - Payslip';
  RAISE NOTICE '  - Performance Review';
  RAISE NOTICE '  - Disciplinary';
  RAISE NOTICE '  - Other';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run 04_SECURITY_RLS.sql';
  RAISE NOTICE '';
END $$;
