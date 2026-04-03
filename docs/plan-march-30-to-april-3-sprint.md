# Sprint Plan — March 30 to April 3, 2026

## Sprint Goal
Enhance existing modules, add new cross-role features, and consolidate the platform for production readiness.

---

## Task 1: Customer Surveys Module
**Priority:** High | **Est:** 1 day

### What
Build a dedicated survey page in the Customer portal where customers can view and submit pending CSAT surveys, see their past ratings, and provide feedback on completed projects.

### Details
- New page: `/customer/surveys`
- Show pending survey invites (from SurveyInvite model where status = "sent")
- Inline star rating + comment form (no need to open external `/survey/[token]` page)
- History tab showing past submitted surveys with ratings
- Average satisfaction score card at top
- Connect to existing `SurveyInvite` and `SurveyResponse` backend models
- Add to customer sidebar under "Account" group

### Files
- `concertina_front_end/src/app/customer/surveys/page.js` (new)
- `concertina_front_end/src/components/customer/surveys/` (new folder)
- Update `UnifiedSidebar.jsx` FALLBACK_MENUS.customer
- Update `SecurityModule.ts` DEFAULT_SECURITY_MODULES
- Seed both databases

---

## Task 2: Customer-Rep Overall Performance Dashboard
**Priority:** High | **Est:** 1 day

### What
New module for admins/managers to see aggregated performance metrics across all customer reps — response times, resolution rates, CSAT scores, ticket volumes, SLA compliance.

### Details
- New page: `/admin/rep-performance` OR add as tab in existing `/admin/support`
- Pulls data from: SupportTicket, SurveyResponse, Complaint models
- Metrics per rep: avg response time, tickets resolved, avg CSAT, open ticket count, SLA compliance %
- Leaderboard view (ranked by combined score)
- Date range filter (7d, 30d, 90d)
- Bar chart: tickets resolved per rep
- Donut: team CSAT distribution
- Table: individual rep stats with trend indicators

### Backend
- New endpoint: `GET /api/admin-analytics/rep-performance` — aggregates from SupportTicket + SurveyResponse
- No new model needed — reads from existing collections

### Files
- `concertina_front_end/src/app/admin/rep-performance/page.js` (new) OR new tab in support page
- `concertina_front_end/src/components/admin/rep-performance/` (new folder)
- Backend: add to `adminAnalytics.controller.ts`

---

## Task 3: Report Center (Consolidation)
**Priority:** High | **Est:** 1.5 days

### What
Convert the existing per-role report pages into a unified Report Center with tabs for each role's reports. Admin gets the full view; other roles see only their own tab.

### Details
- Refactor `/admin/report` page into a tabbed Report Center
- Tabs: All Reports | Operator Reports | QC Reports | Customer Reports | Team Lead Reports
- Each tab fetches from the existing role-specific report API
- Admin sees all tabs; other roles see only their tab (role filtering)
- Add: export to CSV/PDF button per tab
- Add: date range filter, status filter, project filter across all tabs
- Shared table component with consistent columns

### Files
- Refactor `concertina_front_end/src/app/admin/report/page.js`
- `concertina_front_end/src/components/admin/report/ReportTabs.js` (new)
- `concertina_front_end/src/components/admin/report/ReportTable.js` (new)
- Update `index.js` barrel exports

---

## Task 4: Data Export Center
**Priority:** Medium | **Est:** 1 day

### What
New module for Admin and Operator roles to bulk export data (projects, reports, observations, time entries) as CSV or Excel files with date range and project filters.

### Details
- New pages: `/admin/data-export` and `/operator/data-export`
- Export types: Projects, Reports, Observations, Time Entries, Tickets, Defects
- Filters: date range, project, status, role
- Backend generates CSV/JSON on the fly using streaming response
- Download button triggers browser download
- Export history log (who exported what, when)

### Backend
- New controller: `dataExport.controller.ts`
- New route: `GET /api/export/:type` with query params for filters
- Uses MongoDB cursor streaming for large datasets
- Returns CSV with proper headers

### Files
- `concertine_back_end/src/controllers/dataExport.controller.ts` (new)
- `concertine_back_end/src/routes/dataExport.ts` (new)
- `concertina_front_end/src/app/admin/data-export/page.js` (new)
- `concertina_front_end/src/app/operator/data-export/page.js` (new)
- `concertina_front_end/src/components/admin/data-export/` (new folder)
- Update sidebar, security modules, seed

---

## Task 5: Admin Calendar Enhancement
**Priority:** Medium | **Est:** 1 day

### What
Enhance the admin calendar to show events from ALL roles (operators, QC techs, team leads) in one unified view. Add a customer-rep calendar or integrate scheduling into the team management module.

### Details
- Admin calendar: fetch events from all role calendars, color-coded by role
- Filter toggle: show/hide events per role
- New: customer-rep calendar page OR "Schedule" tab in team management
- Customer-rep schedule: view team availability, assigned shifts, meeting slots
- Integrate appointment data (from customer Appointments model) into admin calendar view

### Files
- Refactor `concertina_front_end/src/app/admin/calendar/page.js`
- Update `concertine_back_end/src/controllers/calendar.controller.ts` — add cross-role fetch
- New: `concertina_front_end/src/app/customer-rep/calendar/page.js` OR add tab to team page

---

## Task 6: What's New System Overhaul
**Priority:** Medium | **Est:** 1 day

### What
Move What's New data from hardcoded `whatsNewData.js` to database. Add role-based filtering. Integrate into Announcements admin page as a tab.

### Details (from march-28 plan)
- New model: `WhatsNewRelease` with versioned updates per role
- Tour guide modal: filter updates by authenticated user's role
- What's New page: show only general updates (admin sees all)
- Admin Announcements page: add "What's New" tab for managing releases
- Upload images to B2 instead of static `/public/updates/`
- Remove `whatsNewData.js` after migration

### Files
- See `plan-march-28-deployment-day.md` Section 1 for full file list

---

## Task 7: Notes Module Reorganization
**Priority:** Low | **Est:** 0.5 day

### What
Remove Notes from Admin sidebar (not needed at admin level). Add Notes to Customer-Rep role for internal case notes and ticket documentation.

### Details
- Remove from `ADMIN_MENU_GROUPS` in UnifiedSidebar
- Remove from admin security modules (or set active: false)
- Add new Notes entry to `FALLBACK_MENUS['customer-rep']` under "Support" group
- Add security module for customer-rep notes
- The existing Notes page/components already work — just redirect the route
- Customer-rep notes path: `/customer-rep/notes`
- Create a thin page at `/customer-rep/notes/page.js` that reuses existing Notes components

### Files
- Update `UnifiedSidebar.jsx` — remove from ADMIN_MENU_GROUPS, add to customer-rep FALLBACK_MENUS
- `concertina_front_end/src/app/customer-rep/notes/page.js` (new — thin wrapper)
- Update `SecurityModule.ts` — add customer-rep notes entry
- Seed both databases

---

## Task 8: AI Training Module (Future Planning Only)
**Priority:** Planning only — no code this sprint

### What
Conceptual planning for a future module that brings AI model training capabilities into the admin panel, similar to Roboflow's training interface.

### Challenges
- Model training requires GPU compute (not available on standard web servers)
- Training jobs take hours/days — need async job queue
- Dataset management (upload, annotate, version) is complex
- Roboflow already handles this well — may not need to reinvent

### Possible Approach
- Use Roboflow API to trigger training runs from our admin panel
- Show training progress, metrics, and completion status
- Manage datasets (upload images, map to PACP codes) in our system, push to Roboflow for training
- This is essentially a "Roboflow Dashboard Lite" embedded in admin

### Recommendation
- For now, Jerad uses Roboflow directly for training
- Our admin panel shows available models + metrics (already built in AI Models tab)
- Phase 2 (future): API integration to trigger Roboflow training from admin
- Phase 3 (far future): Self-hosted training pipeline (requires GPU infrastructure)

### No files to create this sprint — planning document only

---

## Announcement Banner (Carried from March 28 plan)
**Priority:** Medium | **Est:** 0.5 day

- Global `AnnouncementBanner.jsx` component in all role layouts
- Dismissible per user (stored in DB)
- Minimize/maximize toggle
- See `plan-march-28-deployment-day.md` Section 2 for full details

---

## Sprint Schedule

| Day | Date | Tasks |
|-----|------|-------|
| Mon | Mar 30 | Task 1 (Customer Surveys) + Task 2 (Rep Performance) |
| Tue | Mar 31 | Task 3 (Report Center consolidation) |
| Wed | Apr 1 | Task 4 (Data Export Center) + Task 7 (Notes reorg) |
| Thu | Apr 2 | Task 5 (Calendar enhancement) + Task 6 (What's New overhaul) |
| Fri | Apr 3 | Announcement Banner + testing + bug fixes + sprint review |

---

## New Modules Summary (Added This Development Cycle)

### Modules Created March 25–27, 2026

| Role | Module | Status | Backend |
|------|--------|--------|---------|
| **Admin** | Analytics | Functional | Real API (aggregates from Project, User, AIDetection) |
| **Admin** | Billing | Seed data | No billing API scoped yet |
| **Admin** | System Health | Functional | Real API (server metrics) |
| **Admin** | Announcements | Functional | Full CRUD + role-targeted send |
| **Operator** | Checklists | Functional | Full CRUD + item toggle |
| **Operator** | Route Planner | Functional | Full CRUD + complete site |
| **Operator** | Incidents | Functional | Full CRUD + admin notify |
| **Operator** | Time Tracking | Functional | Full CRUD + time summary |
| **Operator** | Offline Mode | Functional | Cache toggle + sync |
| **QC Tech** | Defect Library | Functional | Full CRUD + 45 PACP codes seeded |
| **QC Tech** | Comparison Viewer | Functional | Reads from AIDetection |
| **QC Tech** | Review Templates | Functional | Full CRUD |
| **QC Tech** | Training | Functional | Modules + quiz attempts |
| **QC Tech** | Review Analytics | Functional | Aggregates from AIDetection |
| **Customer-Rep** | Knowledge Base | Functional | Full CRUD articles |
| **Customer-Rep** | Customer Profiles | Functional | Reads from tickets + users |
| **Customer-Rep** | Escalation Manager | Functional | Rules CRUD + live escalated tickets |
| **Customer-Rep** | Workflows | Functional | Multi-step workflow CRUD |
| **Customer-Rep** | Surveys (CSAT) | Functional | Send + collect + stats |
| **User** | Resource Scheduler | Functional | Weekly assignments + team members |
| **User** | Budget Tracker | Functional | Budgets + expenses |
| **User** | Client Hub | Functional | Conversations + messages |
| **User** | Project Templates | Functional | CRUD + duplicate + use count |
| **User** | Performance Reviews | Functional | Team metrics + summary |
| **Customer** | Live Tracker | Functional | Real project data + timeline |
| **Customer** | Document Vault | Functional | Documents + download tracking |
| **Customer** | Appointments | Functional | Booking + slot availability |
| **Customer** | Report Annotations | Functional | Comments + replies |
| **Customer** | Dashboard Widgets | Functional | Preferences + live data |

**Total: 29 new module pages across 6 roles**
**Backend: 24 new models, 24 controllers, 24 route files, 150+ API endpoints**
**Frontend: 30+ React Query hooks, 100+ component files, barrel exports for all modules**

### Architecture Improvements Applied
- Component extraction with barrel exports (`components/{role}/{module}/index.js`)
- DataTypes.js constants per module
- React.memo on all card/list components
- useMemo for filtered/sorted data
- useCallback for handlers passed to children
- refetchOnWindowFocus: false on CRUD hooks
- Consistent API response handling (`Array.isArray(data) ? data : (data?.data || [])`)
- Security modules seeded on both local and production databases (61 total)
