# Plan for March 28, 2026 — Deployment Day

## 1. What's New System Overhaul

### Problem
- `whatsNewData.js` is a massive hardcoded file (18K+ tokens) with all release notes
- The What's New page shows ALL updates to ALL roles — no filtering
- The tour guide modal shows updates without considering the user's role
- Images are stored as static `/updates/` paths, not in cloud storage
- No admin interface to manage What's New entries — requires code changes for every update

### Plan

#### A. Role-Based Filtering

**Tour Guide Modal (`TourGuide.jsx`):**
- Read the authenticated user's `role` from `useUser()` context
- Filter `whatsNewData` updates to show only:
  - Updates matching the user's role key (e.g. `updates.operator` for operators)
  - Updates in `updates.other` (general/global changes visible to everyone)
- Admin sees ALL role updates (full view)

**What's New Page (`/whats-new`):**
- Show only `updates.other` (general updates) to all authenticated users
- Do NOT show role-specific updates here — those belong in the tour guide modal
- Admin sees everything (all roles + general)

#### B. Move What's New Data to Database

**New Backend Model: `WhatsNewRelease`**
```
WhatsNewRelease {
  version: string (e.g. "v1.9.0")
  date: Date
  label: string (e.g. "Major Release")
  isNew: boolean
  updates: [{
    role: string ("admin" | "operator" | "qc-technician" | "user" | "customer" | "customer-rep" | "general")
    type: string ("feature" | "fix" | "ui" | "improvement" | "security" | "planned")
    title: string
    description: string
    details: [string]
    images: [string]  // B2 file keys
  }]
  createdBy: ObjectId ref User
  timestamps: true
}
```

**New API Endpoints:**
- `GET /api/whats-new` — returns all releases (admin) or filtered by role (others)
- `GET /api/whats-new/latest` — returns latest release for tour guide
- `POST /api/whats-new` — admin creates new release
- `PUT /api/whats-new/:id` — admin edits release
- `DELETE /api/whats-new/:id` — admin deletes release
- `POST /api/whats-new/upload-image` — upload update screenshot to B2

**Frontend Changes:**
- Replace `import { whatsNewData }` with `useWhatsNewReleases()` hook
- What's New page fetches from API instead of static file
- Tour guide modal fetches latest release filtered by role
- Keep `whatsNewData.js` as a seed/migration source, then remove it

#### C. Image Storage in B2

- Update screenshots uploaded via admin interface go to B2: `updates/[version]/[filename]`
- Backend returns signed download URLs for private images
- Frontend renders images from B2 URLs instead of static `/updates/` paths
- Reduces frontend bundle size significantly (no more static images in public/)

---

## 2. Announcements Banner System

### Current State
- Announcements only visible on the admin `/admin/announcements` page
- No user-facing display — users never see announcements

### Plan

#### A. Global Announcement Banner Component

**New Component: `AnnouncementBanner.jsx`**
- Sits at the top of every role's layout (inside each role's `layout.js`)
- Fetches: `GET /api/announcements/active?role={userRole}` — returns sent + not-dismissed announcements for the user's role
- Displays as a slim, dismissible banner bar at the top of the page content area

**Banner Behavior:**
- Shows the latest unread announcement
- Type determines color: maintenance=amber, feature=blue, policy=purple, alert=red, general=gray
- **Dismiss button** — marks as dismissed for this user (stored in DB or localStorage)
- **Minimize/Maximize toggle:**
  - Minimized: small floating pill in bottom-right corner showing "1 announcement" with expand icon
  - Maximized: full banner bar at top with title, body preview, and dismiss/close buttons
- Once dismissed, that specific announcement never shows again for that user
- New announcements appear automatically (even if previous ones were dismissed)

**Backend Changes:**
- New model: `AnnouncementDismissal { announcementId, userId, dismissedAt }`
- New endpoint: `POST /api/announcements/:id/dismiss` — records dismissal
- Update `GET /api/announcements/active` — exclude dismissed announcements per user

#### B. Announcements + What's New Tab in Admin

**Option: Add "What's New" tab to the existing Announcements page**
- Tab 1: "Announcements" — existing functionality (create, send, manage)
- Tab 2: "What's New" — manage release notes (create versions, add updates per role, upload images)
- Keeps everything in one admin module instead of creating a separate page
- Announcement page becomes the central "Communications Hub" for admins

---

## 3. Deployment Checklist

### Pre-Deployment
- [ ] Run `npx next build --no-lint` — verify zero errors
- [ ] Run `npx ts-node src/scripts/seedSecurityModules.ts --production` — verify all 61 modules seeded
- [ ] Verify all environment variables are set on production server:
  - `MONGO_URI` (production cluster)
  - `JWT_SECRET`
  - `BACKBLAZE_KEY_ID`, `BACKBLAZE_APP_KEY`, `BACKBLAZE_BUCKET_ID`, `BACKBLAZE_BUCKET_NAME`
  - `AWS_SES_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (for survey emails)
  - `ROBOFLOW_API_KEY`, `ROBOFLOW_WORKSPACE`
  - `CLIENT_URL` / `FRONTEND_URL`
- [ ] Check that all new API routes are registered in `app.ts` (28+ new routes added this sprint)
- [ ] Verify backend compiles: `npx tsc --noEmit`

### Deployment Steps
- [ ] Push frontend to Vercel (or hosting platform)
- [ ] Push backend to hosting (verify PM2/Docker picks up new routes)
- [ ] Restart backend server to load all new route registrations
- [ ] Verify MongoDB indexes are created (first request triggers index creation)

### Post-Deployment Smoke Test
- [ ] Admin: Dashboard, Analytics, Billing, System Health, Announcements, Users
- [ ] Operator: Checklists, Route Planner, Incidents, Time Tracking, Offline Mode
- [ ] QC Technician: Defect Library (CRUD), Comparison, Training, Review Templates, Review Analytics
- [ ] Customer-Rep: Knowledge Base, Customer Profiles, Escalation, Workflows, Surveys
- [ ] User/Team Lead: Resource Scheduler, Budget Tracker, Client Hub, Project Templates, Performance Reviews
- [ ] Customer: Live Tracker, Document Vault, Appointments, Report Annotations, Dashboard Widgets
- [ ] Verify Roboflow viewer loads projects correctly
- [ ] Verify sidebar navigation shows all new modules per role

---

## 4. Suggested New Admin Modules (Future Sprint)

### High Value — Should Build Next

| Module | Description | Why |
|--------|-------------|-----|
| **Email Templates Manager** | Admin UI to create/edit HTML email templates (survey invites, notifications, welcome emails) without code changes | Currently templates are hardcoded in `sendEmail.ts` — every change requires a deploy |
| **Role & Permission Builder** | Visual drag-and-drop permission editor — toggle modules per role, create custom permission sets | Current permission levels are managed via seed scripts; admin needs a UI to customize per-user access |
| **Data Export Center** | Bulk export projects, reports, observations as CSV/PDF/Excel with date range filters | Clients frequently request data dumps; currently requires manual DB queries |
| **Integration Hub** | Manage third-party connections (Roboflow, B2, AWS SES) from one page — test connections, view status, update keys | API keys buried in .env; need visibility into what's connected and working |

### Medium Value — Nice to Have

| Module | Description | Why |
|--------|-------------|-----|
| **Scheduled Reports** | Auto-generate and email weekly/monthly project summary reports to specified recipients | Reduces manual report generation workload |
| **Customer Onboarding Wizard** | Step-by-step guided setup for new customer accounts — profile, project setup, notification preferences | Currently manual; a wizard would standardize the onboarding experience |
| **API Usage Dashboard** | Monitor API call volumes, response times, error rates per endpoint | Helps identify performance bottlenecks before they become incidents |
| **White-Label Settings** | Customize logo, colors, email branding per customer organization | Enterprise clients may want their own branding on the portal |

### Lower Priority — Future Consideration

| Module | Description |
|--------|-------------|
| **Changelog Generator** | Auto-generate release notes from git commits |
| **Feature Flags** | Toggle features on/off per role or customer without deploys |
| **Backup Manager** | Schedule and manage database backups from admin UI |
| **Multi-Language** | i18n support for customer-facing pages |

---

## 5. Making the Project Lighter

### Current Pain Points
- `whatsNewData.js` is 18K+ tokens of static data bundled into the frontend
- Update screenshots stored as static files in `/public/updates/` increase build size
- Large page files (some 700+ lines) loaded fully even if user only visits one tab

### Solutions

| Action | Impact | Effort |
|--------|--------|--------|
| Move What's New data to DB (see Section 1B) | Removes 18K tokens from frontend bundle | Medium |
| Move update images to B2 (see Section 1C) | Removes static images from build; loads on demand | Medium |
| Lazy-load heavy page sections with `Next.js dynamic()` | Code-split large pages; only load what's visible | Low |
| Add `react-window` for long lists (defect library, messages) | Only render visible rows; reduces DOM nodes | Low |
| Compress and optimize existing static assets | Smaller initial page load | Low |
| Move large constants (PACP codes, chart data) to API | Reduces JS bundle per page | Medium |

---

## Summary

**March 28 Priority Order:**
1. Deployment checklist + deploy to production
2. Post-deployment smoke test across all roles
3. Fix any runtime issues found during testing
4. Begin What's New system overhaul (DB model + API)
5. Begin Announcement banner component

**Files to Create/Modify:**
- `concertine_back_end/src/models/WhatsNewRelease.ts` (new)
- `concertine_back_end/src/controllers/whatsNew.controller.ts` (new)
- `concertine_back_end/src/routes/whatsNew.ts` (new)
- `concertine_back_end/src/models/AnnouncementDismissal.ts` (new)
- `concertina_front_end/src/components/ui/AnnouncementBanner.jsx` (new)
- `concertina_front_end/src/app/whats-new/page.js` (refactor)
- `concertina_front_end/src/components/TourGuide.jsx` (add role filtering)
- `concertina_front_end/src/app/admin/announcements/page.js` (add What's New tab)
- All role `layout.js` files (add AnnouncementBanner)
