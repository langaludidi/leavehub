# 🚀 LeaveHub Database Setup Guide

**Project Restored:** `anxdcwmndfiowkfismts` ✅

---

## Quick Setup (5 minutes)

### Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/anxdcwmndfiowkfismts
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Database Migrations

Copy and paste the contents of these files **in order** into the SQL Editor and run them:

#### 1️⃣ **Core Schema** (Required)
```sql
-- File: DATABASE_SETUP_FIXED.sql
-- Creates: companies, profiles, leave_types, leave_balances,
--          leave_requests, public_holidays, departments
-- Includes: Demo data for testing
```

**How to run:**
```bash
# Open the file in your editor
code DATABASE_SETUP_FIXED.sql

# Or view in terminal
cat DATABASE_SETUP_FIXED.sql

# Copy the entire contents and paste into Supabase SQL Editor
# Click "Run" or press Cmd+Enter
```

#### 2️⃣ **Notifications** (Required)
```sql
-- File: NOTIFICATIONS_TABLE.sql
-- Creates: notifications table with triggers
```

#### 3️⃣ **Company Settings** (Optional but recommended)
```sql
-- File: COMPANY_SETTINGS.sql
-- Creates: Working days, holidays, policies
```

#### 4️⃣ **Storage Setup** (Optional - for file uploads)
```sql
-- File: supabase-storage-setup.sql
-- Creates: Storage buckets for leave documents
```

---

## Alternative: Quick Setup Script

I can create a single consolidated SQL file for you to run:

**Option A: Via Supabase Dashboard**
1. Open SQL Editor
2. Paste the consolidated script
3. Run it

**Option B: Via Command Line** (if you have Supabase CLI)
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref anxdcwmndfiowkfismts

# Run migrations
supabase db push
```

---

## What Gets Created

### Tables (8 total)
- ✅ `companies` - Organization data
- ✅ `profiles` - User profiles (linked to Clerk)
- ✅ `leave_types` - Leave categories (Annual, Sick, etc.)
- ✅ `leave_balances` - User leave balances per type
- ✅ `leave_requests` - Leave request records
- ✅ `public_holidays` - Holiday calendar
- ✅ `departments` - Department information
- ✅ `notifications` - User notifications

### Demo Data Included
- 1 Demo company
- 4 Test users (1 employee, 3 team members, 1 manager)
- 9 Leave types (Annual, Sick, Family, Maternity, etc.)
- South African public holidays for 2025

---

## Verification Steps

After running the migrations:

### 1. Check Tables Created
In Supabase dashboard:
- Go to **Table Editor**
- You should see all 8 tables listed

### 2. Run Persistence Test
```bash
cd /Users/langaludidi/leavehub
node scripts/persistence-test.js
```

Expected output:
```
✅ Database connection successful
✅ Table 'companies' exists
✅ Table 'profiles' exists
✅ Table 'leave_types' exists
... (all 8 tables)
✅ Retrieved X profile(s) from database
✅ Foreign key relationships working
✅ All tests passed!
```

### 3. Start the Application
```bash
npm run dev
```

Visit: http://localhost:3000

---

## Troubleshooting

### Issue: "Table already exists"
**Solution:** The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to re-run.

### Issue: "Permission denied"
**Solution:** Make sure you're using the SQL Editor in Supabase dashboard, not a regular SQL client.

### Issue: "Foreign key violation"
**Solution:** Run the scripts in order. The companies table must be created before profiles.

### Issue: Still seeing errors in persistence test
**Solution:**
```bash
# Clear Supabase cache
# In SQL Editor, run:
SELECT pg_reload_conf();

# Then re-run test
node scripts/persistence-test.js
```

---

## Next Steps After Setup

1. ✅ Verify all tables created
2. ✅ Run persistence test (should pass all checks)
3. ✅ Test the application locally
4. 🔧 Update Anthropic API key for AI features
5. 🚀 Deploy to production

---

## Quick Reference

### Project Details
- **Project ID:** anxdcwmndfiowkfismts
- **URL:** https://anxdcwmndfiowkfismts.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/anxdcwmndfiowkfismts

### Test Commands
```bash
# Full persistence test
node scripts/persistence-test.js

# Quick table check
node scripts/check-tables.js

# Build application
npm run build

# Start dev server
npm run dev
```

---

**Need Help?** Run the persistence test after setup and it will tell you exactly what's working and what needs attention!
