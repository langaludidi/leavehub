-- Document Storage System for Leave Requests
-- South Africa MVP specific document management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supporting Documents table
CREATE TABLE IF NOT EXISTS supporting_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL, -- references auth.users
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  file_type TEXT NOT NULL, -- MIME type
  storage_path TEXT NOT NULL, -- Supabase storage path
  document_type TEXT NOT NULL CHECK (document_type IN ('medical_certificate', 'study_proof', 'travel_document', 'death_certificate', 'other')),
  is_required BOOLEAN DEFAULT false, -- was this doc required by policy
  is_override BOOLEAN DEFAULT false, -- was this an admin override instead of document
  override_reason TEXT, -- justification for override
  verified_by UUID, -- admin who verified the document
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  access_logs JSONB DEFAULT '[]'::jsonb, -- track who accessed the document when
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Requirements table - defines when documents are needed
CREATE TABLE IF NOT EXISTS document_requirements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('medical_certificate', 'study_proof', 'travel_document', 'death_certificate', 'other')),
  is_required BOOLEAN DEFAULT true,
  required_after_days INTEGER DEFAULT 1, -- require document if leave is longer than X days
  allow_override BOOLEAN DEFAULT true, -- can admin override requirement
  override_requires_justification BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Access Audit table - track all document access
CREATE TABLE IF NOT EXISTS document_access_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES supporting_documents(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL, -- references auth.users
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'delete', 'verify')),
  ip_address INET,
  user_agent TEXT,
  access_reason TEXT, -- why was document accessed
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_supporting_docs_leave_request ON supporting_documents(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_supporting_docs_org ON supporting_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_supporting_docs_type ON supporting_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_doc_requirements_leave_type ON document_requirements(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_audit_doc ON document_access_audit(document_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_access_audit_user ON document_access_audit(accessed_by);

-- Row Level Security (RLS) policies
ALTER TABLE supporting_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supporting_documents
CREATE POLICY "Users can view documents for their own requests" ON supporting_documents
  FOR SELECT USING (
    leave_request_id IN (
      SELECT id FROM leave_requests WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view documents for their team's requests" ON supporting_documents
  FOR SELECT USING (
    leave_request_id IN (
      SELECT lr.id 
      FROM leave_requests lr
      JOIN user_profiles up_employee ON up_employee.user_id = lr.user_id
      JOIN user_profiles up_manager ON up_manager.organization_id = up_employee.organization_id
      WHERE up_manager.user_id = auth.uid() 
        AND up_manager.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Users can upload documents to their own requests" ON supporting_documents
  FOR INSERT WITH CHECK (
    leave_request_id IN (
      SELECT id FROM leave_requests WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all organization documents" ON supporting_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = supporting_documents.organization_id
    )
  );

-- RLS Policies for document_requirements
CREATE POLICY "Users can view document requirements for their organization" ON document_requirements
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage document requirements" ON document_requirements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = document_requirements.organization_id
    )
  );

-- Function to check document requirements for a leave request
CREATE OR REPLACE FUNCTION check_document_requirements(p_leave_request_id UUID)
RETURNS TABLE (
  document_type TEXT,
  is_required BOOLEAN,
  allow_override BOOLEAN,
  description TEXT,
  is_satisfied BOOLEAN,
  has_override BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  org_id UUID;
BEGIN
  -- Get leave request details
  SELECT lr.*, up.organization_id, lt.id as leave_type_id
  INTO request_record
  FROM leave_requests lr
  JOIN user_profiles up ON up.user_id = lr.user_id
  LEFT JOIN leave_types lt ON lt.code = lr.leave_type AND lt.organization_id = up.organization_id
  WHERE lr.id = p_leave_request_id;
  
  org_id := request_record.organization_id;
  
  -- Calculate leave duration in days
  DECLARE
    leave_days INTEGER := EXTRACT(DAY FROM (request_record.end_date::date - request_record.start_date::date)) + 1;
  BEGIN
    RETURN QUERY
    SELECT 
      dr.document_type,
      dr.is_required,
      dr.allow_override,
      dr.description,
      EXISTS (
        SELECT 1 FROM supporting_documents sd 
        WHERE sd.leave_request_id = p_leave_request_id 
        AND sd.document_type = dr.document_type
        AND sd.is_override = false
      ) as is_satisfied,
      EXISTS (
        SELECT 1 FROM supporting_documents sd 
        WHERE sd.leave_request_id = p_leave_request_id 
        AND sd.document_type = dr.document_type
        AND sd.is_override = true
      ) as has_override
    FROM document_requirements dr
    WHERE dr.organization_id = org_id
    AND (dr.leave_type_id = request_record.leave_type_id OR dr.leave_type_id IS NULL)
    AND (dr.required_after_days IS NULL OR leave_days >= dr.required_after_days)
    AND dr.is_required = true;
  END;
END;
$$;

-- Function to log document access
CREATE OR REPLACE FUNCTION log_document_access(
  p_document_id UUID,
  p_access_type TEXT,
  p_access_reason TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  access_id UUID;
BEGIN
  INSERT INTO document_access_audit (
    document_id,
    accessed_by,
    access_type,
    ip_address,
    user_agent,
    access_reason
  ) VALUES (
    p_document_id,
    auth.uid(),
    p_access_type,
    p_ip_address,
    p_user_agent,
    p_access_reason
  ) RETURNING id INTO access_id;
  
  -- Also update the access_logs in supporting_documents
  UPDATE supporting_documents 
  SET 
    access_logs = access_logs || jsonb_build_object(
      'timestamp', NOW(),
      'user_id', auth.uid(),
      'access_type', p_access_type
    ),
    updated_at = NOW()
  WHERE id = p_document_id;
  
  RETURN access_id;
END;
$$;

-- Function to create document override (admin only)
CREATE OR REPLACE FUNCTION create_document_override(
  p_leave_request_id UUID,
  p_document_type TEXT,
  p_override_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  override_id UUID;
  org_id UUID;
BEGIN
  -- Verify user is admin
  SELECT up.organization_id INTO org_id
  FROM user_profiles up
  WHERE up.user_id = auth.uid() AND up.role = 'admin';
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can create document overrides';
  END IF;
  
  -- Create override document record
  INSERT INTO supporting_documents (
    organization_id,
    leave_request_id,
    uploaded_by,
    file_name,
    original_file_name,
    file_size,
    file_type,
    storage_path,
    document_type,
    is_override,
    override_reason
  ) VALUES (
    org_id,
    p_leave_request_id,
    auth.uid(),
    'override',
    'Administrative Override',
    0,
    'text/plain',
    '',
    p_document_type,
    true,
    p_override_reason
  ) RETURNING id INTO override_id;
  
  -- Log the override
  PERFORM log_document_access(override_id, 'override', p_override_reason);
  
  RETURN override_id;
END;
$$;

-- Function to verify document (admin/manager only)
CREATE OR REPLACE FUNCTION verify_document(
  p_document_id UUID,
  p_verification_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_org_id UUID;
  user_role TEXT;
BEGIN
  -- Get document organization and verify user permissions
  SELECT sd.organization_id, up.role
  INTO doc_org_id, user_role
  FROM supporting_documents sd
  JOIN user_profiles up ON up.user_id = auth.uid() AND up.organization_id = sd.organization_id
  WHERE sd.id = p_document_id;
  
  IF user_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Only admins and managers can verify documents';
  END IF;
  
  -- Update document verification
  UPDATE supporting_documents 
  SET 
    verified_by = auth.uid(),
    verified_at = NOW(),
    verification_notes = p_verification_notes,
    updated_at = NOW()
  WHERE id = p_document_id;
  
  -- Log the verification
  PERFORM log_document_access(p_document_id, 'verify', 'Document verified');
END;
$$;

-- Function to get document compliance report
CREATE OR REPLACE FUNCTION get_document_compliance_report(
  p_organization_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_requests INTEGER,
  requests_with_required_docs INTEGER,
  requests_with_overrides INTEGER,
  compliance_percentage NUMERIC,
  override_percentage NUMERIC,
  document_type TEXT,
  doc_required_count INTEGER,
  doc_provided_count INTEGER,
  doc_override_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_filtered_requests AS (
    SELECT lr.id as request_id, lr.created_at, up.organization_id
    FROM leave_requests lr
    JOIN user_profiles up ON up.user_id = lr.user_id
    WHERE up.organization_id = p_organization_id
    AND (p_start_date IS NULL OR lr.created_at::date >= p_start_date)
    AND (p_end_date IS NULL OR lr.created_at::date <= p_end_date)
  ),
  overall_stats AS (
    SELECT 
      COUNT(*)::INTEGER as total_requests,
      COUNT(DISTINCT CASE WHEN sd.id IS NOT NULL AND sd.is_override = false THEN dfr.request_id END)::INTEGER as requests_with_docs,
      COUNT(DISTINCT CASE WHEN sd.is_override = true THEN dfr.request_id END)::INTEGER as requests_with_overrides
    FROM date_filtered_requests dfr
    LEFT JOIN supporting_documents sd ON sd.leave_request_id = dfr.request_id
  ),
  doc_type_stats AS (
    SELECT 
      dr.document_type,
      COUNT(DISTINCT dfr.request_id)::INTEGER as required_count,
      COUNT(DISTINCT CASE WHEN sd.id IS NOT NULL AND sd.is_override = false THEN sd.leave_request_id END)::INTEGER as provided_count,
      COUNT(DISTINCT CASE WHEN sd.is_override = true THEN sd.leave_request_id END)::INTEGER as override_count
    FROM document_requirements dr
    CROSS JOIN date_filtered_requests dfr
    LEFT JOIN supporting_documents sd ON sd.leave_request_id = dfr.request_id AND sd.document_type = dr.document_type
    WHERE dr.organization_id = p_organization_id
    GROUP BY dr.document_type
  )
  SELECT 
    os.total_requests,
    os.requests_with_docs as requests_with_required_docs,
    os.requests_with_overrides,
    CASE WHEN os.total_requests > 0 THEN ROUND((os.requests_with_docs::NUMERIC / os.total_requests::NUMERIC) * 100, 2) ELSE 0 END as compliance_percentage,
    CASE WHEN os.total_requests > 0 THEN ROUND((os.requests_with_overrides::NUMERIC / os.total_requests::NUMERIC) * 100, 2) ELSE 0 END as override_percentage,
    dts.document_type,
    dts.required_count as doc_required_count,
    dts.provided_count as doc_provided_count,
    dts.override_count as doc_override_count
  FROM overall_stats os
  CROSS JOIN doc_type_stats dts;
END;
$$;

-- Create default document requirements for common SA leave types
CREATE OR REPLACE FUNCTION create_default_document_requirements(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default document requirements if they don't exist
  INSERT INTO document_requirements (organization_id, leave_type_id, document_type, is_required, required_after_days, description)
  SELECT 
    org_id,
    lt.id,
    'medical_certificate',
    true,
    3, -- require medical cert for sick leave > 3 days
    'Medical certificate required for sick leave longer than 3 days (BCEA requirement)'
  FROM leave_types lt
  WHERE lt.organization_id = org_id 
    AND lt.code = 'sick'
    AND NOT EXISTS (
      SELECT 1 FROM document_requirements dr 
      WHERE dr.organization_id = org_id 
        AND dr.leave_type_id = lt.id 
        AND dr.document_type = 'medical_certificate'
    );
  
  -- Study leave requires proof
  INSERT INTO document_requirements (organization_id, leave_type_id, document_type, is_required, required_after_days, description)
  SELECT 
    org_id,
    lt.id,
    'study_proof',
    true,
    1,
    'Proof of study enrollment or examination schedule required'
  FROM leave_types lt
  WHERE lt.organization_id = org_id 
    AND lt.code = 'study'
    AND NOT EXISTS (
      SELECT 1 FROM document_requirements dr 
      WHERE dr.organization_id = org_id 
        AND dr.leave_type_id = lt.id 
        AND dr.document_type = 'study_proof'
    );
    
  -- Bereavement leave requires death certificate
  INSERT INTO document_requirements (organization_id, leave_type_id, document_type, is_required, required_after_days, description)
  SELECT 
    org_id,
    lt.id,
    'death_certificate',
    true,
    1,
    'Death certificate or funeral notice required for bereavement leave'
  FROM leave_types lt
  WHERE lt.organization_id = org_id 
    AND lt.code = 'bereavement'
    AND NOT EXISTS (
      SELECT 1 FROM document_requirements dr 
      WHERE dr.organization_id = org_id 
        AND dr.leave_type_id = lt.id 
        AND dr.document_type = 'death_certificate'
    );
END;
$$;

-- Trigger to create default document requirements for new organizations
CREATE OR REPLACE FUNCTION trigger_create_default_doc_requirements()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM create_default_document_requirements(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_doc_requirements_trigger ON organizations;
CREATE TRIGGER create_doc_requirements_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_doc_requirements();