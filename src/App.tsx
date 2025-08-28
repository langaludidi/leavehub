import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";

// Guards & utils
import Protected from "./components/Protected";
import RequireRole from "./components/RequireRole";

// Routes (pages)
import Home from "./routes/Home";
import SignIn from "./routes/SignIn";
import AuthCallback from "./routes/AuthCallback";
import EmployeeHome from "./routes/EmployeeHome";
import NewRequest from "./routes/employee/NewRequest";
import History from "./routes/employee/History";
import CalendarSettings from "./routes/employee/CalendarSettings";
import NotificationSettings from "./routes/employee/NotificationSettings";
import AdminHome from "./routes/AdminHome";
import Holidays from "./routes/admin/Holidays";

// Optional extras (only include these if the files exist in your repo)
import ApprovalsInbox from "./routes/ApprovalsInbox";
// Admin submodules you already shared
import AdminRequests from "./routes/admin/Requests";
import AdminEmployees from "./routes/admin/Employees";
import AdminLeaveTypes from "./routes/admin/LeaveTypes";
import BalancesReport from "./routes/admin/BalancesReport";
import AccrualPolicies from "./routes/admin/AccrualPolicies";
import ReportsForecast from "./routes/admin/ReportsForecast";
import RequestsKanban from "./routes/admin/RequestsKanban";
import Billing from "./routes/admin/Billing";

// Onboarding routes
import OrganizationSetup from "./routes/onboarding/OrganizationSetup";
import EmployeeSetup from "./routes/onboarding/EmployeeSetup";
import OnboardingWizard from "./routes/onboarding/OnboardingWizard";

// Manager routes
import TeamManagement from "./routes/manager/TeamManagement";

// Policy Management
import PolicyRules from "./routes/admin/PolicyRules";
import LeavePolicies from "./routes/admin/LeavePolicies";

// Compliance Management
import Compliance from "./routes/admin/Compliance";
import AuditTrail from "./routes/admin/AuditTrail";

// Trial Management
import TrialManagement from "./routes/admin/TrialManagement";

// Escalation Management
import EscalationManagement from "./routes/admin/EscalationManagement";

// Reports Center
import ReportsCenter from "./routes/admin/ReportsCenter";

// POPIA Compliance
import POPIACompliance from "./routes/admin/POPIACompliance";

// Profile and Settings
import Profile from "./routes/Profile";
import Settings from "./routes/Settings";

// Departments
import Departments from "./routes/admin/Departments";

// Super Admin
import SuperAdmin from "./routes/SuperAdmin";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Onboarding routes */}
        <Route path="/onboarding" element={<Protected><RequireRole role="admin"><OnboardingWizard /></RequireRole></Protected>} />
        <Route path="/onboarding/organization" element={<Protected><RequireRole role="admin"><OrganizationSetup /></RequireRole></Protected>} />
        <Route path="/onboarding/employee" element={<Protected><EmployeeSetup /></Protected>} />

        <Route path="/employee" element={<Protected><EmployeeHome /></Protected>} />
        <Route path="/employee/request" element={<Protected><NewRequest /></Protected>} />
        <Route path="/employee/history" element={<Protected><History /></Protected>} />
        <Route path="/employee/calendar" element={<Protected><CalendarSettings /></Protected>} />
        <Route path="/employee/notifications" element={<Protected><NotificationSettings /></Protected>} />
        
        {/* Profile and Settings */}
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />

        {/* Manager/Admin approval workflows */}
        <Route path="/approvals" element={<Protected><RequireRole role={["manager", "admin"]}><ApprovalsInbox /></RequireRole></Protected>} />

        {/* Admin-only routes */}
        <Route path="/admin" element={<Protected><RequireRole role="admin"><AdminHome /></RequireRole></Protected>} />
        <Route path="/admin/holidays" element={<Protected><RequireRole role="admin"><Holidays /></RequireRole></Protected>} />
        
        {/* Admin submodules - strict admin access */}
        <Route path="/admin/requests" element={<Protected><RequireRole role="admin"><AdminRequests /></RequireRole></Protected>} />
        <Route path="/admin/employees" element={<Protected><RequireRole role="admin"><AdminEmployees /></RequireRole></Protected>} />
        <Route path="/admin/leave-types" element={<Protected><RequireRole role="admin"><AdminLeaveTypes /></RequireRole></Protected>} />
        <Route path="/admin/reports/balances" element={<Protected><RequireRole role="admin"><BalancesReport /></RequireRole></Protected>} />
        <Route path="/admin/leave-policies" element={<Protected><RequireRole role="admin"><LeavePolicies /></RequireRole></Protected>} />
        <Route path="/admin/accrual-policies" element={<Protected><RequireRole role="admin"><AccrualPolicies /></RequireRole></Protected>} />
        <Route path="/admin/policy-rules" element={<Protected><RequireRole role="admin"><PolicyRules /></RequireRole></Protected>} />
        <Route path="/admin/compliance" element={<Protected><RequireRole role="admin"><Compliance /></RequireRole></Protected>} />
        <Route path="/admin/compliance/audit-trail" element={<Protected><RequireRole role="admin"><AuditTrail /></RequireRole></Protected>} />
        <Route path="/admin/compliance/popia" element={<Protected><RequireRole role="admin"><POPIACompliance /></RequireRole></Protected>} />
        <Route path="/admin/trial" element={<Protected><RequireRole role="admin"><TrialManagement /></RequireRole></Protected>} />
        <Route path="/admin/escalations" element={<Protected><RequireRole role="admin"><EscalationManagement /></RequireRole></Protected>} />
        <Route path="/admin/reports" element={<Protected><RequireRole role="admin"><ReportsCenter /></RequireRole></Protected>} />
        <Route path="/admin/reports/forecast" element={<Protected><RequireRole role="admin"><ReportsForecast /></RequireRole></Protected>} />
        <Route path="/admin/requests-kanban" element={<Protected><RequireRole role="admin"><RequestsKanban /></RequireRole></Protected>} />
        <Route path="/admin/billing" element={<Protected><RequireRole role="admin"><Billing /></RequireRole></Protected>} />
        <Route path="/admin/departments" element={<Protected><RequireRole role="admin"><Departments /></RequireRole></Protected>} />
        
        {/* Super Admin - LeaveHub Internal */}
        <Route path="/super-admin" element={<SuperAdmin />} />
        
        {/* Manager-specific routes */}
        <Route path="/manager" element={<Protected><RequireRole role={["manager", "admin"]}><TeamManagement /></RequireRole></Protected>} />
        <Route path="/manager/team" element={<Protected><RequireRole role={["manager", "admin"]}><TeamManagement /></RequireRole></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
