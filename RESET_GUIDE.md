# LeaveHub MVP - Complete Reset & Setup Guide

## Overview
This guide will help you completely reset and set up LeaveHub from scratch with a clean, focused MVP implementation.

---

## Phase 1: Clean Slate - Database Reset

### Step 1: Reset Supabase Database

**Go to Supabase Dashboard:**
1. Navigate to https://supabase.com/dashboard
2. Select your LeaveHub project
3. Go to **SQL Editor**
4. Run the reset script: `database/00_RESET_DATABASE.sql`

This will:
- Drop all existing tables
- Drop all existing functions
- Drop all existing policies
- Drop all existing types
- Give you a completely clean database

---

## Phase 2: Fresh Database Schema

### Step 2: Create Fresh MVP Schema

**In Supabase SQL Editor, run these in order:**

1. `database/01_CORE_SCHEMA.sql` - Core tables (companies, profiles, leave types)
2. `database/02_LEAVE_MANAGEMENT.sql` - Leave requests and balances
3. `database/03_DOCUMENTS.sql` - Document management
4. `database/04_SECURITY_RLS.sql` - Row Level Security policies
5. `database/05_FUNCTIONS.sql` - Helper functions

---

## Phase 3: Service Configuration

### Step 3: Clerk Authentication Setup

**Create New Clerk Application:**

1. Go to https://dashboard.clerk.com
2. Click **"Add Application"**
3. Name: `LeaveHub MVP`
4. Select authentication methods:
   - ✅ Email & Password
   - ✅ Email verification required
5. Click **Create Application**

**Configure Clerk:**

1. **Paths** (in Clerk Dashboard → Paths):
   - Sign-in path: `/sign-in`
   - Sign-up path: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/onboarding`

2. **Webhooks** (in Clerk Dashboard → Webhooks):
   - Endpoint URL: `https://leavehub.co.za/api/webhooks/clerk`
   - Subscribe to events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - Copy the **Signing Secret**

3. **Copy API Keys:**
   - Publishable Key: `pk_test_...`
   - Secret Key: `sk_test_...`
   - Webhook Secret: `whsec_...`

---

### Step 4: Vercel Deployment Setup

**Configure Vercel Environment Variables:**

1. Go to https://vercel.com/dashboard
2. Select LeaveHub project
3. Go to **Settings → Environment Variables**
4. Add ALL variables from `.env.example` (see below)

**Required Environment Variables:**

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Resend Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=LeaveHub <hello@yourdomain.com>

# Paystack (South African Payments)
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

# App Configuration
NEXT_PUBLIC_APP_URL=https://leavehub.co.za
NODE_ENV=production
```

5. Click **Save**
6. Redeploy the application

---

### Step 5: Resend Email Setup

**Configure Resend:**

1. Go to https://resend.com/dashboard
2. **Add Domain** (if not already done):
   - Domain: `leavehub.co.za`
   - Follow DNS verification steps
3. **Create API Key**:
   - Name: `LeaveHub Production`
   - Permission: Full Access
   - Copy the API key
4. **Verify Sender Email**:
   - Add: `hello@leavehub.co.za`
   - Verify via email confirmation

---

## Phase 4: MVP Feature Checklist

### Core Features to Implement (In Order):

**✅ Phase 1: Authentication & User Management**
- [ ] Clerk authentication integration
- [ ] Onboarding flow for new companies
- [ ] User profile creation
- [ ] Role-based access control (5 roles)

**✅ Phase 2: Leave Management Core**
- [ ] Leave request submission
- [ ] Leave approval workflow
- [ ] Leave balance tracking
- [ ] BCEA compliance rules

**✅ Phase 3: Dashboard & UI**
- [ ] Employee dashboard
- [ ] Manager dashboard
- [ ] HR Admin dashboard
- [ ] Teal (#17B2A7) design system

**✅ Phase 4: Advanced Features**
- [ ] AI Leave Planning Assistant
- [ ] Document management
- [ ] Reports dashboard (Navy/Gold theme)
- [ ] Team calendar

**✅ Phase 5: Payments & Subscription**
- [ ] Paystack integration
- [ ] Subscription plans (Starter/Professional/Enterprise)
- [ ] Trial management (14 days)
- [ ] Billing dashboard

---

## Phase 5: Testing Checklist

### Test Complete User Journey:

1. **New Company Signup:**
   - [ ] Sign up with email
   - [ ] Email verification works
   - [ ] Onboarding flow completes
   - [ ] Company + profile created in database
   - [ ] Redirects to dashboard

2. **Employee Flow:**
   - [ ] Submit leave request
   - [ ] View leave balances
   - [ ] Check team calendar
   - [ ] Upload documents

3. **Manager Flow:**
   - [ ] Receive leave request notification
   - [ ] Approve/reject leave
   - [ ] View team reports

4. **HR Admin Flow:**
   - [ ] Add new employees
   - [ ] Configure leave policies
   - [ ] Generate reports

5. **Payments:**
   - [ ] Select subscription plan
   - [ ] Paystack payment flow
   - [ ] Subscription activated
   - [ ] Webhook updates database

---

## Phase 6: Go-Live Checklist

### Pre-Launch:
- [ ] All database migrations run successfully
- [ ] All environment variables set correctly
- [ ] Clerk webhook responding (test in dashboard)
- [ ] Resend emails sending successfully
- [ ] Paystack test payment successful
- [ ] All 5 user roles tested
- [ ] Mobile responsive verified
- [ ] SEO meta tags configured

### Launch:
- [ ] Switch Clerk to production mode
- [ ] Switch Paystack to live keys
- [ ] Update DNS if needed
- [ ] Monitor error logs
- [ ] Test production signup flow

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Database migrations (Supabase)
# Run SQL files in Supabase SQL Editor in order

# Deploy to Vercel
git push origin main  # Auto-deploys

# Check logs
vercel logs https://leavehub.co.za

# Environment variables
vercel env pull  # Pull from Vercel
vercel env add   # Add new variable
```

---

## Support & Troubleshooting

### Common Issues:

**"Profile not found" error:**
- Check Clerk webhook is configured
- Verify webhook secret matches
- Check Supabase service role key

**Email not sending:**
- Verify Resend API key
- Check domain verification
- Check sender email is verified

**Payment failing:**
- Verify Paystack keys (test vs live)
- Check webhook URL is accessible
- Verify webhook signature

**Database permission errors:**
- Check RLS policies are created
- Verify Supabase anon key
- Check JWT claims configuration

---

## Next Steps After Reset

1. Run database reset script
2. Create fresh schema
3. Configure Clerk
4. Update Vercel env variables
5. Test authentication flow
6. Implement core features one by one
7. Test thoroughly
8. Go live!

---

**Let's build a clean, focused MVP! 🚀**
