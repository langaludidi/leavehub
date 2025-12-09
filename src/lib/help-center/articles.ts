// Help Center Articles Database

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: 'Rocket',
    description: 'Learn the basics of LeaveHub',
  },
  {
    id: 'leave-management',
    name: 'Leave Management',
    icon: 'Calendar',
    description: 'Submit and manage leave requests',
  },
  {
    id: 'ai-features',
    name: 'AI Features',
    icon: 'Sparkles',
    description: 'Leverage AI for smart planning',
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'FileText',
    description: 'Upload and manage documents',
  },
  {
    id: 'bcea-compliance',
    name: 'BCEA Compliance',
    icon: 'Scale',
    description: 'South African labor law info',
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    icon: 'AlertCircle',
    description: 'Common issues and solutions',
  },
];

export const articles: HelpArticle[] = [
  // Getting Started (5 articles)
  {
    id: '1',
    title: 'Welcome to LeaveHub',
    category: 'getting-started',
    content: `# Welcome to LeaveHub

LeaveHub is South Africa's leading BCEA-compliant leave management system, designed to simplify leave administration for businesses of all sizes.

## What is LeaveHub?

LeaveHub helps you:
- **Track Leave Balances**: Automatically calculate and monitor leave entitlements
- **Submit Requests**: Easy-to-use interface for requesting time off
- **AI-Powered Planning**: Get intelligent suggestions for optimal leave dates
- **BCEA Compliance**: Built-in South African labor law compliance
- **Document Management**: Upload medical certificates and supporting documents
- **Team Coordination**: See who's away and avoid conflicts

## Getting Started

1. **Sign In**: Use your company credentials to access your account
2. **Complete Your Profile**: Add your department and contact information
3. **Check Your Balance**: View your available leave days
4. **Submit Your First Request**: Navigate to Dashboard → New Leave Request

## Need Help?

Browse our help articles or contact support at support@leavehub.co.za`,
    tags: ['introduction', 'overview', 'basics'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '2',
    title: 'How to Create Your First Leave Request',
    category: 'getting-started',
    content: `# Creating Your First Leave Request

Follow these simple steps to submit a leave request in LeaveHub.

## Step-by-Step Guide

### 1. Navigate to Leave Request Form
- Go to your Dashboard
- Click on "New Leave Request" or the "+" button

### 2. Select Leave Type
Choose from:
- **Annual Leave**: Vacation days (21 days per year)
- **Sick Leave**: Illness or injury (30 days per 3-year cycle)
- **Family Responsibility**: Family emergencies (3 days per year)
- **Maternity Leave**: 4 months for new mothers
- **Study Leave**: Educational purposes (if applicable)

### 3. Choose Your Dates
- Select start and end dates
- Working days are automatically calculated
- Weekends and public holidays are excluded

### 4. Add a Reason (Optional)
- Briefly explain your leave request
- This helps managers process requests faster

### 5. Upload Documents (If Required)
- Medical certificates for sick leave over 2 days
- Supporting documents for family responsibility leave

### 6. Submit for Approval
- Click "Submit Request"
- Your manager will receive a notification
- Track status in your Dashboard

## What Happens Next?

- Manager reviews your request
- You receive an email notification with decision
- Approved leave appears in team calendar
- Leave balance is automatically updated

## Tips for Success

✅ Submit requests well in advance
✅ Check team calendar for conflicts
✅ Upload required documents
✅ Provide clear reasons for urgency`,
    tags: ['leave-request', 'tutorial', 'how-to'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '3',
    title: 'Understanding Your Leave Balance',
    category: 'getting-started',
    content: `# Understanding Your Leave Balance

Your leave balance shows how many days you have available for different leave types.

## Leave Balance Dashboard

Your dashboard displays:
- **Available Days**: Days you can currently use
- **Entitled Days**: Total annual entitlement
- **Used Days**: Days already taken this year
- **Pending Requests**: Days awaiting approval

## Annual Leave

Under BCEA, full-time employees are entitled to:
- **21 consecutive days** per year
- Or 1 day for every 17 days worked
- Calculated on a pro-rata basis

### How It Accrues
- Accrues monthly throughout the year
- Can be carried over (company policy dependent)
- Must be used within 6-12 months of earning

## Sick Leave

- **30 days** per 3-year cycle
- Or 1 day for every 26 days worked (first 6 months)
- Medical certificate required after 2 consecutive days

## Family Responsibility Leave

- **3 days per year**
- For birth of child, serious illness of family member, or death
- Does not accumulate year to year

## Checking Your Balance

View your leave balance from:
1. Dashboard home page
2. Leave request form
3. Reports section

## Questions?

Contact HR or check your company's leave policy for specific rules.`,
    tags: ['leave-balance', 'entitlement', 'bcea'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '4',
    title: 'Navigating the Dashboard',
    category: 'getting-started',
    content: `# Navigating Your LeaveHub Dashboard

The dashboard is your central hub for all leave management activities.

## Main Navigation

### Dashboard
- **Quick Stats**: Leave balance at a glance
- **Upcoming Leave**: Your scheduled time off
- **Recent Requests**: Latest submissions
- **Team Calendar**: Who's away when

### Calendar
- **Month View**: See team availability
- **Color Coding**: Different leave types
- **Public Holidays**: SA holidays highlighted
- **Click Dates**: Quick request creation

### Documents
- **Upload Center**: Drag-and-drop interface
- **Document Library**: All your uploaded files
- **Categories**: Medical, Supporting, Contracts
- **Quick Actions**: Download or delete

### AI Planner
- **Smart Suggestions**: Optimal leave dates
- **Conflict Detection**: Team scheduling
- **Holiday Optimization**: Extended breaks
- **Balance Warnings**: Overspend alerts

### Reports
- **Leave History**: Past requests
- **Analytics**: Usage patterns
- **Export**: PDF and Excel downloads
- **Team Reports**: Manager view

### Approvals (Managers Only)
- **Pending Requests**: Team submissions
- **Quick Approve**: One-click actions
- **Bulk Processing**: Multiple requests
- **Conflict Alerts**: Overlapping leave

## Quick Actions

Look for these shortcuts:
- **+ Button**: New leave request
- **Bell Icon**: Notifications
- **Profile Menu**: Settings and logout
- **Search Bar**: Find anything quickly

## Mobile Access

Access LeaveHub on any device:
- Responsive design
- Touch-friendly buttons
- Mobile notifications
- Offline viewing`,
    tags: ['dashboard', 'navigation', 'interface'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '5',
    title: 'Updating Your Profile',
    category: 'getting-started',
    content: `# Updating Your Profile

Keep your profile information up-to-date for smooth leave management.

## What You Can Update

### Personal Information
- First and Last Name
- Email Address
- Phone Number
- Department
- Job Title
- Employee ID

### Emergency Contact
- Contact Name
- Relationship
- Phone Number
- Email Address

### Leave Preferences
- Email Notifications
- Default Leave Type
- Calendar View Preferences
- Notification Frequency

## How to Update

1. Click your profile picture (top right)
2. Select "Settings"
3. Navigate to "Profile" tab
4. Edit any field
5. Click "Save Changes"

## Important Notes

⚠️ Some fields may be locked by your HR department
⚠️ Email changes require verification
⚠️ Department changes need manager approval

## Need Help?

Contact your HR administrator if you can't update certain information.`,
    tags: ['profile', 'settings', 'account'],
    lastUpdated: '2025-12-09',
  },

  // Leave Management (6 articles)
  {
    id: '6',
    title: 'Types of Leave in South Africa',
    category: 'leave-management',
    content: `# Types of Leave in South Africa

Understanding different leave types under the Basic Conditions of Employment Act (BCEA).

## Annual Leave

**Entitlement**: 21 consecutive days per year
**Purpose**: Vacation, rest, personal time
**Payment**: Full pay
**Requirements**:
- Plan in advance with manager
- Get approval before booking flights
- Check team calendar for conflicts

## Sick Leave

**Entitlement**: 30 days per 3-year cycle
**Purpose**: Illness or injury
**Payment**: Full pay
**Requirements**:
- Medical certificate after 2 days
- Notify manager immediately
- Upload certificate within 5 days

## Family Responsibility Leave

**Entitlement**: 3 days per year
**Purpose**:
- Birth of child
- Serious illness of immediate family
- Death of immediate family member
**Payment**: Full pay
**Requirements**: Proof may be required

## Maternity Leave

**Entitlement**: 4 consecutive months
**Purpose**: Childbirth and newborn care
**Payment**: Unpaid (UIF may provide benefits)
**Requirements**:
- Notify employer 4 weeks before
- Medical certificate confirming pregnancy
- Return to work agreement

## Paternity Leave

**Entitlement**: 10 days
**Purpose**: Support partner during childbirth
**Payment**: Full pay
**Requirements**: Within 4 weeks of birth

## Study Leave

**Entitlement**: Varies by company policy
**Purpose**: Examinations, course requirements
**Payment**: May be unpaid
**Requirements**: Proof of enrollment

## Unpaid Leave

**Entitlement**: At employer's discretion
**Purpose**: Extended travel, personal matters
**Payment**: Unpaid
**Requirements**: Manager approval, advance notice`,
    tags: ['leave-types', 'bcea', 'entitlement'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '7',
    title: 'How to Cancel or Modify a Leave Request',
    category: 'leave-management',
    content: `# Canceling or Modifying Leave Requests

Need to change your plans? Here's how to cancel or modify your leave.

## Before Approval

### Modify Request
1. Go to Dashboard → Pending Requests
2. Click on the request
3. Select "Edit Request"
4. Update dates or details
5. Resubmit for approval

### Cancel Request
1. Go to Dashboard → Pending Requests
2. Click on the request
3. Select "Cancel Request"
4. Confirm cancellation
5. Your manager receives notification

## After Approval

### For Upcoming Leave
1. Contact your manager immediately
2. Go to Dashboard → Approved Leave
3. Click on the request
4. Select "Request Cancellation"
5. Manager must approve cancellation

### For Current Leave
- Call your manager directly
- Cannot cancel through system
- May need HR intervention

## Important Notes

⚠️ Cancellations should be done ASAP
⚠️ Frequent cancellations may affect future approvals
⚠️ Medical emergencies: Contact manager by phone

## Leave Balance

- Canceled leave days return to your balance
- Usually within 24 hours
- Check dashboard to confirm

## Best Practices

✅ Cancel as early as possible
✅ Explain reason for cancellation
✅ Offer to help with rescheduling
✅ Check calendar before rebooking`,
    tags: ['cancel', 'modify', 'change-request'],
    lastUpdated: '2025-12-09',
  },

  // AI Features (4 articles)
  {
    id: '15',
    title: 'Using the AI Leave Planner',
    category: 'ai-features',
    content: `# Using the AI Leave Planner

Get intelligent suggestions for optimal leave dates powered by Claude AI.

## What is the AI Leave Planner?

The AI Leave Planner analyzes:
- Your leave balance
- Team schedules
- Public holidays
- Company policies
- Historical patterns

Then provides personalized recommendations for the best time to take leave.

## How to Use It

### 1. Access AI Planner
- Navigate to Dashboard → AI Planner
- Or click the Sparkles icon ✨

### 2. Enter Your Preferences
- Desired start date
- Desired end date
- Leave type
- Any special requirements

### 3. Get AI Recommendations
The AI will analyze and provide:
- **Optimality Assessment**: Is your choice optimal?
- **Conflict Warnings**: Team scheduling issues
- **Alternative Dates**: Better options with reasoning
- **Holiday Optimization**: Long weekend opportunities
- **Balance Alerts**: If you're using too much leave

### 4. Review Suggestions
Each suggestion includes:
- Recommended date range
- Number of working days
- Reason for recommendation
- Benefits (e.g., "Includes public holiday")
- Team availability status

### 5. Apply Suggestion
- Click "Use These Dates" on any suggestion
- Dates auto-populate in request form
- Review and submit

## AI Features

### Smart Conflict Detection
- Identifies team members already on leave
- Warns if too many people out simultaneously
- Suggests alternative dates to avoid conflicts

### Holiday Optimization
- Spots opportunities for long weekends
- Recommends bridging public holidays
- Maximizes time off with minimum days used

### Balance Management
- Warns if using leave too early in year
- Suggests spreading leave throughout year
- Alerts if nearing balance limits

## Tips for Best Results

✅ Be flexible with dates
✅ Review all suggestions
✅ Consider team needs
✅ Plan around holidays
✅ Use early in planning process

## Example Scenarios

**Scenario 1: Christmas Break**
*Input*: Dec 18-29
*AI Suggests*: Dec 16-Jan 3 (includes public holidays, fewer working days needed)

**Scenario 2: Team Conflict**
*Input*: July 10-14
*AI Warns*: "3 team members already on leave"
*AI Suggests*: July 17-21 or July 3-7

**Scenario 3: Balance Alert**
*Input*: Using 15 days in March
*AI Warns*: "You're using 71% of annual leave in Q1"
*AI Suggests*: Reducing to 10 days or spreading across Q2`,
    tags: ['ai', 'planner', 'suggestions', 'claude'],
    lastUpdated: '2025-12-09',
  },

  // Documents (4 articles)
  {
    id: '19',
    title: 'Uploading Documents',
    category: 'documents',
    content: `# Uploading Documents to LeaveHub

Easily upload medical certificates, contracts, and supporting documents.

## Accessing Documents

Navigate to: Dashboard → Documents

## How to Upload

### Method 1: Drag and Drop
1. Open Documents page
2. Drag file from your computer
3. Drop into upload area
4. File uploads automatically

### Method 2: Click to Browse
1. Click "Upload Document" button
2. Browse your computer
3. Select file
4. Click "Open"

## Document Categories

Choose the appropriate category:
- **Medical Certificate**: Sick leave documentation
- **Supporting Document**: General supporting files
- **Contract**: Employment contracts, agreements
- **Identification**: ID documents, proof of address
- **Other**: Miscellaneous files

## Supported File Types

✅ PDF (.pdf)
✅ Word Documents (.doc, .docx)
✅ Images (.jpg, .jpeg, .png)

## File Size Limits

- Maximum: 10MB per file
- For larger files: Compress or split into multiple documents

## After Upload

Your document appears in the documents list with:
- Filename
- Category
- Upload date
- File size
- Actions (Download, Delete)

## Linking to Leave Requests

When submitting a leave request:
1. Upload required documents first
2. Reference document in request notes
3. Or attach during request submission

## Document Security

🔒 All documents are:
- Encrypted in transit and at rest
- Only visible to you and authorized HR staff
- Stored securely in Supabase Storage
- Backed up regularly

## Best Practices

✅ Name files clearly (e.g., "Medical_Cert_2025-12-09.pdf")
✅ Upload immediately after receiving
✅ Keep local backups
✅ Delete outdated documents
✅ Compress large files before upload`,
    tags: ['documents', 'upload', 'files'],
    lastUpdated: '2025-12-09',
  },

  // BCEA Compliance (5 articles)
  {
    id: '23',
    title: 'BCEA Leave Entitlements Explained',
    category: 'bcea-compliance',
    content: `# BCEA Leave Entitlements Explained

Understanding your rights under South African labor law.

## Basic Conditions of Employment Act (BCEA)

The BCEA is South African legislation that sets minimum standards for employment, including leave entitlements.

## Annual Leave

### Standard Entitlement
- **21 consecutive days** per annual leave cycle
- Or **1 day for every 17 days worked**
- Includes weekends falling within leave period

### Pro-Rata Calculation
For part of a year:
- (Days worked ÷ 17) = Days entitled
- Example: 170 days worked = 10 days leave

### Payment During Leave
- Paid at normal rate
- Includes regular bonuses/allowances
- Calculated as: (Annual earnings ÷ 52) × leave weeks

### Carry Over Rules
- Maximum 6 months carry over (unless agreed)
- Must be used within 6-12 months
- Can be paid out on termination

## Sick Leave

### Entitlement Cycle
- **30 days per 3-year cycle**
- First 6 months: 1 day per 26 days worked

### Medical Certificate Requirements
- Not required for 1-2 days
- Required for 3+ consecutive days
- Required for 2+ occasions in 8 weeks

### Payment
- Fully paid for certificated sick leave
- May be unpaid if certificate not provided

## Family Responsibility Leave

### Eligibility
- Employed for 4+ months
- Work 4+ days per week

### Entitlement
- 3 days per year
- Does not accumulate
- Cannot be cashed out

### Valid Reasons
- Birth of child
- Illness of immediate family member
- Death of immediate family member
  - Spouse/life partner
  - Parent, adoptive parent, grandparent, child, adopted child, grandchild, sibling

## Maternity Leave

### Entitlement
- 4 consecutive months
- Unpaid by employer
- May claim UIF maternity benefits

### Timing
- Can start 4 weeks before expected birth
- Must take at least 6 weeks after birth
- Total = 4 months

### Job Protection
- Position must be held or equivalent offered
- Cannot be dismissed for pregnancy
- Cannot be discriminated against

## Public Holidays

South Africa has 12 public holidays:
1. New Year's Day (1 Jan)
2. Human Rights Day (21 Mar)
3. Good Friday (varies)
4. Family Day (varies)
5. Freedom Day (27 Apr)
6. Workers' Day (1 May)
7. Youth Day (16 Jun)
8. National Women's Day (9 Aug)
9. Heritage Day (24 Sep)
10. Day of Reconciliation (16 Dec)
11. Christmas Day (25 Dec)
12. Day of Goodwill (26 Dec)

### Sunday Rule
If public holiday falls on Sunday, Monday becomes public holiday.

## Compliance in LeaveHub

LeaveHub automatically:
- ✅ Calculates correct entitlements
- ✅ Enforces medical certificate requirements
- ✅ Tracks 3-year sick leave cycles
- ✅ Includes SA public holidays
- ✅ Prevents over-allocation
- ✅ Pro-rates for part-time employees

## Questions About Compliance?

Contact your HR department or email compliance@leavehub.co.za`,
    tags: ['bcea', 'compliance', 'law', 'entitlement'],
    lastUpdated: '2025-12-09',
  },

  // Troubleshooting (6 articles)
  {
    id: '24',
    title: 'Cannot Log In - Common Issues',
    category: 'troubleshooting',
    content: `# Cannot Log In - Troubleshooting Guide

Having trouble accessing your LeaveHub account? Here are common solutions.

## Common Login Issues

### 1. Incorrect Credentials

**Symptoms**: "Invalid email or password" error

**Solutions**:
- Double-check email address spelling
- Ensure Caps Lock is off
- Try copying/pasting password from password manager
- Click "Forgot Password" to reset

### 2. Account Not Activated

**Symptoms**: "Account not found" error

**Solutions**:
- Check email for activation link
- Look in spam/junk folder
- Contact HR to resend invitation
- Verify you're using correct email address

### 3. Browser Issues

**Symptoms**: Page won't load, infinite redirects

**Solutions**:
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Update browser to latest version
- Try a different browser (Chrome, Firefox, Safari)

### 4. Clerk Authentication Errors

**Symptoms**: Redirects to error page, SSL issues

**Solutions**:
- Ensure you're accessing leavehub.co.za (not old URLs)
- Check your internet connection
- Disable VPN temporarily
- Clear browser cache
- Try again in 5 minutes (temporary service issues)

### 5. Account Locked

**Symptoms**: "Account temporarily locked" message

**Reasons**:
- Too many failed login attempts
- Security policy triggered
- Administrative action

**Solution**: Wait 30 minutes or contact IT support

## Step-by-Step Reset

### Password Reset
1. Go to https://leavehub.co.za/sign-in
2. Click "Forgot Password?"
3. Enter your email address
4. Check email for reset link
5. Click link (valid for 1 hour)
6. Create new strong password
7. Log in with new password

### Email Change
- Cannot self-serve
- Contact HR at hr@yourcompany.com
- Provide: Current email, new email, employee ID

## Still Can't Log In?

### Contact Support
📧 Email: support@leavehub.co.za
📞 Phone: +27 21 XXX XXXX
⏰ Hours: Mon-Fri, 8am-5pm SAST

### Information to Provide
- Your full name
- Employee ID
- Email address used
- Error message (screenshot if possible)
- Browser and version
- When issue started

## Prevent Future Issues

✅ Use a password manager
✅ Keep browser updated
✅ Bookmark correct login URL
✅ Save support contact details
✅ Enable notifications for system updates`,
    tags: ['login', 'troubleshooting', 'access', 'authentication'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '25',
    title: 'Leave Request Not Showing',
    category: 'troubleshooting',
    content: `# Leave Request Not Showing

Submitted a leave request but can't see it? Here's how to troubleshoot.

## Check Request Status

### Step 1: Verify Submission
1. Go to Dashboard → My Requests
2. Look under all tabs:
   - Pending
   - Approved
   - Rejected
   - All Requests
3. Use search bar with date or keyword

### Step 2: Check Email Confirmation
- Look for "Leave Request Submitted" email
- Check spam/junk folder
- Email contains request ID and details

## Common Causes

### 1. Submission Failed
**Symptoms**: No confirmation email, not in any list

**Reasons**:
- Network error during submission
- Browser crashed
- Form validation error missed
- Session expired

**Solution**: Resubmit the request

### 2. Wrong Date Filter
**Symptoms**: Request exists but not visible

**Reasons**:
- Date filter set to past period
- Viewing wrong year
- Calendar view not showing correct month

**Solution**: Reset filters, check date range

### 3. Archived Requests
**Symptoms**: Old requests disappeared

**Reason**: Automatically archived after 12 months

**Solution**:
- Go to "Archived Requests"
- Or export historical data from Reports

### 4. Manager's View
**If you're a manager**:

**Symptoms**: Team requests not showing

**Reasons**:
- Filtered by department
- Filtered by status
- Request assigned to different approver

**Solution**: Clear all filters, check "All Departments"

## Technical Issues

### Browser Cache
1. Clear browser cache
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Log out and back in

### Database Sync
Sometimes takes a few minutes:
- Wait 5 minutes
- Refresh page
- Check mobile app if available

## Finding Specific Requests

### Search Tips
- Use request ID from email
- Search by date range
- Filter by leave type
- Sort by submission date

### Export Data
If request exists but not visible:
1. Go to Reports
2. Export "Leave History"
3. Open in Excel
4. Search for your request

## Still Missing?

### Contact Support

**Via Email**:
📧 support@leavehub.co.za
Include:
- Employee ID
- Date request submitted
- Dates of leave requested
- Screenshot of confirmation email

**Via Manager**:
Ask manager to check their approval queue

**Via IT Help Desk**:
May be a system sync issue requiring IT intervention

## Prevent This Issue

✅ Always screenshot confirmation page
✅ Wait for confirmation email before closing
✅ Check "My Requests" immediately after submission
✅ Save confirmation email
✅ Use stable internet connection
✅ Don't close browser during submission`,
    tags: ['missing-request', 'troubleshooting', 'visibility'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '26',
    title: 'Document Upload Fails',
    category: 'troubleshooting',
    content: `# Document Upload Fails

Having trouble uploading documents? Here are solutions.

## Common Upload Errors

### 1. File Too Large

**Error**: "File size exceeds 10MB limit"

**Solutions**:
- Compress PDF: Use Adobe Acrobat or online tools
- Reduce image quality: Use image editor
- Split large documents into parts
- Scan at lower resolution (300dpi vs 600dpi)

**Tools**:
- PDF Compressor: smallpdf.com
- Image Compressor: tinypng.com
- MacOS: Preview > Export with Quartz Filter

### 2. Unsupported File Type

**Error**: "File type not supported"

**Supported formats**: PDF, DOC, DOCX, JPG, JPEG, PNG

**Solutions**:
- Convert to PDF: Use "Print to PDF"
- For images: Save as JPG or PNG
- For Word docs: Save as .docx not .pages or .odt

### 3. Network Timeout

**Error**: "Upload timed out" or stuck at 99%

**Causes**:
- Slow internet connection
- Large file size
- Server busy

**Solutions**:
- Switch to faster WiFi
- Wait and try again
- Upload during off-peak hours
- Compress file before retry

### 4. Browser Issues

**Error**: Upload bar doesn't appear or freezes

**Solutions**:
- Clear browser cache
- Disable browser extensions
- Try incognito mode
- Use different browser
- Update browser to latest version

### 5. Storage Quota Exceeded

**Error**: "Storage limit reached"

**Solution**:
- Delete old, unnecessary documents
- Contact HR to increase quota
- Compress files before upload

## Upload Best Practices

### File Preparation
✅ Name files clearly (e.g., "Medical_Cert_2025-12-09")
✅ Remove unnecessary pages
✅ Ensure text is readable
✅ Check file size before upload
✅ Use PDF format when possible

### Connection Tips
✅ Use stable WiFi (not mobile data)
✅ Don't close browser during upload
✅ Wait for "Upload successful" message
✅ Verify file appears in list after upload

### Optimization
✅ Scan documents at 150-300 DPI
✅ Use "Medium Quality" for PDFs
✅ Crop unnecessary margins
✅ Convert color docs to grayscale if acceptable

## Troubleshooting Checklist

Try these in order:

1. ☐ Check file size (<10MB)
2. ☐ Verify file type is supported
3. ☐ Clear browser cache
4. ☐ Try different browser
5. ☐ Compress file
6. ☐ Check internet connection
7. ☐ Try incognito mode
8. ☐ Disable VPN
9. ☐ Wait 30 mins and retry
10. ☐ Contact support

## Still Having Issues?

### Document Alternative
If urgent:
- Email document to manager directly
- Bring physical copy to HR
- Upload will be done by admin

### Support Information

📧 **Email**: support@leavehub.co.za
📞 **Phone**: +27 21 XXX XXXX

**Include in support request**:
- File size and type
- Error message screenshot
- Browser and version
- Steps you've already tried

## Emergency Uploads

For urgent medical certificates:
1. Email directly to: urgent-docs@leavehub.co.za
2. Subject: "Urgent - [Your Name] - [Date]"
3. Attach document
4. Reference your leave request ID
5. Confirm receipt with HR

## Prevent Future Issues

✅ Keep a folder of commonly used documents
✅ Pre-compress files before saving
✅ Use consistent naming convention
✅ Maintain good internet connection
✅ Save successful upload confirmations`,
    tags: ['documents', 'upload', 'troubleshooting', 'errors'],
    lastUpdated: '2025-12-09',
  },

  // Additional Leave Management Articles
  {
    id: '8',
    title: 'Manager Approval Process',
    category: 'leave-management',
    content: `# Manager Approval Process

Understanding how managers review and approve leave requests.

## Manager Dashboard

Managers have access to:
- Pending approval queue
- Team calendar view
- Leave balance reports
- Historical requests

## Approval Workflow

### 1. Request Notification
- Email alert sent immediately
- In-app notification badge
- Mobile push notification (if enabled)

### 2. Review Factors
Managers consider:
- Leave balance availability
- Team coverage needs
- Business critical dates
- Previous request patterns
- Supporting documentation

### 3. Quick Actions
- **Approve**: Grant leave immediately
- **Reject**: Decline with reason
- **Request Info**: Ask for clarification
- **Defer**: Mark for later review

## Approval Timeframes

Standard processing:
- Urgent requests: Within 24 hours
- Standard requests: Within 48 hours
- Future-dated requests: Within 5 business days

## Appeals Process

If request is rejected:
1. Review rejection reason
2. Address manager's concerns
3. Resubmit with additional info
4. Escalate to HR if needed

## Best Practices for Employees

✅ Submit well in advance
✅ Provide clear reasons
✅ Include required documents
✅ Check team calendar first
✅ Be flexible with dates
✅ Respond promptly to questions`,
    tags: ['approval', 'manager', 'workflow'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '9',
    title: 'Public Holidays in South Africa',
    category: 'leave-management',
    content: `# South African Public Holidays

Complete guide to SA public holidays and how they affect leave.

## 2025 Public Holidays

1. **New Year's Day** - 1 January (Wednesday)
2. **Human Rights Day** - 21 March (Friday)
3. **Good Friday** - 18 April
4. **Family Day** - 21 April (Monday)
5. **Freedom Day** - 27 April (Sunday) → 28 April (Monday)
6. **Workers' Day** - 1 May (Thursday)
7. **Youth Day** - 16 June (Monday)
8. **National Women's Day** - 9 August (Saturday) → 11 August (Monday)
9. **Heritage Day** - 24 September (Wednesday)
10. **Day of Reconciliation** - 16 December (Tuesday)
11. **Christmas Day** - 25 December (Thursday)
12. **Day of Goodwill** - 26 December (Friday)

## Sunday Rule

When a public holiday falls on Sunday:
- Next Monday becomes a public holiday
- Example: Freedom Day 2025 falls on Sunday, so Monday 28 April is off

## How Holidays Affect Leave

### Working Around Holidays
- Public holidays don't count toward leave balance
- Bridge days between holiday and weekend = smart planning
- LeaveHub automatically excludes holidays from calculations

### Example Scenarios

**Christmas 2025 Bridge**:
- 25 Dec (Thu) - Public Holiday
- 26 Dec (Fri) - Public Holiday
- 27-28 Dec (Weekend)
- 29-31 Dec - **Take 3 days leave**
- Result: 9 consecutive days off using only 3 leave days!

**Long Weekend Strategy**:
- Take Friday + Monday around a Tuesday holiday
- Result: 4-day weekend using 2 leave days

## Holiday Pay

Under BCEA:
- Paid at normal rate
- Cannot be substituted with leave days
- Must be given as time off
- Overtime may apply if you work on holiday (double pay)

## LeaveHub Features

✅ Holidays pre-loaded in calendar
✅ Automatic exclusion from working days
✅ Smart suggestions for bridge days
✅ Holiday reminders`,
    tags: ['public-holidays', 'sa', 'bcea'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '10',
    title: 'Team Calendar and Coordination',
    category: 'leave-management',
    content: `# Using the Team Calendar

Coordinate leave with your team to ensure adequate coverage.

## Accessing Team Calendar

Navigate to: Dashboard → Calendar

## Calendar Views

### Month View
- See all team members' leave
- Color-coded by leave type
- Public holidays highlighted
- Hover for details

### Week View
- Detailed daily breakdown
- Team availability at a glance
- Conflict warnings

### Day View
- Who's in office vs out
- Department breakdown
- Meeting availability

## Color Coding

- 🟢 **Green**: Annual Leave
- 🔴 **Red**: Sick Leave
- 🟡 **Yellow**: Family Responsibility
- 🟣 **Purple**: Maternity/Paternity
- 🔵 **Blue**: Study Leave
- ⚪ **Gray**: Unpaid Leave

## Checking Conflicts

Before submitting leave:
1. Open Team Calendar
2. Select your desired dates
3. Check "Availability" panel
4. Look for warnings:
   - "High team absence"
   - "Manager unavailable"
   - "Critical coverage period"

## Coverage Planning

### Best Practices
✅ Coordinate with teammates
✅ Stagger leave dates
✅ Document handover tasks
✅ Set up out-of-office auto-reply
✅ Provide emergency contact

### Blackout Periods
Some teams have blackout dates:
- Month-end close (Finance)
- Peak season (Retail/Hospitality)
- Budget planning (All departments)
- Major project deadlines

Check with your manager for team-specific rules.

## Mobile Calendar Sync

Approved leave syncs to:
- Google Calendar
- Outlook Calendar
- Apple Calendar

Setup in Settings → Integrations`,
    tags: ['calendar', 'team', 'coordination'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '11',
    title: 'Leave Accrual and Carry Over',
    category: 'leave-management',
    content: `# Leave Accrual and Carry Over Rules

Understanding how leave accumulates and rolls over.

## How Annual Leave Accrues

### Monthly Accrual
- 1.75 days per month (21 days ÷ 12 months)
- Accrues on the 1st of each month
- Pro-rated for part-month employment

### Example Timeline
- **Jan 1**: +1.75 days
- **Feb 1**: +1.75 days (total: 3.5)
- **Mar 1**: +1.75 days (total: 5.25)
- And so on...

## Carry Over Rules

### BCEA Minimum
- Employer must allow minimum 6 months carry over
- Leave must be used within 6 months of new cycle
- Cannot force forfeiture before 6 months

### Company Policies Vary
Common approaches:
1. **6-month carry over**: Use it or lose it after 6 months
2. **12-month carry over**: Full year to use previous year's leave
3. **Unlimited carry over**: Accumulate indefinitely
4. **Cash out option**: Convert to payment (rare)

**Check your company's specific policy in the Employee Handbook**

## Leave Year Cycles

Most common cycles:
- **Calendar year**: Jan 1 - Dec 31
- **Financial year**: Mar 1 - Feb 28/29
- **Anniversary**: Based on hire date

LeaveHub tracks your specific cycle.

## New Employees

### First Year Pro-Rata
- Accrue based on months worked
- Example: Start July 1 = 10.5 days for year
- (6 months × 1.75 days/month)

### Probation Period
- Still accrues during probation
- May have restrictions on taking leave
- Check employment contract

## Negative Balance

### What Happens
- System prevents overuse
- Requests rejected if insufficient balance
- Exception: Pre-approved advance leave

### Advance Leave
Some employers allow:
- Taking next year's allocation early
- Must be repaid if you resign
- Requires manager and HR approval

## Tracking in LeaveHub

Dashboard shows:
- Current balance
- Accrued this month
- Scheduled to accrue
- Pending deductions
- Carry over from previous year (if applicable)

## Year-End Planning

**November/December Tips**:
- Check balance before year-end
- Book remaining days
- Coordinate with team
- Submit requests early
- Consider carry over limits`,
    tags: ['accrual', 'carry-over', 'balance'],
    lastUpdated: '2025-12-09',
  },

  // Additional AI Features Articles
  {
    id: '16',
    title: 'AI Conflict Detection Explained',
    category: 'ai-features',
    content: `# How AI Conflict Detection Works

Understanding LeaveHub's intelligent conflict detection system.

## What is Conflict Detection?

The AI analyzes your requested dates against:
- Team member schedules
- Department capacity
- Historical patterns
- Company policies
- Critical business dates

## Conflict Severity Levels

### 🟢 Low Severity
- 1-2 team members away
- Adequate coverage maintained
- No critical roles affected
- Proceed with confidence

### 🟡 Medium Severity
- 3-4 team members away
- Reduced but manageable coverage
- May need contingency planning
- Manager review recommended

### 🔴 High Severity
- 5+ team members away
- Critical roles uncovered
- High impact on operations
- Alternative dates strongly suggested

## What the AI Considers

### Team Dynamics
- Department size
- Role criticality
- Cross-training levels
- Historical coverage issues

### Business Context
- Peak vs off-peak seasons
- Project deadlines
- Client commitments
- Regulatory requirements

### Historical Data
- Previous conflicts
- Success/failure patterns
- Team preferences
- Seasonal trends

## Smart Suggestions

When conflicts detected, AI suggests:

1. **Alternative Week**: Same duration, different timing
2. **Split Leave**: Break into smaller periods
3. **Shorter Duration**: Reduce number of days
4. **Extended Weekend**: Long weekend instead of full week

Each suggestion includes:
- Conflict severity reduction
- Team availability improvement
- Business impact assessment
- Employee benefit analysis

## Override Options

You can still submit despite conflicts if:
- Emergency or urgent need
- Pre-approved by management
- Mitigating circumstances
- Coverage arranged manually

Always add explanation in request notes.

## Limitations

AI cannot account for:
- Last-minute changes
- Unplanned sick leave
- External factors (client emergencies)
- Informal arrangements

**Always coordinate with your manager**

## Note About API

⚠️ AI features require Anthropic API key
⚠️ If unavailable, basic calendar checking still works
⚠️ Contact IT to enable AI features`,
    tags: ['ai', 'conflicts', 'detection'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '17',
    title: 'Holiday Optimization Strategies',
    category: 'ai-features',
    content: `# Maximizing Your Leave with AI

Learn how to use AI to get the most from your leave days.

## The Bridge Day Opportunity

### What is a Bridge Day?
A bridge day is a working day between:
- Public holiday and weekend
- Two public holidays
- Holiday and existing leave

### Example
- Friday: Public Holiday
- Monday: Take 1 day leave
- Result: 4-day weekend with 1 leave day!

## AI Holiday Optimization

The AI scans:
- All SA public holidays
- Your preferred dates
- Team availability
- Company calendar

Then suggests:
- Best bridge opportunities
- Long weekend options
- Extended break strategies
- Maximum days off for minimum leave used

## 2025 Optimization Opportunities

### Easter Long Weekend
- Take Thu 17 Apr + Tue 22 Apr (2 days)
- Get: 17-22 April off (6 consecutive days)
- Cost: Only 2 leave days

### Freedom Day Extension
- Take Tue 29 + Wed 30 April (2 days)
- Get: 26 Apr - 4 May off (9 consecutive days)
- Cost: Only 2 leave days + 3 public holidays

### Workers' Day Bridge
- Public holiday Thursday 1 May
- Take Friday 2 May (1 day)
- Get: 4-day weekend
- Cost: 1 leave day

### Heritage Day Strategy
- Take Thu 25 + Fri 26 September (2 days)
- Get: 24-28 September off (5 consecutive days)
- Cost: 2 leave days

### Christmas/New Year Mega Break
- 25-26 Dec: Public holidays
- 27-28 Dec: Weekend
- 29-31 Dec: Take 3 days
- 1 Jan 2026: Public holiday
- Result: 8 days off for 3 leave days!

## Planning Your Year

### Q1 Strategy (Jan-Mar)
- Plan major breaks
- Use AI to identify opportunities
- Book early for popular dates

### Q2-Q3 Execution (Apr-Sep)
- Take planned leave
- Monitor balance
- Adjust as needed

### Q4 Wrap-up (Oct-Dec)
- Use remaining balance
- Maximize year-end holidays
- Consider carry-over rules

## Tips for Success

✅ Plan 3-6 months ahead
✅ Book flights after approval
✅ Coordinate with family
✅ Check school holiday dates
✅ Monitor fare prices
✅ Have backup dates ready

## AI Recommendations

Ask AI to:
- "Find best dates for 2-week vacation"
- "Maximize December break"
- "Suggest long weekend options"
- "When should I take leave to minimize conflicts?"

## Combining Strategies

**For Maximum Impact**:
1. Use AI suggestions
2. Check team calendar
3. Align with public holidays
4. Submit early
5. Book travel after approval`,
    tags: ['optimization', 'holidays', 'strategy', 'ai'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '18',
    title: 'AI Balance Warnings and Recommendations',
    category: 'ai-features',
    content: `# Understanding AI Balance Warnings

Smart guidance to help you use leave wisely throughout the year.

## What are Balance Warnings?

The AI monitors:
- Your current leave usage
- Remaining balance
- Time left in year
- Historical patterns

And alerts you to:
- Overspending early
- Underspending risk
- Optimal distribution
- Carry-over implications

## Warning Types

### 🔴 High Usage Alert
"You're using 60% of annual leave in Q1"

**What it means**:
- Burning through leave too quickly
- May have shortage later
- Emergency leave buffer needed

**Recommendation**:
- Reduce current request
- Spread leave across year
- Keep 3-5 days for emergencies

### 🟡 Pace Concern
"Current rate will deplete balance by September"

**What it means**:
- Usage tracking shows early depletion
- No leave for Q4 holidays
- May miss carry-over opportunity

**Recommendation**:
- Review upcoming plans
- Reduce frequency
- Plan smaller breaks

### 🟢 Under-Utilization
"You have 15 unused days with 2 months left"

**What it means**:
- Not using entitled leave
- Risk losing days to policy
- Missing rest opportunities

**Recommendation**:
- Book remaining leave now
- Check carry-over rules
- Plan year-end break

## Optimal Distribution

AI recommends:
- **Q1 (Jan-Mar)**: Use 15-20% of balance
- **Q2 (Apr-Jun)**: Use 25-30% of balance
- **Q3 (Jul-Sep)**: Use 25-30% of balance
- **Q4 (Oct-Dec)**: Use remaining 25-30%

## Smart Allocation Strategy

### Emergency Buffer
Always keep:
- 2-3 days for unexpected needs
- Family emergencies
- Illness (if sick leave depleted)
- Personal matters

### Planned vs Spontaneous
Split your leave:
- 60-70% planned (holidays, events)
- 30-40% flexible (long weekends, spontaneous)

## AI Personalization

The AI learns:
- Your usage patterns
- Team dynamics
- Seasonal preferences
- Work intensity cycles

And customizes warnings to your:
- Department
- Role
- Historical behavior
- Company policies

## Responding to Warnings

### If Overusing
1. Cancel or reduce planned leave
2. Reschedule to later quarter
3. Take shorter breaks
4. Use public holidays strategically

### If Under-Using
1. Book remaining days immediately
2. Check company buy-back policy
3. Plan year-end vacation
4. Use for extended break

## Year-End Planning

**October Checkpoint**:
- Review remaining balance
- Calculate working days left
- Plan Q4 leave
- Consider carry-over limits

**December Rush**:
- Don't wait until December
- Popular dates book fast
- Team coverage becomes difficult
- Submit by November

## Exceptions

AI understands special cases:
- New employees (pro-rata balance)
- Parental leave (separate entitlement)
- Long service leave
- Sabbatical planning

## No API Key?

Without AI, you can still:
- Manually calculate optimal distribution
- Use simple leave calculator
- Follow 25% per quarter rule
- Check balance regularly

Contact IT to enable AI features for smarter planning.`,
    tags: ['balance', 'warnings', 'ai', 'planning'],
    lastUpdated: '2025-12-09',
  },

  // Additional Documents Articles
  {
    id: '20',
    title: 'Managing Your Document Library',
    category: 'documents',
    content: `# Managing Your Document Library

Keep your documents organized and accessible.

## Document Organization

### Categories
- **Medical Certificates**: Sick leave proof
- **Supporting Documents**: Additional evidence
- **Contracts**: Employment agreements
- **Identification**: ID, proof of address
- **Other**: Miscellaneous files

### Naming Convention
Good names:
✅ Medical_Cert_2025-12-09_Dr_Smith.pdf
✅ Annual_Leave_Flight_Booking.pdf
✅ Family_Emergency_Hospital_Letter.pdf

Bad names:
❌ IMG_1234.jpg
❌ Document.pdf
❌ Scan001.pdf

## Viewing Documents

### Document List View
Shows:
- Filename
- Category badge
- Upload date
- File size
- Quick actions

### Sorting Options
- By date (newest/oldest)
- By category
- By size
- Alphabetically

### Search Function
- Search by filename
- Filter by category
- Filter by date range

## Downloading Documents

1. Click download icon (⬇️)
2. File downloads to your browser's download folder
3. Original filename preserved
4. Can download multiple times

**Use cases**:
- Backup to personal storage
- Print physical copies
- Email to third parties
- Archive for records

## Deleting Documents

### When to Delete
- Outdated documents
- Duplicate uploads
- Wrong file uploaded
- No longer needed

### How to Delete
1. Click delete icon (🗑️)
2. Confirm deletion
3. Permanent removal from storage

⚠️ **Warning**: Deletion is permanent and cannot be undone

### Best Practice
- Keep documents for at least 1 year
- Check if referenced in leave requests
- Download backup before deleting
- Follow company retention policy

## Document History

LeaveHub tracks:
- Upload date and time
- Uploaded by (user)
- File metadata
- Download history (admin view)

Managers and HR can see:
- When documents were submitted
- If requirements were met
- Verification status

## Storage Limits

### Current Limits
- 10MB per file
- 100MB total per user
- Unlimited number of files (within storage limit)

### Managing Space
If approaching limit:
1. Delete old documents
2. Compress large PDFs
3. Remove duplicates
4. Request quota increase from HR

## Document Security

### Privacy
🔒 Only you and authorized HR can see your documents
🔒 Encrypted in transit and at rest
🔒 Secure cloud storage (Supabase)
🔒 Regular backups

### Compliance
- POPIA compliant (SA data protection)
- GDPR principles followed
- Audit trail maintained
- Right to deletion honored

## Integration with Leave Requests

### Automatic Linking
When you upload:
1. Select category
2. Upload file
3. Reference in leave request notes
4. Manager can view attached documents

### Required Documents
System may automatically request:
- Medical cert for 3+ sick days
- Proof for family responsibility leave
- Supporting evidence for special leave

## Mobile Access

Documents accessible via:
- Mobile browser
- Responsive design
- Download on mobile
- View in-app

**Tip**: Enable Google Drive sync for automatic backup

## Troubleshooting

**Can't see uploaded document?**
- Refresh page
- Check category filter
- Clear browser cache
- Contact support

**Download fails?**
- Check internet connection
- Try different browser
- Disable popup blockers
- Check disk space`,
    tags: ['documents', 'management', 'library'],
    lastUpdated: '2025-12-09',
  },
  {
    id: '21',
    title: 'Document Requirements by Leave Type',
    category: 'documents',
    content: `# Required Documents for Different Leave Types

Know what documentation you need for each leave type.

## Annual Leave
**Required Documents**: ❌ None

Annual leave doesn't require supporting documents. However, you may want to upload:
- Flight bookings (for manager context)
- Conference invitations
- Event tickets

## Sick Leave

### 1-2 Days
**Required**: ❌ No medical certificate needed

Under BCEA:
- First two days don't require proof
- Self-certification acceptable
- Just submit leave request

### 3+ Consecutive Days
**Required**: ✅ Medical Certificate

Certificate must include:
- Doctor's details and signature
- Practice number
- Date of consultation
- Recommended days off
- Your name and ID number
- Stamp or letterhead

**Upload within**: 5 working days of return

### Repeat Sick Leave (2+ occasions in 8 weeks)
**Required**: ✅ Medical Certificate (even for 1 day)

BCEA allows employers to request medical proof if pattern emerges.

## Family Responsibility Leave

**Required**: ✅ Supporting Documentation

Acceptable documents:
- **Birth**: Birth certificate, hospital certificate
- **Death**: Death certificate, funeral notice
- **Illness**: Hospital admission letter, medical report

Must prove:
- Immediate family relationship
- Seriousness of situation
- Your need to be present

## Maternity Leave
**Required**: ✅ Medical Certificate

Must include:
- Confirmation of pregnancy
- Expected due date
- Recommended leave period
- Doctor/midwife details

**Submit**: 4 weeks before intended leave start

**Additional**:
- Proof of birth (after delivery)
- Hospital discharge summary

## Paternity Leave
**Required**: ✅ Proof of Birth

Acceptable documents:
- Birth certificate
- Hospital birth record
- Clinic birth notification

**Submit**: Within 4 weeks of birth

## Study Leave
**Required**: ✅ Proof of Enrollment + Exam Schedule

Must include:
- Institution name
- Course details
- Exam dates and times
- Your student number

**Additional**:
- Letter from institution
- Course timetable
- Proof of payment

## Unpaid Leave
**Required**: ⚠️ Varies by reason

Manager may request:
- Explanation letter
- Supporting evidence
- Timeline
- Financial impact acknowledgment

## Emergency Leave
**Required**: ✅ Submit proof afterward

For urgent situations:
1. Submit leave request immediately
2. Upload documents when possible
3. Provide explanation
4. Follow up with HR

## Document Checklist

Before submitting:
- [ ] Document is clear and readable
- [ ] All required info visible
- [ ] File size under 10MB
- [ ] Saved as PDF (preferred) or JPG
- [ ] Named descriptively
- [ ] Correct category selected

## Medical Certificate Requirements

Valid medical certificates must have:
✅ Letterhead or stamp
✅ Doctor's name and practice number
✅ Consultation date
✅ Number of days off recommended
✅ Your name and ID
✅ Doctor's signature
✅ Contact details

Invalid certificates:
❌ Handwritten notes without letterhead
❌ Unsigned documents
❌ No practice number
❌ Generic "sick note" templates
❌ Expired or post-dated certificates

## Verification Process

HR may verify:
- Doctor's registration with HPCSA
- Hospital records
- Death/birth certificates with Home Affairs

False documentation = dismissible offense

## Privacy and Confidentiality

Your documents are:
- Only viewable by you, your manager, and HR
- Stored securely
- Not shared with other employees
- Deleted per retention policy

Medical details:
- Manager sees "medical certificate uploaded"
- Does not see diagnosis details
- HR maintains medical file separately

## International Documents

For leave abroad:
- Ensure documents in English (or translated)
- Notarize if required
- Check authentication requirements
- Allow extra processing time

## Digital vs Physical

### Digital Preferred
- Upload to LeaveHub
- Faster processing
- No lost documents
- Easy to retrieve

### Physical Copy
- Bring to HR if system unavailable
- Keep as personal backup
- Required for legal proceedings
- Submit within 5 days

## FAQs

**Q: What if my doctor doesn't provide certificates?**
A: All registered practitioners must provide certificates. If refused, find another doctor or report to HPCSA.

**Q: Can I submit a pharmacy till slip?**
A: No, only certificates from registered medical practitioners accepted.

**Q: What if I'm too sick to get certificate immediately?**
A: Get certificate when able, upload retroactively, explain delay to manager.`,
    tags: ['documents', 'requirements', 'medical-certificate'],
    lastUpdated: '2025-12-09',
  },

  // Additional BCEA Compliance Articles
  {
    id: '22',
    title: 'Your Rights as an Employee Under BCEA',
    category: 'bcea-compliance',
    content: `# Your Employment Rights Under BCEA

Understanding your rights under South African labor law.

## What is the BCEA?

The Basic Conditions of Employment Act (1997) sets minimum standards for:
- Working hours
- Leave entitlements
- Payment
- Termination procedures
- Protection of employees

## Leave Rights

### You Are Entitled To:
✅ 21 days annual leave per year
✅ 30 days sick leave per 3-year cycle
✅ 3 days family responsibility leave per year
✅ 4 months unpaid maternity leave
✅ 10 days paid paternity leave
✅ Payment during leave at normal rate

### Employer Cannot:
❌ Force you to forfeit annual leave
❌ Pay less than normal rate during leave
❌ Require work on public holidays without permission
❌ Deny leave without valid reason
❌ Dismiss you for taking BCEA-entitled leave

## Working Hours

**Maximum**: 45 hours per week
- 9 hours per day (5-day week)
- 8 hours per day (6-day week)

**Overtime**:
- Up to 10 hours per week
- Must be paid at 1.5× normal rate
- Or time off equivalent

**Rest periods**:
- Minimum 12 hours between shifts
- 1 hour lunch break (if working 5+ hours)
- 36 consecutive hours off per week (usually weekend)

## Payment Rights

### Timely Payment
- Monthly salaries: Last working day
- Weekly wages: End of week
- Cannot be later than 7 days after period end

### Pay Deductions
Employer can only deduct:
- With your written consent
- For debt owed to employer
- By court order
- Statutory deductions (tax, UIF, pension)

### Payslip Required
Must show:
- Employer and employee details
- Payment period
- Gross and net pay
- All deductions
- Leave balance

## Protection from Unfair Practices

### Cannot be Dismissed For:
- Taking entitled leave
- Reporting violations
- Pregnancy
- Participating in union activities
- Refusing illegal activities

### Protection During Pregnancy
- Cannot be forced to work dangerous tasks
- Entitled to maternity leave
- Job protection during leave
- Right to return to same/similar position
- Cannot be dismissed for pregnancy

## Probation Period Rights

Even during probation:
- Still covered by BCEA
- Leave accrues normally
- Can take sick leave
- Cannot be arbitrarily dismissed

**Maximum probation**: 3-6 months

## Contract Requirements

Employment contract must include:
- Names of parties
- Job title and description
- Start date
- Place of work
- Working hours
- Remuneration
- Leave entitlements
- Notice periods
- Dispute resolution process

### Types of Contracts
- **Permanent**: Ongoing employment
- **Fixed-term**: Specific end date (max 3 months probation)
- **Part-time**: Reduced hours, pro-rata benefits

## Termination Rights

### Notice Periods
- 1 week: Employed < 6 months
- 2 weeks: Employed 6 months - 1 year
- 4 weeks: Employed > 1 year

### Severance Pay
If dismissed for operational reasons:
- 1 week's pay per year of service
- Applicable after 1 year of service

### Unfair Dismissal
You can challenge dismissal if:
- No valid reason
- Unfair procedure
- Discriminatory
- Automated (without reason)

**File complaint with**: CCMA within 30 days

## Vulnerable Workers

### Domestic Workers
- Covered by BCEA
- Entitled to all leave
- Minimum wage applies
- Written contract required

### Farm Workers
- Covered by BCEA
- Sectoral determination applies
- Housing and food allowances

### Part-time Workers
- Pro-rata entitlements
- Same protections
- Cannot be discriminated against

## Public Holiday Rights

If you work on public holiday:
- Must be voluntary (or in essential services)
- Paid double time
- Or normal pay + day off within 7 days
- Or extra day's pay

## UIF (Unemployment Insurance Fund)

### Contributions
- 1% from employee
- 1% from employer
- Deducted monthly

### Benefits
- Unemployment benefits
- Maternity benefits
- Illness benefits
- Dependant benefits

## Where to Report Violations

### Department of Employment and Labour
📞 **Call Centre**: 0860 10 20 20
📧 **Email**: info@labour.gov.za
🌐 **Website**: www.labour.gov.za

### CCMA (Commission for Conciliation, Mediation and Arbitration)
For disputes:
📞 **Call Centre**: 0861 16 16 16
📧 **Email**: info@ccma.org.za

### Union Representatives
- Speak to shop steward
- File internal grievance
- Seek union legal assistance

## Company Policies vs BCEA

Company can offer:
- MORE than BCEA minimums ✅
- Stricter procedures ✅ (if not contradicting BCEA)
- Additional benefits ✅

Company cannot:
- Offer LESS than BCEA minimums ❌
- Remove BCEA rights ❌
- Override BCEA protections ❌

**Your employment contract cannot waive BCEA rights**

## Record Keeping

Keep records of:
- Employment contract
- Payslips (min 3 years)
- Leave records
- Performance reviews
- Correspondence with employer
- Medical certificates

**Required retention**: 3 years minimum

## Further Information

### Resources
- Department of Labour website
- BCEA full text: www.gov.za
- Your company HR handbook
- Union resources
- Legal aid clinics

### Free Advice
- Labour Centres
- University law clinics
- Legal Aid SA
- Trade union offices`,
    tags: ['bcea', 'rights', 'employment', 'law'],
    lastUpdated: '2025-12-09',
  },
];

// Search function
export function searchArticles(query: string): HelpArticle[] {
  const lowerQuery = query.toLowerCase();
  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// Get articles by category
export function getArticlesByCategory(category: string): HelpArticle[] {
  return articles.filter((article) => article.category === category);
}

// Get single article
export function getArticle(id: string): HelpArticle | undefined {
  return articles.find((article) => article.id === id);
}
