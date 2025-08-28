-- South African Leave Types (BCEA Compliant)
-- Create default leave types that comply with Basic Conditions of Employment Act

-- Function to create South African BCEA-compliant leave types
CREATE OR REPLACE FUNCTION create_sa_leave_types(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing leave types for clean setup
  DELETE FROM leave_types WHERE organization_id = org_id;
  
  -- Annual Leave (BCEA Section 20)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Annual Leave',
    'annual',
    'Annual vacation leave as per BCEA Section 20. Minimum 21 consecutive days or 15 working days per annual leave cycle.',
    '#10b981',
    '🏖️',
    true,
    true,
    null, -- No limit on consecutive days for annual leave
    21, -- 3 weeks advance notice recommended
    '[]'::jsonb,
    true,
    true, -- Can carry over (up to 6 months into next cycle per BCEA)
    NOW()
  );

  -- Sick Leave (BCEA Section 22)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Sick Leave',
    'sick',
    'Sick leave as per BCEA Section 22. During every sick leave cycle of 36 months, an employee is entitled to an amount of paid sick leave equal to the number of days the employee would normally work during a period of six weeks.',
    '#f59e0b',
    '🤒',
    true,
    false, -- Sick leave typically doesn''t require pre-approval
    null,
    0, -- No advance notice required for genuine illness
    '[]'::jsonb,
    true,
    false, -- Sick leave doesn''t carry over
    NOW()
  );

  -- Maternity Leave (BCEA Section 25)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Maternity Leave',
    'maternity',
    'Maternity leave as per BCEA Section 25. An employee is entitled to at least four consecutive months'' maternity leave.',
    '#ec4899',
    '👶',
    true,
    true,
    120, -- 4 months = ~120 days
    30, -- 30 days advance notice
    '[]'::jsonb,
    false, -- Not paid by employer (UIF may provide benefits)
    false,
    NOW()
  );

  -- Paternity Leave (BCEA Section 25A)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Paternity Leave',
    'paternity',
    'Paternity leave as per BCEA Section 25A. An employee is entitled to at least 10 consecutive days'' paternity leave.',
    '#8b5cf6',
    '👨‍👶',
    true,
    true,
    10,
    30, -- 30 days advance notice
    '[]'::jsonb,
    true, -- Paid paternity leave
    false,
    NOW()
  );

  -- Adoption Leave (BCEA Section 25B)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Adoption Leave',
    'adoption',
    'Adoption leave as per BCEA Section 25B. An employee who is an adoptive parent is entitled to adoption leave of up to 10 consecutive weeks.',
    '#06b6d4',
    '👪',
    true,
    true,
    70, -- 10 weeks = 70 days
    30, -- 30 days advance notice
    '[]'::jsonb,
    false, -- Not paid by employer
    false,
    NOW()
  );

  -- Family Responsibility Leave (BCEA Section 27)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Family Responsibility Leave',
    'family_responsibility',
    'Family responsibility leave as per BCEA Section 27. An employee is entitled to 3 days'' family responsibility leave during each leave cycle when the employee''s child is born, when the employee''s child is sick, or in the event of death of certain family members.',
    '#f97316',
    '👨‍👩‍👧‍👦',
    true,
    false, -- Emergency nature - no pre-approval required
    3, -- Maximum 3 days per cycle
    0, -- No advance notice required for emergencies
    '[]'::jsonb,
    true,
    false, -- Doesn''t carry over
    NOW()
  );

  -- Study Leave (Not mandated by BCEA but common practice)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Study Leave',
    'study',
    'Leave for educational purposes including examinations, course attendance, or thesis submission. Subject to employer approval and may be unpaid.',
    '#7c3aed',
    '📚',
    true,
    true, -- Always requires approval
    null,
    30, -- 30 days advance notice
    '[]'::jsonb,
    false, -- Typically unpaid unless employer policy states otherwise
    false,
    NOW()
  );

  -- Compassionate/Bereavement Leave (Custom but common)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Compassionate Leave',
    'compassionate',
    'Leave for bereavement or compassionate circumstances beyond family responsibility leave. Duration subject to employer discretion.',
    '#6b7280',
    '🕊️',
    true,
    true, -- Requires approval for longer periods
    5, -- Typically up to 5 days
    0, -- No advance notice required for emergencies
    '[]'::jsonb,
    true, -- Often paid as goodwill gesture
    false,
    NOW()
  );

  -- Unpaid Leave (General)
  INSERT INTO leave_types (
    organization_id, 
    name, 
    code, 
    description, 
    color, 
    icon, 
    is_active,
    requires_approval, 
    max_consecutive_days, 
    min_advance_notice_days, 
    blackout_periods,
    is_paid, 
    carries_over,
    created_at
  ) VALUES (
    org_id,
    'Unpaid Leave',
    'unpaid',
    'General unpaid leave for personal circumstances not covered by other leave types. Subject to employer approval and operational requirements.',
    '#9ca3af',
    '🏃‍♂️',
    true,
    true, -- Always requires approval
    null,
    21, -- 21 days advance notice
    '[]'::jsonb,
    false, -- Unpaid by definition
    false,
    NOW()
  );

END;
$$;

-- Function to create SA-specific accrual policies
CREATE OR REPLACE FUNCTION create_sa_accrual_policies(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  leave_type_rec RECORD;
BEGIN
  -- Delete existing accrual policies
  DELETE FROM accrual_policies WHERE organization_id = org_id;

  -- Annual Leave Accrual (BCEA compliant)
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'annual';
  IF FOUND THEN
    INSERT INTO accrual_policies (
      organization_id,
      leave_type_id,
      policy_name,
      accrual_method,
      accrual_amount,
      max_balance,
      waiting_period_days,
      proration_method,
      anniversary_based,
      is_active
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'BCEA Annual Leave Accrual',
      'monthly',
      1.75, -- 21 days per year = 1.75 days per month
      42, -- Can accumulate up to 2 years worth (carry over limited to 6 months per BCEA)
      0, -- No waiting period as per BCEA
      'daily', -- Pro-rate based on actual days worked
      true, -- Anniversary-based as per BCEA
      true
    );
  END IF;

  -- Sick Leave Accrual (BCEA Section 22)
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'sick';
  IF FOUND THEN
    INSERT INTO accrual_policies (
      organization_id,
      leave_type_id,
      policy_name,
      accrual_method,
      accrual_amount,
      max_balance,
      waiting_period_days,
      proration_method,
      anniversary_based,
      is_active
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'BCEA Sick Leave Accrual',
      'yearly',
      30, -- 30 days over 36-month cycle (simplified to yearly for system)
      30, -- Maximum 30 days in a cycle
      0, -- No waiting period for sick leave
      'none', -- No proration for sick leave
      false, -- Calendar year basis
      true
    );
  END IF;

  -- Family Responsibility Leave (Fixed allocation per BCEA)
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'family_responsibility';
  IF FOUND THEN
    INSERT INTO accrual_policies (
      organization_id,
      leave_type_id,
      policy_name,
      accrual_method,
      accrual_amount,
      max_balance,
      waiting_period_days,
      proration_method,
      anniversary_based,
      is_active
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'BCEA Family Responsibility Leave',
      'yearly',
      3, -- 3 days per year as per BCEA
      3, -- Maximum 3 days
      0, -- No waiting period
      'none', -- No proration
      false, -- Calendar year
      true
    );
  END IF;

  -- Paternity Leave (Fixed entitlement)
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'paternity';
  IF FOUND THEN
    INSERT INTO accrual_policies (
      organization_id,
      leave_type_id,
      policy_name,
      accrual_method,
      accrual_amount,
      max_balance,
      waiting_period_days,
      proration_method,
      anniversary_based,
      is_active
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'BCEA Paternity Leave',
      'manual', -- Granted per qualifying event
      10, -- 10 days per BCEA
      10,
      0,
      'none',
      false,
      true
    );
  END IF;

END;
$$;

-- Function to create SA-specific document requirements
CREATE OR REPLACE FUNCTION create_sa_document_requirements(org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  leave_type_rec RECORD;
BEGIN
  -- Delete existing document requirements
  DELETE FROM document_requirements WHERE organization_id = org_id;

  -- Sick Leave - Medical Certificate (BCEA requirement for >2 days)
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'sick';
  IF FOUND THEN
    INSERT INTO document_requirements (
      organization_id,
      leave_type_id,
      document_type,
      is_required,
      required_after_days,
      allow_override,
      override_requires_justification,
      description
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'medical_certificate',
      true,
      2, -- BCEA Section 23: Medical certificate required for absence >2 consecutive days
      true,
      true,
      'Medical certificate required for sick leave exceeding 2 consecutive days (BCEA Section 23)'
    );
  END IF;

  -- Study Leave - Proof of Study
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'study';
  IF FOUND THEN
    INSERT INTO document_requirements (
      organization_id,
      leave_type_id,
      document_type,
      is_required,
      required_after_days,
      allow_override,
      override_requires_justification,
      description
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'study_proof',
      true,
      1,
      true,
      true,
      'Proof of study enrollment, exam timetable, or course attendance requirement'
    );
  END IF;

  -- Maternity Leave - Medical Certificate
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'maternity';
  IF FOUND THEN
    INSERT INTO document_requirements (
      organization_id,
      leave_type_id,
      document_type,
      is_required,
      required_after_days,
      allow_override,
      override_requires_justification,
      description
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'medical_certificate',
      true,
      1,
      true,
      true,
      'Medical certificate confirming pregnancy and expected due date'
    );
  END IF;

  -- Compassionate/Bereavement Leave - Death Certificate
  SELECT id INTO leave_type_rec FROM leave_types WHERE organization_id = org_id AND code = 'compassionate';
  IF FOUND THEN
    INSERT INTO document_requirements (
      organization_id,
      leave_type_id,
      document_type,
      is_required,
      required_after_days,
      allow_override,
      override_requires_justification,
      description
    ) VALUES (
      org_id,
      leave_type_rec.id,
      'death_certificate',
      true,
      1,
      true,
      true,
      'Death certificate or funeral notice for compassionate leave'
    );
  END IF;

END;
$$;

-- Function to set up complete SA leave system for an organization
CREATE OR REPLACE FUNCTION setup_sa_leave_system(org_id UUID)
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
    jsonb_build_object('system_type', 'south_africa_bcea'),
    jsonb_build_object('setup_date', NOW(), 'compliance_framework', 'BCEA')
  );
END;
$$;

-- Update the organization trigger to use SA leave types
CREATE OR REPLACE FUNCTION trigger_create_sa_leave_system()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set up South African leave system for new organizations
  PERFORM setup_sa_leave_system(NEW.id);
  RETURN NEW;
END;
$$;

-- Replace the existing trigger
DROP TRIGGER IF EXISTS create_default_leave_types_trigger ON organizations;
CREATE TRIGGER create_sa_leave_system_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_sa_leave_system();