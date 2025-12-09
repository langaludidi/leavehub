# Role-Based Access Control (RBAC) Implementation

## Overview

LeaveHub implements a comprehensive Role-Based Access Control system with 5 distinct user roles, each providing a unique experience tailored to their responsibilities.

## The 5 User Roles

### 1. Employee (Level 1)
**Default role for all new users**

**Capabilities:**
- Submit leave requests
- View personal leave balance
- Upload documents (sick notes, etc.)
- Access AI Leave Planner
- View personal calendar
- Receive notifications

**Dashboard:** `/dashboard`

**Permissions:**
```typescript
{
  canSubmitLeaveRequests: true,
  canUploadDocuments: true,
  canAccessAIPlanner: true,
}
```

---

### 2. Manager (Level 2)
**Team lead with approval authority**

**Capabilities:**
- All Employee capabilities, plus:
- Approve/reject team leave requests
- View team calendar
- Manage team members
- Access team reports
- AI conflict detection
- AI leave insights

**Dashboard:** `/dashboard/manager`

**Permissions:**
```typescript
{
  canSubmitLeaveRequests: true,
  canApproveLeaveRequests: true,
  canViewTeamMembers: true,
  canManageTeamMembers: true,
  canViewTeamReports: true,
  canUploadDocuments: true,
  canAccessAIPlanner: true,
  canAccessAIInsights: true,
}
```

---

### 3. HR Administrator (Level 3)
**Human Resources management**

**Capabilities:**
- All Manager capabilities, plus:
- Manage all leave requests across organization
- Manage all users and employees
- Access company settings
- Manage leave policies
- Manage departments
- Manage company holidays
- View organization-wide reports
- Manage company documents

**Dashboard:** `/dashboard/hr`

**Permissions:**
```typescript
{
  canManageAllLeaveRequests: true,
  canManageAllUsers: true,
  canAccessSettings: true,
  canManageCompanySettings: true,
  canManageLeavePolicies: true,
  canManageDepartments: true,
  canManageHolidays: true,
  canViewOrganizationReports: true,
  canManageCompanyDocuments: true,
  // ... plus all Manager permissions
}
```

---

### 4. Admin (Level 4)
**Organization administrator**

**Capabilities:**
- All HR Admin capabilities, plus:
- Manage organization settings
- Access organization analytics
- Manage integrations
- Security configuration
- System notifications
- **Assign roles to users** (except Super Admin)

**Dashboard:** `/dashboard/admin`

**Permissions:**
- Same as HR Admin (for now)
- Additional capabilities in role assignment API

---

### 5. Super Admin (Level 5)
**Platform-wide administrator**

**Capabilities:**
- All Admin capabilities, plus:
- Multi-tenant management
- View platform analytics
- Manage multiple organizations
- Database management
- System settings
- API management
- Security & compliance
- **Assign any role including Super Admin**

**Dashboard:** `/dashboard/super-admin`

**Permissions:**
```typescript
{
  canManageOrganizations: true,
  canManageSystemSettings: true,
  canAccessSuperAdminPanel: true,
  canViewPlatformAnalytics: true,
  // ... plus all other permissions
}
```

---

## Architecture

### Database Schema

The `profiles` table includes a `role` field using a PostgreSQL enum:

```sql
CREATE TYPE user_role AS ENUM (
  'employee',
  'manager',
  'hr_admin',
  'admin',
  'super_admin'
);

ALTER TABLE profiles
ADD COLUMN role user_role DEFAULT 'employee' NOT NULL;
```

**Location:** `supabase/migrations/20251209_add_role_to_profiles.sql`

### Role Hierarchy

```
Level 5: Super Admin ──> Platform-wide access
Level 4: Admin       ──> Organization management
Level 3: HR Admin    ──> Employee & policy management
Level 2: Manager     ──> Team approval & oversight
Level 1: Employee    ──> Self-service leave management
```

Higher levels inherit all permissions from lower levels.

---

## Implementation Components

### 1. Type Definitions
**File:** `src/types/roles.ts`

- `UserRole` enum
- `RolePermissions` interface (21 granular permissions)
- `ROLE_LABELS` and `ROLE_DESCRIPTIONS`
- `getRolePermissions()` function
- `hasHigherOrEqualRole()` utility
- `getDefaultDashboardRoute()` for redirects

### 2. Server-Side Utilities
**File:** `src/lib/auth/roles.ts`

```typescript
// Get current user's role from database
await getUserRole(): Promise<UserRole | null>

// Get user's permissions
await getUserPermissions(): Promise<RolePermissions>

// Check specific permission
await hasPermission(permissionKey: keyof RolePermissions): Promise<boolean>

// Check role hierarchy
await hasRole(requiredRole: UserRole): Promise<boolean>

// Require role (throws error if unauthorized)
await requireRole(requiredRole: UserRole): Promise<void>

// Require permission (throws error if unauthorized)
await requirePermission(permissionKey: keyof RolePermissions): Promise<void>
```

**Usage in API Routes:**
```typescript
export async function GET(request: Request) {
  await requireRole(UserRole.HR_ADMIN);
  // ... HR-only logic
}
```

**Usage in Server Components:**
```typescript
export default async function HRDashboard() {
  await requireRole(UserRole.HR_ADMIN);
  // ... render HR dashboard
}
```

### 3. Client-Side Hooks
**File:** `src/hooks/useUserRole.ts`

```typescript
// Main hook for role and permissions
const { role, permissions, isLoading, error, refreshRole } = useUserRole();

// Check specific permission
const canManageUsers = usePermission('canManageAllUsers');

// Check role hierarchy
const isManager = useHasRole(UserRole.MANAGER);
```

**Usage in Components:**
```typescript
function MyComponent() {
  const { role, permissions, isLoading } = useUserRole();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {permissions?.canApproveLeaveRequests && (
        <ApprovalButton />
      )}
    </div>
  );
}
```

### 4. UI Components

#### RoleBasedNav
**File:** `src/components/RoleBasedNav.tsx`

Dynamically shows/hides navigation items based on user role.

```typescript
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Team', href: '/dashboard/manager', minRole: UserRole.MANAGER },
  { label: 'HR Panel', href: '/dashboard/hr', minRole: UserRole.HR_ADMIN },
  { label: 'Admin', href: '/dashboard/admin', minRole: UserRole.ADMIN },
  // ...
];
```

#### RoleGuard
**File:** `src/components/RoleGuard.tsx`

Client-side component guard for protecting UI:

```typescript
<RoleGuard requiredRole={UserRole.HR_ADMIN}>
  <SensitiveContent />
</RoleGuard>
```

Shows access denied message if user doesn't have required role.

#### RoleBadge
**File:** `src/components/RoleBadge.tsx`

Displays user's current role with color-coded badge:
- Employee: Gray
- Manager: Blue
- HR Admin: Purple
- Admin: Amber
- Super Admin: Red

### 5. Profile Creation & Role Assignment

#### Clerk Webhook Handler
**File:** `src/app/api/webhooks/clerk/route.ts`

Automatically creates user profiles when users sign up via Clerk:

```typescript
// On user.created
{
  clerk_user_id: userId,
  email: email,
  first_name: firstName,
  last_name: lastName,
  role: UserRole.EMPLOYEE, // Default role
  company_id: demoCompanyId,
}
```

**Setup:** See `CLERK_WEBHOOK_SETUP.md`

#### Fallback Profile Creation
**File:** `src/lib/auth/ensure-profile.ts`

Ensures profile exists even if webhook isn't configured:

```typescript
await ensureProfileExists();
```

Call this in layouts or protected pages as a safety net.

#### Role Management API
**File:** `src/app/api/admin/users/[userId]/role/route.ts`

Allows Admins to change user roles:

```http
PATCH /api/admin/users/{userId}/role
{
  "role": "manager"
}
```

**Authorization:**
- Requires Admin role
- Only Super Admins can assign Super Admin role
- Users cannot change their own role

---

## Dashboard Pages

### Employee Dashboard
**Route:** `/dashboard`
**File:** `src/app/dashboard/page.tsx`

- Leave balance overview
- Quick leave request
- Upcoming leaves
- Team calendar

### Manager Dashboard
**Route:** `/dashboard/manager`
**File:** `src/app/dashboard/manager/page.tsx` (to be created)

- Team leave requests (approve/reject)
- Team calendar
- Team statistics
- AI conflict detection

### HR Admin Dashboard
**Route:** `/dashboard/hr`
**File:** `src/app/dashboard/hr/page.tsx`

- Pending leave requests (all employees)
- Department overview
- Employee management
- Leave policies
- Reports & analytics

### Admin Dashboard
**Route:** `/dashboard/admin`
**File:** `src/app/dashboard/admin/page.tsx`

- User management
- Role assignment
- Organization settings
- System health
- Integrations
- Security settings

### Super Admin Dashboard
**Route:** `/dashboard/super-admin`
**File:** `src/app/dashboard/super-admin/page.tsx`

- Platform metrics (revenue, organizations, users)
- Multi-tenant management
- System performance
- Database management
- API management
- Billing overview

---

## Security Best Practices

### 1. Double Protection
Always protect routes on BOTH server and client:

```typescript
// Server-side (page.tsx)
export default async function AdminPage() {
  await requireRole(UserRole.ADMIN); // Server protection
  return <AdminContent />;
}

// Client-side (component)
<RoleGuard requiredRole={UserRole.ADMIN}>
  <SensitiveUIComponent />
</RoleGuard>
```

### 2. API Route Protection

```typescript
export async function POST(request: Request) {
  await requireRole(UserRole.HR_ADMIN);
  // ... secure logic
}
```

### 3. Database RLS Policies

The migration includes Row Level Security policies:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims')::json->>'sub');

-- Admins can see all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub'
      AND role IN ('hr_admin', 'admin', 'super_admin')
    )
  );
```

### 4. Role Escalation Prevention

- Users cannot change their own role
- Only Super Admins can create Super Admins
- Role changes require admin authentication
- All role changes are audited (to be implemented)

---

## Setup Instructions

### 1. Apply Database Migration

Run the SQL migration in Supabase Dashboard:
```bash
node scripts/apply-role-migration.js
```

This will show you the SQL to run manually in Supabase SQL Editor.

### 2. Configure Clerk Webhook

Follow the guide in `CLERK_WEBHOOK_SETUP.md`:

1. Create webhook endpoint in Clerk Dashboard
2. Subscribe to `user.created`, `user.updated`, `user.deleted`
3. Add `CLERK_WEBHOOK_SECRET` to `.env.local`
4. Deploy and verify webhook is working

### 3. Assign Initial Roles

For existing users, update roles manually in Supabase:

```sql
-- Make a user an admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Or use the API (once you have an admin):

```bash
curl -X PATCH https://leavehub.co.za/api/admin/users/{userId}/role \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### 4. Test Each Role

1. Create test users for each role
2. Verify navigation shows correct items
3. Test access to each dashboard
4. Verify permission checks work
5. Test role assignment API

---

## Common Use Cases

### Check Permission in Component

```typescript
function LeaveApprovalButton() {
  const { permissions } = useUserRole();

  if (!permissions?.canApproveLeaveRequests) {
    return null; // Don't show button
  }

  return <Button onClick={handleApprove}>Approve</Button>;
}
```

### Conditional Rendering

```typescript
function DashboardSidebar() {
  const { role } = useUserRole();

  return (
    <nav>
      <NavItem href="/dashboard">Dashboard</NavItem>
      {role && hasHigherOrEqualRole(role, UserRole.MANAGER) && (
        <NavItem href="/dashboard/manager">Team</NavItem>
      )}
      {role && hasHigherOrEqualRole(role, UserRole.HR_ADMIN) && (
        <NavItem href="/dashboard/hr">HR Panel</NavItem>
      )}
    </nav>
  );
}
```

### Protect API Route

```typescript
export async function POST(request: Request) {
  // Require specific permission
  await requirePermission('canManageAllUsers');

  const body = await request.json();
  // ... create user
}
```

### Get User Role in Server Component

```typescript
export default async function MyPage() {
  const role = await getUserRole();
  const permissions = await getUserPermissions();

  return (
    <div>
      <p>Your role: {role}</p>
      {permissions.canManageAllUsers && <AdminPanel />}
    </div>
  );
}
```

---

## Next Steps

### Planned Enhancements

1. **Audit Logging**
   - Log all role changes
   - Track permission usage
   - Security event monitoring

2. **Custom Permissions**
   - Allow organizations to define custom permissions
   - Fine-grained access control
   - Resource-level permissions

3. **Role Templates**
   - Predefined role configurations
   - Quick role assignment
   - Industry-specific templates

4. **Self-Service Role Requests**
   - Employees can request role upgrades
   - Approval workflow
   - Automatic provisioning

5. **Role Analytics**
   - Usage statistics per role
   - Permission utilization
   - Security insights

---

## Troubleshooting

### "Unauthorized" errors

1. Check user has a profile in Supabase
2. Verify role column exists and has correct value
3. Check Clerk authentication is working
4. Verify API routes have proper auth middleware

### Navigation items not showing

1. Check `useUserRole` hook is loading correctly
2. Verify role is being fetched from database
3. Check role hierarchy in RoleBasedNav

### Webhook not creating profiles

1. Verify webhook is configured in Clerk Dashboard
2. Check `CLERK_WEBHOOK_SECRET` is set correctly
3. Look at Vercel logs for webhook errors
4. Test webhook with Clerk's test events

### Cannot access admin pages

1. Verify your role in Supabase: `SELECT role FROM profiles WHERE email = 'your-email'`
2. Update role if needed
3. Refresh the page to reload role
4. Check browser console for errors

---

## Files Reference

```
├── src/
│   ├── types/
│   │   └── roles.ts                     # Role types, enums, permissions
│   ├── lib/auth/
│   │   ├── roles.ts                     # Server-side utilities
│   │   └── ensure-profile.ts            # Fallback profile creation
│   ├── hooks/
│   │   └── useUserRole.ts               # Client-side hooks
│   ├── components/
│   │   ├── RoleBasedNav.tsx             # Dynamic navigation
│   │   ├── RoleGuard.tsx                # Client-side route guard
│   │   └── RoleBadge.tsx                # Role display badge
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/clerk/route.ts  # Clerk webhook handler
│   │   │   └── admin/users/[userId]/role/route.ts  # Role management
│   │   └── dashboard/
│   │       ├── page.tsx                 # Employee dashboard
│   │       ├── manager/page.tsx         # Manager dashboard
│   │       ├── hr/page.tsx              # HR Admin dashboard
│   │       ├── admin/page.tsx           # Admin dashboard
│   │       └── super-admin/page.tsx     # Super Admin dashboard
├── supabase/migrations/
│   └── 20251209_add_role_to_profiles.sql  # Database migration
├── scripts/
│   └── apply-role-migration.js          # Migration helper
├── CLERK_WEBHOOK_SETUP.md               # Webhook setup guide
└── RBAC_IMPLEMENTATION.md               # This file
```

---

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in relevant files
3. Check Supabase logs for database issues
4. Check Vercel logs for API/webhook issues
5. Verify environment variables are set correctly

---

**Last Updated:** December 9, 2024
**Version:** 2.0
**Status:** Production Ready ✅
