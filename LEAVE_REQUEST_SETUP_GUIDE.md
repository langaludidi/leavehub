# Leave Request Submission System - Setup Guide

## Overview

The leave request submission system has been fully implemented with the following features:
- ✅ Form validation with BCEA compliance checking
- ✅ File upload to Supabase Storage
- ✅ Database integration for storing leave requests
- ✅ Email notifications to managers
- ✅ Success confirmation page

## Setup Steps

### 1. Configure Supabase Storage

Run the SQL script to create the storage bucket and set up security policies:

```bash
# Open your Supabase project SQL Editor and run:
cat supabase-storage-setup.sql
```

This will:
- Create the `leave-documents` storage bucket
- Set up Row Level Security (RLS) policies
- Add `document_paths` column to `leave_requests` table

### 2. Configure Email Notifications (Resend)

1. **Sign up for Resend** (if you haven't already):
   - Go to https://resend.com
   - Create a free account (100 emails/day free tier)

2. **Get your API key**:
   - Go to API Keys in your Resend dashboard
   - Create a new API key
   - Copy the key

3. **Add to environment variables**:
   ```bash
   # Add to .env.local
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL="LeaveHub <noreply@yourdomain.com>"
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
   ```

4. **Verify your domain** (for production):
   - In Resend dashboard, go to Domains
   - Add your domain and follow DNS verification steps
   - Update `RESEND_FROM_EMAIL` with your verified domain

### 3. Test the System

#### Test Leave Request Submission

1. **Navigate to the leave request form**:
   ```
   http://localhost:3000/dashboard/leave/new
   ```

2. **Fill out the form**:
   - Select a leave type (try "Sick Leave - 3 days" to test document requirements)
   - Choose start and end dates
   - Enter a reason
   - Upload a document if required
   - Submit the form

3. **Expected flow**:
   - Form validates and shows any errors
   - On success, redirects to `/dashboard/leave/success?id=xxx`
   - Leave request saved to database
   - Files uploaded to Supabase Storage
   - Email sent to manager (if configured)

#### Test Different Leave Types

**Sick Leave (2 days)**:
- ✅ No document required
- Should submit successfully

**Sick Leave (3+ days)**:
- ⚠️ Medical certificate required
- File upload component appears
- Cannot submit without uploading document

**Family Responsibility Leave**:
- ⚠️ Proof document required
- Max 3 days per year (BCEA Section 27)

**Maternity Leave**:
- ⚠️ Medical confirmation required
- Max 120 days (BCEA Section 25)

**Surrogacy Leave**:
- ⚠️ High Court registered surrogacy agreement required
- Max 10 weeks

### 4. Database Schema

The system uses these tables:

```sql
-- leave_requests table
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
leave_type_id UUID REFERENCES leave_types(id)
start_date DATE
end_date DATE
total_days INTEGER
working_days INTEGER
reason TEXT
status VARCHAR (pending, approved, rejected)
document_paths TEXT[] -- Array of file paths in storage
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 5. File Storage Structure

Files are stored in Supabase Storage with this structure:

```
leave-documents/
├── {user_id}/
│   ├── {timestamp}_{filename}.pdf
│   ├── {timestamp}_{filename}.jpg
│   └── ...
```

- User ID ensures data isolation
- Timestamp prevents filename collisions
- RLS policies ensure users can only access their own files

## API Endpoints

### POST /api/leave-requests
Submit a new leave request

**Body** (multipart/form-data):
```typescript
{
  userId: string;
  leaveTypeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  workingDays: number;
  documents: File[]; // Optional array of files
}
```

**Response**:
```typescript
{
  success: true;
  leaveRequest: {
    id: string;
    // ... other fields
  };
  message: string;
}
```

### GET /api/leave-requests
Fetch leave requests

**Query params**:
- `userId` (optional): Filter by user
- `status` (optional): Filter by status (pending, approved, rejected)

**Response**:
```typescript
{
  leaveRequests: Array<{
    id: string;
    start_date: string;
    end_date: string;
    working_days: number;
    reason: string;
    status: string;
    document_paths: string[];
    leave_types: {
      name: string;
      code: string;
      color: string;
    };
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
    };
  }>;
}
```

## Email Notifications

### Manager Notification
Sent when a leave request is submitted:
- Professional HTML template
- Shows all request details
- "Review Request" button linking to manager dashboard
- Includes BCEA-compliant leave type information

### Employee Notification
Sent when request is approved/rejected:
- Status-colored design (green for approved, red for rejected)
- Shows approval/rejection reason
- Link back to dashboard

## Troubleshooting

### Files not uploading
- Check Supabase Storage bucket exists: `leave-documents`
- Verify RLS policies are configured
- Check browser console for errors
- Ensure file size < 10MB

### Emails not sending
- Verify `RESEND_API_KEY` is set in `.env.local`
- Check Resend dashboard for error logs
- Ensure manager email exists in profiles table
- For production, verify domain in Resend

### Database errors
- Run `supabase-storage-setup.sql` to ensure schema is up-to-date
- Check `document_paths` column exists on `leave_requests` table
- Verify demo user exists in `profiles` table

### Form validation errors
- Ensure leave types are loaded (check console)
- Verify working days calculation is correct
- Check BCEA validation rules in `leave-types-logic.ts`

## Next Steps

✅ **Completed: Leave Request Submission System**

**Coming Next:**
1. Manager Approval Dashboard
   - View pending requests
   - Approve/reject with comments
   - Team calendar view

2. AI-Powered Features
   - Smart leave planning
   - Conflict detection
   - Document validation

3. Leave Calendar View
   - Visual calendar
   - Team availability
   - Public holidays

4. Reports & Analytics
   - Leave usage reports
   - BCEA compliance tracking
   - Export functionality

## Production Checklist

Before deploying to production:

- [ ] Run SQL migrations on production Supabase
- [ ] Configure Resend with verified domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Set up proper authentication (replace demo-user-123)
- [ ] Configure manager role assignment
- [ ] Test file upload with production storage
- [ ] Test email delivery to actual email addresses
- [ ] Set up monitoring for failed requests
- [ ] Configure proper error handling and logging
- [ ] Add rate limiting to API endpoints
- [ ] Implement proper security headers
- [ ] Test on mobile devices

## Support

For issues or questions:
- Check browser console for errors
- Review server logs (npm run dev output)
- Check Supabase logs in dashboard
- Verify environment variables are set correctly
