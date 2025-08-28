-- POPIA (Protection of Personal Information Act) Compliance Features
-- South African data protection and privacy compliance system

-- Table to track data processing purposes and legal bases
CREATE TABLE IF NOT EXISTS data_processing_purposes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  purpose_name TEXT NOT NULL,
  purpose_description TEXT NOT NULL,
  legal_basis TEXT NOT NULL CHECK (legal_basis IN (
    'consent', 'contract', 'legal_obligation', 'vital_interests', 
    'public_task', 'legitimate_interests'
  )),
  data_categories JSONB NOT NULL DEFAULT '[]'::jsonb, -- Types of personal info processed
  retention_period_months INTEGER NOT NULL DEFAULT 60, -- 5 years default
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default POPIA-compliant data processing purposes for leave management
INSERT INTO data_processing_purposes (
  organization_id, purpose_name, purpose_description, legal_basis, 
  data_categories, retention_period_months
) 
SELECT 
  id as organization_id,
  'Leave Management',
  'Processing employee personal information for leave request management, approval workflows, and compliance reporting as required by employment law',
  'legal_obligation',
  '["employee_identity", "employment_details", "leave_history", "medical_certificates", "contact_information"]'::jsonb,
  84 -- 7 years for employment records
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM data_processing_purposes 
  WHERE organization_id = organizations.id 
  AND purpose_name = 'Leave Management'
);

-- Table to track consent records (where applicable)
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_subject_id UUID NOT NULL, -- Can reference user_profiles or external subjects
  data_subject_email TEXT NOT NULL,
  processing_purpose_id UUID NOT NULL REFERENCES data_processing_purposes(id) ON DELETE CASCADE,
  
  -- Consent details
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  consent_method TEXT, -- 'explicit_form', 'email_confirmation', 'verbal', etc.
  consent_evidence JSONB, -- Store evidence of consent
  
  -- Withdrawal tracking
  consent_withdrawn BOOLEAN NOT NULL DEFAULT false,
  consent_withdrawn_at TIMESTAMP WITH TIME ZONE,
  withdrawal_method TEXT,
  withdrawal_evidence JSONB,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(data_subject_id, processing_purpose_id)
);

-- Table to track data subject requests (access, rectification, erasure, etc.)
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_reference TEXT NOT NULL, -- Human-readable reference
  
  -- Data subject information
  data_subject_id UUID, -- May be NULL for non-users
  data_subject_email TEXT NOT NULL,
  data_subject_name TEXT,
  data_subject_phone TEXT,
  
  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN (
    'access', 'rectification', 'erasure', 'restriction', 
    'portability', 'objection', 'consent_withdrawal'
  )),
  request_description TEXT NOT NULL,
  request_scope JSONB, -- What data/systems are involved
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'under_review', 'additional_info_required', 
    'processing', 'completed', 'rejected', 'partially_completed'
  )),
  
  -- Timeline tracking (POPIA requires response within 30 days)
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Processing details
  assigned_to UUID REFERENCES auth.users(id),
  processing_notes TEXT,
  outcome_description TEXT,
  rejection_reason TEXT,
  
  -- Compliance tracking
  verification_method TEXT, -- How identity was verified
  verification_evidence JSONB,
  compliance_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, request_reference)
);

-- Table to track data breaches and incidents
CREATE TABLE IF NOT EXISTS data_incidents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_reference TEXT NOT NULL,
  
  -- Incident classification
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'data_breach', 'system_compromise', 'unauthorized_access', 
    'data_loss', 'accidental_disclosure', 'other'
  )),
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN (
    'low', 'medium', 'high', 'critical'
  )),
  
  -- Incident details
  incident_description TEXT NOT NULL,
  affected_data_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_affected_individuals INTEGER,
  
  -- Timeline
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  contained_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Response actions
  immediate_actions_taken TEXT,
  containment_measures TEXT,
  remediation_actions TEXT,
  
  -- Regulatory compliance
  regulator_notified BOOLEAN NOT NULL DEFAULT false,
  regulator_notification_date TIMESTAMP WITH TIME ZONE,
  individuals_notified BOOLEAN NOT NULL DEFAULT false,
  individuals_notification_date TIMESTAMP WITH TIME ZONE,
  
  -- Risk assessment
  risk_to_individuals TEXT,
  likelihood_of_harm TEXT NOT NULL DEFAULT 'low' CHECK (likelihood_of_harm IN (
    'negligible', 'low', 'medium', 'high'
  )),
  
  -- Investigation
  root_cause TEXT,
  preventive_measures TEXT,
  lessons_learned TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, incident_reference)
);

-- Table to track data retention and deletion schedules
CREATE TABLE IF NOT EXISTS data_retention_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_category TEXT NOT NULL,
  retention_period_months INTEGER NOT NULL,
  legal_basis TEXT NOT NULL,
  deletion_method TEXT NOT NULL DEFAULT 'secure_deletion',
  
  -- Scheduling
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  next_cleanup_at TIMESTAMP WITH TIME ZONE,
  cleanup_frequency_days INTEGER NOT NULL DEFAULT 30,
  
  -- Configuration
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, data_category)
);

-- Insert default retention schedules for leave management data
INSERT INTO data_retention_schedules (
  organization_id, data_category, retention_period_months, legal_basis
)
SELECT 
  id as organization_id,
  'leave_requests',
  84, -- 7 years for employment records
  'Employment records retention as required by Labour Relations Act and BCEA'
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM data_retention_schedules 
  WHERE organization_id = organizations.id 
  AND data_category = 'leave_requests'
)
UNION ALL
SELECT 
  id as organization_id,
  'employee_personal_data',
  84, -- 7 years
  'Employee records retention for legal and compliance purposes'
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM data_retention_schedules 
  WHERE organization_id = organizations.id 
  AND data_category = 'employee_personal_data'
)
UNION ALL
SELECT 
  id as organization_id,
  'medical_documents',
  60, -- 5 years for medical records
  'Medical records retention as per healthcare and employment regulations'
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM data_retention_schedules 
  WHERE organization_id = organizations.id 
  AND data_category = 'medical_documents'
);

-- Function to log data access events for compliance
CREATE OR REPLACE FUNCTION log_data_access(
  p_organization_id UUID,
  p_accessed_user_id UUID,
  p_access_type TEXT,
  p_data_categories JSONB DEFAULT '[]'::jsonb,
  p_access_reason TEXT DEFAULT NULL,
  p_legal_basis TEXT DEFAULT 'legitimate_interests'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    new_values,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_organization_id,
    auth.uid(),
    'data_access',
    p_accessed_user_id,
    p_access_type,
    jsonb_build_object(
      'data_categories', p_data_categories,
      'access_reason', p_access_reason,
      'legal_basis', p_legal_basis
    ),
    jsonb_build_object(
      'compliance_log', true,
      'popia_tracking', true,
      'access_timestamp', NOW()
    ),
    COALESCE(current_setting('request.headers', true)::jsonb->>'x-forwarded-for', '127.0.0.1')::inet,
    current_setting('request.headers', true)::jsonb->>'user-agent'
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to create data subject request
CREATE OR REPLACE FUNCTION create_data_subject_request(
  p_organization_id UUID,
  p_email TEXT,
  p_name TEXT,
  p_request_type TEXT,
  p_description TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_ref TEXT;
  request_id UUID;
BEGIN
  -- Generate human-readable reference
  request_ref := 'DSR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(
    (EXTRACT(DOY FROM NOW()))::text, 3, '0'
  ) || '-' || LPAD(
    (SELECT COUNT(*) + 1 FROM data_subject_requests 
     WHERE organization_id = p_organization_id 
     AND DATE(created_at) = DATE(NOW()))::text, 3, '0'
  );
  
  INSERT INTO data_subject_requests (
    organization_id,
    request_reference,
    data_subject_email,
    data_subject_name,
    data_subject_phone,
    request_type,
    request_description,
    received_at,
    due_date
  ) VALUES (
    p_organization_id,
    request_ref,
    p_email,
    p_name,
    p_phone,
    p_request_type,
    p_description,
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO request_id;
  
  -- Log the request creation
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    new_values,
    metadata
  ) VALUES (
    p_organization_id,
    auth.uid(),
    'data_subject_request',
    request_id,
    'create',
    jsonb_build_object(
      'request_type', p_request_type,
      'reference', request_ref,
      'data_subject_email', p_email
    ),
    jsonb_build_object(
      'popia_compliance', true,
      'legal_timeline_days', 30
    )
  );
  
  RETURN request_ref;
END;
$$;

-- Function to process data deletion requests
CREATE OR REPLACE FUNCTION process_data_erasure_request(
  p_request_id UUID,
  p_verification_passed BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  deletion_summary JSONB := '{"deleted": [], "retained": [], "errors": []}'::jsonb;
  user_record RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_record
  FROM data_subject_requests
  WHERE id = p_request_id AND request_type = 'erasure';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Erasure request not found');
  END IF;
  
  IF NOT p_verification_passed THEN
    UPDATE data_subject_requests 
    SET status = 'rejected', 
        rejection_reason = 'Identity verification failed',
        updated_at = NOW()
    WHERE id = p_request_id;
    
    RETURN jsonb_build_object('error', 'Identity verification failed');
  END IF;
  
  -- Find the user profile if it exists
  SELECT * INTO user_record
  FROM user_profiles
  WHERE organization_id = request_record.organization_id
    AND (email = request_record.data_subject_email OR user_id = request_record.data_subject_id);
  
  IF FOUND THEN
    -- Check for legal retention requirements
    IF EXISTS (
      SELECT 1 FROM leave_requests 
      WHERE user_id = user_record.user_id 
      AND created_at > NOW() - INTERVAL '7 years'
    ) THEN
      deletion_summary := jsonb_set(
        deletion_summary, 
        '{retained}', 
        (deletion_summary->'retained') || '["leave_requests - legal retention required"]'::jsonb
      );
    ELSE
      -- Safe to delete leave requests
      DELETE FROM leave_requests WHERE user_id = user_record.user_id;
      deletion_summary := jsonb_set(
        deletion_summary, 
        '{deleted}', 
        (deletion_summary->'deleted') || '["leave_requests"]'::jsonb
      );
    END IF;
    
    -- Delete supporting documents (with legal retention check)
    DELETE FROM supporting_documents 
    WHERE uploaded_by = user_record.user_id 
    AND created_at <= NOW() - INTERVAL '5 years';
    
    deletion_summary := jsonb_set(
      deletion_summary, 
      '{deleted}', 
      (deletion_summary->'deleted') || '["old_supporting_documents"]'::jsonb
    );
    
    -- Anonymize user profile (keep for legal compliance but remove PII)
    UPDATE user_profiles 
    SET 
      first_name = 'DELETED',
      last_name = 'USER',
      email = 'deleted-' || user_id::text || '@anonymized.local',
      phone = NULL,
      date_of_birth = NULL,
      emergency_contact_name = NULL,
      emergency_contact_phone = NULL,
      updated_at = NOW()
    WHERE user_id = user_record.user_id;
    
    deletion_summary := jsonb_set(
      deletion_summary, 
      '{deleted}', 
      (deletion_summary->'deleted') || '["personal_identifiable_information"]'::jsonb
    );
  END IF;
  
  -- Update request status
  UPDATE data_subject_requests 
  SET 
    status = 'completed',
    completed_at = NOW(),
    outcome_description = 'Data erasure processed according to POPIA requirements. Some data retained for legal compliance.',
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Log the deletion
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    new_values,
    metadata
  ) VALUES (
    request_record.organization_id,
    auth.uid(),
    'data_subject_request',
    p_request_id,
    'process_erasure',
    deletion_summary,
    jsonb_build_object(
      'popia_compliance', true,
      'erasure_type', 'right_to_be_forgotten',
      'legal_basis_checked', true
    )
  );
  
  RETURN deletion_summary;
END;
$$;

-- Function to generate POPIA compliance report
CREATE OR REPLACE FUNCTION generate_popia_compliance_report(
  p_organization_id UUID,
  p_start_date DATE DEFAULT (NOW() - INTERVAL '1 year')::date,
  p_end_date DATE DEFAULT NOW()::date
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report JSONB := '{}'::jsonb;
BEGIN
  -- Data Subject Requests Summary
  report := jsonb_set(report, '{data_subject_requests}', (
    SELECT jsonb_build_object(
      'total_requests', COUNT(*),
      'by_type', jsonb_object_agg(request_type, type_count),
      'by_status', jsonb_object_agg(status, status_count),
      'response_times', jsonb_build_object(
        'avg_days', AVG(EXTRACT(days FROM COALESCE(completed_at, NOW()) - received_at)),
        'overdue_count', COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'rejected'))
      )
    )
    FROM (
      SELECT 
        request_type,
        status,
        COUNT(*) as type_count,
        COUNT(*) as status_count,
        completed_at,
        received_at,
        due_date
      FROM data_subject_requests
      WHERE organization_id = p_organization_id
        AND received_at::date BETWEEN p_start_date AND p_end_date
      GROUP BY request_type, status, completed_at, received_at, due_date
    ) t
  ));
  
  -- Data Processing Activities
  report := jsonb_set(report, '{processing_activities}', (
    SELECT jsonb_build_object(
      'active_purposes', COUNT(*) FILTER (WHERE is_active = true),
      'purposes_by_legal_basis', jsonb_object_agg(legal_basis, basis_count),
      'avg_retention_months', AVG(retention_period_months)
    )
    FROM (
      SELECT legal_basis, COUNT(*) as basis_count, retention_period_months, is_active
      FROM data_processing_purposes
      WHERE organization_id = p_organization_id
      GROUP BY legal_basis, retention_period_months, is_active
    ) t
  ));
  
  -- Data Incidents
  report := jsonb_set(report, '{security_incidents}', (
    SELECT jsonb_build_object(
      'total_incidents', COUNT(*),
      'by_severity', jsonb_object_agg(severity_level, severity_count),
      'by_type', jsonb_object_agg(incident_type, type_count),
      'resolved_count', COUNT(*) FILTER (WHERE resolved_at IS NOT NULL),
      'regulator_notifications', COUNT(*) FILTER (WHERE regulator_notified = true)
    )
    FROM (
      SELECT 
        severity_level,
        incident_type,
        COUNT(*) as severity_count,
        COUNT(*) as type_count,
        resolved_at,
        regulator_notified
      FROM data_incidents
      WHERE organization_id = p_organization_id
        AND occurred_at::date BETWEEN p_start_date AND p_end_date
      GROUP BY severity_level, incident_type, resolved_at, regulator_notified
    ) t
  ));
  
  -- Data Access Logging
  report := jsonb_set(report, '{data_access_logs}', (
    SELECT jsonb_build_object(
      'total_access_events', COUNT(*),
      'unique_users', COUNT(DISTINCT user_id),
      'by_action', jsonb_object_agg(action, action_count)
    )
    FROM (
      SELECT action, COUNT(*) as action_count, user_id
      FROM audit_logs
      WHERE organization_id = p_organization_id
        AND entity_type = 'data_access'
        AND created_at::date BETWEEN p_start_date AND p_end_date
      GROUP BY action, user_id
    ) t
  ));
  
  -- Compliance Score Calculation
  DECLARE
    compliance_score INTEGER := 100;
    overdue_requests INTEGER;
    unresolved_incidents INTEGER;
  BEGIN
    -- Check for overdue data subject requests
    SELECT COUNT(*) INTO overdue_requests
    FROM data_subject_requests
    WHERE organization_id = p_organization_id
      AND due_date < NOW()
      AND status NOT IN ('completed', 'rejected');
    
    -- Check for unresolved high-severity incidents
    SELECT COUNT(*) INTO unresolved_incidents
    FROM data_incidents
    WHERE organization_id = p_organization_id
      AND severity_level IN ('high', 'critical')
      AND resolved_at IS NULL
      AND occurred_at < NOW() - INTERVAL '72 hours';
    
    -- Deduct points for compliance issues
    compliance_score := compliance_score - (overdue_requests * 20); -- -20 per overdue request
    compliance_score := compliance_score - (unresolved_incidents * 30); -- -30 per unresolved incident
    compliance_score := GREATEST(0, compliance_score); -- Minimum 0
    
    report := jsonb_set(report, '{compliance_score}', jsonb_build_object(
      'score', compliance_score,
      'overdue_requests', overdue_requests,
      'unresolved_incidents', unresolved_incidents,
      'last_calculated', NOW()
    ));
  END;
  
  RETURN report;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_org_subject ON consent_records(organization_id, data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_org_status ON data_subject_requests(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_due_date ON data_subject_requests(due_date) WHERE status NOT IN ('completed', 'rejected');
CREATE INDEX IF NOT EXISTS idx_data_incidents_org_severity ON data_incidents(organization_id, severity_level);
CREATE INDEX IF NOT EXISTS idx_data_incidents_occurred ON data_incidents(occurred_at);

-- RLS Policies for POPIA tables
ALTER TABLE data_processing_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_schedules ENABLE ROW LEVEL SECURITY;

-- Data processing purposes - admin access only
CREATE POLICY data_processing_purposes_policy ON data_processing_purposes
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin')
    )
  );

-- Consent records - admin access only
CREATE POLICY consent_records_policy ON consent_records
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin')
    )
  );

-- Data subject requests - admin access only
CREATE POLICY data_subject_requests_policy ON data_subject_requests
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin')
    )
  );

-- Data incidents - admin access only
CREATE POLICY data_incidents_policy ON data_incidents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin')
    )
  );

-- Data retention schedules - admin access only
CREATE POLICY data_retention_schedules_policy ON data_retention_schedules
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin')
    )
  );

-- Create compliance dashboard view
CREATE OR REPLACE VIEW popia_compliance_dashboard AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  
  -- Data Subject Requests
  COALESCE(dsr_stats.total_requests, 0) as total_data_subject_requests,
  COALESCE(dsr_stats.pending_requests, 0) as pending_requests,
  COALESCE(dsr_stats.overdue_requests, 0) as overdue_requests,
  
  -- Data Incidents  
  COALESCE(incident_stats.total_incidents, 0) as total_incidents,
  COALESCE(incident_stats.unresolved_critical, 0) as unresolved_critical_incidents,
  
  -- Processing Activities
  COALESCE(purpose_stats.active_purposes, 0) as active_processing_purposes,
  
  -- Compliance Score
  CASE 
    WHEN COALESCE(dsr_stats.overdue_requests, 0) > 0 OR COALESCE(incident_stats.unresolved_critical, 0) > 0 THEN 'non_compliant'
    WHEN COALESCE(dsr_stats.pending_requests, 0) > 5 THEN 'at_risk'
    ELSE 'compliant'
  END as compliance_status,
  
  NOW() as last_updated
  
FROM organizations o

LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status IN ('received', 'under_review', 'processing')) as pending_requests,
    COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'rejected')) as overdue_requests
  FROM data_subject_requests
  GROUP BY organization_id
) dsr_stats ON o.id = dsr_stats.organization_id

LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) as total_incidents,
    COUNT(*) FILTER (WHERE severity_level IN ('high', 'critical') AND resolved_at IS NULL) as unresolved_critical
  FROM data_incidents
  WHERE occurred_at > NOW() - INTERVAL '6 months'
  GROUP BY organization_id
) incident_stats ON o.id = incident_stats.organization_id

LEFT JOIN (
  SELECT 
    organization_id,
    COUNT(*) FILTER (WHERE is_active = true) as active_purposes
  FROM data_processing_purposes
  GROUP BY organization_id
) purpose_stats ON o.id = purpose_stats.organization_id;

GRANT SELECT ON popia_compliance_dashboard TO authenticated;