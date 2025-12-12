# 🚀 Setup Instructions - When You Return

## Current Status ✅

- ✅ Database is completely empty (0 tables)
- ✅ All old tables have been deleted
- ✅ Reset scripts have been committed to git
- ✅ Dev server is running on http://localhost:3001

---

## What You Need to Do (6 SQL Scripts)

Go to **Supabase Dashboard** → **SQL Editor**
(https://supabase.com/dashboard/project/anxdcwmndfiowkfismts/sql)

Run these 6 scripts **IN EXACT ORDER** by copy/pasting the entire file contents:

---

### 1️⃣ **CORE SCHEMA** (Companies, Profiles, Leave Types)

**File:** `database/01_CORE_SCHEMA.sql`

**Expected Success Message:**
```
✅ Core schema created successfully!
```

**What this creates:**
- Companies table
- Profiles table (with company_id column!)
- 5 user roles (employee, manager, hr_admin, admin, super_admin)
- 7 BCEA leave types
- 2025 South African public holidays

---

### 2️⃣ **LEAVE MANAGEMENT** (Requests, Balances, Approvals)

**File:** `database/02_LEAVE_MANAGEMENT.sql`

**Expected Success Message:**
```
✅ Leave management schema created successfully!
```

**What this creates:**
- leave_balances table
- leave_requests table
- leave_request_approvals table
- Auto-update triggers for balances

---

### 3️⃣ **DOCUMENTS** (Document Management System)

**File:** `database/03_DOCUMENTS.sql`

**Expected Success Message:**
```
✅ Document management schema created successfully!
```

**What this creates:**
- documents table (9 categories)
- document_access_logs table
- Auto-link medical certificates trigger

---

### 4️⃣ **SECURITY** (Row Level Security)

**File:** `database/04_SECURITY_RLS.sql`

**Expected Success Message:**
```
✅ Row Level Security policies created successfully!
```

**What this creates:**
- RLS policies on ALL tables
- Multi-tenant data isolation
- Role-based access control

---

### 5️⃣ **FUNCTIONS** (Helper Functions)

**File:** `database/05_FUNCTIONS.sql`

**Expected Success Message:**
```
✅ Helper functions created successfully!
```

**What this creates:**
- calculate_working_days (BCEA-compliant)
- check_leave_balance
- get_team_members
- initialize_employee_leave_balances
- create_default_leave_types_for_company
- And 4 more helper functions

---

### 6️⃣ **PAYSTACK SUBSCRIPTIONS** (Payments)

**File:** `database/06_PAYSTACK_SUBSCRIPTIONS.sql`

**Expected Success Message:**
```
🎉 DATABASE SETUP COMPLETE!
```

**What this creates:**
- subscriptions table
- payments table
- paystack_customers table
- paystack_webhooks table

---

## After Running All 6 Scripts

### ✅ Verify Setup

Run this query in Supabase SQL Editor:
```sql
SELECT COUNT(*) as table_count FROM pg_tables WHERE schemaname = 'public';
```

**Expected result:** 14 tables

---

### ✅ Test Authentication Flow

1. **Clear browser cache** (important!)
2. **Go to:** http://localhost:3001
3. **Click "Sign Up"**
4. **Create a new account** with a test email
5. **After signup**, you should be redirected to `/onboarding`
6. **Fill in company details:**
   - Company Name: "Test Company"
   - Industry: Any
   - Company Size: Any
7. **Click "Complete Setup"**
8. **Expected:** You should be redirected to dashboard with your new company!

---

## If You See Errors

### Error: "Failed to create company"

**Check the browser console (F12) for the actual error message**

Common issues:
- Database scripts didn't run completely
- Missing RLS policies
- Supabase service role key is incorrect

**Debug steps:**
1. Run this query to check if profiles table has company_id:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'profiles'
   ORDER BY ordinal_position;
   ```

2. Check dev server logs (look for errors)

3. Test the API endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/onboarding/complete \
     -H "Content-Type: application/json" \
     -d '{"companyName":"Test"}'
   ```

---

## Quick Reference

**Database:** https://supabase.com/dashboard/project/anxdcwmndfiowkfismts
**Dev Server:** http://localhost:3001
**All Scripts Location:** `/Users/langaludidi/leavehub/database/`

---

## Next Steps After Successful Setup

1. ✅ Test complete user journey (signup → onboarding → dashboard)
2. ✅ Test leave request creation
3. ✅ Test manager approval workflow
4. ✅ Configure Paystack webhook
5. ✅ Test subscription flow

---

**Everything is ready! Just run the 6 SQL scripts in order and test the onboarding flow.** 🚀
