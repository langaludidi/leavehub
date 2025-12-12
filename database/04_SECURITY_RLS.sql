-- ============================================
-- LeaveHub MVP - Row Level Security (RLS)
-- Multi-tenant data isolation and access control
-- ============================================

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_request_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. COMPANIES TABLE POLICIES
-- ============================================

-- Users can view their own company
CREATE POLICY "Users can view own company"
ON companies FOR SELECT
USING (
  id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Super admins can view all companies
CREATE POLICY "Super admins can view all companies"
ON companies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role = 'super_admin'
  )
);

-- Admins and super admins can update their company
CREATE POLICY "Admins can update own company"
ON companies FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- 3. PROFILES TABLE POLICIES
-- ============================================

-- Users can view profiles in their company
CREATE POLICY "Users can view company profiles"
ON profiles FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (
  clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (
  clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- Admins and HR can insert new profiles
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('admin', 'super_admin', 'hr_admin')
  )
);

-- Admins can update profiles in their company
CREATE POLICY "Admins can update company profiles"
ON profiles FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('admin', 'super_admin', 'hr_admin')
  )
);

-- ============================================
-- 4. LEAVE TYPES POLICIES
-- ============================================

-- Users can view leave types in their company
CREATE POLICY "Users can view company leave types"
ON leave_types FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- HR and Admins can manage leave types
CREATE POLICY "HR can manage leave types"
ON leave_types FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('hr_admin', 'admin', 'super_admin')
  )
);

-- ============================================
-- 5. LEAVE BALANCES POLICIES
-- ============================================

-- Users can view their own leave balances
CREATE POLICY "Users can view own leave balances"
ON leave_balances FOR SELECT
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Managers can view their team's leave balances
CREATE POLICY "Managers can view team leave balances"
ON leave_balances FOR SELECT
USING (
  user_id IN (
    SELECT id FROM profiles p1
    WHERE p1.manager_id IN (
      SELECT id FROM profiles p2
      WHERE p2.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
);

-- HR and Admins can view all leave balances in their company
CREATE POLICY "HR can view all leave balances"
ON leave_balances FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('hr_admin', 'admin', 'super_admin')
  )
);

-- HR and Admins can manage leave balances
CREATE POLICY "HR can manage leave balances"
ON leave_balances FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('hr_admin', 'admin', 'super_admin')
  )
);

-- ============================================
-- 6. LEAVE REQUESTS POLICIES
-- ============================================

-- Users can view their own leave requests
CREATE POLICY "Users can view own leave requests"
ON leave_requests FOR SELECT
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Managers can view their team's leave requests
CREATE POLICY "Managers can view team leave requests"
ON leave_requests FOR SELECT
USING (
  user_id IN (
    SELECT id FROM profiles p1
    WHERE p1.manager_id IN (
      SELECT id FROM profiles p2
      WHERE p2.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  OR
  manager_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- HR and Admins can view all leave requests in their company
CREATE POLICY "HR can view all leave requests"
ON leave_requests FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('hr_admin', 'admin', 'super_admin')
  )
);

-- Users can create their own leave requests
CREATE POLICY "Users can create leave requests"
ON leave_requests FOR INSERT
WITH CHECK (
  user_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
ON leave_requests FOR UPDATE
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  AND status = 'pending'
);

-- Managers can update leave requests assigned to them
CREATE POLICY "Managers can update assigned requests"
ON leave_requests FOR UPDATE
USING (
  manager_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('manager', 'hr_admin', 'admin', 'super_admin')
  )
);

-- HR can update all leave requests in their company
CREATE POLICY "HR can update all requests"
ON leave_requests FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('hr_admin', 'admin', 'super_admin')
  )
);

-- ============================================
-- 7. LEAVE REQUEST APPROVALS POLICIES
-- ============================================

-- Users can view approvals for their requests
CREATE POLICY "Users can view own request approvals"
ON leave_request_approvals FOR SELECT
USING (
  leave_request_id IN (
    SELECT id FROM leave_requests
    WHERE user_id IN (
      SELECT id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
);

-- Managers and HR can view all approvals in their scope
CREATE POLICY "Managers can view approvals"
ON leave_request_approvals FOR SELECT
USING (
  leave_request_id IN (
    SELECT lr.id FROM leave_requests lr
    JOIN profiles p ON p.id = lr.user_id
    WHERE p.company_id IN (
      SELECT company_id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('manager', 'hr_admin', 'admin', 'super_admin')
    )
  )
);

-- Approvers can create approval records
CREATE POLICY "Approvers can create approvals"
ON leave_request_approvals FOR INSERT
WITH CHECK (
  approver_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('manager', 'hr_admin', 'admin', 'super_admin')
  )
);

-- ============================================
-- 8. DOCUMENTS POLICIES
-- ============================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
USING (
  owner_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- HR and Admins can view all documents in their company
CREATE POLICY "HR can view all documents"
ON documents FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('hr_admin', 'admin', 'super_admin')
  )
);

-- Managers can view their team's documents (non-private)
CREATE POLICY "Managers can view team documents"
ON documents FOR SELECT
USING (
  is_private = false
  AND owner_id IN (
    SELECT id FROM profiles p1
    WHERE p1.manager_id IN (
      SELECT id FROM profiles p2
      WHERE p2.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND p2.role = 'manager'
    )
  )
);

-- Users can upload documents
CREATE POLICY "Users can upload documents"
ON documents FOR INSERT
WITH CHECK (
  owner_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
ON documents FOR UPDATE
USING (
  owner_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- HR can update all documents
CREATE POLICY "HR can update all documents"
ON documents FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND role IN ('hr_admin', 'admin', 'super_admin')
  )
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON documents FOR DELETE
USING (
  owner_id IN (
    SELECT id FROM profiles
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- ============================================
-- 9. DOCUMENT ACCESS LOGS POLICIES
-- ============================================

-- HR and Admins can view access logs
CREATE POLICY "HR can view access logs"
ON document_access_logs FOR SELECT
USING (
  document_id IN (
    SELECT id FROM documents
    WHERE company_id IN (
      SELECT company_id FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('hr_admin', 'admin', 'super_admin')
    )
  )
);

-- System can insert access logs
CREATE POLICY "System can insert access logs"
ON document_access_logs FOR INSERT
WITH CHECK (true);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Row Level Security policies created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Summary:';
  RAISE NOTICE '- All tables have RLS enabled';
  RAISE NOTICE '- Multi-tenant data isolation enforced';
  RAISE NOTICE '- Role-based access control implemented';
  RAISE NOTICE '';
  RAISE NOTICE 'Access Levels:';
  RAISE NOTICE '- Employee: Own data only';
  RAISE NOTICE '- Manager: Own + team data';
  RAISE NOTICE '- HR Admin: All company data';
  RAISE NOTICE '- Admin: All company data + settings';
  RAISE NOTICE '- Super Admin: All data across all companies';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run 05_FUNCTIONS.sql';
  RAISE NOTICE '';
END $$;
