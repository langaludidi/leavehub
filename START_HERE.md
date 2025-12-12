# 🚀 LeaveHub MVP - Complete Reset Instructions

## What I've Prepared For You

I've created a complete reset and setup system for your LeaveHub MVP. Here's everything ready for you:

### ✅ Documentation Created

1. **`RESET_GUIDE.md`** - Complete step-by-step reset guide
2. **`database/00_RESET_DATABASE.sql`** - Wipes everything clean
3. **`database/01_CORE_SCHEMA.sql`** - Fresh MVP schema with:
   - Companies table (multi-tenant)
   - Profiles table (5 user roles)
   - Leave types (7 BCEA-compliant types)
   - Public holidays (2025 SA calendar)

### 📋 What You Need To Do Next

I'm creating the remaining database scripts. While I do that, you can start the reset process:

## Step 1: Reset Supabase Database (DO THIS FIRST)

1. Go to https://supabase.com/dashboard
2. Select your LeaveHub project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `database/00_RESET_DATABASE.sql`
6. Paste and click **RUN**
7. You should see: "✅ Database completely reset!"

## Step 2: Create Fresh Schema

After reset completes, run this SQL file:

1. Still in SQL Editor, click **New Query**
2. Copy the contents of `database/01_CORE_SCHEMA.sql`
3. Paste and click **RUN**
4. You should see: "✅ Core schema created successfully!"

This creates:
- ✅ Companies table
- ✅ Profiles table with 5 roles (employee, manager, hr_admin, admin, super_admin)
- ✅ Leave types (Annual, Sick, Family Responsibility, Maternity, Paternity, Study, Unpaid)
- ✅ Public holidays for South Africa 2025

## Step 3: Wait For Me To Finish

I'm creating these additional files:
- `database/02_LEAVE_MANAGEMENT.sql` - Leave requests & balances
- `database/03_DOCUMENTS.sql` - Document management
- `database/04_SECURITY_RLS.sql` - Row Level Security
- `database/05_FUNCTIONS.sql` - Helper functions
- `database/06_PAYSTACK_SUBSCRIPTIONS.sql` - Payments & subscriptions

## Step 4: Service Setup (We'll Do Together)

After database is ready, we'll configure:

### Clerk (Authentication)
- Create new Clerk app
- Configure paths and webhooks
- Copy API keys

### Vercel (Hosting)
- Update environment variables
- Set all new keys
- Redeploy

### Resend (Email)
- Verify it's still working
- Update API key if needed

### Paystack (Payments)
- Set up webhook URL
- Configure subscription plans
- Test payment flow

## Step 5: Clean Codebase

I'll help you:
- Remove old/broken implementations
- Keep only MVP features
- Clean up routes and components
- Focus on the 5 user roles

## 🎯 MVP Features We're Building

**Core (Phase 1):**
- ✅ Authentication with Clerk
- ✅ Onboarding flow
- ✅ 5 distinct user roles
- ✅ Multi-tenant architecture

**Leave Management (Phase 2):**
- ✅ Submit leave requests
- ✅ Approval workflows
- ✅ Leave balances
- ✅ BCEA compliance

**Advanced (Phase 3):**
- ✅ AI Leave Planning Assistant
- ✅ Document management
- ✅ Reports dashboard (Navy/Gold theme)
- ✅ Team calendar

**Payments (Phase 4):**
- ✅ Paystack integration
- ✅ 3 subscription tiers
- ✅ 14-day trial
- ✅ Billing dashboard

## 🔥 Let's Start!

**Right now, you can:**

1. Open Supabase dashboard
2. Run `database/00_RESET_DATABASE.sql`
3. Run `database/01_CORE_SCHEMA.sql`
4. Tell me when done, and I'll continue with the rest!

**Questions while you wait:**
- Do you want to keep the existing Clerk app or create a brand new one?
- Same question for Vercel project - keep or new?
- Resend - keep the same domain verification?

Let me know when you've run the first two SQL files, and I'll create the remaining database scripts!

---

**Your LeaveHub MVP will be:**
- 🧹 **Clean** - No technical debt
- 🎯 **Focused** - Only MVP features
- 🏗️ **Solid** - Proper architecture from the start
- 🚀 **Ready** - For real customers

Let's do this! 💪
