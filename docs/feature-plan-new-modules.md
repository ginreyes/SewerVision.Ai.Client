# Feature Plan: New Modules Per Role

> Date: March 20, 2026
> Status: Planning Phase — not yet implemented
> Priority: To be determined per sprint

---

## Customer Representative (Improvements + New Modules)

### Improvements to Existing Modules
- **Tickets** — Add real-time typing indicators, canned response insertion from templates directly inside the reply editor, and ticket merge for duplicates
- **Monitoring** — Add exportable SLA reports (PDF/CSV), SLA breach alerts via push notification, and historical comparison (week-over-week)
- **Inbox** — Add threaded conversations, @mentions for tagging teammates, and read receipts
- **Templates** — Add template usage analytics (most used, least used), template sharing across the team, and variable placeholders (e.g. `{{customer_name}}`)
- **Dashboard** — Add customer satisfaction score (CSAT) widget and a live ticket feed

### 5 New Modules
| # | Module | Description |
|---|--------|-------------|
| 1 | **Knowledge Base** | Create and manage help articles, FAQs, and troubleshooting guides that can be shared with customers or linked in ticket responses |
| 2 | **Customer Profiles** | Centralized view of each customer's history — all past tickets, projects, interactions, and satisfaction scores in one place |
| 3 | **Escalation Manager** | Define escalation rules (time-based, priority-based), auto-escalate breached SLAs, and track escalation chains with notifications |
| 4 | **Canned Workflows** | Multi-step automated workflows for common scenarios (e.g. onboarding a new customer, handling a billing dispute) with drag-and-drop builder |
| 5 | **Satisfaction Surveys** | Send post-resolution CSAT surveys, collect ratings and feedback, and display satisfaction trends on the dashboard |

---

## Admin

### 5 New Modules
| # | Module | Description |
|---|--------|-------------|
| 1 | **Audit Log Viewer** | Searchable, filterable log of all user actions across the platform — login events, data changes, permission updates, deletions — for compliance and security |
| 2 | **Analytics & Insights** | Advanced reporting dashboard with project completion rates, team productivity metrics, AI detection accuracy trends, and exportable charts |
| 3 | **Billing & Invoicing** | Generate invoices per project/customer, track payment status, manage subscription tiers, and export financial summaries |
| 4 | **System Health Monitor** | Real-time status of backend services, AI processing queues, storage usage, API response times, and uptime tracking with alert thresholds |
| 5 | **Announcement Center** | Broadcast announcements to specific roles or all users — maintenance windows, feature releases, policy changes — displayed as banners or in-app notifications |

---

## Operator

### 5 New Modules
| # | Module | Description |
|---|--------|-------------|
| 1 | **Field Checklist** | Pre-inspection checklists that operators must complete before starting a job — equipment verification, safety checks, site conditions — with photo capture |
| 2 | **GPS Route Planner** | Map-based view of assigned inspection sites with optimized driving routes, estimated travel times, and navigation links |
| 3 | **Offline Mode** | Cache assigned projects and checklists locally so operators can work in areas with poor connectivity, then auto-sync when back online |
| 4 | **Incident Reports** | Log field incidents (equipment failure, safety hazards, access issues) with photos, location, and severity — auto-notifies admin |
| 5 | **Time Tracking** | Clock in/out per project, track time spent on inspections vs travel vs setup, and generate timesheets for payroll integration |

---

## QC Technician

### 5 New Modules
| # | Module | Description |
|---|--------|-------------|
| 1 | **QC Review Templates** | Predefined review criteria templates per defect type — standardize how QC techs evaluate cracks vs root intrusions vs joint offsets |
| 2 | **Comparison Viewer** | Side-by-side comparison of AI detection vs manual review with overlay tools, measurement annotations, and before/after snapshots |
| 3 | **Training & Calibration** | Practice mode with known-answer detection samples to maintain accuracy, track calibration scores, and identify areas for improvement |
| 4 | **Defect Library** | Reference catalog of all defect types with example images, PACP codes, severity definitions, and recommended actions — searchable during reviews |
| 5 | **Review Analytics** | Personal performance dashboard — approval/rejection rates, average review time, consistency scores, and trends over time |

---

## User (Team Lead)

### 5 New Modules
| # | Module | Description |
|---|--------|-------------|
| 1 | **Resource Scheduler** | Visual calendar for assigning operators and QC techs to projects — drag-and-drop scheduling with conflict detection and availability tracking |
| 2 | **Budget Tracker** | Per-project budget tracking with estimated vs actual costs, expense categories, and alerts when approaching budget limits |
| 3 | **Client Communication Hub** | Direct messaging channel with assigned customers per project — share updates, request approvals, and attach files without leaving the platform |
| 4 | **Project Templates** | Save project configurations (team composition, task lists, milestones) as reusable templates for recurring inspection types |
| 5 | **Performance Reviews** | Track and evaluate team member performance — review completion rates, quality scores, response times — and generate periodic review summaries |

---

## Customer

### 5 New Modules
| # | Module | Description |
|---|--------|-------------|
| 1 | **Live Project Tracker** | Real-time map view showing where inspections are happening, with progress indicators, estimated completion times, and status updates |
| 2 | **Report Annotations** | Allow customers to comment on and annotate delivered reports — highlight sections, ask questions, and request clarifications inline |
| 3 | **Document Vault** | Centralized file storage for all project-related documents — contracts, permits, reports, invoices — organized by project with download history |
| 4 | **Appointment Scheduler** | Request and schedule inspection dates, view available time slots, and receive confirmation and reminder notifications |
| 5 | **Customer Dashboard Widgets** | Customizable dashboard with drag-and-drop widgets — choose which metrics, charts, and project summaries to display based on preference |

---

## Implementation Priority Suggestion

### Phase 1 (High Impact, Near-Term)
- Customer-Rep: Knowledge Base, Customer Profiles
- Admin: Audit Log Viewer, Analytics & Insights
- QC Technician: Defect Library

### Phase 2 (Medium Priority)
- Operator: Field Checklist, Incident Reports
- User: Resource Scheduler, Project Templates
- Customer: Document Vault, Report Annotations

### Phase 3 (Future Enhancements)
- Customer-Rep: Escalation Manager, Satisfaction Surveys, Canned Workflows
- Admin: Billing & Invoicing, System Health Monitor, Announcement Center
- Operator: GPS Route Planner, Offline Mode, Time Tracking
- QC Technician: Comparison Viewer, Training & Calibration, Review Analytics
- User: Budget Tracker, Client Communication Hub, Performance Reviews
- Customer: Live Project Tracker, Appointment Scheduler, Customer Dashboard Widgets
