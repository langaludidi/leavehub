# Calendar Integration Setup Guide

This guide explains how to set up Google Calendar and Microsoft Outlook integration for LeaveHub.

## Overview

LeaveHub supports automatic synchronization of approved leave requests with:
- **Google Calendar** - Using Google Calendar API
- **Microsoft Outlook** - Using Microsoft Graph API

When leave requests are approved, they are automatically added as calendar events. When requests are denied or cancelled, the events are removed.

## Prerequisites

1. **Google Calendar Integration**:
   - Google Cloud Console project
   - Google Calendar API enabled
   - OAuth 2.0 credentials configured

2. **Microsoft Outlook Integration**:
   - Microsoft Azure App Registration
   - Microsoft Graph API permissions
   - OAuth 2.0 redirect URI configured

## Setup Instructions

### Google Calendar Integration

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Calendar API

2. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" section
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add your domain to "Authorized JavaScript origins"
   - Add redirect URIs if needed

3. **Get API Key**:
   - In "Credentials" section
   - Click "Create Credentials" > "API key"
   - Restrict the key to Google Calendar API

4. **Environment Variables**:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
   VITE_GOOGLE_API_KEY=your_google_api_key_here
   ```

### Microsoft Outlook Integration

1. **Create Azure App Registration**:
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Set redirect URI to: `https://yourdomain.com/auth/outlook/callback`

2. **Configure API Permissions**:
   - In your app registration, go to "API permissions"
   - Add Microsoft Graph permissions:
     - `Calendars.ReadWrite` (Application or Delegated)
     - `User.Read` (Delegated)

3. **Environment Variables**:
   ```bash
   VITE_OUTLOOK_CLIENT_ID=your_microsoft_app_client_id_here
   ```

## Database Setup

Run the calendar integration migration to add necessary database tables:

```sql
-- Run this SQL in your Supabase SQL editor
\i database-calendar-migration.sql
```

This creates:
- `calendar_integrations` - Store user calendar connections
- `calendar_sync_logs` - Audit trail for sync events
- Adds `calendar_event_ids` column to `leave_requests`
- Adds `calendar_preferences` column to `employee_profiles`

## Features

### Automatic Sync
- **Approved Requests**: Automatically create calendar events
- **Status Changes**: Update or remove events when request status changes
- **Multi-Calendar**: Support for both Google and Outlook simultaneously

### User Preferences
Users can configure:
- Enable/disable automatic sync
- All-day event creation
- Include leave type in event title
- Include reason in event description
- Notification settings

### Privacy & Security
- Calendar tokens are encrypted in database
- Users control their own calendar connections
- Events only contain necessary information
- No sharing of personal calendar data

## Implementation Details

### Components
- `CalendarSync.tsx` - Connection management UI
- `CalendarSettings.tsx` - User preferences page
- `useCalendarIntegration.ts` - Calendar API integration hook
- `useLeaveCalendarSync.ts` - Leave request sync logic

### API Integration
- **Google Calendar**: Uses Google APIs JavaScript client
- **Microsoft Outlook**: Uses Microsoft Graph REST API
- **Authentication**: OAuth 2.0 flows with popup windows

### Error Handling
- Graceful fallback if calendar APIs are unavailable
- User notification for connection failures
- Automatic retry for temporary failures
- Audit logging for troubleshooting

## Usage

### For Employees
1. Go to "Calendar Settings" in the employee dashboard
2. Connect desired calendar providers (Google/Outlook)
3. Configure sync preferences
4. Leave requests will automatically sync when approved

### For Admins
- Calendar integration is user-managed
- Admin can view sync logs for troubleshooting
- No admin setup required once environment variables are configured

## Troubleshooting

### Common Issues

1. **"Failed to load Google API"**
   - Check that `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY` are set
   - Verify Google Calendar API is enabled in Google Cloud Console
   - Check browser console for CORS errors

2. **"Authentication failed"**
   - Verify OAuth client configuration
   - Check redirect URIs match exactly
   - Ensure user has necessary permissions

3. **"Events not syncing"**
   - Check calendar permissions in connected apps
   - Verify user has calendar write permissions
   - Check sync logs in database

### Debug Information

Enable debug logging by checking browser console:
- Calendar connection status
- API call responses
- Error messages with details

## Security Considerations

1. **Token Storage**: Access tokens are encrypted in database
2. **HTTPS Required**: All OAuth flows require HTTPS in production
3. **Scope Limitation**: Only request minimum required permissions
4. **Token Expiration**: Implement proper token refresh logic

## Testing

### Development Setup
1. Copy `.env.example` to `.env.local`
2. Fill in your development API credentials
3. Test with personal Google/Outlook accounts

### Production Deployment
1. Set environment variables in production
2. Configure OAuth redirect URIs for production domain
3. Test with real user accounts
4. Monitor sync logs for issues

## Support

For issues with calendar integration:
1. Check environment variables are properly set
2. Verify API credentials in respective consoles
3. Check database logs in `calendar_sync_logs` table
4. Review browser console for client-side errors