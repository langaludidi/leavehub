-- ============================================
-- LeaveHub MVP - Leave Management
-- Leave Requests, Balances, Approvals
-- ============================================

-- ============================================
-- 1. LEAVE REQUEST STATUS ENUM
-- ============================================
CREATE TYPE leave_request_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'withdrawn'
);

CREATE TYPE approval_action AS ENUM (
  'approved',
  'rejected'
);

-- ============================================
-- 2. LEAVE BALANCES TABLE
-- ============================================
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User and Company
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE NOT NULL,

  -- Balance Information
  year INTEGER NOT NULL,
  entitled_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  used_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  available_days DECIMAL(5,2) GENERATED ALWAYS AS (entitled_days - used_days) STORED,

  -- Carryover from previous year
  carried_over_days DECIMAL(5,2) DEFAULT 0,
  carryover_expiry_date DATE,

  -- For sick leave cycle (3 years)
  cycle_start_date DATE,
  cycle_end_date DATE,
  cycle_used_days DECIMAL(5,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, leave_type_id, year)
);

CREATE INDEX idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX idx_leave_balances_company_id ON leave_balances(company_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
CREATE INDEX idx_leave_balances_leave_type_id ON leave_balances(leave_type_id);

-- ============================================
-- 3. LEAVE REQUESTS TABLE
-- ============================================
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User and Company
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE RESTRICT NOT NULL,

  -- Request Details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  working_days DECIMAL(5,2) NOT NULL,  -- Calculated excluding weekends/holidays

  -- Request Information
  reason TEXT,
  notes TEXT,
  status leave_request_status DEFAULT 'pending' NOT NULL,

  -- Approval Chain
  manager_id UUID REFERENCES profiles(id),
  hr_admin_id UUID REFERENCES profiles(id),

  -- Manager Approval
  manager_approved_at TIMESTAMPTZ,
  manager_approved_by UUID REFERENCES profiles(id),
  manager_comments TEXT,

  -- HR Approval
  hr_approved_at TIMESTAMPTZ,
  hr_approved_by UUID REFERENCES profiles(id),
  hr_comments TEXT,

  -- Final Decision
  final_approved_at TIMESTAMPTZ,
  final_approved_by UUID REFERENCES profiles(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,

  -- Medical Certificate (for sick leave)
  requires_medical_certificate BOOLEAN DEFAULT false,
  medical_certificate_uploaded BOOLEAN DEFAULT false,
  medical_certificate_url TEXT,

  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (end_date >= start_date),
  CHECK (working_days > 0)
);

CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_company_id ON leave_requests(company_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX idx_leave_requests_manager_id ON leave_requests(manager_id);
CREATE INDEX idx_leave_requests_leave_type_id ON leave_requests(leave_type_id);

-- ============================================
-- 4. LEAVE REQUEST APPROVALS TABLE (Audit Trail)
-- ============================================
CREATE TABLE leave_request_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  leave_request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE NOT NULL,

  -- Approver Information
  approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approver_role user_role NOT NULL,

  -- Approval Details
  action approval_action NOT NULL,
  comments TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leave_request_approvals_leave_request_id ON leave_request_approvals(leave_request_id);
CREATE INDEX idx_leave_request_approvals_approver_id ON leave_request_approvals(approver_id);

-- ============================================
-- 5. TRIGGER: UPDATE LEAVE BALANCE AFTER APPROVAL
-- ============================================
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update balance when request is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE leave_balances
    SET
      used_days = used_days + NEW.working_days,
      updated_at = NOW()
    WHERE
      user_id = NEW.user_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;

  -- Restore balance if request is cancelled or rejected
  IF (NEW.status = 'cancelled' OR NEW.status = 'rejected') AND OLD.status = 'approved' THEN
    UPDATE leave_balances
    SET
      used_days = used_days - NEW.working_days,
      updated_at = NOW()
    WHERE
      user_id = NEW.user_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leave_balance
AFTER UPDATE OF status ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_leave_balance_on_approval();

-- ============================================
-- 6. TRIGGER: AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leave_balances_updated_at
BEFORE UPDATE ON leave_balances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leave_requests_updated_at
BEFORE UPDATE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Leave Management schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- leave_balances table (with auto-calculated available_days)';
  RAISE NOTICE '- leave_requests table (full approval workflow)';
  RAISE NOTICE '- leave_request_approvals table (audit trail)';
  RAISE NOTICE '- Triggers for balance updates';
  RAISE NOTICE '- Triggers for timestamp updates';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run 03_DOCUMENTS.sql';
  RAISE NOTICE '';
END $$;
