# 🚀 LeaveHub Setup Guide

## ✅ What's Been Built

Your LeaveHub application is now running at **http://localhost:3000** with the following features:

### 1. **Frontend Application**
- ✅ Next.js 16 with TypeScript and Turbopack
- ✅ Tailwind CSS v4 with LeaveHub design system (teal primary color)
- ✅ 14 shadcn/ui components installed
- ✅ Responsive homepage with hero section
- ✅ Sign-in and sign-up pages (split-screen design)
- ✅ Protected dashboard route

### 2. **Authentication Setup**
- ✅ Clerk authentication integrated
- ✅ Authentication middleware protecting routes
- ✅ Sign-in page: http://localhost:3000/sign-in
- ✅ Sign-up page: http://localhost:3000/sign-up
- ⚠️ **NOTE:** Clerk domain issue needs resolving (see Step 3 below)

### 3. **Database Setup**
- ✅ Supabase client utilities created
- ✅ BCEA-compliant database schema ready
- ✅ Row Level Security policies included
- ⏳ **Next:** Run the SQL schema in Supabase

---

## 📋 Next Steps to Complete Setup

### Step 1: Set Up Supabase Database

1. Go to https://supabase.com/dashboard
2. Select your project: `anxdcwmndfiowkfismts`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file: `/Users/langaludidi/leavehub/database-setup.sql`
6. Copy the entire SQL code
7. Paste it into the Supabase SQL Editor
8. Click **Run** or press `Cmd + Enter`
9. Wait for "Success. No rows returned" message

**What this does:**
- Creates all tables (companies, profiles, leave_types, leave_balances, etc.)
- Adds South African public holidays for 2025
- Sets up Row Level Security policies
- Creates helper functions for calculating working days
- Adds indexes for performance

### Step 2: Create Your Company

After running the schema, create your company:

```sql
-- In Supabase SQL Editor, run:
INSERT INTO companies (name, slug, work_days_per_week)
VALUES ('Your Company Name', 'your-company', 5)
RETURNING id;
```

**Copy the company ID** that's returned - you'll need it for the next step.

### Step 3: Add Default Leave Types

Replace `{company_id}` with your actual company ID from Step 2:

```sql
INSERT INTO leave_types (company_id, name, code, description, days_per_year, accrual_method, paid, bcea_compliant, color) VALUES
('{company_id}', 'Annual Leave', 'ANN', '21 days per year (BCEA Section 20)', 21, 'monthly', true, true, '#0D9488'),
('{company_id}', 'Sick Leave', 'SICK', '30 days per 3-year cycle (BCEA Section 22)', 10, 'none', true, true, '#EF4444'),
('{company_id}', 'Family Responsibility', 'FAM', '3 days per year (BCEA Section 27)', 3, 'annual', true, true, '#F59E0B'),
('{company_id}', 'Maternity Leave', 'MAT', '4 months unpaid (BCEA Section 25)', 120, 'none', false, true, '#EC4899'),
('{company_id}', 'Parental Leave', 'PAR', '10 consecutive days (BCEA Section 25A)', 10, 'none', false, true, '#8B5CF6');
```

### Step 4: Fix Clerk Authentication (CRITICAL)

**Current Issue:** Your Clerk keys are tied to "soulbridge.co.za" domain.

**Solution:** Create a new Clerk application for LeaveHub:

1. Go to https://dashboard.clerk.com
2. Click **"+ Create application"**
3. Name it: **"LeaveHub"**
4. Select authentication methods: **Email**, **Google**, etc.
5. Click **Create Application**
6. Copy the new keys (they'll be different from current ones):
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
7. Update `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_new_pk_test_key>
   CLERK_SECRET_KEY=<your_new_sk_test_key>
   ```
8. Restart your dev server: `npm run dev`

### Step 5: Set Up Clerk Webhook (Sync Users to Supabase)

1. In Clerk Dashboard → **Webhooks**
2. Click **Add Endpoint**
3. Endpoint URL: `http://localhost:3000/api/webhooks/clerk` (for dev)
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret**
6. Add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

---

## 🧪 Testing Your Setup

Once Steps 1-4 are complete:

1. **Visit homepage**: http://localhost:3000
2. **Click "Get Started"**
3. **Create an account** with your email
4. **Verify you're redirected** to http://localhost:3000/dashboard
5. **See your user info** displayed

---

## 📁 Project Structure

```
leavehub/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── layout.tsx (ClerkProvider)
│   │   ├── page.tsx (Homepage)
│   │   └── globals.css (Design system)
│   ├── components/
│   │   └── ui/ (14 shadcn components)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts
│   └── middleware.ts (Auth protection)
├── database-setup.sql (Run in Supabase)
├── .env.local (Environment variables)
└── package.json
```

---

## 🔧 Environment Variables

Your `.env.local` should have:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://anxdcwmndfiowkfismts.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Anthropic AI (for future AI features)
ANTHROPIC_API_KEY=sk-ant-api03-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🎨 Design System

### Colors
- **Primary:** `#0D9488` (Teal)
- **Success:** `#10B981` (Green)
- **Warning:** `#F59E0B` (Orange)
- **Error:** `#EF4444` (Red)

### Components
All UI components are from shadcn/ui with custom styling:
- Button, Card, Input, Label, Select
- Dialog, Dropdown Menu, Avatar, Badge
- Calendar, Progress, Separator, Tabs, Sonner (toasts)

---

## 🚀 What to Build Next

### Phase 1: Core Features (Week 1-2)
1. ✅ Homepage and authentication (DONE)
2. ⏳ Employee dashboard with real data from Supabase
3. ⏳ Leave balance widgets showing actual balances
4. ⏳ Leave request submission form
5. ⏳ Leave history page

### Phase 2: Manager Features (Week 3)
1. ⏳ Manager approval queue
2. ⏳ Team calendar view
3. ⏳ Leave request approval/rejection

### Phase 3: AI Features (Week 4-5)
1. ⏳ AI Smart Leave Planner (suggests optimal dates)
2. ⏳ AI Approval Assistant (recommends approve/reject)
3. ⏳ Document Analysis (OCR for medical certificates)

### Phase 4: Admin & Advanced (Week 6-8)
1. ⏳ Admin dashboard
2. ⏳ User management
3. ⏳ Reports and analytics
4. ⏳ Company settings

---

## 📞 Support

### Common Issues

**1. Clerk authentication not working**
- Make sure you created a NEW Clerk application (not using soulbridge keys)
- Verify keys are test keys (`pk_test_`, `sk_test_`)
- Restart dev server after updating `.env.local`

**2. Supabase connection failed**
- Verify URL and keys in `.env.local`
- Check Supabase project is active
- Ensure database schema has been run

**3. Build errors**
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`

### Documentation
- **Clerk Docs:** https://clerk.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## ✅ Checklist

- [ ] Supabase database schema executed
- [ ] Company created in database
- [ ] Default leave types added
- [ ] New Clerk application created for LeaveHub
- [ ] Clerk keys updated in `.env.local`
- [ ] Dev server restarted
- [ ] Authentication tested (can sign up/sign in)
- [ ] Dashboard loads successfully

---

## 🎉 You're Ready to Build!

Once all steps are complete, you have a solid foundation for building the full LeaveHub system. The next major task is connecting the dashboard to real Supabase data and building out the leave management features.

**Happy coding! 🚀**
