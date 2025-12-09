# Clerk Webhook Setup Guide

This guide will help you set up Clerk webhooks to automatically create user profiles when users sign up.

## Step 1: Get Your Webhook Secret

1. Go to the [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**

## Step 2: Configure the Endpoint

1. **Endpoint URL**: Enter your production URL:
   ```
   https://leavehub.co.za/api/webhooks/clerk
   ```

   For local testing with ngrok:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/clerk
   ```

2. **Subscribe to events**:
   - ✓ `user.created`
   - ✓ `user.updated`
   - ✓ `user.deleted`

3. Click **Create**

## Step 3: Copy the Webhook Secret

1. After creating the endpoint, Clerk will show you a **Signing Secret**
2. Copy this secret (starts with `whsec_...`)

## Step 4: Add to Environment Variables

Add the secret to your `.env.local` file:

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

Also add it to your Vercel environment variables:

```bash
vercel env add CLERK_WEBHOOK_SECRET
```

## Step 5: Verify Setup

1. Deploy your application with the new webhook handler
2. Test by creating a new user via sign-up
3. Check Clerk Dashboard > Webhooks > Your Endpoint > Events to see webhook calls
4. Check your Supabase profiles table to verify the profile was created

## Troubleshooting

### Webhook not triggering?
- Check that the endpoint URL is correct and accessible
- Verify the webhook secret is correctly set in environment variables
- Check Vercel logs for any errors
- Ensure the `/api/webhooks` route is included in `middleware.ts` public routes

### Profile not created?
- Check Supabase logs for any database errors
- Verify the `profiles` table has the correct schema with `role` column
- Run the role migration SQL if not already applied
- Check that SUPABASE_SERVICE_ROLE_KEY has permission to insert into profiles

### Testing locally with ngrok:
```bash
# Install ngrok if you haven't already
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in Clerk webhook settings
```

## What Happens When a User Signs Up

1. User completes sign-up in Clerk
2. Clerk sends a `user.created` webhook to your endpoint
3. Your webhook handler (`/api/webhooks/clerk/route.ts`) receives the event
4. A profile is created in Supabase with:
   - `clerk_user_id`: User's Clerk ID
   - `email`: User's email
   - `first_name` & `last_name`: From Clerk profile
   - `role`: Default `employee`
   - `company_id`: Demo company (customize for multi-tenant)
5. User can now access the dashboard with their assigned role

## Default Roles

All new users are assigned the `employee` role by default. To change a user's role:

1. Use the Admin dashboard (coming in Part 2)
2. Or make an API call to `/api/admin/users/[userId]/role`
3. Only Admins and Super Admins can change roles

## Role Hierarchy

- **Employee** (Level 1): Basic user, can submit leave requests
- **Manager** (Level 2): Can approve team leave requests
- **HR Admin** (Level 3): Can manage all leave, users, policies
- **Admin** (Level 4): Can manage organization settings
- **Super Admin** (Level 5): Platform-wide access
