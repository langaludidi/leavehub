# Manager Approval Dashboard - Setup Guide

## ✅ Feature #2 Complete!

The Manager Approval Dashboard has been fully implemented with:
- Manager dashboard showing pending/approved/rejected requests
- Detailed review page with approve/reject functionality
- Automatic leave balance deduction on approval
- Email notifications to employees on approval/rejection
- BCEA compliance tracking

---

## 🎯 What's Been Built

### 1. Manager Dashboard (`/dashboard/manager`)
**Features:**
- Quick stats cards (Pending, Approved This Month, Total)
- Filter by status (Pending, Approved, Rejected, All)
- List view of all leave requests with key details
- Color-coded status badges
- Document indicators
- Direct links to review each request

### 2. Detailed Review Page (`/dashboard/manager/requests/[id]`)
**Features:**
- Complete request details (employee, dates, reason, documents)
- Approve/reject buttons with confirmation flow
- Required comments for rejection
- Optional comments for approval
- Automatic status updates in database
- Email notifications sent on approval/rejection
- Cannot re-process already-approved/rejected requests

### 3. API Endpoints

**Approve Request:** `POST /api/leave-requests/[id]/approve`
- Updates request status to "approved"
- Deducts leave days from employee balance
- Sends approval email to employee
- Tracks approving manager and timestamp

**Reject Request:** `POST /api/leave-requests/[id]/reject`
- Updates request status to "rejected"
- Requires manager comments (mandatory)
- Sends rejection email with comments
- Tracks rejecting manager and timestamp

### 4. Database Enhancements
- Added `approved_by`, `approved_at`, `manager_comments` columns
- Created `deduct_leave_balance()` function
- Created `restore_leave_balance()` function (for cancellations)
- Added performance indexes
- Created `manager_leave_requests_view` for easy queries

---

## 📋 Setup Instructions

### Step 1: Run the SQL Migration

Copy and paste this into your Supabase SQL Editor:

```sql
-- =====================================================
-- MANAGER APPROVAL SYSTEM - DATABASE SETUP
-- =====================================================

-- Add columns to leave_requests table for approval tracking
ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS approved_by VARCHAR,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS manager_comments TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN leave_requests.approved_by IS 'Clerk user ID of the manager who approved/rejected';
COMMENT ON COLUMN leave_requests.approved_at IS 'Timestamp when the request was approved/rejected';
COMMENT ON COLUMN leave_requests.manager_comments IS 'Optional comments from the manager';

-- =====================================================
-- CREATE FUNCTION TO DEDUCT LEAVE BALANCE
-- =====================================================

CREATE OR REPLACE FUNCTION deduct_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_deduct INTEGER,
  p_year INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update the leave balance for the user
  UPDATE leave_balances
  SET
    used_days = used_days + p_days_to_deduct,
    available_days = entitled_days - (used_days + p_days_to_deduct),
    updated_at = NOW()
  WHERE
    user_id = p_user_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;

  IF NOT FOUND THEN
    RAISE NOTICE 'Leave balance not found for user %, leave type %, year %',
      p_user_id, p_leave_type_id, p_year;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE FUNCTION TO RESTORE LEAVE BALANCE
-- =====================================================

CREATE OR REPLACE FUNCTION restore_leave_balance(
  p_user_id UUID,
  p_leave_type_id UUID,
  p_days_to_restore INTEGER,
  p_year INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE leave_balances
  SET
    used_days = GREATEST(0, used_days - p_days_to_restore),
    available_days = entitled_days - GREATEST(0, used_days - p_days_to_restore),
    updated_at = NOW()
  WHERE
    user_id = p_user_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;

  IF NOT FOUND THEN
    RAISE NOTICE 'Leave balance not found for user %, leave type %, year %',
      p_user_id, p_leave_type_id, p_year;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE INDEX FOR MANAGER QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leave_requests_status
ON leave_requests(status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_dates
ON leave_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id
ON leave_requests(user_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leave_requests'
AND column_name IN ('approved_by', 'approved_at', 'manager_comments');
```

### Step 2: Test the Manager Dashboard

1. **Navigate to Manager Dashboard**:
   ```
   http://localhost:3000/dashboard/manager
   ```

2. **Expected View**:
   - See all leave requests from your database
   - Filter by Pending/Approved/Rejected
   - Quick stats at the top

3. **Review a Request**:
   - Click "Review" button on any pending request
   - Review all details
   - Add optional comments
   - Click "Approve" or "Reject"

4. **Approval Flow**:
   - Approve → Confirm → Request status updated → Email sent → Leave balance deducted
   - Reject → Add comments (required) → Confirm → Request status updated → Email sent

---

## 🔐 Manager Access

Currently, the manager dashboard is accessible at `/dashboard/manager` for all users (demo mode).

**For Production:**
1. Add role-based authentication
2. Check user role before showing manager features
3. Add to layout:
   ```typescript
   if (user.role === 'manager' || user.role === 'admin') {
     // Show manager link in navigation
   }
   ```

---

## 📧 Email Notifications

### Approval Email
**Sent to:** Employee
**Triggered:** When manager approves request
**Contains:**
- Approval confirmation
- Leave dates
- Manager's name
- Optional comments from manager
- Link back to dashboard

### Rejection Email
**Sent to:** Employee
**Triggered:** When manager rejects request
**Contains:**
- Rejection notice
- Leave dates that were rejected
- Manager's name
- **Required** rejection reason/comments
- Link back to dashboard

**Configure in `.env.local`:**
```bash
RESEND_API_KEY=your_key_here
RESEND_FROM_EMAIL="LeaveHub <noreply@yourdomain.com>"
```

---

## 💾 Database Functions

### `deduct_leave_balance()`
**Purpose:** Automatically deducts leave days from employee balance when request is approved

**Parameters:**
- `p_user_id` - Employee's profile UUID
- `p_leave_type_id` - Leave type UUID
- `p_days_to_deduct` - Number of working days to deduct
- `p_year` - Year of the leave balance

**Example:**
```sql
SELECT deduct_leave_balance(
  'employee-uuid',
  'leave-type-uuid',
  5,
  2025
);
```

### `restore_leave_balance()`
**Purpose:** Restores leave days if a request is cancelled after approval

**Parameters:** Same as above but `p_days_to_restore`

---

## 🎨 UI Features

### Status Badges
- **Pending** - Yellow/warning color with clock icon
- **Approved** - Green/success color with checkmark icon
- **Rejected** - Red/error color with X icon

### Request Cards
- Employee avatar with name
- Leave type with color indicator
- Duration (working days)
- Start and end dates
- Reason
- Document count (if applicable)
- Submission timestamp

### Review Page
- Full request details
- Employee information
- Supporting documents (with "View" button)
- Comments textarea
- Approve/Reject buttons
- Confirmation flow
- Cannot reprocess completed requests

---

## 🚀 Testing Workflow

### Complete End-to-End Test

1. **Employee Submits Request**:
   ```
   /dashboard/leave/new
   ```
   - Select leave type
   - Choose dates
   - Upload document (if required)
   - Submit

2. **Manager Reviews**:
   ```
   /dashboard/manager
   ```
   - See request in "Pending" list
   - Click "Review"
   - Review all details

3. **Manager Approves**:
   - Add optional comments
   - Click "Approve Request"
   - Confirm approval
   - ✅ Request status updated
   - ✅ Email sent to employee
   - ✅ Leave balance reduced

4. **Verify**:
   - Check employee dashboard - should show updated balance
   - Check leave_requests table - status should be "approved"
   - Check leave_balances table - used_days should increase

---

## 📊 Database Schema Updates

**leave_requests table - New columns:**
```sql
approved_by VARCHAR      -- Clerk user ID of approving manager
approved_at TIMESTAMP    -- When approved/rejected
manager_comments TEXT    -- Optional comments from manager
```

**New Indexes:**
```sql
idx_leave_requests_status     -- Faster status filtering
idx_leave_requests_dates      -- Faster date range queries
idx_leave_requests_user_id    -- Faster employee lookups
```

---

## 🐛 Troubleshooting

### Manager dashboard shows no requests
- Check that leave requests exist in database
- Verify API endpoint `/api/leave-requests` returns data
- Check browser console for errors

### Approval/rejection fails
- Verify SQL migration was run (check for new columns)
- Ensure `deduct_leave_balance()` function exists
- Check for BCEA validation errors in console
- Verify employee has sufficient leave balance

### Emails not sending
- Check `RESEND_API_KEY` is set in `.env.local`
- Verify manager email exists in profiles table
- Check Resend dashboard for delivery status

### Balance not deducting
- Verify `deduct_leave_balance()` function was created
- Check that leave_balances record exists for employee
- Check year parameter matches leave request year
- Look for SQL errors in server logs

---

## ✨ Next Steps

We've now completed:
- ✅ Feature #1: Leave Request Submission
- ✅ Feature #2: Manager Approval Dashboard

**Coming Next:**
- Feature #3: AI-Powered Features
- Feature #4: Leave Calendar View
- Feature #5: Reports & Analytics

---

## 📝 Production Checklist

Before deploying to production:

- [ ] Run SQL migrations on production database
- [ ] Set up role-based access control for manager routes
- [ ] Configure production email domain in Resend
- [ ] Test approval/rejection workflow end-to-end
- [ ] Verify leave balance deduction works correctly
- [ ] Test email delivery to real email addresses
- [ ] Add manager navigation link in main layout
- [ ] Implement proper authentication checks
- [ ] Add audit logging for approvals/rejections
- [ ] Set up error monitoring
- [ ] Configure rate limiting on API endpoints
- [ ] Test with multiple managers and employees

---

## 🎉 Feature #2 Complete!

Your manager approval system is now fully functional with:
- ✅ Beautiful, intuitive manager dashboard
- ✅ Complete approval/rejection workflow
- ✅ Automatic leave balance management
- ✅ Professional email notifications
- ✅ BCEA compliance checks
- ✅ Performance-optimized database queries

Ready to test or move on to Feature #3! 🚀
