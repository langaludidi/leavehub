-- Organization Onboarding Wizard with Compliance Gating
-- Multi-step onboarding process with compliance requirements and gating

-- Table to track onboarding progress and compliance requirements
CREATE TABLE IF NOT EXISTS organization_onboarding (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL DEFAULT 8,
  
  -- Step completion tracking
  step_1_basic_info BOOLEAN NOT NULL DEFAULT false,
  step_1_completed_at TIMESTAMP WITH TIME ZONE,
  
  step_2_compliance_selection BOOLEAN NOT NULL DEFAULT false,
  step_2_completed_at TIMESTAMP WITH TIME ZONE,
  
  step_3_leave_types_setup BOOLEAN NOT NULL DEFAULT false,
  step_3_completed_at TIMESTAMP WITH TIME ZONE,
  
  step_4_employee_import BOOLEAN NOT NULL DEFAULT false,
  step_4_completed_at TIMESTAMP WITH TIME ZONE,
  
  step_5_approval_workflow BOOLEAN NOT NULL DEFAULT false,
  step_5_completed_at TIMESTAMP WITH TIME ZONE,
  
  step_6_document_requirements BOOLEAN NOT NULL DEFAULT false,
  step_6_completed_at TIMESTAMP WITH TIME ZONE,
  
  step_7_integrations BOOLEAN NOT NULL DEFAULT false,
  step_7_completed_at TIMESTAMP WITH TIME ZONE,
  
  step_8_trial_activation BOOLEAN NOT NULL DEFAULT false,
  step_8_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Compliance framework selection
  compliance_framework TEXT NOT NULL DEFAULT 'south_africa_bcea' CHECK (
    compliance_framework IN ('south_africa_bcea', 'uk_employment_rights', 'us_fmla', 'custom')
  ),
  
  -- Configuration data for each step
  basic_info_data JSONB DEFAULT '{}'::jsonb,
  compliance_data JSONB DEFAULT '{}'::jsonb,
  leave_types_data JSONB DEFAULT '{}'::jsonb,
  employee_data JSONB DEFAULT '{}'::jsonb,
  approval_data JSONB DEFAULT '{}'::jsonb,
  document_data JSONB DEFAULT '{}'::jsonb,
  integrations_data JSONB DEFAULT '{}'::jsonb,
  trial_data JSONB DEFAULT '{}'::jsonb,
  
  -- Validation and gating
  compliance_validated BOOLEAN NOT NULL DEFAULT false,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  blocked_reasons JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_onboarding_org_id ON organization_onboarding(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_onboarding_current_step ON organization_onboarding(current_step);
CREATE INDEX IF NOT EXISTS idx_organization_onboarding_completed ON organization_onboarding(completed_at) WHERE completed_at IS NOT NULL;

-- Table for onboarding step templates and requirements
CREATE TABLE IF NOT EXISTS onboarding_step_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT NOT NULL,
  compliance_framework TEXT NOT NULL,
  
  -- Requirements and validation rules
  required_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  gating_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Configuration templates
  field_templates JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Step metadata
  estimated_duration_minutes INTEGER DEFAULT 10,
  is_required BOOLEAN NOT NULL DEFAULT true,
  can_skip BOOLEAN NOT NULL DEFAULT false,
  requires_admin_approval BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(step_number, compliance_framework)
);

-- Insert South African BCEA onboarding templates
INSERT INTO onboarding_step_templates (
  step_number, step_name, step_description, compliance_framework,
  required_fields, validation_rules, gating_conditions, field_templates,
  estimated_duration_minutes, is_required, can_skip
) VALUES 
-- Step 1: Basic Organization Information
(1, 'Basic Information', 'Configure basic organization details and contact information', 'south_africa_bcea',
 '["organization_name", "primary_contact_email", "phone_number", "business_address", "industry", "company_registration_number"]'::jsonb,
 '[{"field": "organization_name", "rule": "required", "message": "Organization name is required"}, {"field": "primary_contact_email", "rule": "email", "message": "Valid email address required"}, {"field": "company_registration_number", "rule": "pattern", "pattern": "^[0-9]{4}/[0-9]{6}/[0-9]{2}$", "message": "Valid SA company registration number required (YYYY/XXXXXX/XX)"}]'::jsonb,
 '[{"type": "required_fields", "message": "All basic information must be completed"}]'::jsonb,
 '{"organization_name": {"type": "text", "label": "Organization Name", "placeholder": "Enter your organization name"}, "primary_contact_email": {"type": "email", "label": "Primary Contact Email"}, "phone_number": {"type": "tel", "label": "Phone Number", "placeholder": "+27 XX XXX XXXX"}, "business_address": {"type": "textarea", "label": "Business Address"}, "industry": {"type": "select", "label": "Industry", "options": ["Technology", "Manufacturing", "Retail", "Healthcare", "Education", "Finance", "Other"]}, "company_registration_number": {"type": "text", "label": "Company Registration Number", "placeholder": "YYYY/XXXXXX/XX"}}'::jsonb,
 15, true, false),

-- Step 2: Compliance Framework Selection
(2, 'Compliance Selection', 'Select and configure compliance framework (BCEA requirements)', 'south_africa_bcea',
 '["compliance_confirmation", "bcea_compliance_level", "union_agreements", "sectoral_determinations"]'::jsonb,
 '[{"field": "compliance_confirmation", "rule": "required", "message": "BCEA compliance confirmation required"}, {"field": "bcea_compliance_level", "rule": "required", "message": "BCEA compliance level selection required"}]'::jsonb,
 '[{"type": "compliance_acknowledgment", "message": "BCEA compliance framework must be acknowledged"}]'::jsonb,
 '{"compliance_confirmation": {"type": "checkbox", "label": "I confirm this organization will comply with the Basic Conditions of Employment Act (BCEA)"}, "bcea_compliance_level": {"type": "select", "label": "BCEA Compliance Level", "options": ["Standard BCEA", "Enhanced (with union agreements)", "Sectoral determination"]}, "union_agreements": {"type": "textarea", "label": "Union Agreements (if applicable)", "optional": true}, "sectoral_determinations": {"type": "select", "label": "Sectoral Determination", "options": ["None", "Hospitality", "Retail", "Security", "Other"], "optional": true}}'::jsonb,
 10, true, false),

-- Step 3: Leave Types Configuration
(3, 'Leave Types Setup', 'Configure BCEA-compliant leave types and policies', 'south_africa_bcea',
 '["leave_types_confirmed", "custom_leave_types"]'::jsonb,
 '[{"field": "leave_types_confirmed", "rule": "required", "message": "Leave types configuration must be confirmed"}]'::jsonb,
 '[{"type": "leave_types_setup", "message": "Standard BCEA leave types must be configured"}]'::jsonb,
 '{"leave_types_confirmed": {"type": "checkbox", "label": "Standard BCEA leave types configured (Annual, Sick, Maternity, etc.)"}, "custom_leave_types": {"type": "textarea", "label": "Additional Custom Leave Types", "placeholder": "List any additional leave types your organization requires", "optional": true}}'::jsonb,
 20, true, false),

-- Step 4: Employee Import
(4, 'Employee Import', 'Import existing employees and set up user accounts', 'south_africa_bcea',
 '["import_method", "employee_count_estimate"]'::jsonb,
 '[{"field": "import_method", "rule": "required", "message": "Employee import method must be selected"}, {"field": "employee_count_estimate", "rule": "number_min", "min": 1, "message": "At least 1 employee required"}]'::jsonb,
 '[{"type": "employee_import", "message": "At least one employee must be imported or created"}]'::jsonb,
 '{"import_method": {"type": "select", "label": "Import Method", "options": ["CSV Upload", "Manual Entry", "Skip for now"]}, "employee_count_estimate": {"type": "number", "label": "Estimated Employee Count", "min": 1}, "csv_file": {"type": "file", "label": "Employee CSV File", "accept": ".csv", "conditional": "import_method=CSV Upload"}}'::jsonb,
 25, true, false),

-- Step 5: Approval Workflow
(5, 'Approval Workflow', 'Configure leave request approval hierarchy and escalation', 'south_africa_bcea',
 '["approval_structure", "escalation_enabled"]'::jsonb,
 '[{"field": "approval_structure", "rule": "required", "message": "Approval structure must be defined"}]'::jsonb,
 '[{"type": "approval_workflow", "message": "Basic approval workflow must be configured"}]'::jsonb,
 '{"approval_structure": {"type": "select", "label": "Approval Structure", "options": ["Single Manager", "Department Head + HR", "Custom Hierarchy"]}, "escalation_enabled": {"type": "checkbox", "label": "Enable 72-hour escalation (recommended)"}, "custom_escalation_hours": {"type": "number", "label": "Custom Escalation Hours", "conditional": "escalation_enabled=true", "default": 72, "min": 4, "max": 168}}'::jsonb,
 15, true, false),

-- Step 6: Document Requirements
(6, 'Document Requirements', 'Configure document requirements for different leave types', 'south_africa_bcea',
 '["medical_certificates", "document_storage"]'::jsonb,
 '[{"field": "document_storage", "rule": "required", "message": "Document storage configuration required"}]'::jsonb,
 '[{"type": "document_config", "message": "Document requirements must be configured"}]'::jsonb,
 '{"medical_certificates": {"type": "checkbox", "label": "Require medical certificates for sick leave >2 days (BCEA compliant)"}, "document_storage": {"type": "select", "label": "Document Storage", "options": ["Supabase Storage (recommended)", "Local storage only"]}, "retention_period": {"type": "select", "label": "Document Retention Period", "options": ["3 years", "5 years", "7 years"], "default": "5 years"}}'::jsonb,
 10, true, false),

-- Step 7: Integrations
(7, 'System Integrations', 'Configure optional integrations (payroll, HR systems, etc.)', 'south_africa_bcea',
 '[]'::jsonb,
 '[]'::jsonb,
 '[]'::jsonb,
 '{"payroll_integration": {"type": "select", "label": "Payroll System Integration", "options": ["None", "Sage", "Pastel", "VIP", "Other"], "optional": true}, "email_notifications": {"type": "checkbox", "label": "Enable email notifications", "default": true}, "calendar_sync": {"type": "checkbox", "label": "Enable calendar synchronization", "optional": true}}'::jsonb,
 15, false, true),

-- Step 8: Trial Activation
(8, 'Trial Activation', 'Activate 14-day trial and complete onboarding', 'south_africa_bcea',
 '["terms_accepted", "trial_activation"]'::jsonb,
 '[{"field": "terms_accepted", "rule": "required", "message": "Terms and conditions must be accepted"}, {"field": "trial_activation", "rule": "required", "message": "Trial activation confirmation required"}]'::jsonb,
 '[{"type": "trial_activation", "message": "Trial must be activated to complete onboarding"}]'::jsonb,
 '{"terms_accepted": {"type": "checkbox", "label": "I accept the LeaveHub Terms of Service and Privacy Policy"}, "trial_activation": {"type": "checkbox", "label": "Activate 14-day free trial"}, "marketing_consent": {"type": "checkbox", "label": "I consent to receiving product updates and marketing communications", "optional": true}}'::jsonb,
 5, true, false);

-- Function to initialize onboarding for a new organization
CREATE OR REPLACE FUNCTION initialize_organization_onboarding(
  org_id UUID,
  framework TEXT DEFAULT 'south_africa_bcea'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  onboarding_id UUID;
BEGIN
  -- Create onboarding record
  INSERT INTO organization_onboarding (
    organization_id,
    compliance_framework,
    current_step,
    total_steps
  ) VALUES (
    org_id,
    framework,
    1,
    (SELECT COUNT(*) FROM onboarding_step_templates WHERE compliance_framework = framework)
  )
  RETURNING id INTO onboarding_id;
  
  -- Log the initialization
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    new_values,
    metadata
  ) VALUES (
    org_id,
    auth.uid(),
    'organization_onboarding',
    onboarding_id,
    'initialize',
    jsonb_build_object('compliance_framework', framework, 'step_count', (SELECT COUNT(*) FROM onboarding_step_templates WHERE compliance_framework = framework)),
    jsonb_build_object('auto_initialize', true)
  );
  
  RETURN onboarding_id;
END;
$$;

-- Function to complete an onboarding step
CREATE OR REPLACE FUNCTION complete_onboarding_step(
  org_id UUID,
  step_num INTEGER,
  step_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  onboarding_record RECORD;
  template_record RECORD;
  validation_errors JSONB := '[]'::jsonb;
  is_valid BOOLEAN := true;
  next_step INTEGER;
BEGIN
  -- Get current onboarding record
  SELECT * INTO onboarding_record
  FROM organization_onboarding
  WHERE organization_id = org_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No onboarding record found for organization %', org_id;
  END IF;
  
  -- Get step template for validation
  SELECT * INTO template_record
  FROM onboarding_step_templates
  WHERE step_number = step_num 
    AND compliance_framework = onboarding_record.compliance_framework;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No template found for step % in framework %', step_num, onboarding_record.compliance_framework;
  END IF;
  
  -- Validate step data (simplified validation - in production, implement comprehensive validation)
  -- This would validate against template_record.validation_rules
  
  -- Update the onboarding record based on step number
  CASE step_num
    WHEN 1 THEN
      UPDATE organization_onboarding SET
        step_1_basic_info = true,
        step_1_completed_at = NOW(),
        basic_info_data = step_data,
        updated_at = NOW()
      WHERE organization_id = org_id;
      
    WHEN 2 THEN
      UPDATE organization_onboarding SET
        step_2_compliance_selection = true,
        step_2_completed_at = NOW(),
        compliance_data = step_data,
        compliance_validated = COALESCE((step_data->>'compliance_confirmation')::boolean, false),
        updated_at = NOW()
      WHERE organization_id = org_id;
      
    WHEN 3 THEN
      UPDATE organization_onboarding SET
        step_3_leave_types_setup = true,
        step_3_completed_at = NOW(),
        leave_types_data = step_data,
        updated_at = NOW()
      WHERE organization_id = org_id;
      -- Also trigger leave types setup
      PERFORM setup_sa_leave_system_with_escalation(org_id);
      
    WHEN 4 THEN
      UPDATE organization_onboarding SET
        step_4_employee_import = true,
        step_4_completed_at = NOW(),
        employee_data = step_data,
        updated_at = NOW()
      WHERE organization_id = org_id;
      
    WHEN 5 THEN
      UPDATE organization_onboarding SET
        step_5_approval_workflow = true,
        step_5_completed_at = NOW(),
        approval_data = step_data,
        updated_at = NOW()
      WHERE organization_id = org_id;
      
    WHEN 6 THEN
      UPDATE organization_onboarding SET
        step_6_document_requirements = true,
        step_6_completed_at = NOW(),
        document_data = step_data,
        updated_at = NOW()
      WHERE organization_id = org_id;
      
    WHEN 7 THEN
      UPDATE organization_onboarding SET
        step_7_integrations = true,
        step_7_completed_at = NOW(),
        integrations_data = step_data,
        updated_at = NOW()
      WHERE organization_id = org_id;
      
    WHEN 8 THEN
      UPDATE organization_onboarding SET
        step_8_trial_activation = true,
        step_8_completed_at = NOW(),
        trial_data = step_data,
        updated_at = NOW()
      WHERE organization_id = org_id;
      
      -- Activate trial
      PERFORM start_organization_trial(org_id);
      
      -- Mark onboarding as complete
      UPDATE organization_onboarding SET
        completed_at = NOW(),
        current_step = step_num + 1
      WHERE organization_id = org_id;
      
  END CASE;
  
  -- Advance to next step (unless it's the last step)
  IF step_num < onboarding_record.total_steps THEN
    next_step := step_num + 1;
    UPDATE organization_onboarding SET
      current_step = next_step
    WHERE organization_id = org_id;
  END IF;
  
  -- Log step completion
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    new_values,
    metadata
  ) VALUES (
    org_id,
    auth.uid(),
    'organization_onboarding',
    onboarding_record.id,
    'complete_step',
    jsonb_build_object('step_number', step_num, 'step_data', step_data),
    jsonb_build_object('next_step', next_step, 'completion_time', NOW())
  );
  
  RETURN true;
END;
$$;

-- Function to get onboarding progress
CREATE OR REPLACE FUNCTION get_onboarding_progress(org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  onboarding_record RECORD;
  completed_steps INTEGER;
BEGIN
  SELECT * INTO onboarding_record
  FROM organization_onboarding
  WHERE organization_id = org_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No onboarding record found');
  END IF;
  
  -- Count completed steps
  completed_steps := (
    CASE WHEN onboarding_record.step_1_basic_info THEN 1 ELSE 0 END +
    CASE WHEN onboarding_record.step_2_compliance_selection THEN 1 ELSE 0 END +
    CASE WHEN onboarding_record.step_3_leave_types_setup THEN 1 ELSE 0 END +
    CASE WHEN onboarding_record.step_4_employee_import THEN 1 ELSE 0 END +
    CASE WHEN onboarding_record.step_5_approval_workflow THEN 1 ELSE 0 END +
    CASE WHEN onboarding_record.step_6_document_requirements THEN 1 ELSE 0 END +
    CASE WHEN onboarding_record.step_7_integrations THEN 1 ELSE 0 END +
    CASE WHEN onboarding_record.step_8_trial_activation THEN 1 ELSE 0 END
  );
  
  result := jsonb_build_object(
    'id', onboarding_record.id,
    'organization_id', org_id,
    'current_step', onboarding_record.current_step,
    'total_steps', onboarding_record.total_steps,
    'completed_steps', completed_steps,
    'progress_percentage', ROUND((completed_steps::decimal / onboarding_record.total_steps::decimal) * 100, 1),
    'is_completed', onboarding_record.completed_at IS NOT NULL,
    'started_at', onboarding_record.started_at,
    'completed_at', onboarding_record.completed_at,
    'compliance_framework', onboarding_record.compliance_framework,
    'compliance_validated', onboarding_record.compliance_validated,
    'validation_errors', onboarding_record.validation_errors,
    'blocked_reasons', onboarding_record.blocked_reasons,
    'step_status', jsonb_build_object(
      'step_1', jsonb_build_object('completed', onboarding_record.step_1_basic_info, 'completed_at', onboarding_record.step_1_completed_at, 'data', onboarding_record.basic_info_data),
      'step_2', jsonb_build_object('completed', onboarding_record.step_2_compliance_selection, 'completed_at', onboarding_record.step_2_completed_at, 'data', onboarding_record.compliance_data),
      'step_3', jsonb_build_object('completed', onboarding_record.step_3_leave_types_setup, 'completed_at', onboarding_record.step_3_completed_at, 'data', onboarding_record.leave_types_data),
      'step_4', jsonb_build_object('completed', onboarding_record.step_4_employee_import, 'completed_at', onboarding_record.step_4_completed_at, 'data', onboarding_record.employee_data),
      'step_5', jsonb_build_object('completed', onboarding_record.step_5_approval_workflow, 'completed_at', onboarding_record.step_5_completed_at, 'data', onboarding_record.approval_data),
      'step_6', jsonb_build_object('completed', onboarding_record.step_6_document_requirements, 'completed_at', onboarding_record.step_6_completed_at, 'data', onboarding_record.document_data),
      'step_7', jsonb_build_object('completed', onboarding_record.step_7_integrations, 'completed_at', onboarding_record.step_7_completed_at, 'data', onboarding_record.integrations_data),
      'step_8', jsonb_build_object('completed', onboarding_record.step_8_trial_activation, 'completed_at', onboarding_record.step_8_completed_at, 'data', onboarding_record.trial_data)
    )
  );
  
  RETURN result;
END;
$$;

-- Automatically initialize onboarding when an organization is created
CREATE OR REPLACE FUNCTION trigger_initialize_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Initialize onboarding with South African BCEA compliance by default
  PERFORM initialize_organization_onboarding(NEW.id, 'south_africa_bcea');
  RETURN NEW;
END;
$$;

-- Update the existing organization trigger
DROP TRIGGER IF EXISTS create_sa_leave_system_with_escalation_trigger ON organizations;
CREATE OR REPLACE FUNCTION trigger_create_sa_organization_setup()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Initialize onboarding process (this will handle leave system setup in step 3)
  PERFORM initialize_organization_onboarding(NEW.id, 'south_africa_bcea');
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_sa_organization_setup_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_sa_organization_setup();

-- RLS Policies
ALTER TABLE organization_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_step_templates ENABLE ROW LEVEL SECURITY;

-- Onboarding access - users can view their org's onboarding
CREATE POLICY onboarding_organization_access ON organization_onboarding
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Step templates are readable by all authenticated users
CREATE POLICY onboarding_templates_read ON onboarding_step_templates
  FOR SELECT TO authenticated USING (true);

-- Create a view for easy onboarding monitoring
CREATE OR REPLACE VIEW onboarding_dashboard AS
SELECT 
  oo.id,
  oo.organization_id,
  o.name as organization_name,
  oo.current_step,
  oo.total_steps,
  oo.compliance_framework,
  oo.started_at,
  oo.completed_at,
  CASE WHEN oo.completed_at IS NOT NULL THEN 'completed'
       WHEN oo.current_step > 1 THEN 'in_progress'
       ELSE 'not_started'
  END as status,
  (oo.step_1_basic_info::integer + 
   oo.step_2_compliance_selection::integer + 
   oo.step_3_leave_types_setup::integer + 
   oo.step_4_employee_import::integer + 
   oo.step_5_approval_workflow::integer + 
   oo.step_6_document_requirements::integer + 
   oo.step_7_integrations::integer + 
   oo.step_8_trial_activation::integer) as completed_steps,
  ROUND(((oo.step_1_basic_info::integer + 
          oo.step_2_compliance_selection::integer + 
          oo.step_3_leave_types_setup::integer + 
          oo.step_4_employee_import::integer + 
          oo.step_5_approval_workflow::integer + 
          oo.step_6_document_requirements::integer + 
          oo.step_7_integrations::integer + 
          oo.step_8_trial_activation::integer)::decimal / oo.total_steps::decimal) * 100, 1) as progress_percentage,
  oo.compliance_validated,
  oo.updated_at
FROM organization_onboarding oo
JOIN organizations o ON o.id = oo.organization_id
ORDER BY oo.updated_at DESC;

GRANT SELECT ON onboarding_dashboard TO authenticated;