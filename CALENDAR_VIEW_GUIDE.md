# Feature #4: Leave Calendar View - Complete! ✅

Your LeaveHub application now includes a powerful visual calendar for viewing and managing team leave schedules.

---

## What's Been Built

### 1. **Calendar Page Component** (`/dashboard/calendar/page.tsx`)

A fully-featured calendar interface with:

**View Modes:**
- **Month View** - Full month grid with all dates
- **Week View** - Focused 7-day view for detailed planning

**Interactive Features:**
- Click any day with leaves to see detailed information
- Color-coded leave status indicators
- Hover effects for better interactivity
- Today's date highlighted
- Navigation between months/weeks

**Visual Elements:**
- Leave overlays showing team members on leave
- Status color coding (Approved = Green, Pending = Yellow, Rejected = Gray)
- Employee initials in colored badges
- Leave type colors from database
- +X more indicator when multiple leaves overlap

### 2. **Filtering System**

**Leave Scope Filters:**
- **All Leaves** - View entire company's leave schedule
- **My Team** - Filter to only your department
- **My Leaves Only** - See only your own leave requests

**Status Filters:**
- **All Status** - Show all leave requests
- **Approved Only** - Only confirmed leaves
- **Pending Only** - Leaves awaiting approval

### 3. **Day Detail Modal**

Click on any day with leaves to open a modal showing:
- Full date display (e.g., "Friday, November 10, 2025")
- Count of team members on leave
- Detailed cards for each person including:
  - Employee name and department
  - Leave type with color badge
  - Status badge
  - Full date range and duration
  - Reason for leave

### 4. **API Endpoint** (`/api/calendar/leave-data`)

REST API for fetching calendar data with:
- User-based filtering (my leaves, team, company)
- Status filtering
- Date range filtering
- Department-based team grouping
- Demo data fallback for development
- Efficient database queries with Supabase

### 5. **Navigation Integration**

- Calendar button linked on main dashboard
- Easy access from "Quick Actions" section
- Consistent navigation throughout app

---

## Key Features

### Month View
```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 1    2    3    4    5    6    7
      Jane S.
      [Annual Leave]
 8    9   10   11   12   13   14
          John D.  John D.
          [Sick]   [Sick]
```

### Week View
- Focused view of single week
- More space for leave details
- Better for day-by-day planning

### Color Coding
- **Green/Leave Type Color** - Approved leaves
- **Yellow** - Pending approval
- **Gray** - Rejected requests
- **Blue Border** - Today's date

### Smart Overlays
Shows up to 3 leaves per day, then "+X more" indicator. Click day to see all.

---

## Usage Guide

### Accessing the Calendar

1. **From Dashboard:**
   - Click "View Calendar" button in Quick Actions section
   - Or navigate to `/dashboard/calendar`

2. **First Load:**
   - Calendar loads current month by default
   - Shows approved leaves by default
   - Filters to "All Leaves" scope

### Navigating the Calendar

**Change View:**
- Click "Month" or "Week" buttons to switch views

**Navigate Time:**
- Click left/right arrows to go previous/next period
- Click "Today" to return to current date

**Filter Leaves:**
- Select filter from dropdown (All/My Team/My Leaves)
- Select status filter (All/Approved/Pending)
- Calendar updates automatically

### Viewing Leave Details

1. **Identify Days with Leave:**
   - Look for colored boxes on calendar days
   - Days with leaves show employee names

2. **Click for Details:**
   - Click any day with leave indicators
   - Modal opens with full details for all leaves that day

3. **Close Modal:**
   - Click X button or click outside modal
   - Return to calendar view

### Exporting (Future Feature)

Export button prepared for:
- PDF export of calendar
- CSV export of leave data
- Print-friendly format

---

## API Usage

### Fetch Calendar Data

```typescript
GET /api/calendar/leave-data?userId={clerkUserId}&filter=all&status=approved

Query Parameters:
- userId: string (required) - Clerk user ID
- filter: 'all' | 'my-team' | 'my-leaves' (optional, default: 'all')
- status: 'pending' | 'approved' | 'rejected' | 'all' (optional, default: all)
- startDate: YYYY-MM-DD (optional) - Filter leaves starting after date
- endDate: YYYY-MM-DD (optional) - Filter leaves ending before date

Response:
{
  "leaveRequests": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "start_date": "2025-11-10",
      "end_date": "2025-11-14",
      "working_days": 5,
      "status": "approved",
      "reason": "Family vacation",
      "leave_types": {
        "name": "Annual Leave",
        "code": "ANN",
        "color": "#0D9488"
      },
      "profiles": {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@company.com",
        "department": "Engineering"
      }
    }
  ],
  "isDemoData": false
}
```

### Filter Logic

**All Leaves:**
- Fetches all leave requests in user's company
- Good for company-wide planning

**My Team:**
- Fetches leaves from same department
- Based on `profiles.department` field
- Shows team coverage at a glance

**My Leaves Only:**
- Only user's own leave requests
- Personal view of approved/pending leaves

---

## Files Created

### Pages
- `/src/app/dashboard/calendar/page.tsx` - Main calendar component

### API Routes
- `/src/app/api/calendar/leave-data/route.ts` - Calendar data endpoint

### Modified Files
- `/src/app/dashboard/page.tsx` - Added calendar link button

---

## Technical Details

### Date Handling

Uses `date-fns` for all date operations:
- `startOfMonth` / `endOfMonth` - Month boundaries
- `startOfWeek` / `endOfWeek` - Week boundaries (starts Monday)
- `isWithinInterval` - Check if date is within leave period
- `format` - Display formatted dates
- `parseISO` - Parse database date strings

### Calendar Grid Generation

```typescript
// Month view spans from Monday before month start
// to Sunday after month end for complete weeks
const monthStart = startOfMonth(date);
const monthEnd = endOfMonth(date);
const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

// Create array of all dates in grid
const days = [];
let currentDay = calendarStart;
while (currentDay <= calendarEnd) {
  // Find leaves for this day
  const dayLeaves = leaveRequests.filter(leave =>
    isWithinInterval(currentDay, {
      start: parseISO(leave.start_date),
      end: parseISO(leave.end_date)
    })
  );

  days.push({ date: currentDay, leaves: dayLeaves });
  currentDay = addDays(currentDay, 1);
}
```

### Leave Overlap Logic

A leave request appears on a day if:
```typescript
isWithinInterval(dayDate, {
  start: parseISO(leave.start_date),
  end: parseISO(leave.end_date)
})
```

This means:
- Leave from Nov 10-14 shows on Nov 10, 11, 12, 13, 14
- Multi-day leaves span across calendar
- Single-day leaves show on that day only

### Performance Considerations

**Efficient Queries:**
- Filters applied at database level
- Only fetches necessary leave requests
- Joins leave_types and profiles in single query

**Client-Side Optimization:**
- Calculates day grid only when needed
- Memoizes leave-per-day calculations
- Minimal re-renders with React state

---

## South African Business Context

### Public Holiday Integration (Coming Soon)

Will integrate with `south-african-holidays.ts` to:
- Highlight public holidays on calendar
- Show holiday names
- Distinguish between national and provincial holidays
- Calculate working days accurately

### BCEA Compliance

Calendar view helps enforce:
- **Annual Leave Planning** - Visual overview of leave distribution
- **Team Coverage** - See if too many people off at once
- **Fairness** - Ensure equitable leave distribution
- **Documentation** - Export calendar for audits

---

## Best Practices

### For Managers

**Weekly Review:**
1. Switch to week view every Monday
2. Check upcoming team coverage
3. Approve pending requests with calendar context

**Monthly Planning:**
1. Start of each month, review month view
2. Identify potential coverage gaps
3. Communicate with team about optimal leave dates

### For Employees

**Plan Ahead:**
1. Check calendar before requesting leave
2. See when team members are away
3. Choose dates with good coverage

**Stay Informed:**
1. Filter to "My Team" regularly
2. Know when colleagues are on leave
3. Plan work handovers accordingly

---

## Customization Options

### Changing Week Start Day

Default is Monday (South African standard). To change:

```typescript
// In calendar component, change all weekStartsOn values
startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday, 1 = Monday
```

### Custom Color Schemes

Leave colors come from database `leave_types.color` field:
```sql
UPDATE leave_types SET color = '#your-hex-color' WHERE code = 'ANN';
```

### Adding More Filters

Add new filter options in component:
```typescript
<select>
  <option value="department-engineering">Engineering Only</option>
  <option value="managers">Managers Only</option>
  <option value="critical-roles">Critical Roles</option>
</select>
```

Update API endpoint to handle new filter types.

---

## Troubleshooting

### Calendar shows no leaves

**Check:**
1. Filter settings (try "All Leaves" and "All Status")
2. Date range (navigate to month with known leaves)
3. User permissions (ensure you can see team leaves)
4. API response in browser DevTools Network tab

### Modal doesn't open

**Check:**
1. Leaves exist on that day (colored boxes visible)
2. No JavaScript errors in browser console
3. Click directly on the day box, not empty space

### Wrong leaves showing

**Check:**
1. Filter is set correctly (All/Team/My Leaves)
2. Status filter includes desired statuses
3. Department field set correctly in profiles table

### Performance is slow

**Optimize:**
1. Add database indexes on frequently queried fields:
   ```sql
   CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
   CREATE INDEX idx_leave_requests_user_status ON leave_requests(user_id, status);
   CREATE INDEX idx_profiles_department ON profiles(department, company_id);
   ```

2. Limit date range in API query (don't fetch all historical data)

3. Implement caching for frequently accessed months

---

## Future Enhancements

### Phase 1 (Next Steps)
- [ ] Export to PDF/CSV functionality
- [ ] Print-optimized view
- [ ] Public holiday integration
- [ ] Sync with Google Calendar/Outlook

### Phase 2
- [ ] Drag-and-drop leave requests
- [ ] Multi-user selection for bulk approval
- [ ] Coverage analytics (% of team away each day)
- [ ] Resource allocation indicators

### Phase 3
- [ ] AI-powered optimal leave suggestions
- [ ] Automatic conflict warnings
- [ ] Team capacity forecasting
- [ ] Integration with project management tools

### Phase 4
- [ ] Mobile app with calendar view
- [ ] Push notifications for calendar changes
- [ ] Shared team calendars
- [ ] iCal feed generation

---

## Integration with Other Features

### Works With Feature #1: Leave Requests
- Submitted leaves appear on calendar automatically
- Visual confirmation of leave dates
- Easy to spot booking conflicts

### Works With Feature #2: Manager Approvals
- Managers see pending leaves on calendar (yellow)
- Approved leaves turn green on calendar
- Context for approval decisions (team coverage)

### Works With Feature #3: AI Features
- AI can analyze calendar to suggest dates
- Conflict detection uses calendar data
- Leave insights based on calendar patterns

---

## Database Requirements

### Required Tables
- `leave_requests` - Leave request data
- `leave_types` - Leave type definitions with colors
- `profiles` - User profiles with departments
- `companies` - Company definitions

### Required Fields

**leave_requests:**
- `id`, `user_id`, `start_date`, `end_date`
- `working_days`, `status`, `reason`
- `leave_type_id` (foreign key)

**leave_types:**
- `id`, `name`, `code`, `color`

**profiles:**
- `id`, `clerk_user_id`, `first_name`, `last_name`
- `email`, `department`, `company_id`

### Optional Enhancements

Add `is_public_holiday` field to mark special days:
```sql
ALTER TABLE leave_requests ADD COLUMN is_public_holiday BOOLEAN DEFAULT false;
```

Add calendar settings per company:
```sql
CREATE TABLE calendar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  week_start_day INTEGER DEFAULT 1, -- 0=Sunday, 1=Monday
  show_rejected_leaves BOOLEAN DEFAULT false,
  default_view VARCHAR(10) DEFAULT 'month',
  color_scheme VARCHAR(50) DEFAULT 'default'
);
```

---

## Feature #4 Complete! ✅

Your LeaveHub application now has:
- ✅ Visual calendar with month/week views
- ✅ Interactive day selection and details
- ✅ Advanced filtering (team, status, personal)
- ✅ Color-coded leave indicators
- ✅ API endpoint with smart queries
- ✅ Demo data fallback for development
- ✅ Responsive design for all screen sizes
- ✅ Real-time leave overlap detection

**What's Working:**
- Navigate between months and weeks
- See all team members' approved/pending leaves
- Click days to see detailed leave information
- Filter by department, status, or personal leaves
- Beautiful color-coding matching leave types
- Integration with existing dashboard

**Next Steps:**
1. Test the calendar at `/dashboard/calendar`
2. Try different filter combinations
3. Click on days with leaves to see details
4. Navigate between months and weeks

**Ready for Feature #5: Reports & Analytics** 📊

---

## Quick Reference

### URLs
- Calendar: `/dashboard/calendar`
- API: `/api/calendar/leave-data`

### Key Functions
- `getDaysInMonth()` - Generate month grid
- `getDaysInWeek()` - Generate week grid
- `isWithinInterval()` - Check if date has leave
- `goToPreviousPeriod()` / `goToNextPeriod()` - Navigate time

### Color Codes
- `#0D9488` - Primary/Annual Leave (Teal)
- `#EF4444` - Sick Leave (Red)
- `#F59E0B` - Family Responsibility (Amber)
- Green - Approved status
- Yellow - Pending status
- Gray - Rejected status

### Filter Values
- Scope: `all` | `my-team` | `my-leaves`
- Status: `all` | `pending` | `approved` | `rejected`

Enjoy your new calendar view! 🎉
