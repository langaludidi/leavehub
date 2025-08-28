-- Compliance and Audit Trail System
-- This migration creates tables for tracking all system activities and generating compliance reports

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Audit Log table - tracks all significant system activities
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID, -- references auth.users, nullable for system events
  entity_type TEXT NOT NULL, -- 'leave_request', 'user', 'policy', etc.
  entity_id UUID, -- ID of the affected entity
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'deny', 'cancel', 'restore')),
  old_values JSONB, -- previous state of the entity
  new_values JSONB, -- new state of the entity
  metadata JSONB DEFAULT '{}', -- additional context (IP, user agent, etc.)
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT, -- session identifier for grouping related actions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Reports table - stores generated compliance reports
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('audit_trail', 'leave_usage', 'policy_compliance', 'data_export', 'user_access')),
  title TEXT NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}', -- filter criteria, date ranges, etc.
  generated_by UUID NOT NULL, -- references auth.users
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  file_path TEXT, -- path to generated report file
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  expires_at TIMESTAMPTZ, -- when the report file should be deleted
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Retention Policies table - defines how long different types of data should be kept
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'audit_logs', 'leave_requests', 'notifications', etc.
  retention_period_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT false,
  archive_before_delete BOOLEAN DEFAULT true,
  policy_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL, -- references auth.users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, data_type)
);

-- GDPR/Privacy Requests table - tracks data subject requests
CREATE TABLE IF NOT EXISTS privacy_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'portability', 'rectification', 'erasure', 'restriction')),
  subject_email TEXT NOT NULL,
  subject_user_id UUID, -- references auth.users if the subject is a user
  requested_by UUID NOT NULL, -- references auth.users (could be admin or the subject)
  request_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  status_reason TEXT,
  due_date DATE, -- legal deadline for completion
  completed_at TIMESTAMPTZ,
  response_file_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Events table - tracks system-level events for monitoring
CREATE TABLE IF NOT EXISTS system_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'password_change', 'permission_change', etc.
  severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  user_id UUID, -- references auth.users
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'web' -- 'web', 'api', 'mobile', 'system'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp ON audit_logs(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_org ON compliance_reports(organization_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_org ON privacy_requests(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON privacy_requests(status);
CREATE INDEX IF NOT EXISTS idx_system_events_org_timestamp ON system_events(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_events_user ON system_events(user_id);
CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);

-- Row Level Security (RLS) policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view organization audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = audit_logs.organization_id
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Allow system to insert audit logs

-- RLS Policies for compliance_reports
CREATE POLICY "Admins can manage compliance reports" ON compliance_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = compliance_reports.organization_id
    )
  );

-- RLS Policies for data_retention_policies
CREATE POLICY "Admins can manage retention policies" ON data_retention_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = data_retention_policies.organization_id
    )
  );

-- RLS Policies for privacy_requests
CREATE POLICY "Admins can manage privacy requests" ON privacy_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = privacy_requests.organization_id
    )
  );

-- Users can view their own privacy requests
CREATE POLICY "Users can view own privacy requests" ON privacy_requests
  FOR SELECT USING (
    subject_user_id = auth.uid() OR requested_by = auth.uid()
  );

-- RLS Policies for system_events
CREATE POLICY "Admins can view organization system events" ON system_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND organization_id = system_events.organization_id
    )
  );

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_organization_id UUID,
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    old_values,
    new_values,
    metadata
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_entity_type,
    p_entity_id,
    p_action,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Function to log system events
CREATE OR REPLACE FUNCTION log_system_event(
  p_organization_id UUID,
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'info',
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}',
  p_source TEXT DEFAULT 'web'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO system_events (
    organization_id,
    event_type,
    severity,
    user_id,
    ip_address,
    user_agent,
    event_data,
    source
  ) VALUES (
    p_organization_id,
    p_event_type,
    p_severity,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_event_data,
    p_source
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Function to generate audit trail report
CREATE OR REPLACE FUNCTION generate_audit_trail_report(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMPTZ,
  user_email TEXT,
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  changes TEXT,
  ip_address TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.timestamp,
    COALESCE(u.email, 'System') as user_email,
    al.entity_type,
    al.entity_id,
    al.action,
    CASE 
      WHEN al.old_values IS NOT NULL AND al.new_values IS NOT NULL THEN
        'Updated: ' || al.old_values::text || ' → ' || al.new_values::text
      WHEN al.new_values IS NOT NULL THEN
        'Created: ' || al.new_values::text
      WHEN al.old_values IS NOT NULL THEN
        'Deleted: ' || al.old_values::text
      ELSE
        al.action
    END as changes,
    COALESCE(al.metadata->>'ip_address', 'Unknown') as ip_address
  FROM audit_logs al
  LEFT JOIN auth.users u ON u.id = al.user_id
  WHERE al.organization_id = p_organization_id
    AND (p_start_date IS NULL OR al.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR al.timestamp <= p_end_date)
    AND (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
  ORDER BY al.timestamp DESC;
END;
$$;

-- Function to clean up old audit logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  policy_record RECORD;
BEGIN
  -- Loop through active retention policies
  FOR policy_record IN 
    SELECT organization_id, retention_period_days 
    FROM data_retention_policies 
    WHERE data_type = 'audit_logs' AND is_active = true AND auto_delete = true
  LOOP
    DELETE FROM audit_logs 
    WHERE organization_id = policy_record.organization_id 
      AND timestamp < NOW() - (policy_record.retention_period_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;

-- Create default retention policies for new organizations
CREATE OR REPLACE FUNCTION create_default_retention_policies(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default retention policies if they don't exist
  INSERT INTO data_retention_policies (organization_id, data_type, retention_period_days, auto_delete, policy_name, created_by)
  VALUES 
    (org_id, 'audit_logs', 2555, false, 'Audit Logs - 7 years', (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
    (org_id, 'leave_requests', 2555, false, 'Leave Requests - 7 years', (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
    (org_id, 'notifications', 365, true, 'Notifications - 1 year', (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
    (org_id, 'system_events', 90, true, 'System Events - 90 days', (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1))
  ON CONFLICT (organization_id, data_type) DO NOTHING;
END;
$$;

-- Trigger to create audit logs for leave request changes
CREATE OR REPLACE FUNCTION trigger_audit_leave_requests()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization_id from user profile
  SELECT organization_id INTO org_id
  FROM user_profiles
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      org_id,
      NEW.user_id,
      'leave_request',
      NEW.id,
      'create',
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_audit_event(
      org_id,
      NEW.user_id,
      'leave_request',
      NEW.id,
      'update',
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event(
      org_id,
      OLD.user_id,
      'leave_request',
      OLD.id,
      'delete',
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for leave requests audit logging
DROP TRIGGER IF EXISTS audit_leave_requests_trigger ON leave_requests;
CREATE TRIGGER audit_leave_requests_trigger
  AFTER INSERT OR UPDATE OR DELETE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_leave_requests();

-- Trigger for organizations to create default retention policies
CREATE OR REPLACE FUNCTION trigger_create_default_retention_policies()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM create_default_retention_policies(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_retention_policies_trigger ON organizations;
CREATE TRIGGER create_retention_policies_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_retention_policies();