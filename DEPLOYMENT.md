# LeaveHub Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Set up at [supabase.com](https://supabase.com)
3. **GitHub Repository** (optional but recommended)

## Step 1: Environment Variables

Before deploying, you'll need to set up these environment variables in Vercel:

### Required Variables:
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Optional Variables (for additional features):
```bash
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_OUTLOOK_CLIENT_ID=your_microsoft_app_client_id_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
VITE_APP_URL=https://your-app.vercel.app
```

## Step 2: Deploy Options

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Vite settings
4. Add environment variables in project settings
5. Deploy

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable from the list above
4. Redeploy if needed

## Step 4: Database Setup

1. Run the database migrations in your Supabase project:
   - `database-setup.sql`
   - `database-leave-policies-migration.sql` 
   - `database-notifications-migration.sql`
   - `database-onboarding-wizard.sql`

2. Set up Row Level Security (RLS) policies in Supabase
3. Configure authentication providers if needed

## Step 5: Domain Configuration (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Post-Deployment Checklist

- [ ] Verify app loads at production URL
- [ ] Test user authentication flows
- [ ] Verify admin dashboard access (`/admin`)
- [ ] Verify super admin dashboard access (`/super-admin`)
- [ ] Test leave request functionality
- [ ] Check responsive design on mobile
- [ ] Verify all environment variables are set correctly

## Troubleshooting

### Build Errors
- Check TypeScript errors in build logs
- Ensure all environment variables are prefixed with `VITE_`

### Runtime Errors
- Check browser console for errors
- Verify Supabase connection
- Check network tab for failed API calls

### Authentication Issues
- Verify Supabase auth configuration
- Check redirect URLs in auth provider settings
- Ensure CORS is configured correctly

## Key Features Available After Deployment

✅ **Employee Features**
- Leave request submission
- Request history and status
- Calendar integration
- Notification preferences

✅ **Admin Features**
- Employee management
- Leave approvals
- Policy configuration
- Reporting and analytics

✅ **Super Admin Features** (`/super-admin`)
- Multi-tenant monitoring
- Revenue tracking (R10,510 MRR)
- Organization management
- Usage analytics

## Support

For deployment issues, check:
1. Vercel deployment logs
2. Browser developer console
3. Supabase logs
4. Network requests in dev tools