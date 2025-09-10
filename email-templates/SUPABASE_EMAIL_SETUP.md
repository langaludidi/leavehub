# Supabase Email Template Configuration Guide

This guide explains how to implement the custom LeaveHub branded email templates in your Supabase project.

## Overview

LeaveHub includes custom email templates that replace the default Supabase branding with professional LeaveHub branding. The templates include:

- **confirm-signup.html**: Account confirmation email
- **recovery.html**: Password reset email  
- **magic-link.html**: Magic link sign-in email
- **invite.html**: Organization invitation email

## Implementation Steps

### 1. Upload Logo Assets

First, ensure the LeaveHub logos are accessible:
- `/public/leavehub-logo.svg` - Standard logo for light backgrounds
- `/public/leavehub-logo-white.svg` - White logo for dark email backgrounds

### 2. Configure Supabase Auth Settings

In your Supabase Dashboard:

1. Go to **Authentication > Settings**
2. Scroll to **Email Templates** section
3. For each template type, replace the default HTML with our custom templates

### 3. Template Configuration

#### Confirm Signup Template
```html
<!-- Use content from confirm-signup.html -->
<!-- This template uses gradient backgrounds and professional styling -->
<!-- Key variables: {{ .ConfirmationURL }} -->
```

#### Password Recovery Template  
```html
<!-- Use content from recovery.html -->
<!-- Red/warning theme for security-focused messaging -->
<!-- Key variables: {{ .ConfirmationURL }} -->
```

#### Magic Link Template
```html
<!-- Use content from magic-link.html -->
<!-- Green theme for positive, secure sign-in experience -->
<!-- Key variables: {{ .ConfirmationURL }} -->
```

#### Invite User Template
```html
<!-- Use content from invite.html -->
<!-- Purple theme for invitation/welcome experience -->
<!-- Key variables: {{ .ConfirmationURL }}, {{ .Data.OrganizationName }}, {{ .Data.Role }}, {{ .Data.InvitedBy }} -->
```

### 4. Template Variables

Supabase provides these template variables:

| Variable | Description |
|----------|-------------|
| `{{ .Email }}` | Recipient's email address |
| `{{ .ConfirmationURL }}` | Confirmation/action URL |
| `{{ .Token }}` | Authentication token |
| `{{ .Type }}` | Email type (signup, recovery, etc.) |
| `{{ .SiteURL }}` | Your site URL |
| `{{ .Data.* }}` | Custom data passed to email |

### 5. SMTP Configuration

For production, configure custom SMTP settings:

1. Go to **Authentication > Settings**
2. Scroll to **SMTP Settings**
3. Configure your email service:
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your email account
   - **SMTP Pass**: Your email password/app password
   - **Sender Email**: noreply@yourdomain.com
   - **Sender Name**: LeaveHub

### 6. Email Sender Configuration

Recommended sender settings:
```
From Name: LeaveHub
From Email: noreply@leavehub.com
Reply-To: support@leavehub.com
```

### 7. Testing Email Templates

After configuration:

1. Test signup flow with new user
2. Test password reset functionality
3. Test magic link sign-in
4. Test organization invitations
5. Check email delivery and formatting across email clients

### 8. Email Client Compatibility

Our templates are tested for:
- Gmail (Web, Mobile)
- Outlook (Web, Desktop, Mobile)
- Apple Mail
- Yahoo Mail
- Thunderbird

### 9. Security Considerations

The templates include:
- CSP-friendly styling (inline CSS)
- Security messaging for password resets
- Clear expiration times for links
- Professional appearance to avoid spam filters

### 10. Customization Options

To customize the templates further:

1. **Colors**: Update the gradient color stops in the CSS
2. **Logo**: Replace the SVG logo with your custom logo
3. **Content**: Modify the messaging and copy
4. **Branding**: Update company name and contact information

### 11. Troubleshooting

Common issues:
- **Images not loading**: Ensure logos are publicly accessible
- **Styling broken**: Use inline CSS, avoid external stylesheets
- **Variables not working**: Check Supabase template variable syntax
- **Emails in spam**: Configure proper SPF, DKIM, DMARC records

### 12. Production Checklist

Before going live:
- [ ] All templates configured in Supabase
- [ ] SMTP settings configured
- [ ] Test emails sent successfully
- [ ] Email deliverability checked
- [ ] SPF/DKIM records configured
- [ ] Logo URLs accessible
- [ ] Contact information updated
- [ ] Legal compliance checked (CAN-SPAM, GDPR)

## Support

For support with email template implementation:
- Email: support@leavehub.com
- Documentation: https://leavehub.com/docs
- Supabase Docs: https://supabase.io/docs/guides/auth/auth-email-templates