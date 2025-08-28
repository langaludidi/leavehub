# Manual Vercel Deployment Steps

## Prerequisites Complete ✅
- [x] Vercel CLI installed
- [x] Production build ready
- [x] Configuration files created
- [x] Environment variables documented

## Next Steps (Complete These Manually):

### 1. Login to Vercel
```bash
vercel login
```
Choose your preferred login method (GitHub recommended)

### 2. Deploy the Project
```bash
vercel --prod
```
This will:
- Prompt you to link the project
- Upload the build files
- Deploy to production
- Provide you with a live URL

### 3. Set Environment Variables in Vercel Dashboard

Go to your project on [vercel.com](https://vercel.com) → Settings → Environment Variables

**Required Variables:**
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Optional Variables (for additional features):**
```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_OUTLOOK_CLIENT_ID=your_microsoft_app_client_id_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
VITE_APP_URL=https://your-app.vercel.app
```

### 4. Redeploy After Setting Environment Variables
```bash
vercel --prod
```

## Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import from GitHub (recommended - connect your repository)
3. Vercel will auto-detect Vite settings
4. Add environment variables in project settings
5. Deploy

## What You'll Get After Deployment

✅ **Live URLs:**
- Main App: `https://your-app.vercel.app`
- Admin Dashboard: `https://your-app.vercel.app/admin`
- Super Admin Dashboard: `https://your-app.vercel.app/super-admin`

✅ **Features Working:**
- Employee leave management
- Admin organization management  
- Super admin multi-tenant monitoring
- Revenue tracking (R10,510 MRR)
- Role-based access control
- Responsive design

## Testing After Deployment

1. Visit your live URL
2. Test user authentication
3. Access admin features at `/admin`
4. Access super admin features at `/super-admin`
5. Test leave request functionality
6. Verify responsive design on mobile

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Check browser console for errors
4. Ensure Supabase configuration is correct

Your LeaveHub app is ready for production! 🚀