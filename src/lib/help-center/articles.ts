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
