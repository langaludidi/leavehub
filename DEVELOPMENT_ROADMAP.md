# LeaveHub - Feature Development Roadmap
**Created:** December 9, 2025
**Goal:** Build all missing features to match the MVP specification

---

## 🎯 Development Priority Order

### **Phase 1: Quick Wins (Week 1-2)** ⚡
**Focus:** High-value features with existing backend support

1. ✅ **Document Management UI** (2-3 days)
   - File upload page with drag-and-drop
   - Document list/grid view
   - Category selection
   - Uses existing Supabase Storage
   - **Impact:** HIGH - Users can upload medical certificates

2. ✅ **AI Leave Planner UI** (2-3 days)
   - Chat interface for AI assistant
   - Integration with existing API endpoints
   - Smart suggestions display
   - **Impact:** HIGH - Differentiating feature

3. ✅ **Enhanced Reports Dashboard** (2 days)
   - Apply Navy/Gold color scheme
   - Improve visual charts
   - **Impact:** MEDIUM - Better UX

**Total:** ~1-2 weeks

### **Phase 2: Content & UX (Week 3-5)** 📚
**Focus:** Knowledge base and user experience improvements

4. ✅ **Help Center** (1 week)
   - Create 26 help articles
   - Build searchable knowledge base
   - Category organization
   - **Impact:** HIGH - Reduces support burden

5. ✅ **Role-Based Navigation** (3 days)
   - Dynamic menu based on user role
   - 5-role system implementation
   - Permission guards
   - **Impact:** MEDIUM - Better role separation

**Total:** ~2 weeks

### **Phase 3: Enterprise Features (Week 6-8)** 🏢
**Focus:** Multi-tenant and advanced capabilities

6. ✅ **Multi-Tenant Organization UI** (1 week)
   - Organization switcher
   - Org-specific settings
   - Data isolation UI
   - **Impact:** HIGH - Required for SaaS

7. ✅ **PDF Export System** (4 days)
   - Report generation
   - Branded headers/footers
   - Download functionality
   - **Impact:** MEDIUM - Professional reporting

**Total:** ~2 weeks

---

## 📅 Detailed Implementation Plan

### Feature 1: Document Management System

**Backend:** Already exists (Supabase Storage)
**Need to Build:** UI only

**Pages to Create:**
- `/dashboard/documents` - Main documents page
- `/dashboard/documents/upload` - Upload interface

**Components:**
- `DocumentUploadZone` - Drag-and-drop area
- `DocumentList` - Grid/list view
- `DocumentCard` - Individual document display
- `DocumentCategorySelect` - Category picker

**API Integration:**
- POST `/api/documents/upload`
- GET `/api/documents`
- DELETE `/api/documents/[id]`

**Time Estimate:** 2-3 days

---

### Feature 2: AI Leave Planner UI

**Backend:** Already exists (4 AI endpoints)
**Need to Build:** Chat interface

**Pages to Create:**
- `/dashboard/ai-planner` - AI chat interface

**Components:**
- `AIChatInterface` - Main chat component
- `AIMessageBubble` - Message display
- `AISuggestionCard` - Leave recommendations
- `AILoadingIndicator` - Thinking animation

**API Integration:**
- POST `/api/ai/leave-planner`
- POST `/api/ai/conflict-detection`
- POST `/api/ai/leave-insights`

**Time Estimate:** 2-3 days

---

### Feature 3: Help Center

**Backend:** Static content
**Need to Build:** Pages and content

**Structure:**
```
/help
  /getting-started
    - introduction
    - first-request
    - understanding-balances
  /features
    - leave-requests
    - approvals
    - calendar
    - reports
  /bcea-compliance
    - annual-leave
    - sick-leave
    - maternity-paternity
  /troubleshooting
```

**Pages to Create:**
- `/help` - Help center home
- `/help/[category]` - Category pages
- `/help/[category]/[article]` - Article pages
- `/help/search` - Search results

**Components:**
- `HelpSearch` - Search bar
- `ArticleCard` - Article preview
- `ArticleContent` - Article display
- `RelatedArticles` - Suggestions

**Content:** 26 articles to write

**Time Estimate:** 5-7 days (writing content takes time)

---

### Feature 4: Multi-Tenant Organization UI

**Backend:** Database structure exists
**Need to Build:** UI for switching/managing

**Pages to Create:**
- `/dashboard/organizations` - Org list/switcher
- `/dashboard/organizations/[id]/settings` - Org settings

**Components:**
- `OrganizationSwitcher` - Dropdown selector
- `OrganizationCard` - Org display
- `OrganizationSettings` - Configuration

**Database Updates:**
- Add org_id to user sessions
- Update RLS policies
- Org-specific data filtering

**Time Estimate:** 5-7 days

---

### Feature 5: Enhanced Reports with PDF Export

**Pages to Update:**
- `/dashboard/reports` - Add Navy/Gold theme

**Libraries to Add:**
- `jsPDF` or `react-pdf` for PDF generation

**Components:**
- `PDFExportButton` - Export trigger
- `ReportTemplate` - PDF layout
- `BrandedHeader` - Navy/Gold header
- `BrandedFooter` - Footer with branding

**Time Estimate:** 3-4 days

---

## 🛠️ Technical Requirements

### New Dependencies Needed
```json
{
  "@uploadthing/react": "^6.0.0",  // File uploads
  "react-dropzone": "^14.2.0",     // Drag-and-drop
  "jspdf": "^2.5.0",                // PDF generation
  "jspdf-autotable": "^3.8.0",     // PDF tables
  "react-markdown": "^9.0.0",      // Help article rendering
  "fuse.js": "^7.0.0"              // Search functionality
}
```

### Supabase Storage Setup
```sql
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- RLS policies for documents bucket
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 📊 Progress Tracking

| Feature | Status | Progress | ETA |
|---------|--------|----------|-----|
| Document Management | Not Started | 0% | 3 days |
| AI Leave Planner UI | Not Started | 0% | 3 days |
| Enhanced Reports | Not Started | 0% | 2 days |
| Help Center | Not Started | 0% | 7 days |
| Role-Based Nav | Not Started | 0% | 3 days |
| Multi-Tenant UI | Not Started | 0% | 7 days |
| PDF Export | Not Started | 0% | 4 days |

**Total Estimated Time:** 29 days (6 weeks)

---

## 🚀 Quick Start: Let's Build!

I recommend we start with **Document Management** because:
1. Backend already exists (Supabase Storage)
2. High user value (upload medical certificates)
3. Quick win to build momentum
4. ~2-3 days to complete

Shall we begin?
