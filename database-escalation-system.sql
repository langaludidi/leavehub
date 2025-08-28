-- 72-Hour Escalation Automation System
-- Automatically escalates leave requests that haven't been approved within configured timeframe

-- Table to store escalation rules per organization
CREATE TABLE IF NOT EXISTS escalation_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  leave_type_code TEXT, -- NULL means applies to all leave types
  escalation_hours INTEGER NOT NULL DEFAULT 72, -- Hours before escalation
  escalation_levels JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of escalation levels
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_escalation_hours CHECK (escalation_hours > 0 AND escalation_hours <= 168), -- Max 1 week
  CONSTRAINT valid_escalation_levels CHECK (jsonb_array_length(escalation_levels) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_escalation_rules_org_active ON escalation_rules(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_leave_type ON escalation_rules(leave_type_code) WHERE leave_type_code IS NOT NULL;

-- Table to track escalation events
CREATE TABLE IF NOT EXISTS request_escalations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  escalation_rule_id UUID NOT NULL REFERENCES escalation_rules(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL, -- 1, 2, 3, etc.
  escalated_to TEXT NOT NULL, -- email or user_id of person escalated to
  escalated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  escalation_reason TEXT NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  UNIQUE(leave_request_id, escalation_level) -- Prevent duplicate escalations
);

-- Indexes for escalation tracking
CREATE INDEX IF NOT EXISTS idx_request_escalations_org ON request_escalations(organization_id);
CREATE INDEX IF NOT EXISTS idx_request_escalations_request ON request_escalations(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_request_escalations_unresolved ON request_escalations(resolved_at) WHERE resolved_at IS NULL;

-- Default South African escalation rule for new organizations
CREATE OR REPLACE FUNCTION create_default_sa_escalation_rules(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Default 72-hour escalation rule for all leave types
  INSERT INTO escalation_rules (
    organization_id,
    leave_type_code,
    escalation_hours,
    escalation_levels,
    is_active
  ) VALUES (
    org_id,
    NULL, -- Applies to all leave types
    72, -- 72 hours as per MVP requirement
    '[
      {
        "level": 1,
        "escalate_to": "manager",
        "notification_template": "escalation_level_1",
        "description": "Escalate to direct manager"
      },
      {
        "level": 2,
        "escalate_to": "hr",
        "notification_template": "escalation_level_2", 
        "description": "Escalate to HR department"
      },
      {
        "level": 3,
        "escalate_to": "admin",
        "notification_template": "escalation_level_3",
        "description": "Final escalation to system administrator"
      }
    ]'::jsonb,
    true
  );

  -- Sick leave specific rule - faster escalation for urgent medical situations
  INSERT INTO escalation_rules (
    organization_id,
    leave_type_code,
    escalation_hours,
    escalation_levels,
    is_active
  ) VALUES (
    org_id,
    'sick',
    24, -- 24 hours for sick leave
    '[
      {
        "level": 1,
        "escalate_to": "manager",
        "notification_template": "sick_escalation_level_1",
        "description": "Urgent: Sick leave pending approval"
      },
      {
        "level": 2,
        "escalate_to": "hr",
        "notification_template": "sick_escalation_level_2",
        "description": "Critical: Sick leave requires immediate attention"
      }
    ]'::jsonb,
    true
  );

  -- Family responsibility leave - immediate escalation due to emergency nature
  INSERT INTO escalation_rules (
    organization_id,
    leave_type_code,
    escalation_hours,
    escalation_levels,
    is_active
  ) VALUES (
    org_id,
    'family_responsibility',
    4, -- 4 hours for family emergencies
    '[
      {
        "level": 1,
        "escalate_to": "manager",
        "notification_template": "family_escalation_level_1",
        "description": "Emergency: Family responsibility leave pending"
      },
      {
        "level": 2,
        "escalate_to": "hr",
        "notification_template": "family_escalation_level_2",
        "description": "Urgent: Family emergency requires approval"
      }
    ]'::jsonb,
    true
  );

END;
$$;

-- Function to check and trigger escalations
CREATE OR REPLACE FUNCTION process_leave_request_escalations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  escalation_record RECORD;
  escalation_count INTEGER := 0;
  escalation_config JSONB;
  current_level INTEGER;
  escalation_email TEXT;
  escalation_data JSONB;
BEGIN
  -- Find leave requests that need escalation
  FOR escalation_record IN
    SELECT DISTINCT
      lr.id as request_id,
      lr.organization_id,
      lr.user_id,
      lr.start_date,
      lr.end_date,
      lr.leave_type,
      lr.reason,
      lr.created_at,
      er.id as rule_id,
      er.escalation_hours,
      er.escalation_levels,
      up.email as employee_email,
      lt.name as leave_type_name,
      COALESCE(MAX(re.escalation_level), 0) as current_max_level
    FROM leave_requests lr
    JOIN escalation_rules er ON (
      er.organization_id = lr.organization_id
      AND er.is_active = true
      AND (er.leave_type_code IS NULL OR er.leave_type_code = lr.leave_type)
    )
    JOIN user_profiles up ON up.user_id = lr.user_id
    LEFT JOIN leave_types lt ON (lt.organization_id = lr.organization_id AND lt.code = lr.leave_type)
    LEFT JOIN request_escalations re ON (re.leave_request_id = lr.id AND re.resolved_at IS NULL)
    WHERE 
      lr.status = 'pending'
      AND lr.created_at <= NOW() - INTERVAL '1 hour' * er.escalation_hours
    GROUP BY lr.id, lr.organization_id, lr.user_id, lr.start_date, lr.end_date, 
             lr.leave_type, lr.reason, lr.created_at, er.id, er.escalation_hours, 
             er.escalation_levels, up.email, lt.name
    HAVING COALESCE(MAX(re.escalation_level), 0) < jsonb_array_length(er.escalation_levels)
  LOOP
    -- Determine next escalation level
    current_level := escalation_record.current_max_level + 1;
    
    -- Get escalation configuration for this level
    escalation_config := escalation_record.escalation_levels -> (current_level - 1);
    
    IF escalation_config IS NOT NULL THEN
      -- Determine escalation recipient
      CASE escalation_config->>'escalate_to'
        WHEN 'manager' THEN
          -- Get manager's email (simplified - in real system would look up manager hierarchy)
          escalation_email := 'manager@company.com';
        WHEN 'hr' THEN
          escalation_email := 'hr@company.com';
        WHEN 'admin' THEN
          escalation_email := 'admin@company.com';
        ELSE
          escalation_email := escalation_config->>'escalate_to';
      END CASE;

      -- Create escalation record
      INSERT INTO request_escalations (
        organization_id,
        leave_request_id,
        escalation_rule_id,
        escalation_level,
        escalated_to,
        escalation_reason,
        escalated_at
      ) VALUES (
        escalation_record.organization_id,
        escalation_record.request_id,
        escalation_record.rule_id,
        current_level,
        escalation_email,
        format('Leave request pending approval for %s hours - Level %s escalation triggered',
               escalation_record.escalation_hours, current_level),
        NOW()
      );

      -- Prepare notification data
      escalation_data := jsonb_build_object(
        'request_id', escalation_record.request_id,
        'employee_email', escalation_record.employee_email,
        'leave_type', escalation_record.leave_type_name,
        'start_date', escalation_record.start_date,
        'end_date', escalation_record.end_date,
        'reason', escalation_record.reason,
        'escalation_level', current_level,
        'hours_pending', EXTRACT(EPOCH FROM (NOW() - escalation_record.created_at)) / 3600,
        'escalation_description', escalation_config->>'description'
      );

      -- Send escalation notification (using Supabase Edge Function)
      PERFORM supabase.http((
        'POST',
        supabase.vault.get_secret('site_url') || '/functions/v1/escalation-notify',
        ARRAY[supabase.http_header('Content-Type', 'application/json')],
        '{
          "to": "' || escalation_email || '",
          "template": "' || (escalation_config->>'notification_template') || '",
          "data": ' || escalation_data::text || '
        }'
      ));

      -- Update leave request with escalation flag
      UPDATE leave_requests 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('escalated', true, 'escalation_level', current_level)
      WHERE id = escalation_record.request_id;

      escalation_count := escalation_count + 1;
    END IF;
  END LOOP;

  -- Log escalation processing
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    action,
    new_values,
    metadata
  ) VALUES (
    NULL, -- System action
    NULL,
    'escalation_processing',
    'process',
    jsonb_build_object('escalations_processed', escalation_count),
    jsonb_build_object('processed_at', NOW(), 'system', 'escalation_automation')
  );

  RETURN escalation_count;
END;
$$;

-- Function to resolve escalation when request is approved/rejected
CREATE OR REPLACE FUNCTION resolve_request_escalations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Resolve all open escalations for this request
  UPDATE request_escalations
  SET 
    resolved_at = NOW(),
    resolved_by = NEW.approved_by,
    resolution_notes = format('Request %s by %s', NEW.status, 
                             CASE WHEN NEW.approved_by IS NOT NULL 
                                  THEN (SELECT email FROM auth.users WHERE id = NEW.approved_by)
                                  ELSE 'system'
                             END)
  WHERE 
    leave_request_id = NEW.id
    AND resolved_at IS NULL;

  RETURN NEW;
END;
$$;

-- Trigger to resolve escalations when leave request status changes
DROP TRIGGER IF EXISTS resolve_escalations_on_status_change ON leave_requests;
CREATE TRIGGER resolve_escalations_on_status_change
  AFTER UPDATE OF status ON leave_requests
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected'))
  EXECUTE FUNCTION resolve_request_escalations();

-- Update the organization setup to include escalation rules
CREATE OR REPLACE FUNCTION setup_sa_leave_system_with_escalation(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create SA-compliant leave types
  PERFORM create_sa_leave_types(org_id);
  
  -- Create corresponding accrual policies
  PERFORM create_sa_accrual_policies(org_id);
  
  -- Create document requirements
  PERFORM create_sa_document_requirements(org_id);
  
  -- Create default escalation rules
  PERFORM create_default_sa_escalation_rules(org_id);
  
  -- Log the setup
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    action,
    new_values,
    metadata
  ) VALUES (
    org_id,
    auth.uid(),
    'leave_system_setup',
    'create',
    jsonb_build_object('system_type', 'south_africa_bcea_with_escalation'),
    jsonb_build_object(
      'setup_date', NOW(), 
      'compliance_framework', 'BCEA',
      'escalation_enabled', true,
      'default_escalation_hours', 72
    )
  );
END;
$$;

-- Update the organization trigger to use the enhanced setup
DROP TRIGGER IF EXISTS create_sa_leave_system_trigger ON organizations;
CREATE OR REPLACE FUNCTION trigger_create_sa_leave_system_with_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set up South African leave system with escalation for new organizations
  PERFORM setup_sa_leave_system_with_escalation(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_sa_leave_system_with_escalation_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_sa_leave_system_with_escalation();

-- RLS Policies for escalation tables
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_escalations ENABLE ROW LEVEL SECURITY;

-- Users can view escalation rules for their organization
CREATE POLICY escalation_rules_select_policy ON escalation_rules
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can modify escalation rules
CREATE POLICY escalation_rules_modify_policy ON escalation_rules
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin')
    )
  );

-- Users can view escalations for their organization
CREATE POLICY request_escalations_select_policy ON request_escalations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Only system and admins can create escalation records
CREATE POLICY request_escalations_insert_policy ON request_escalations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin')
    )
  );

-- Admins can resolve escalations
CREATE POLICY request_escalations_update_policy ON request_escalations
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_admin', 'manager')
    )
  );

-- Create a view for easy escalation monitoring
CREATE OR REPLACE VIEW escalation_dashboard AS
SELECT 
  re.id,
  re.escalated_at,
  re.escalation_level,
  re.escalated_to,
  re.escalation_reason,
  re.resolved_at,
  lr.id as request_id,
  up.email as employee_email,
  lr.start_date,
  lr.end_date,
  lr.leave_type,
  lt.name as leave_type_name,
  lr.reason,
  lr.status as request_status,
  o.name as organization_name,
  EXTRACT(EPOCH FROM (COALESCE(re.resolved_at, NOW()) - re.escalated_at)) / 3600 as hours_escalated
FROM request_escalations re
JOIN leave_requests lr ON lr.id = re.leave_request_id
JOIN organizations o ON o.id = re.organization_id
JOIN user_profiles up ON up.user_id = lr.user_id
LEFT JOIN leave_types lt ON (lt.organization_id = lr.organization_id AND lt.code = lr.leave_type)
ORDER BY re.escalated_at DESC;

-- Grant access to the view
GRANT SELECT ON escalation_dashboard TO authenticated;