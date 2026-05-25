
export const whatsNewData = [
    {
        id: "v2.7.0",
        date: "May 26, 2026",
        label: "Admin Bulk-Op Audit Trail + Reminder Cooldown Override + Health Rollup Polling",
        isNew: true,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Bulk Operations Audit Trail',
                    description: 'Admin bulk actions on devices and uploads now write AuditLog rows (projects already did), and /admin/audit-log gains a "Bulk Operations" tab showing only the bulk-op trail across all three resources.',
                    details: [
                        'bulkDeviceAction and bulkUploadAction now emit device_bulk_<op> / upload_bulk_<op> audit rows with requested/succeeded/failed counts and a capped id sample — matching the existing project_bulk_<op> convention',
                        'New GET /api/audit/bulk endpoint constrained to an ADMIN_BULK_ACTIONS allow-list (admin-only via authorizeRoles) so the History tab can\'t be repurposed to read arbitrary AuditLog rows; the action-filter dropdown is driven by the server\'s allowedActions list',
                        'Audit-log page gets an All Events / Bulk Operations tab switch; destructive *_delete rows keep the red delete styling in either view',
                        'Bulk view gets its own scoped stat cards via a $facet severity/today/total rollup on /audit/bulk, and a constrained /audit/bulk/export endpoint (shares the allow-list query builder so the CSV can never spill non-bulk rows)',
                        'Click any audit row to open a detail drawer showing the full metadata the table truncates — succeeded/failed ids, payload, and per-op counts',
                    ]
                },
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Reminder Cooldown Override',
                    description: 'A freshly-renewed cert sometimes needs an immediate re-reminder. The owning team-lead (or admin) can now override the 24h reminder cooldown from the certifications page — the override is recorded in the audit log.',
                    details: [
                        'POST /api/user/training/:id/remind accepts ?force=true; within the cooldown window a non-forced call returns 429 with canForce:true so the UI can offer a confirm-and-override',
                        'Forced reminders are stamped cooldownOverridden in the audit metadata and bumped to medium severity so they stand out in the trail',
                        '/user/certifications "Remind" now shows a "Send anyway?" confirm dialog on cooldown instead of dead-ending on the error toast',
                        'The History tab tags forced reminders with an orange "Forced" badge and adds a "Forced only" toggle (server-side ?overridden=true filter) so overrides are visible where the actions live',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Project Health Rollup Auto-Refresh',
                    description: 'The team-lead dashboard Project Health row now polls every 30s like the admin equivalent, so a project sliding into the red surfaces without a manual refresh.',
                    details: [
                        'useProjectHealthRollup gains refetchInterval 30s with staleTime tracking the interval so window-focus doesn\'t double-fire on top of the poll',
                    ]
                },
            ],
        },
    },
    {
        id: "v2.6.0",
        date: "May 18 – 22, 2026",
        label: "Team-Lead Compliance Suite + Render-Stability Sweep + Chunked Upload Hardening",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Equipment Issues Bulk Actions + Status Filter',
                    description: 'Selection checkboxes on every /admin/equipment-issues row unlock bulk Acknowledge and bulk Resolve, with per-item success/failure tallying via Promise.allSettled.',
                    details: [
                        'New BulkActionsBar component appears once any row is selected — bulk Acknowledge for Open issues and bulk Resolve with optional shared resolution notes',
                        'Per-item Promise.allSettled fan-out so a single failing row doesn\'t abort the batch — toast reports "Acknowledged N · failed M"',
                        'Status filter Select added to FilterBar (Open / Acknowledged / In repair / Resolved / Any) so cross-status search-and-bulk works without round-tripping through tabs',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Team Activity Card on Dashboard Overview',
                    description: 'New per-inspector workload aggregation card on /admin/dashboard Overview — active project count, pending-QC badge, total defects, and over-loaded / idle highlights derived client-side from recentProjects.',
                    details: [
                        'Drop-in widget — no new backend endpoint needed (today\'s ship), follow-up wires it to /api/admin/team-workload-overview',
                        'Highlights overloaded inspectors in amber and idle inspectors in muted grey so admin spots capacity drift at a glance',
                    ]
                },
                {
                    type: 'security',
                    title: 'Audit Log ReDoS Hardening (storage + 8 other controllers)',
                    description: 'User-supplied search input is now escaped via the new src/utils/escapeRegex.ts helper before reaching new RegExp(...) — a single `[` no longer throws SyntaxError mid-request and `.+` no longer scans the full collection as a wildcard.',
                    details: [
                        'Swept across storage, audit, device, complaint, incident, clientConversation, customerDocument, qc_notes, qc_reports, reports controllers',
                        '5-test vitest pinning the helper itself (regression: `[` throws unescaped, parses escaped; `.+` matches literally)',
                        'Storage audit endpoint additionally constrained to STORAGE_ACTIONS allow-list so the action filter can\'t be repurposed to read non-storage AuditLog rows',
                        'endDate=YYYY-MM-DD now pushed to T23:59:59.999Z so audit windows include the full final day',
                    ]
                },
            ],
            operator: [
                {
                    type: 'fix',
                    title: 'Chunked Upload Pipeline Hardening (C3 Day 7-8)',
                    description: 'End-to-end fixes across the offline upload stack so resumed uploads, hash mismatches, and stale sessions all behave predictably under the conditions that were biting us in dev.',
                    details: [
                        'completeChunkedUpload now ends the concat writestream explicitly and awaits its `finish` event — previously the buffer could be read mid-flush on fast disks and ship a truncated payload to storageService',
                        'reconcileWithServer now POSTs /complete when status.complete is true — finishes uploads whose chunks the server already has',
                        'gcStaleChunkedUploads no longer wipes in-flight sessions on a transient manifest JSON parse hiccup — manifest-less staging dirs are only deleted when their mtime exceeds STALE_SESSION_MS',
                        'Collapsed the double window `online` listener race on the operator uploads page — drain handler no longer fires before reconcile finishes',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Reconcile Progress + Hash-Mismatch Retry',
                    description: 'Operator uploads page now surfaces what the offline-queue reconciliation is doing on mount, and a single chunk corruption auto-retries instead of failing the upload.',
                    details: [
                        'reconcileWithServer accepts onProgress({ total, scanned, reconciledChunks }) and UploadSummaryCard renders "Syncing offline queue with server (N/M)" while it runs',
                        'New putChunkOnce wraps both live-upload and resume paths — auto-retries exactly once on a 422 chunk hash mismatch by re-reading the blob and re-PUTting',
                        'onHashMismatch callback bubbles { uploadId, index } to the UI which renders a rose-bordered "Chunk N corrupted in transit — auto-retried" inline notice',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Per-Row Local-Queue Actions in Upload History',
                    description: 'IDB-staged local rows in UploadHistoryTable are no longer read-only — Resume retries the queue for just that uploadId, Discard removes the row and its staged blobs, View-error pops the lastError + chunk index + timestamp.',
                    details: [
                        'listIdbQueueRows() projects local IDB rows into the server-Upload shape so they merge inline with server rows',
                        'Local rows show a "local" badge with amber/blue/rose tone for queued/draining/failed states',
                        'lastError surfaces inline so stuck rows are self-explaining without opening DevTools',
                    ]
                },
                {
                    type: 'security',
                    title: 'Service Worker Chunk Persistence Tightened',
                    description: 'The SW\'s chunk-PUT regex now requires the 32-hex shape the server actually issues — a stray local-<uuid> id can no longer be persisted under an id the server will reject forever.',
                    details: [
                        'When the SW sees a chunk PUT for an uploadId the page hasn\'t enqueued, it now returns false from persistChunk and falls through to the network — no more phantom 202 with totalChunks=0',
                        'SW_VERSION bumped to v0.3.1-day8',
                    ]
                },
            ],
            qcTechnician: [
                {
                    type: 'feature',
                    title: 'Speed Trends — Per-Reviewer Module',
                    description: 'New /qc-technician/speed-trends page graphing defects-per-hour and review-throughput over 7/30/90-day windows with role-themed accents.',
                    details: [
                        'Backed by the new /api/qc-technician/speed-trends endpoint',
                        'CSV export of the current window for offline analysis',
                    ]
                },
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Training & Certifications — Compliance Suite Complete',
                    description: 'The team-lead Training & Certifications module gains bulk actions, dashboard widgets, side-panel drill-down, audit history, and CSV export — closing the loop on "I need to manage 30 expiring certs without a spreadsheet".',
                    details: [
                        'Bulk Renew: multi-select rows then push a new expiry date forward; status is recomputed from the new expiry so already-expired rows roll back to active/expiring automatically',
                        'Bulk Remind: choose immediate / daily / weekly cadence; immediate fires NotificationService alerts now, the others stamp the schedule on the row for the reminder job',
                        'Category facets (Safety, QC Cert, Device Cert, Compliance, Onboarding) joining the status filter row',
                        'Export filtered records as CSV via the new GET /api/user/training/export endpoint — filter state preserved in the download',
                        'New History tab showing the audit trail of bulk-renew / bulk-remind / per-member remind actions — who did it, when, how many records, what schedule, with action-filter dropdown (TRAINING_ACTIONS allow-list enforced server-side)',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Dashboard Compliance Summary + Member Side-Panel',
                    description: 'A red/amber/green compliance pill card now sits above Recent Projects so the team-lead sees the team\'s certification health on dashboard load — and clicking any member name slides in a per-member drill-down.',
                    details: [
                        'New /api/user/certifications/team-summary endpoint returning totalRecords / activeCount / expiringCount / expiredCount / riskMembersList',
                        'MemberComplianceSidePanel sheet renders records grouped by category (Safety / QC Cert / Device Cert / Compliance / Onboarding / Other) with the same tone palette as the certifications page',
                        '"View compliance" affordance on every TeamMemberList row plus a clickable "Members to triage" list in the summary card',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Certification Reminder Deep-Link → Side-Panel',
                    description: 'Per-record and bulk reminder actions now ALSO fire an owner-side notification stamped with a /user/dashboard?compliance=<memberId> deep-link, so clicking the bell entry lands the team-lead on the member\'s compliance side-panel without hunting through the page.',
                    details: [
                        'New resolveOwnerComplianceUrl helper on the backend centralises the deep-link shape',
                        'NotificationCenter rows now render an "Open" action when actionUrl is present, navigating via next/router and marking the row read in the same click',
                        'Dashboard reads ?compliance= on mount, auto-opens MemberComplianceSidePanel, and wipes the query string so a refresh doesn\'t re-open it',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Project Health Rollup on Dashboard',
                    description: 'New ProjectHealthRow card lists the team-lead\'s active projects sorted worst-first with a one-line "why is this red" (SLA breach / QC stuck >48h / confidence drift / no snapshots / aging).',
                    details: [
                        'Backed by new GET /api/user/project-health-rollup endpoint — scopes the admin Project Health Score (May 11-15) to managerId, reuses the same factor weights so the score lines up across views',
                        'Snapshot counts batched into a single aggregation so a team with 50+ projects doesn\'t fan out to 50 N+1 queries',
                        'Score badge (Healthy / Watch / At risk / Critical) plus 0-100 number on every row, click to deep-link into /user/project?selectedProject=<id>',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Notes — Team-Lead Scope Wiring',
                    description: 'UserNotesPage now injects scope=team and routes through the new useUserNotes(userId) hook so the team-lead sees notes for their direct reports rather than the admin-wide list.',
                    details: [
                        'New src/components/user/notes/UserNotesPage replaces the bare re-export of the admin NotesPage',
                        'Hook composes existing notesApi.list with the team-lead userId — no new backend endpoint needed',
                    ]
                },
            ],
            general: [
                {
                    type: 'fix',
                    title: 'Render-Stability Sweep (NotificationProvider + Dashboards + Socket)',
                    description: 'A cross-role audit of high-traffic frontend pages eliminated the cascade re-renders that were burning frames every time a socket event arrived — bell badge, notification center, and dashboards now only update when an actual field changes.',
                    details: [
                        'NotificationProvider context value is now memoized so the bell badge and every page calling useNotifications() only re-render when a field actually changes',
                        'fetchNotifications no longer takes currentPage from the useCallback dep list — paginating no longer rebuilds the callback and cascade-invalidates every consumer',
                        'deleteNotification reads via the functional setNotifications updater so the callback ref stays stable across socket events',
                        'SocketProvider context value memoized so every page calling useSocket() (admin, operator, qc, user, customer-rep) stops re-rendering on every provider tick',
                        '/user/dashboard compliance widget triple-render fixed — onSelectMember and onViewCompliance wrapped in useCallback, StatsCards and ComplianceSummaryCard memoized so neighbouring widget refetches don\'t cascade',
                        'Identical fetchNotifications-deps fix applied to admin, operator, qc-technician, and customer-rep notifications pages',
                    ]
                },
                {
                    type: 'fix',
                    title: 'NotificationService Rollup Coalesce Bug',
                    description: 'The debounce/coalesce branch was dropping newer actionUrl, title, and priority on the floor — chat-mention rollups landed on the FIRST conversation that triggered the badge rather than the most recent.',
                    details: [
                        'Now refreshes actionUrl/title on every hit and escalates priority to high when a high-priority event arrives inside the 30s coalesce window',
                        'notification:updated socket emit now carries the new fields so the bell badge stays consistent with the row',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Training Reminder Audit Trail',
                    description: 'Bulk-renew / bulk-remind / per-record remind now append AuditLog rows under a constrained TRAINING_ACTIONS allow-list, so the new History tab can replay exactly who did what and when.',
                    details: [
                        'New /api/user/training/audit endpoint reads the rows, enriches actor + member display names server-side, and refuses any action outside TRAINING_ACTIONS so it can\'t be repurposed to read other AuditLog entries',
                        'AuditLog.create() is fire-and-forget — a flaky audit write never blocks the user action that produced it',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Notification Template Parity',
                    description: 'Training reminder mobile push + email templates now render the corrected /user/certifications actionUrl, derived from a single resolveActionUrl helper so future route renames break in one place.',
                    details: [
                        '2-case vitest in NotificationService.test.ts pinning the actionUrl shape',
                        'Email template CTA href is now a single helper call — no more hand-coded path strings drifting from the backend',
                    ]
                },
            ],
        }
    },
    {
        id: "v2.5.0",
        date: "May 11 – 15, 2026",
        label: "Equipment Issues End-to-End + Team-Lead Modules + Offline Upload Resilience",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Equipment Issues Back-Office Queue',
                    description: 'New /admin/equipment-issues page consolidating every broken-gear report across operators into one acknowledge-or-resolve queue.',
                    details: [
                        'Cross-operator list (operator-scoping silently dropped for admin/maintenance roles)',
                        'Filter by status (Open / Active / Resolved / All), severity (critical/high/medium/low), category (camera/battery/cable/housing/other)',
                        'Search across title, operator name, device, project, and description',
                        'Inline Acknowledge action on open issues, Resolve dialog with optional resolution notes (persisted on the row)',
                        'Summary cards for Open / Critical active / Total / Resolved with critical pill in the header',
                        'CSV export of the current filtered view (Title, Severity, Status, Operator, Device, Project, timestamps, resolution notes)',
                        'New AdminSidebar entry under Management with Wrench icon, RBAC-gated by the admin-equipment-issues security module',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Customer Representative Assignment on Projects',
                    description: 'Admin project edit form gained a "Customer Representative (optional)" Select so reps can be tied to a project at create/edit time.',
                    details: [
                        'Customer rep automatically joins the project chat group and the project appears in their dashboard',
                        'Backend Project model gained a customerRep ObjectId field with index',
                        'Backfill script extended to provision conversations for customer-rep-only projects',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Database Models Explorer',
                    description: 'Live introspection across all 63 Mongoose models surfaced under Admin → System Management → Database with a new Schemas section.',
                    details: [
                        'Per-model card with fieldCount, documentCount, relationship-count badges and an embedded field table',
                        'Domain bucketing (Identity, Projects & Pipeline, Field Capture, AI & Detections, QC & Reports, Communications, etc.)',
                        'Clickable relationship chips that scroll the target model into view',
                        'Copy TypeScript interface + per-model CSV + Summary CSV across all 63 models for offline review',
                        '5-minute cache with admin-only refresh endpoint',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'AI Model Control Plane',
                    description: 'AI Model tab rebuilt into a real control surface with model version registry, per-class threshold sliders, and an A/B comparator.',
                    details: [
                        'Atomic active-flip via Mongo transaction (two simultaneous activates can\'t double-write)',
                        'Per-class Confidence Threshold Matrix sliders bound to the active config and saved via PUT',
                        'A/B Comparator picks two configs and renders a grouped bar chart of kept-detections per class over the last 50-500 detections',
                        'New AIModelConfig collection with admin-only CRUD and audit events on every mutation',
                        'Ingest pipeline now reads thresholds from the active config — threshold changes apply without a redeploy',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Bulk Project Actions — Polished Modals',
                    description: 'Replaced the ugly prompt() bulk-action flow on /admin/project with proper modals plus audit logging.',
                    details: [
                        'BulkAssignModal pulls live operators via the shared hook',
                        'BulkStatusModal exposes all 8 statuses with optional note appended to statusHistory',
                        'BulkTagModal is a single-input form; tagging fields now declared on the Project model so writes land',
                        'Fire-and-forget audit logging for every bulk op (archive/delete classified at higher severity)',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Project Health Score',
                    description: 'Composite 0-100 health score (age, AI confidence drift, stuck QC, missing snapshots, SLA breach, ETA) rolled up into a red/amber/green badge on every admin project card.',
                    details: [
                        'New GET /api/projects/:id/health endpoint',
                        'Hover tooltip surfaces the factor breakdown',
                        'Backed by useProjectHealth TanStack hook with 5-min staleTime',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Devices and Projects ETag/304 Cache',
                    description: 'Hot list endpoints now ship weak ETag + Cache-Control: private, max-age=30 and honor If-None-Match.',
                    details: [
                        'getDevices and getAllProjects return 304 empty-body when client revalidates inside the 30s window',
                        '~6 widgets polling every 30s collapse to 5/6 round-trips returning 304 within each cache window',
                    ]
                },
                {
                    type: 'security',
                    title: 'Announcement Audience Hardening',
                    description: 'Server-side role allowlist on announcement create AND update closes an authorization hole where a customer-rep could POST/PUT roles=[\'admin\'] directly bypassing the UI gate.',
                    details: [
                        'ANNOUNCEMENT_ROLE_ALLOWLIST: admin → all six targetable roles, customer-rep → customer+customer-rep',
                        'Unknown caller roles get 403 outright',
                        'Disallowed entries return 403 "Cannot target roles outside your scope: <list>"',
                    ]
                },
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Equipment Issues — Field-Side Logger',
                    description: 'New /operator/equipment-issues page so operators can log broken gear in the field and maintenance picks it up without a Slack scrum.',
                    details: [
                        'Report issue modal: Title / Category (camera/battery/cable/housing/other) / Severity (critical/high/medium/low) / Device / Description',
                        'Severity + status badges on every row, category icon, device + project link, relative reported-at timestamp',
                        'Open / Active / Resolved tabs with empty-state copy per tab',
                        'Summary cards: Open / Active / Resolved with role-themed rose-orange accent',
                        'Backed by EquipmentIssue Mongoose model with compound indexes on operatorId+reportedAt and status+reportedAt',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Shift Handoffs',
                    description: 'New /operator/handoffs page with Incoming / Outgoing / All tabs and an Acknowledge action that clears handoffs from the inbox.',
                    details: [
                        'Backend authorization tightened: non-admin callers locked to req.user.id so handoffs are no longer reach-anywhere',
                        'Incoming-handoff visibility fixed (recent query expanded to operatorId OR nextShiftFor)',
                        '"Alice → Bob" arrow flow on every card via populated user refs',
                        'Acknowledge action idempotent — re-ack is a no-op',
                        'Dashboard "Recent handoffs" widget exposes Acknowledge inline so operators don\'t have to navigate to clear an incoming one',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Offline Upload Resilience',
                    description: 'Chunked uploader with IndexedDB-backed queue survives mid-upload connection drops and resumes automatically on reconnect.',
                    details: [
                        'Backend chunked endpoints from scratch (8 MiB chunk cap, 5 GiB total, 2048 chunk ceiling, disk-staged manifest)',
                        'Service worker intercepts chunk PUTs while offline and persists blobs to IDB, returning a synthetic 202 Accepted',
                        'queueUpload writes meta + chunks before the first PUT so tab-close mid-upload is resumable',
                        'Offline-start fallback: if /start itself fails offline, the upload is staged under a local-<uuid> and migrated to a real server id on reconnect',
                        'UploadSummaryCard surfaces queued / draining / failed counts and a "Resume failed uploads" button',
                        'window "online" event triggers automatic drain across leftover IDB rows',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Device-App Project-Link Picker',
                    description: 'Replaced the free-text "Project ID" input on the device app with a real <select> populated from /api/devices/:id/projects.',
                    details: [
                        'Eliminates typing a UUID into a tablet keyboard mid-job',
                        'Falls back to the free-text input if the fetch yields nothing — never blocks on a network hiccup',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'GPS Auto-Tagging on Observations',
                    description: 'Observations now auto-capture latitude, longitude, and accuracy from the device. Operator detail page shows a read-only GPS card with an "Open in Google Maps →" deep-link.',
                    details: [
                        '4-state chip during capture: idle / capturing / captured / denied / unsupported',
                        'Accuracy shown in meters',
                        'Click-to-recapture if the first fix is too coarse',
                    ]
                },
            ],
            'qc-technician': [
                {
                    type: 'feature',
                    title: 'Personal Defect Trends',
                    description: 'New /qc-technician/defect-trends page tracking your defect-type mix over 7d/30d/90d ranges with weekly buckets and CSV export.',
                    details: [
                        'Aggregates AIDetection.qcReviewedAt scoped to req.user._id with $isoWeek bucketing',
                        'Top-5 defect types with approved/rejected/avg-confidence breakdown',
                        'Average reviews per active day',
                        'Pure-CSS stacked-bar visualization (no chart.js dep)',
                        'CSV export for management 1:1s: Defect Type, Reviews, Approved, Rejected, Approved %, Avg Confidence',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Review Speed Trends',
                    description: 'New /qc-technician/speed-trends page surfaces decision-time percentiles and daily speed-bucket distribution.',
                    details: [
                        'Backend aggregates qcReviewedAt - createdAt deltas via a single $switch projection, pre-filling every day in the range',
                        'p50 and p90 derived from bucket counts via shared BUCKET_MID mapping',
                        'SummaryCards: p50/median, p90, long-tail percentage (reviews ≥5min)',
                        'Stacked daily distribution (under-30s emerald, 30s-2m cyan, 2-5m amber, 5m+ red)',
                        'Extremes row showing the fastest and slowest review with duration, defect type, decision, and timestamp',
                        'CSV export: day, under30s, 30s-2m, 2-5m, 5m+, total',
                    ]
                },
                {
                    type: 'feature',
                    title: 'QC Bulk Approve/Reject with Undo',
                    description: 'Multi-select on pending detections + sticky action bar + 5-minute undo window backed by a QCBulkUndoToken collection.',
                    details: [
                        'One bulkWrite + one insertMany of QCReviewHistory rows + token creation per bulk action',
                        'Single-use undo restores the pre-bulk state via bulkWrite and deletes the audit rows that were written',
                        'BulkUndoToast component with live countdown',
                        'Mongo TTL index auto-cleans expired tokens',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Peer-Review Flag (F-key)',
                    description: 'Pressing F on a detection writes qcStatus=needs_review and fans out peer-review notifications to other QC techs on the same project.',
                    details: [
                        'Admins are notified as fallback if no other QC tech is on the project',
                        'Pending queue now includes needs_review rows with a distinctive amber "Flagged for second opinion by …" badge',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Keyboard Shortcuts Cheat Sheet',
                    description: 'Pressing ? opens a Dialog with grouped Navigation / Review / General shortcuts.',
                    details: [
                        'J/K aliases for ↓/↑ navigation',
                        'F flags for peer review',
                        'A/R/Esc/Arrow behavior unchanged',
                    ]
                },
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Approvals Queue',
                    description: 'New /user/approvals page surfaces every approvable item routed to the team-lead tier in one place instead of forcing the lead to bounce between per-type pages.',
                    details: [
                        'Pulls overtime requests where approverTier=team-lead (future approvable types — time-off, expense claims — plug into the same routes via a kind discriminator)',
                        'Per-row Approve / Reject actions',
                        'Summary cards: Pending / Stale > 24h / Total',
                        'Amber "N pending > 24h" pill when SLA is slipping',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Team Workload & Capacity',
                    description: 'New /user/workload page shows a per-member capacity heatmap aggregating active project assignments and hours-this-week with over/under flags.',
                    details: [
                        'Pulls from existing Project (active statuses only) and TimeEntry (ISO-week window starting Monday) collections — no new collection',
                        'Coloured capacity bar per member (rose=over ≥40h default, amber=under ≤20h default, emerald=ok)',
                        '3 sample project chips per member',
                        'Roll-up totals: memberCount, overAllocated, underUtilized, totalHours, totalActiveProjects',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Goal Tracking',
                    description: 'New /user/goals page captures forward-looking quarterly objectives, distinct from the retrospective Performance Reviews page.',
                    details: [
                        'TeamGoal model: ownerId + memberId? + title + description? + quarter + status + progress (0-100) + dueDate? + lastUpdate/Note',
                        'Status-tinted summary cards: Total / On track / At risk / Blocked',
                        'Inline status Select and progress slider per row — commits via update mutation on change',
                        'Default quarter resolves to the current YYYY-Qn server-side',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Team Analytics + Excel Export',
                    description: 'New /user/analytics page with KPI strip (team total, operators, qc techs, active projects, completion %), 7-day creation trend, and role-split donut pair.',
                    details: [
                        'Sourced from the new useUserTeamAnalyticsMetrics aggregation hook',
                        'Export to Excel button reusing the shared csvExport helper',
                        'Unified shared/charts BarChart + DonutRing under a single permissive prop API (replaces 3 duplicated copies that had diverging shapes)',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Bulk Team-Member Operations',
                    description: 'Multi-select on /user/team with bulk role-change, deactivate, activate, resend-invite, and export — same toolbar pattern as the QC bulk-review flow.',
                    details: [
                        'Team-lead scope enforced server-side: ids outside the lead\'s managedMembers land in failed[] not mutated',
                        'Team leads blocked from escalating role to admin/user (only operator/qc-technician allowed)',
                        'Fixed a pre-existing bug where deactivate/activate were writing a non-existent status field — now sets active: true/false',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Bulk Device-Assignment Operations',
                    description: 'Multi-select on /user/device-assignments with bulk status / unassign / export — destructive delete hidden for team leads (and enforced server-side).',
                    details: [
                        'Persisted status filter survives a refresh via localStorage with a strict allowlist',
                        'Bulk-assign payloads naming people outside the lead\'s team rejected with 403 listing the offending fields',
                        'Finer 403 copy: distinguishes "you tried to assign yourself outside team" vs "you tried to assign an outsider"',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Performance Reviews — At-a-Glance Card',
                    description: 'New summary row on /user/performance-reviews with KPI tiles (Avg score, On-time %, Cycles, Submissions 30d) plus a 30-day metrics-submissions BarChart.',
                    details: [
                        'Sourced from the existing /api/performance-reviews/summary endpoint with client-side fallback',
                        'Per-member 90-day quality-score sparkline below the Total Reviews tile',
                        'Empty-state copy for new hires with zero submissions in window',
                    ]
                },
            ],
            'customer-rep': [
                {
                    type: 'feature',
                    title: 'Announcement Compose',
                    description: 'New /customer-rep/announcements/compose page lets reps draft announcements scoped to {customer, customer-rep}.',
                    details: [
                        'Reuses the shared AnnouncementFormModal with a new allowedRoles prop (admin retains ALL_ROLES default)',
                        'Pulls assigned-ticket tags via useSupportAssignedTickets and renders them as a tag-filter pill row',
                        '"Compose for tag" shortcut pre-fills title and body from a ticket',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Canned-Response Library — Mine/Shared/All Filter',
                    description: 'Templates page gained a Scope filter (Mine/Shared/All, defaults to Mine) so reps default to seeing only their own snippets.',
                    details: [
                        'Same Mine/All toggle added above the inline reply composer in TicketDetail',
                        'Filter is by createdBy === userId so reps don\'t scroll past shared-team templates while replying',
                    ]
                },
                {
                    type: 'feature',
                    title: 'My Activity Log',
                    description: 'New /customer-rep/activity page reuses the ProjectStatusTimeline pattern to render the rep\'s own AuditLog rows.',
                    details: [
                        'Backend filters AuditLog by actorId === req.user._id',
                        'Surfaces every action the rep took — ticket assignments, status changes, deletions',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Calendar with Ticket-Linked Callbacks',
                    description: 'New /customer-rep/calendar page reusing the shared calendar (MonthView/WeekView/DayView) pre-filtered to the rep.',
                    details: [
                        'New TicketLinkSelect autocomplete sourced from useSupportAssignedTickets so callbacks can be attached to a specific ticket',
                        'Event route allowlisted for customer-rep',
                    ]
                },
            ],
            customer: [
                {
                    type: 'feature',
                    title: 'Project Status History Timeline',
                    description: 'Status history surfaced on the Timeline tab of every project detail page across admin, user, customer, and customer-rep views with role-themed accents.',
                },
                {
                    type: 'feature',
                    title: 'Project Metadata Panel',
                    description: 'Read-only metadata panel now shows ALL fields including shape/material/custom keys instead of just upstream/downstream/remarks.',
                },
                {
                    type: 'improvement',
                    title: 'Project Priority Filter + Sort',
                    description: 'Project list pages gained a priority filter and sort (newest/oldest/priority-desc/priority-asc/name-asc/name-desc) with a Mongo aggregation path for priority-weighted sorting.',
                },
            ],
            bugfixes: [
                {
                    type: 'bugfix',
                    title: 'Bell + Rollup Count Alignment',
                    description: 'Navbar bell badge now reads rollup-aware distinctUnreadCount so a chat-message rollup of ×5 occupies one bell slot instead of five.',
                    details: [
                        'Pairs cleanly with the NotificationCenter rollup pill and the per-row ×N badge — bell, list pill, and inline badge all tell the same story',
                        'Falls back to raw server unreadCount during first paint before notifications load',
                    ]
                },
                {
                    type: 'bugfix',
                    title: 'High-Priority Notification Toasts',
                    description: 'Priority=high notifications now trigger an 8-second toast pop via a new HighPriorityToastBridge that listens for a notification:high CustomEvent.',
                    details: [
                        'Bridges AlertProvider showAlert() into NotificationProvider without flipping the provider tree',
                        'NotificationRow renders rollupCount > 1 as "5 new messages in {project}" with type-aware noun inference',
                    ]
                },
                {
                    type: 'bugfix',
                    title: 'Stale-Closure Rollback in Notification Toggles',
                    description: 'togglePreference on the user notifications page was reading the new state in its catch block during a two-toggles-in-flight scenario, landing the rollback on the wrong toggle\'s value.',
                    details: [
                        'Now snapshots the previous state before the optimistic update and restores from the snapshot on failure',
                    ]
                },
                {
                    type: 'bugfix',
                    title: 'Status Transition Guards',
                    description: 'Illegal project-status jumps now return 422 with an explanatory message instead of silently writing an invalid state.',
                    details: [
                        'VALID_STATUS_TRANSITIONS map wired into both updateProject and updateProjectStatus',
                        'Admin override via ?force=true writes a "Forced transition (admin override)" note into statusHistory',
                        'Fixed updateProjectStatus\'s broken validStatuses list that listed nonexistent enum values',
                    ]
                },
                {
                    type: 'bugfix',
                    title: 'Training Notification De-Dupe',
                    description: 'Training.assignModules was emitting one notification per (user × module) so a user assigned 3 modules in one request got 3 identical pings — deduped via Set so each user gets exactly one notification per assignment batch.',
                },
                {
                    type: 'bugfix',
                    title: 'Performance Reviews Page Top-Performer Name',
                    description: 'Page was rendering raw PerformanceMetrics docs into MemberCard which expected a flat shape — added normalizeMetric / build30DayTrend helpers and avatar palette so docs are normalized once into the shape the rest of the page already consumed.',
                    details: [
                        'Top performer name now resolves correctly from the populated teamMember',
                        'Member tiles no longer show undefined name or "-" top performer',
                    ]
                },
            ],
        }
    },
    {
        id: "v2.4.3",
        date: "April 28 – May 01, 2026",
        label: "Real-Time Project Chat Bubble + Notifications Phase C + PWA Foundation",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'improvement',
                    title: 'PWA Installable',
                    description: 'Manifest + metadata wired so the app is installable on mobile home screens with proper icon and splash.',
                    details: [
                        'public/manifest.json with name/short_name/description/start_url/scope/display=standalone/theme_color',
                        'Three icon entries: 192/512 + maskable',
                        'metadata.manifest + applicationName + appleWebApp + icons wired into the app layout',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Hand-Rolled Modals → shadcn Dialog',
                    description: 'Migrated 12 hand-rolled modals (admin notes detail, project edit upload progress, qc-review lightbox, DetectionCard, training CertificateViewer, ReportPreview, AnalyticsExport, ObservationsPanel delete, and more) to shadcn Dialog with proper Esc / click-outside / open-state wiring.',
                    details: [
                        'Pure helpers extracted (printPdf, buildPdfHtml, normalizeConfidence, formatLongDate, buildCertificateHtml, etc.) per ryanmcdermott/clean-code-javascript principles',
                        'Single-responsibility subcomponents (FormatButton, DeleteObservationDialog, NoteDetailDialog)',
                        'Upload progress dialog blocks Esc / click-outside until 100% so users can\'t dismiss mid-upload',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Performance + Cleanup Pass',
                    description: 'Next.js + backend hot paths trimmed.',
                    details: [
                        'next.config.mjs gains compiler.removeConsole (strips console.log in prod, keeps error/warn) + optimizePackageImports for lucide-react/date-fns/framer-motion',
                        'Backend tsconfig gains incremental + tsBuildInfoFile (cold→warm tsc went 6.7s → 2.0s, 70% faster)',
                        'Parallelized chat-notification fan-out (4 sequential awaits → Promise.all)',
                        'Bumped 4 hot pollers (project chat 15s→60s, customer chat 15s→60s, admin dashboard 10s→30s, admin uploads 5s→15s)',
                    ]
                },
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Messenger-Style Project Chat Bubble',
                    description: 'Replaced the inline drawer with a floating bottom-right launcher (420×580 panel, slideUp animation) modeled exactly on the customer ChatBubble.',
                    details: [
                        '"Chats" and "Projects" tabs in the panel',
                        'Real-time via Socket.IO — DMs, group chat, reactions, edit, delete, read receipts, @-mentions, pin, reply all live',
                        'Per-role accent palette (operator=blue) via central getRoleTheme',
                        'New "Chat" button on every ProjectCard deep-links into the bubble pre-targeted at that project',
                        'Backend /my-projects endpoint surfaces every project the user is on in any role plus an idempotent /ensure endpoint for one-click conversation provisioning on legacy projects',
                    ]
                },
            ],
            'qc-technician': [
                {
                    type: 'feature',
                    title: 'Project Chat Bubble',
                    description: 'Same Messenger-style bubble mounted in the QC layout with the QC theme (purple accent).',
                    details: [
                        'QcChatBridge publishes selectedDetection into the launcher context so the existing detection-aware template-suggest works across the bubble surface',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Chat Templates + @-Mentions',
                    description: 'QC-specific chat templates with detection-aware auto-suggest above the composer plus @-mention autocomplete with keyboard nav.',
                    details: [
                        'CannedResponse model gained type discriminator (\'customer\'|\'qc\') + detectionTags',
                        'Suggest endpoint ranks templates by detectionTags exact match → category match → severity tag match → usageCount (popularity capped so it can\'t outweigh tag relevance)',
                        'Free-form detection types canonicalized ("Pipe Broken" → "broken_pipes") so templates surface for any matching detection',
                        '@-mention picker is keyboard-driven (↑/↓ navigate, Enter/Tab select, Esc dismiss)',
                        '@-mentions render inline as rose-tinted pills in message bodies',
                    ]
                },
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Project Chat Bubble',
                    description: 'Same Messenger-style bubble with the user theme (indigo accent).',
                },
            ],
            'customer-rep': [
                {
                    type: 'feature',
                    title: 'Project Chat Group Membership',
                    description: 'Customer reps are now first-class participants in the project chat group with their own role.',
                    details: [
                        'ProjectConversationRole enum extended to include \'customerRep\'',
                        'ensureProjectConversations wires them in on assignment',
                        'ProjectChatDrawer mounted on the customer-rep project detail page',
                    ]
                },
            ],
            customer: [],
            bugfixes: [
                {
                    type: 'feature',
                    title: 'Notifications Phase C — Full Scope',
                    description: 'Chat notifications consolidated under a single service with priority, rollup, mute, snooze, and a 4-stage filter pipeline.',
                    details: [
                        '4 new chat-* notification types (chat_message / chat_reply / chat_pin / chat_reaction) on top of chat_mention',
                        'priority (low/normal/high) and rollupCount fields on Notification',
                        '30-second debounce coalesces chat_message and chat_reaction into a single rollup notification per (user, type, project, conversation)',
                        '4-stage filter pipeline: per-type pref → per-conversation mute → snooze window (critical types bypass) → debounce',
                        'NotificationCenter Snooze dropdown: 30min / 1h / 4h / Until tomorrow / Clear',
                        'Per-conversation mute toggle in the chat bubble header (BellOff/Bell)',
                        'Pinned-message socket emission so pin/unpin propagates without manual refetch',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Pin / Save Messages + Threading + Read Receipts ✓✓',
                    description: 'Three chat features shipped together: pinned-messages strip at the top of every conversation showing up to 5 most recent pins with click-to-scroll, flat-thread replies (parent rendered as a quoted preview above the reply), and ✓✓ read receipts when every participant\'s lastReadAt is past the message createdAt.',
                    details: [
                        'pinned / pinnedAt / pinnedBy fields on ProjectMessage with compound index',
                        'POST /messages/:id/pin authorized to sender-or-managers',
                        'replyToMessageId on ProjectMessage with parent validation that walks to root',
                        'New ReadReceipt component reads lastReadAt cursor + message.readBy[], stable-hashed avatar chips',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Slash-Command Template Palette',
                    description: 'Type / in the composer to open an inline command palette with fuzzy-search across template title + shortcut + body (role-aware library: qc-tech → qc templates, all others → customer).',
                },
                {
                    type: 'bugfix',
                    title: 'Project-Chat Selection Bugs Fixed',
                    description: 'Selected-project highlight was visually identical to hover (bg-rose-50 vs hover:bg-rose-50) and activeId carried stale conversation ids when switching projects, so the right pane stayed empty.',
                },
                {
                    type: 'bugfix',
                    title: 'Customer Projects Page Runtime Error',
                    description: 'Fixed a stale ReferenceError on /customer/projects line 102: referenced undefined isLoading because the destructure at line 57 used isLoading: loading — renamed the call site.',
                },
            ],
        }
    },
    {
        id: "v2.4.2",
        date: "May 04 – 08, 2026",
        label: "Team Ops + Vitest Foundation + Backend Notifications Service Migration",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'improvement',
                    title: 'Vitest Foundation',
                    description: 'Backend repo had ZERO tests before this — installed vitest + supertest with v8 coverage, 41 cases now passing in under 1.2s.',
                    details: [
                        'New src/utils/deviceScoping.ts (13 cases) + userScoping.ts (14 cases) + projectScoping.ts (14 cases) extract-and-test pattern',
                        'Replaces the placeholder npm test "echo No tests specified" that had been there since project start',
                        'Coverage targets src/utils + src/services',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Backend Notifications Service Migration',
                    description: 'Six backend controllers no longer reference the Notification model directly. Every fan-out now flows through NotificationService.create / createForUsers so prefs / snooze / Socket.IO push apply uniformly.',
                    details: [
                        'Migrated: shiftHandoff, qc_technician, projectPipeline, project, support (3 sites), training',
                        'Only notification.controller.ts itself still touches the raw Notification model (correct — that\'s the canonical CRUD endpoint serving the inbox UI)',
                        'Migration policy: opportunistic only, never big-bang',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Charts Unification',
                    description: 'BarChart and DonutRing were duplicated 3× with diverging prop signatures across admin, customer-rep, qc-technician — unified under components/shared/charts/ with one permissive prop API.',
                    details: [
                        'Backwards-compatible with both the admin raw-array shape and the customer-rep {label,value}[] shape',
                        'admin/analytics/BarChart.js and DonutRing.js converted to one-line re-exports so existing imports keep working',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Architecture Audit Documented',
                    description: 'Mapped current Concertina topology (70+ controllers, 65+ models, 60+ routes, 7 roles) and captured recommendations for incremental application.',
                    details: [
                        'Renamed notificationApi .js → notificationApi.js (trailing-space cross-platform footgun)',
                        'Identified backend controllers/ as flat with 70+ files and no domain folders — recommended grouping into project/, qc/, operator/, customer-support/, system/, auth/ when next touching each file',
                    ]
                },
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Offline Upload — Service Worker + IDB Foundation',
                    description: 'Service worker registration (operator role only, scope=/api/uploads/) plus IndexedDB schema for the upload queue.',
                    details: [
                        'public/sw-uploads.js with install/activate handlers, skipWaiting, clients.claim, GET_VERSION handshake',
                        'src/lib/uploadQueue.js with uploadQueue DB v1: uploads (keyPath id, indexes by_createdAt + by_status) + chunks (keyPath composite "<uploadId>:<chunkIndex>", index by_uploadId)',
                        'Passthrough fetch handler forwards POST /api/uploads/start and PUT /api/uploads/:id/chunk/:n unchanged with logging so interception can be verified before queueing is enabled',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Maintenance Reporting Polish',
                    description: 'Operator and admin storage stats now sum across both cloud providers; previously only counted one.',
                },
            ],
            'qc-technician': [
                {
                    type: 'improvement',
                    title: 'getMemberMetrics ?days Query Param',
                    description: 'getMemberMetrics had no limit and no createdAt filter so the per-member 90-day sparkline was pulling all-time history per member-select.',
                    details: [
                        'Added optional ?days=<N> query (clamped to 1..3650, omitted preserves full history for other consumers)',
                        'days value folded into the queryKey so cache doesn\'t collide between consumers',
                    ]
                },
            ],
            user: [
                {
                    type: 'security',
                    title: 'Team-Lead Bulk Op Scoping',
                    description: 'Team-lead callers can only act on their own managedMembers — out-of-scope ids land in the failed[] partial-success list rather than being mutated.',
                    details: [
                        'Same pattern across bulkUsers, bulkDeviceAction, and bulkProjects',
                        'Team leads blocked from escalating role to admin/user (only operator/qc-technician allowed)',
                        'Scoping logic extracted into pure helpers (deviceScoping, userScoping, projectScoping) and unit-tested',
                    ]
                },
            ],
            'customer-rep': [],
            customer: [],
            bugfixes: [],
        }
    },
    {
        id: "v2.4.1",
        date: "April 27, 2026",
        label: "Database Introspection + AI Control Plane + Project Module Overhaul",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Models Explorer',
                    description: 'Live Mongoose introspection across all 63 registered models surfaced under Admin → System Management → Database with a new Schemas section.',
                    details: [
                        'Dynamic eager-loading so introspection works even when a model hasn\'t been touched by any controller in the current process',
                        '5-minute in-memory cache mirroring the existing db-stats TTL pattern',
                        'Admin-only POST /api/system-health/models/refresh to invalidate the cache on demand',
                        '12 domain groupings with declarative regex rules so future models classify automatically',
                        'Global search across model/field/ref names, domain dropdown filter, expand/collapse-all toggles',
                        'Per-model "Copy TS" generates a real TypeScript interface (export interface IModelName) with proper enum unions, optional markers, ref comments',
                        'Per-model + header-level "Summary CSV" exports for offline review',
                    ]
                },
                {
                    type: 'feature',
                    title: 'AI Model Control Plane',
                    description: 'AiModelTab refactored into a real control surface with model version registry, per-class threshold sliders, and an A/B comparator.',
                    details: [
                        'New AIModelConfig collection (organizationId, modelVersion, per-class thresholds, isActive, deployedAt/By, accuracySnapshot, notes)',
                        'Activate button does an atomic active-flip via Mongo transaction (two simultaneous activates can\'t double-write)',
                        'Per-class Confidence Threshold Matrix for fractures/cracks/broken_pipes/roots/corrosion/blockages',
                        'A/B Comparator renders grouped-bar Chart.js comparison of kept-detections per class over the last 50-500 detections',
                        'Type-classifier maps free-form AIDetection.type strings to the 6 canonical class buckets so unmapped types are reported separately rather than silently dropped',
                    ]
                },
                {
                    type: 'feature',
                    title: 'AI Model Health Card',
                    description: 'Full-width ModelHealthCard above the Overview pie chart surfacing detection volume, avg confidence with month-over-month trend arrow, QC approval rate, false-positive rate, week-over-week drift, and the 3 lowest-confidence detection types.',
                },
                {
                    type: 'feature',
                    title: 'Project Health Score',
                    description: 'New GET /api/projects/:project_id/health composite-risk-score endpoint scoring 0-100 from age, AI confidence drift vs cached global average, stuck QC, missing snapshots, and SLA breach.',
                    details: [
                        'New ProjectHealthBadge in shared ProjectCard header (admin role only): red/amber/green pip with hover tooltip showing factor breakdown',
                        'Backed by useProjectHealth TanStack hook with 5-min staleTime',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Bulk Project Actions — Polished Modals',
                    description: 'Replaced the ugly prompt() bulk-action flow with BulkAssignModal / BulkStatusModal / BulkTagModal plus fire-and-forget audit logging on every bulk op.',
                    details: [
                        'Project model gained archived/archivedAt/tags fields (bulk archive op was already writing archived without it being declared, so writes were silently dropped)',
                        'Compound index added: { archived, createdAt }',
                        'project_bulk_<op> audit events with metadata for ids/payload/succeeded/failed counts',
                        'Archive and delete classified at higher severity',
                    ]
                },
                {
                    type: 'bugfix',
                    title: 'Admin Calendar Dark Mode Contrast',
                    description: 'Event Filters heading and per-category checkbox labels now have dark variants. Month-view day cells get a #1a2332 fill in dark mode (was transparent and bleeding into the surface) with #243042 hover and brighter #3f4856 cell dividers so day numbers and event chips are legible.',
                },
            ],
            operator: [],
            'qc-technician': [],
            user: [],
            'customer-rep': [],
            customer: [],
            bugfixes: [],
        }
    },
    {
        id: "v2.4.0",
        date: "April 23 – 24, 2026",
        label: "Overtime End-to-End + Dual Cloud Storage (B2 + S3) + AI Pipeline Hardening",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Admin-Switchable Cloud Storage (Backblaze B2 + Amazon S3)',
                    description: 'New Storage tab under Admin → Uploads lets admins switch the active cloud provider at runtime without touching env vars or redeploying.',
                    details: [
                        'Provider dropdown with three modes: Backblaze B2, Amazon S3, Dual-write (both)',
                        'Inline S3 credentials form with show/hide secret, Test Connection, and Save — secrets encrypted at rest with AES-256-CBC',
                        'Per-provider usage cards with folder breakdown (videos, avatars, snapshots, certifications, etc.)',
                        'Same controls added to Admin → System Management → Storage for quick access',
                        'Every storage action is audit-logged with actor username, email, IP',
                        'Files uploaded before the switch keep serving from their original provider — zero downtime migration',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Storage Migration Tool with Live Progress',
                    description: 'One-click backup that copies all files from one provider to the other, resumable and idempotent.',
                    details: [
                        'Four-phase progress modal (Discover → Copy → Finalize → Done) with plain-English status',
                        'Two progress bars — files vs bytes — with live throughput and ETA during copy',
                        'Distinct counters for Copied / Skipped (already present) / Failed, each with tooltip explanations',
                        'Floating global progress bubble survives navigation and page reload',
                        'Downloadable JSON log of every file action including per-file errors',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Rep Activity Dashboard',
                    description: 'New page aggregating tickets, complaints, and overtime per rep with SLA compliance and workload classification.',
                    details: [
                        'Sortable table with drill-in per rep',
                        'Saved Views and CSV export supported',
                        'Available in admin for all reps + in customer-rep as self-view',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Permission Modules Resync',
                    description: 'New button in Permission Levels tab that aligns module availability after new modules are added in code — no more manual editing every level.',
                    details: [
                        'Dry-run preview shows per-role diff and user-impact count before applying',
                        'Opt-in backfill only touches each role\'s DEFAULT level (custom restricted levels left untouched)',
                        'Audit-logged with who/when/what modules were added',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Admin Upload Management — Full Visual Revamp',
                    description: 'Header, tabs, stats, and settings redesigned to match the polished admin/users module pattern.',
                    details: [
                        'Per-tab icon-badge header with dynamic accent color (rose/indigo/blue/emerald/amber)',
                        'Icons added to all 5 tab triggers',
                        'Stats row now uses shared GenericStatCard',
                        'Settings tab shows active storage destination at the top with jump-to-Storage-tab action',
                        'Section headers across Settings use icon badges for visual hierarchy',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Rep & Admin Activity Tracking',
                    description: 'Admin dashboard storage stats now sum across both providers; previously only counted one.',
                },
                {
                    type: 'improvement',
                    title: 'Customer Reps Page + Hot-Path Redis Caching',
                    description: 'New Customer Reps page added; 6 hot endpoints now Redis-cached with proper TTL and invalidation.',
                    details: [
                        'Redis cache on dashboard stats, project list, user list, rep activity, storage config, backup logs',
                        '6 compound MongoDB indexes added for hot queries',
                    ]
                },
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Overtime Request & Approval',
                    description: 'Operators can now submit overtime requests directly from the time-tracking page. Routed to team lead for approval.',
                    details: [
                        'Tabbed time-tracking page with Overtime section',
                        'Request modal with hours, date, project, reason',
                        'Status badge shows pending / approved / rejected with reviewer note',
                        'Two-tier approval: operators and QC-tech route to team lead; users and customer-reps route to admin',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Storage & Backups Page',
                    description: 'New sidebar entry showing which provider your uploads go to + audit log of storage events that affected your work.',
                },
            ],
            'qc-technician': [
                {
                    type: 'feature',
                    title: 'Overtime Request',
                    description: 'Overtime submission flow added to QC time-tracking page, with role-themed accents.',
                },
                {
                    type: 'improvement',
                    title: 'Certification Uploads on Active Storage',
                    description: 'Certification file uploads now go to the active cloud provider (S3 or B2) automatically.',
                },
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Team Overtime',
                    description: 'New sidebar entry — review and approve overtime requests from your operators and QC technicians.',
                },
                {
                    type: 'feature',
                    title: 'Storage & Backups Page',
                    description: 'See where your team\'s files live and track backup activity across your work.',
                },
            ],
            'customer-rep': [
                {
                    type: 'feature',
                    title: 'My Performance',
                    description: 'Self-view performance dashboard added to customer-rep sidebar — tickets, complaints, overtime, SLA compliance.',
                },
                {
                    type: 'feature',
                    title: 'Overtime Request',
                    description: 'Overtime submission with routing to admin for approval.',
                },
            ],
            customer: [],
            bugfixes: [
                {
                    type: 'bugfix',
                    title: 'AI Pipeline Now Stamps Storage Provider Correctly',
                    description: 'Fixed silent write-drop where AIDetections and Observations were not tracking which cloud provider their snapshots lived on.',
                    details: [
                        'AIDetection and Observation models gained a storageProvider field (schema was silently dropping writes)',
                        'Every upload controller (video, project, device, user avatar/logo, certification, complaint) now saves the provider on the created DB row',
                        'Backfilled 1045 existing documents (522 AIDetection + 523 Observation + misc) with explicit provider',
                        'Snapshot streaming endpoint now looks up provider from AIDetection → Observation → Snapshot, not only Snapshot',
                    ]
                },
                {
                    type: 'bugfix',
                    title: 'SNAPSHOTS Card Shows AI-Generated Snapshots',
                    description: 'Top-right SNAPSHOTS card on the project detail page was reading only user-created snapshots and never showed AI output.',
                    details: [
                        'New shared helper lib/projectSnapshots.js merges user Snapshot docs with AI Observation.snapshotUrl entries',
                        'Fixed for admin and operator project detail pages (user detail already had this pattern)',
                    ]
                },
                {
                    type: 'bugfix',
                    title: 'Fail-Fast Pipeline Guard',
                    description: 'AI processing now errors out clearly at start if the video\'s cloud provider is not configured, instead of cryptic 403s mid-pipeline.',
                },
            ],
        }
    },
    {
        id: "v2.3.0",
        date: "April 13 – 14, 2026",
        label: "DRY Consolidation + Cross-Role Enhancements + TanStack Migration",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'improvement',
                    title: 'TanStack Query Migration',
                    description: 'All admin pages migrated to TanStack Query for automatic caching, deduplication, and optimistic updates.',
                    details: [
                        'Project list, user management, calendar, announcements, audit log, notifications all cached',
                        'All 3 ProjectDetail components (admin/operator/user) use shared hooks',
                        'Shared hooks: useProjectObservations, useProjectSnapshots, useProjectMetadata, usePacpCodes',
                        'Approve/reject, create project, save settings use mutations with cache invalidation',
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Code Consolidation (DRY)',
                    description: 'Unified shared components across all 6 roles — reduced ~4000 lines of duplicated code.',
                    details: [
                        'RoleLayout wrapper replaces 6 identical layout files (600→30 LOC)',
                        'Shared calendar components (MonthView, WeekView, DayView, etc.)',
                        'Shared observations module (ObservationsPanel, AddObservation, etc.)',
                        'Shared ProjectSwitcher using shadcn DropdownMenu',
                        'GenericStatCard replaces 6 role-specific variants',
                    ]
                },
                {
                    type: 'feature',
                    title: 'Project Compare for All Roles',
                    description: 'Side-by-side project comparison now available for admin, operator, and user roles.',
                },
                {
                    type: 'feature',
                    title: 'Export Users',
                    description: 'New export button on user management page — CSV/Excel download of user data.',
                },
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Analytics & Insights Page',
                    description: 'New analytics dashboard with weekly hours, project status, AI processing stats, and monthly trends.',
                },
                {
                    type: 'feature',
                    title: 'Project Compare',
                    description: 'Side-by-side project comparison tab added to the project list.',
                },
                {
                    type: 'improvement',
                    title: 'Calendar Dark Mode',
                    description: 'CalendarGrid fully themed for dark mode with zinc palette.',
                },
            ],
            'qc-technician': [
                {
                    type: 'improvement',
                    title: 'Calendar Dark Mode',
                    description: 'QC calendar and month view fully themed for dark mode.',
                },
                {
                    type: 'improvement',
                    title: 'Upload Page Migration',
                    description: 'Uploads page now uses TanStack Query for cached data fetching.',
                },
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Project Compare',
                    description: 'Compare tab added to the project list for side-by-side analysis.',
                },
            ],
            'customer-rep': [
                {
                    type: 'feature',
                    title: 'Project Viewing (NEW)',
                    description: 'Customer reps can now view all projects with details, videos, AI detections, and team info.',
                    details: [
                        'Read-only project list with search and status badges',
                        'Project detail page with video player, AI detections, team sidebar',
                        'Added to sidebar navigation',
                    ]
                },
            ],
            customer: [],
        }
    },
    {
        id: "v2.2.0",
        date: "April 9 – 13, 2026",
        label: "QC Review Workspace + Dark Mode + Redis Caching",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Dark Mode',
                    description: 'Full dark mode across all 6 roles with system-aware defaults. Toggle via the navbar icon or Settings > Appearance.',
                    details: [
                        'Light / Dark / System toggle with OS preference detection',
                        'Auto-adaptation layer — all pages adapt without per-page overrides',
                        'Chart.js global dark theme for all dashboards',
                        'Appearance settings section in every role\'s settings page',
                        'Smooth CSS transitions on toggle'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Redis Caching Layer',
                    description: 'Server-side Redis caching for hot endpoints. Falls back to in-memory when Redis is unavailable.',
                    details: [
                        'Security modules cached 10 minutes (sidebar loads on every page)',
                        'QC assignments cached 30 seconds (matches polling interval)',
                        'Project detections cached 15 seconds with automatic invalidation on review',
                        'Redis-backed rate limiter with atomic INCR',
                        'Socket.IO Redis adapter for multi-instance scaling'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Response Compression',
                    description: 'Gzip/deflate compression middleware reduces JSON payload sizes by 60-80% across all API endpoints.',
                }
            ],
            'qc-technician': [
                {
                    type: 'feature',
                    title: 'Review Workspace',
                    description: 'Projects, quality control, and the video player merged into one unified workspace.',
                    details: [
                        'Three view modes: Detail / Comparison / Video — all sharing the same selection',
                        'Video player seeks to detection timestamp on click',
                        'Project Info drawer with device, operator, pipeline metadata',
                        'Manual detection form anchored to current video playback time',
                        'URL state preserves project, detection, and view mode on refresh',
                        'Old /project and /project/[id] routes redirect to the workspace'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Instant Approve / Reject',
                    description: 'Optimistic updates make approve/reject feel instant — detection vanishes from queue and project counts update immediately.',
                    details: [
                        'TanStack Query migration with 2-minute assignment caching',
                        'Optimistic mutation patches both detection list and assignment counts',
                        'Automatic rollback on server error',
                        'Targeted cache invalidation instead of full refetch'
                    ]
                },
                {
                    type: 'fix',
                    title: 'Data Accuracy Fixes',
                    description: 'The detection detail card now shows real AI data instead of placeholder text.',
                    details: [
                        'Analysis Notes synthesized from confidence, severity, bounding box, PACP code, model version',
                        'Provenance block showing reviewer name, source video, timestamps',
                        'Severity filter fixed (was matching zero detections)',
                        'Frame #0 and Distance N/A placeholder bugs fixed'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Dark Mode',
                    description: 'Full dark mode support. Toggle via the navbar icon or Settings > Appearance.',
                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Dark Mode',
                    description: 'Full dark mode across sidebar, navbar, and all pages. Toggle via navbar icon or Settings > Appearance.',
                }
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Dark Mode',
                    description: 'Full dark mode support with system preference detection. Settings > Appearance.',
                }
            ],
            customer: [
                {
                    type: 'feature',
                    title: 'Dark Mode',
                    description: 'Dark mode available via navbar toggle or Settings > Appearance.',
                }
            ],
            'customer-rep': [
                {
                    type: 'feature',
                    title: 'Dark Mode',
                    description: 'Dark mode support across all pages. Toggle via navbar or Settings > Appearance.',
                }
            ],
        }
    },
    {
        id: "v2.1.0",
        date: "April 6 – 8, 2026",
        label: "AI Pipeline Overhaul + LMS Training System",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'QC Review Dashboard Redesign',
                    description: 'Completely redesigned QC Review tab with two-column layout, approval rate tracking, severity distribution, and inline approve/reject actions.',
                    details: [
                        'Progress rings showing approval rate and AI accuracy',
                        'Review queue cards with stacked progress bars (approved/rejected/pending)',
                        '2-column detection grid with inline Approve/Reject buttons',
                        'Bulk select and bulk approve/reject actions',
                        'Severity distribution horizontal bars'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'AI Pipeline 5x Faster',
                    description: 'Parallelized video frame processing with configurable concurrency, batch DB writes, and reduced progress saves.',
                    details: [
                        'Frames processed in parallel batches (AI_CONCURRENCY env var, default 5)',
                        'insertMany for detections and observations instead of per-frame creates',
                        'Progress saved every 5% instead of every frame',
                        'Async file reads replacing blocking readFileSync',
                        'Stop AI + Reset AI Data endpoints with cancellation token support'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Database Optimization',
                    description: 'Added MongoDB indexes to 6 models, .lean() to 10+ controllers, field selection on .populate() calls.',
                    details: [
                        'Compound indexes on Observation, Snapshot, PacpCode, Calendar, Certifications, Note',
                        '.lean() on read-only queries reducing memory overhead',
                        'Selective .populate() fields cutting data transfer',
                        'Bulk insertMany replacing N+1 query loops'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Observations UI Overhaul',
                    description: 'Redesigned observations table with severity badges, AI chips, snapshot thumbnails, and a new slide-over detail panel with Before/After comparison.',
                    details: [
                        'Color-coded severity badges (red/amber/green)',
                        'AI confidence chips showing detection percentage',
                        'Snapshot thumbnails in table rows',
                        'Slide-over detail panel with edit mode and Before/After draggable viewer',
                        'Delete with confirmation, Go to Time button'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Export & System Polish',
                    description: 'Export dropdown with Excel/CSV/PDF options, branded PDF output, error boundaries, keyboard shortcuts, and search debouncing.',
                    details: [
                        'Export button with format picker (Excel via SheetJS, CSV, branded PDF)',
                        'Error boundaries for all 6 roles',
                        'Ctrl+K global search focus shortcut',
                        'Debounced search inputs across project pages',
                        'Skeleton loading components for all dashboards'
                    ]
                },
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Progress Tracker',
                    description: 'New progress tracker card on the operator dashboard with circular progress rings showing projects, uploads, AI success rate, and inspections.',
                    details: [
                        '4 circular progress rings with trend indicators',
                        'Month-over-month comparison arrows',
                        'Integrated into existing dashboard layout'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Settings Page Redesign',
                    description: 'Operator settings split from 776 lines into 7 modular components with redesigned profile card using operator background image.',
                    details: [
                        'Profile hero card with operator_background.jpg cover',
                        'Stat cards with emoji icons (Inspections, Uploads, Completion, Hours)',
                        'Split into ProfileTab, DataSyncTab, VideoAITab, NotificationsTab, PreferencesTab',
                        'Constants and UI components extracted to separate files'
                    ]
                },
                {
                    type: 'fix',
                    title: 'Route Planner Auto-Population',
                    description: 'Route sites now auto-created when projects are assigned to operators with locations.',
                    details: [
                        'Auto-creates on project creation if operator + location present',
                        'Auto-creates on project update when operator newly assigned',
                        'Duplicate check prevents multiple route sites per project'
                    ]
                },
            ],
            'qc-technician': [
                {
                    type: 'feature',
                    title: 'Learning Management System',
                    description: 'Full LMS with learning paths, interactive defect exercises, and certificate generation.',
                    details: [
                        'Learning Paths with sequential module progression and auto-unlock',
                        'Interactive Defect Identification: draw bounding boxes on sewer images',
                        'IoU-based scoring comparing user marks to ground truth',
                        'Certificate viewer with branded SewerVision.ai PDF template',
                        'Image-based module cards using training pictures'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Onboarding Checklist',
                    description: 'Guided onboarding banner on the dashboard for new QC technicians with 5 setup steps.',
                    details: [
                        'Complete profile, first review, training, first report, calibration',
                        'Each step links to the relevant page',
                        'Progress bar with step completion tracking',
                        'Dismissible (saves to localStorage)'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Mustard + Red Color Scheme',
                    description: 'Updated QC Technician color scheme from rose/pink to mustard and red across all 71 QC files.',
                    details: [
                        'Primary: red-700 buttons, red-600 accents',
                        'Secondary: amber-500 highlights, amber-50/100 backgrounds',
                        'Sidebar gradient: from-red-700 to-amber-500',
                        'Distinct from admin (rose) to avoid confusion'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Add Observation Wizard',
                    description: 'Rebuilt as a 4-step sidebar wizard with visual clock position picker.',
                    details: [
                        'Steps: Basic Info, Assessment, Snapshot, Review & Save',
                        'Circular clock dial for pipe position selection',
                        'Frame capture from video player (no fake LIVE canvas)',
                        'Role-themed colors throughout'
                    ]
                },
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Training Center',
                    description: 'New Training Center page for team leads to oversee QC technician training and take modules themselves.',
                    details: [
                        '4 tabs: Team Progress, Assign Training, Learning Paths, My Training',
                        'Assign modules to QC techs with checkbox selection',
                        'View learning paths and enroll',
                        'Full quiz player for self-training'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Team Page with Training Progress',
                    description: 'Team member cards now show training progress bars, and detail pages include training stats and module breakdown.',
                    details: [
                        'Progress bar on each team member card (modules completed, avg score)',
                        'Training Progress section on detail page with 3 stat cards',
                        'Module-by-module breakdown with pass/fail badges',
                        'Training Center added to sidebar menu'
                    ]
                },
            ],
            customer: [
                {
                    type: 'improvement',
                    title: 'Upload & Delivery Improvements',
                    description: 'Async video upload on project creation, upload error banners, and settings-based size limits.',
                    details: [
                        'Projects created instantly with "uploading" status while video uploads in background',
                        'Error banner on project console if upload fails',
                        'Upload size limit respects admin settings (useUploadLimits hook)',
                        'Real-time XHR upload progress with circular dialog'
                    ]
                },
            ],
            platform: [
                {
                    type: 'improvement',
                    title: 'Turborepo Monorepo + Docker',
                    description: 'Project restructured as Turborepo monorepo with single Dockerfile for API + Web.',
                    details: [
                        'npm workspaces with Turbo build caching (FULL TURBO in 182ms)',
                        'Single multi-stage Dockerfile with supervisord',
                        'docker-compose.yml with MongoDB',
                        'AWS deployment guide (App Runner, console-only)',
                        '.env.example documenting all 36+ environment variables'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Memory & Performance',
                    description: '651 console statements removed from backend, streaming video upload, skeleton loading across all dashboards.',
                    details: [
                        'All console.log/warn/error stripped from production build',
                        'Video upload streams to temp file (disk) instead of RAM buffering',
                        'Skeleton loading components for dashboards, grids, tables, profiles',
                        'ES6 audit: template literals, arrow functions, no require()'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Status Guide Redesign',
                    description: 'Project Status Guide redesigned as a workflow progression layout with step numbers and color-coded cards.',
                    details: [
                        '7-step workflow visualization (Planning → Customer Notified)',
                        'Color-coded status cards with tinted backgrounds',
                        'Step numbers and arrow indicators between stages',
                        'Footer explaining automatic progression'
                    ]
                },
            ],
        },
    },
    {
        id: "v2.0.0",
        date: "March 23 – April 3, 2026",
        label: "Major Platform Update",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'System Health Monitor',
                    description: 'Real-time backend service monitoring with latency bars, uptime percentage, and resource usage gauges.',
                    image: '/updates/admin/admin_system_health.png',
                    details: [
                        'Auto-refreshes every 30 seconds for real-time monitoring',
                        'CPU, memory, and storage resource gauges with danger thresholds',
                        'Service-level status cards with latency bars and uptime percentages',
                        'Overall status banner (operational / degraded / incident)'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Announcement Center',
                    description: 'Create and broadcast announcements targeted to specific roles with draft/send workflow and real-time banner display.',
                    image:[ '/updates/admin/admin_announcements_1.png', '/updates/admin/admin_announcements_2.png', '/updates/admin/admin_announcements_3.png'],
                    details: [
                        'Draft → Send lifecycle with role-targeted delivery',
                        'Beautiful modal form with gradient header and role selector grid',
                        '5 announcement types: general, maintenance, feature, policy, alert',
                        'Real-time banner on all role dashboards with 15-second polling',
                        'View tracking, pin to top, and per-user dismiss with session persistence'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Analytics & Insights Dashboard',
                    description: 'Platform-wide analytics with real data from Project, User, AIDetection, and Report models.',
                    image: '/updates/admin/admin_analytics.png',
                    details: [
                        'KPI cards: Total Projects, Active Users, Completed, Avg Duration — all from real DB aggregation',
                        'Monthly project completions bar chart (12 months)',
                        'AI Detection accuracy donut rings (this month, last month, Q1 avg)',
                        'Team productivity table with completion counts and scores'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Billing & Invoicing',
                    description: 'Invoice management with customer, tier, amount, status tracking and collection rate visualization.',
                    details: [
                        'Invoice table with search and status filters (paid, pending, overdue, draft)',
                        'Collection rate progress bar with color segments',
                        'Stats cards: Total Billed, Collected, Pending, Overdue'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Admin Component Architecture',
                    description: 'Refactored all admin modules into organized component folders with barrel exports and extracted constants.',
                    details: [
                        'components/admin/announcements/, system-health/, analytics/, billing/ folders',
                        'DataTypes.js constants per module for seed data and configuration',
                        'Shared constants in admin/constants.js (ALL_ROLES, ROLE_LABELS, type configs)',
                        'Barrel exports via index.js for clean imports'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Real-Time Chat System',
                    description: 'Messenger-style chat with Socket.IO real-time messaging, photo galleries, emoji reactions, and file attachments.',
                    details: [
                        'Socket.IO real-time messaging between customers and team leads',
                        'Multi-file photo upload with grid collage and full-screen lightbox carousel',
                        'Message reactions, inline edit, soft delete, and read receipts',
                        'Shared ChatMessage component across ChatBubble, Client Hub, and Notifications'
                    ]
                },
                {
                    type: 'feature',
                    title: 'System Management Module',
                    description: 'Unified system administration with Database stats, B2 Storage usage, System Health monitoring, and AI Model management.',
                    details: [
                        'Real MongoDB collection stats with document counts, sizes, and indexes',
                        'Backblaze B2 storage usage with folder breakdown and capacity bar',
                        'System Health monitor with auto-refresh (moved from standalone page)',
                        'AI Models tab with Roboflow project viewer'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Email Templates Manager',
                    description: 'Create and manage dynamic email templates with HTML editor, live preview, and variable insertion.',
                    details: [
                        'Full CRUD for email templates with category management',
                        'Split-view HTML editor with live preview and variable substitution',
                        'Auto-extracts {{variables}} from template body',
                        'Template rendering API for sending customized emails'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Live Tracker Map View',
                    description: 'Interactive Leaflet + OpenStreetMap view as a third option on project listing pages alongside Grid and Table.',
                    details: [
                        'Status-colored map markers with project popups',
                        'Project sidebar with progress bars and team member chips',
                        'Click-to-select interaction between map and sidebar',
                        'Available on Admin, Operator, and User project pages'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Upload Configuration & Clean Code',
                    description: 'Configurable upload limits from admin settings, 1GB video default, and comprehensive debug log cleanup.',
                    details: [
                        'Upload Settings tab connected to backend API (was localStorage only)',
                        'Video upload limit increased to 1GB, all file limits configurable',
                        'Removed 50+ debug console.log statements across all roles',
                        'Clean project card headers — replaced rainbow gradients with clean status colors'
                    ]
                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Checklists Module',
                    description: 'Complete pre-inspection and field safety checklists with item toggle, auto-progress bar, and photo-required indicators.',
                    details: ['Toggle checklist items with real-time progress tracking', 'Photo-required indicators per item', 'Full CRUD with backend API']
                },
                {
                    type: 'feature',
                    title: 'Route Planner',
                    description: 'Plan daily site routes with distance, ETA, and priority information.',
                    details: ['Site list with distance/ETA calculations', 'Map placeholder with numbered site dots', 'Navigate to Site quick action']
                },
                {
                    type: 'feature',
                    title: 'Incidents, Time Tracking & Offline Mode',
                    description: 'Three new operator modules: field incident reporting, clock in/out time tracking, and offline data caching.',
                    details: ['Incident reports with type, severity, location, and admin notifications', 'Live clock timer with project selection and activity type', 'Cache toggle per project with pending sync queue display']
                },
                {
                    type: 'improvement',
                    title: 'Route Planner Maps Integration',
                    description: 'Open in Maps and Navigate to Site buttons now open Google Maps with real addresses and optimized waypoints.',
                    details: ['Open in Maps creates multi-stop route with all assigned sites', 'Navigate to Site opens directions to specific site', 'New Checklist creation dialog with dynamic item builder']
                },
                {
                    type: 'improvement',
                    title: 'AI Detection Snapshots & Live Tracker',
                    description: 'Snapshot panel now renders AI detection images alongside manual captures. Live Tracker map view added to project listing.',
                    details: ['AI detection images with confidence percentages and scrollable container', 'Live Tracker as third view mode on project page (Grid | Table | Map)', 'Status Legend guide button explaining project status colors']
                }
            ],
            qc: [
                {
                    type: 'feature',
                    title: 'PACP Defect Library',
                    description: '45 NASSCO PACP defect codes seeded with severity grades, descriptions, and recommended actions.',
                    image: '/updates/qc-tech/qc_defect_library.png',
                    details: ['Full CRUD for defect codes with create/edit/delete', 'Category filtering with count badges and search', 'Personal favorites and notes system', 'Visual severity grade bar and left color stripe cards']
                },
                {
                    type: 'feature',
                    title: 'Training & Review Analytics',
                    description: 'Interactive training modules with practice quizzes and personal QC performance analytics.',
                    details: ['Multiple-choice quizzes with answer feedback', 'Score summary on completion', 'Weekly stacked bar chart, donut rings for approval/consistency/speed', 'Defect distribution horizontal bars']
                },
                {
                    type: 'improvement',
                    title:'Quality Control - Added Defect Comparison Tool',
                    image:'/updates/qc-tech/qc_modules_quality_control_comparison.png',
                    description:'New defect comparison tool in the QC module to compare AI-detected defects against a reference set for accuracy analysis.',
                    details: [
                        'New Tab in QC module for Defect Comparison',
                        'Side-by-side comparison table showing matches, false positives, and misses',
                        'Summary statistics with accuracy percentage, precision, recall, and F1 score'
                    ]
                }
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Resource Scheduler & Performance Reviews',
                    description: 'Weekly calendar grid for team assignments and team member performance comparison with quality scores.',
                    details: ['7-day calendar table with team members as rows', 'Click empty slots to assign', 'Team cards ranked by quality score with score bars']
                },
                {
                    type: 'feature',
                    title: 'Budget Tracker, Project Templates & Client Hub',
                    description: 'Per-project budget tracking, reusable project templates, and chat-style client messaging.',
                    details: ['Budget vs spent with category breakdown and over-budget highlighting', 'Template CRUD with milestones/tasks and use count tracking', 'Conversation list with real-time message sending on Enter key']
                },
                {
                    type: 'feature',
                    title: 'Notify Customer & Location Picker',
                    description: 'Team leads can now notify customers when reports are ready, and project creation includes an interactive map for precise location entry.',
                    details: ['Notify Customer button on completed projects sends email + in-app notification', 'Location picker with Nominatim geocoding and interactive Leaflet map', 'Resource Scheduler now fully functional with create/delete assignment dialog', 'Client Hub with real-time Socket.IO messaging and Messenger-style UI']
                },
                {
                    type: 'improvement',
                    title: 'Project Card & Table Enhancements',
                    description: 'Redesigned project cards with clean status colors and enhanced table view with progress bars and team columns.',
                    details: ['Clean two-tone status header colors replacing rainbow gradients', 'Operator + QC Tech avatars at card footer (Team Lead removed as user IS the lead)', 'Table view: Progress bar column, Team column with operator/QC names, row actions', 'Live Tracker map view with status-colored markers and team member chips']
                }
            ],
            customer: [
                {
                    type: 'feature',
                    title: 'Customer Module Suite',
                    description: '5 new customer-facing modules connected to real MongoDB collections with TanStack Query caching.',
                    image: [
                        '/updates/customer/customer_modules_appointment_scheduler.png',
                        '/updates/customer/customer_modules_document_vault.png',
                        '/updates/customer/customer_modules_live_tracker.png',
                        '/updates/customer/customer_modules_report_annotations.png',
                        '/updates/customer/customer_modules_dashboard_widgets.png',
                        '/updates/customer/customer_modules_help_center.png'
                    ],
                    details: [
                        'Live Tracker: Real project data with auto-generated timelines and progress percentages',
                        'Document Vault: File grid with type icons, download tracking, and storage usage',
                        'Appointments: Booking form with available slot checking and conflict detection',
                        'Report Annotations: Comments and replies per report section with author population',
                        'Dashboard Widgets: Toggle widgets on/off with live data from Projects, Reports, and Tickets',
                        'Help Center: FAQ and contact support modules with real backend integration for ticket submission and admin viewing'
                    ]
                }, 
                {
                    type:'enhancement',
                    title:'Sidebar Navigation & UI Improvements',
                    description:'Redesigned sidebar for customers with improved navigation, role-based theming, and visual polish.',
                    image: '/updates/customer/customer_modules_new_ui.png',
                    details: [
                        'New sidebar design with clearer hierarchy and improved icons',
                        'Role-based theming with teal/cyan accent colors in sidebar and highlights',
                        'Enhanced active state indicators for better navigation feedback',
                        'Improved spacing and typography for a more polished look'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Messenger-Style Chat Bubble',
                    description: 'Floating chat widget for direct messaging with team leaders, with photo sharing and emoji reactions.',
                    details: [
                        'Contact list showing team leaders from assigned projects',
                        'Real-time messaging via Socket.IO with read receipts',
                        'Multi-photo upload with grid collage and lightbox carousel',
                        'Emoji picker, message reactions, edit, and delete',
                        'Messages tab in Notifications page with full Messenger-style inbox'
                    ]
                }
            ],
            customer_rep: [
                {
                    type: 'feature',
                    title: 'Customer Rep Module Suite',
                    description: '5 new customer rep modules with full backend APIs and CRUD operations.',
                    details: [
                        'Knowledge Base: Create and manage internal help articles with categories and tags',
                        'Customer Profiles: Derived from real ticket data with mini stats and recent tickets',
                        'Escalation Manager: Rules CRUD with live escalated ticket detection (>24h open)',
                        'Workflows: Multi-step workflow builder with 6 step types',
                        'CSAT Surveys: Send invites, collect ratings, view distribution and averages'
                    ]
                }
            ],
            other: [
                {
                    type: 'feature',
                    title: '30 New Module Pages Across All Roles',
                    description: '30 new functional module pages added across all 6 roles, each connected to real backend APIs with full CRUD operations.',
                    details: [
                        'Admin: Analytics, Billing, System Health, Announcements',
                        'Operator: Checklists, Route Planner, Incidents, Time Tracking, Offline Mode',
                        'QC: Defect Library, Comparison, Templates, Training, Review Analytics',
                        'Customer-Rep: Knowledge Base, Profiles, Escalation, Workflows, Surveys',
                        'User: Resource Scheduler, Budget, Client Hub, Templates, Performance Reviews',
                        'Customer: Live Tracker, Document Vault, Appointments, Annotations, Widgets'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Real-Time Announcement Banner System',
                    description: 'Global announcement banner that polls every 15 seconds with slide-in animations, expand/collapse, and per-user dismiss.',
                    details: [
                        '5 announcement types with role-specific color themes',
                        'New announcement glow animation with 8-second fade',
                        'Pinned announcements with visual rose stripe indicator',
                        'Session-based dismiss persistence per role'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'TanStack Query Across All New Modules',
                    description: 'Applied React Query with 30+ new hooks, proper cache keys, stale times, and mutation invalidation patterns.',
                    details: [
                        'Query keys centralized in useQueryHooks.js for cache management',
                        'Mutations with automatic cache invalidation on success',
                        'refetchOnWindowFocus: false on all CRUD hooks to prevent re-renders',
                        'Defensive data extraction: Array.isArray(data) ? data : (data?.data || [])'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Component Architecture & Performance',
                    description: 'All new modules follow organized folder structure with barrel exports, React.memo, useMemo, and useCallback.',
                    details: [
                        'components/{role}/{module}/ folder structure with index.js barrel exports',
                        'DataTypes.js constants per module for seed data',
                        'React.memo on all card and list-item components',
                        'useMemo for all filtered/sorted data, useCallback for event handlers'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Backend Infrastructure Expansion',
                    description: '24 new Mongoose models, 24 controllers, 24 route files with 150+ API endpoints registered in app.ts.',
                    details: [
                        'All controllers use lean(), Promise.all, pagination, and standard response format',
                        'authenticateToken middleware on all protected routes',
                        'Security modules seeded on both local and production databases (61 total)',
                        'Roboflow API integration fix: correct data path and metric percentage formatting'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Socket.IO + SSE Real-Time Infrastructure',
                    description: 'Added Socket.IO for real-time chat messaging and Server-Sent Events for AI processing log streaming.',
                    details: [
                        'Socket.IO server with room-based messaging (user, conversation, project rooms)',
                        'SSE endpoint for AI processing logs — live frame-by-frame progress streaming',
                        'SocketProvider context wrapping the entire app for global real-time access',
                        'useRealtimeChat hook for automatic room joining and event handling'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Clean Code & Deployment Ready',
                    description: 'Comprehensive clean code pass with 50+ debug log removals, React.memo additions, upload limits, and deployment optimization.',
                    details: [
                        'Removed 50+ console.log debug statements across all roles and controllers',
                        'Added React.memo to all list-item components for re-render prevention',
                        'Configurable upload limits in Admin Settings (1GB video, 100MB files)',
                        'Status Legend guide on all project listing pages',
                        'Location picker with Nominatim geocoding for accurate Live Tracker map pins'
                    ]
                }
            ]
        }
    },
    {
        id: "v1.9.0",
        date: "March 20, 2026",
        label: "Major Release",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Full UI Consistency Audit',
                    description: 'Replaced all native HTML form elements with shadcn/ui components across the entire admin section for a polished, consistent look.',
                    details: [
                        'All native <input>, <select>, <textarea>, and <checkbox> elements replaced with shadcn equivalents',
                        'AddNewTaskModal fully rewritten with shadcn Input, Textarea, Select, and Label components',
                        'AccountSettings role selector upgraded to shadcn Select',
                        'SelectCustom component rewritten from native select to shadcn Select with backwards compatibility',
                        'AddUserModal checkboxes replaced with shadcn Checkbox components'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Role-Based Theming System',
                    description: 'Introduced CSS variable-based role theming via var(--role-accent) across all shared UI components — every role now has its own accent color.',
                    image: '/updates/admin/admin_role_theming.png',
                    details: [
                        'RoleThemeProvider injects --role-accent, --role-accent-ring, and --role-accent-light per role',
                        'Shared components (Button, Badge, Tabs, Calendar, Navbar) now use var(--role-accent) instead of hardcoded hex colors',
                        'Admin = rose, Operator = blue, QC = purple, User = indigo, Customer = emerald, Customer-Rep = teal',
                        'Fallback colors ensure graceful degradation if theme provider is missing'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Admin Support Ticket Overview',
                    description: 'New support page for admins to oversee all customer support tickets and complaints across the platform.',
                    image: '/updates/admin/admin_support_overview.png',
                    details: [
                        'View all support tickets from customers with filtering and search',
                        'Track ticket status, priority, and assignment across the team',
                        'Integrated with the new Customer Representative workflow'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Permission Level System',
                    description: 'Full permission level management — create custom permission levels per role, assign them to users, and control which modules each user can access.',
                    image: ['/updates/admin/module_permission_part1.png', '/updates/admin/admin_permission_tab_part_2.png', '/updates/admin/admin_permission_tab_part_3.png'],
                    details: [
                        'New Permission Levels tab in User Management with create, edit, and delete flows',
                        'Module selection grid grouped by category (Main, Management, Equipment, etc.)',
                        'Locked modules (Dashboard, Settings) auto-included and cannot be removed',
                        'Assigning a permission level syncs modulePermissions across all affected users',
                        'New middleware on backend validates module access per request'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Sidebar Ui & Navigation Overhaul',
                    description: 'Complete redesign of the sidebar and navigation structure for improved usability and visual consistency.',
                    image: '/updates/admin/sidebar_overhaul.png',
                    details: [
                        'Streamlined navigation with clearer hierarchy and improved iconography',
                        'Enhanced sidebar collapse/expand functionality with smooth animations',
                        'Updated active state indicators for better user feedback'
                    ]
                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Operator Upload Module',
                    description: 'Dedicated upload page for operators to quickly upload inspection footage directly from the field.',
                    image: '/updates/operator/operator_upload_module.png',
                    details: [
                        'Full upload page with drag-and-drop support and progress tracking',
                        'Multiple file upload with format validation (MP4, MOV)',
                        'Direct integration with Backblaze B2 cloud storage',
                        'Upload history and status tracking'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Codebase Restructure & TanStack Query',
                    description: 'Operator pages restructured into modular components with TanStack Query for efficient data fetching and caching.',
                    details: [
                        'Dashboard, maintenance, equipment, and operations pages refactored into smaller components',
                        'New operatorApi.js with centralized API functions',
                        'TanStack Query hooks with 30-second auto-refresh for real-time data',
                        'Reduced page sizes by 40-60% through component extraction'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'UI Consistency with shadcn Components',
                    description: 'Replaced native HTML form elements on the operator project page and reports page with shadcn/ui components.',
                    details: [
                        'Project page: search input, status filter select, and view toggle buttons upgraded to shadcn',
                        'Reports page: checkboxes for select-all and per-report selection now use shadcn Checkbox',
                        'Consistent styling with role-based blue accent theming'
                    ]
                }
            ],
            'qc-technician': [
                {
                    type: 'feature',
                    title: 'QC Review Dashboard for Admin',
                    description: 'New admin-side QC review page to inspect and manage AI-detected defects per project with approve/reject workflow.',
                    image: '/updates/qc/qc_review_dashboard.png',
                    details: [
                        'Dedicated /admin/qc-review/[project_id] page with defect listing',
                        'Confidence scores, severity levels, and detection type display',
                        'Approve/reject actions with instant status update'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'QC Technician Tour Guide Fixed',
                    description: 'Fixed the QC technician tour guide to use the correct purple/violet theme colors instead of admin rose/pink colors.',
                    details: [
                        'Welcome step: icon gradient, badges, and background updated to purple/violet',
                        'Dashboard step: chart bars and progress card themed to purple',
                        'Assignments step: selected project card, status badges, and progress bar in purple',
                        'Detections step: selected detection card in purple, native selects replaced with styled spans',
                        'Approve-reject and complete steps: borders and bulk action bar updated to purple'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Codebase Restructure & Component Extraction',
                    description: 'QC technician pages restructured with extracted components, constants files, and TanStack Query hooks.',
                    details: [
                        'New qc/ component folder with certifications, dashboard, project, reports, and settings sub-modules',
                        'Constants file with role-specific configuration and column definitions',
                        'Shared hooks for data fetching with automatic cache invalidation'
                    ]
                }
            ],
            user: [
                {
                    type: 'improvement',
                    title: 'Team Lead Dashboard & Pages Revamped',
                    description: 'User (Team Lead) dashboard and all pages restructured into modular components with improved data fetching.',
                    details: [
                        'Dashboard split into StatsCards, TeamMemberList, and UserDashboardDetail components',
                        'Team page refactored with TeamMemberCard components',
                        'Device assignments page simplified with AssignmentSelector and PersonBadge components',
                        'Inbox restructured with ChatBubble and DateSeparator components',
                        'New userApi.js with centralized API functions and TanStack Query hooks'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'UI Consistency with shadcn Components',
                    description: 'Replaced native form elements across all user pages with shadcn/ui components.',
                    details: [
                        'Project page: search input and status filter upgraded to shadcn Input and Select',
                        'Settings page: language selector now uses shadcn Select',
                        'TeamMemberList: hardcoded accent colors replaced with var(--role-accent)'
                    ]
                }
            ],
            customer: [
                {
                    type: 'feature',
                    title: 'Customer Portal Revamp',
                    description: 'Complete overhaul of the customer experience — new dashboard, project detail views, and settings page with improved UI.',
                    image: '/updates/customer/customer_dashboard_new_ui.png',
                    details: [
                        'Dashboard redesigned with StatsCards and ProjectListCard components',
                        'Project detail page enhanced with DefectCard, DefectSummary, SnapshotGrid, and ProjectInfoCard',
                        'New customer settings page with profile, security, notifications, and avatar management',
                        'Support page expanded with ContactInfoCard and SupportForm for ticket submission',
                        'All pages restructured into modular components with TanStack Query caching'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Customer Tour Guide',
                    description: 'Interactive tour guide for the customer role walking through projects, status tracking, reports, and settings.',
                    details: [
                        '6-step tour: Welcome, Projects, Status, Reports, Settings, Complete',
                        'Teal/cyan themed illustrations matching the customer brand',
                        'Accessible from the navbar profile popover'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'UI Consistency with shadcn Components',
                    description: 'Customer settings company size selector upgraded from native select to shadcn Select component.',
                    details: [
                        'Synthetic event wrapper maintains backwards compatibility with existing onChange handlers'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Codebase Restructure & Component Extraction',
                    description: 'Customer pages restructured with extracted components, constants files, and TanStack Query hooks.',
                    details: [
                        'New customer/ component folder with dashboard, project, settings, support, and tour sub-modules',
                        'Constants file with role-specific configuration and column definitions',
                        'Shared hooks for data fetching with automatic cache invalidation'
                     ]
                },
                {
                    type: 'improvement',
                    title: 'Avatar Upload Persistence',
                    description: 'Customer avatar uploads now instantly reflect in the navbar and all pages without needing a page reload.',
                    details: [
                        'Added refetchUser() call after successful avatar upload in customer settings',
                        'UserContext refreshes globally so navbar and profile sections update immediately'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Support Ticket Form with Backend Integration',
                    description: 'New support form in the customer portal that submits tickets directly to the backend and integrates with the admin support overview.',
                    image: [
                        '/updates/customer/customer_support_center_1.png', 
                        '/updates/customer/customer_support_center_2.png'
                    ],
                    details: [
                        'Support form with subject, description, and file attachment fields',
                        'Form validation and user feedback on submission success/failure',
                        'Tickets submitted via the form are saved in the backend and visible in the admin support overview page'
                    ]
                }
            ],
            'customer_rep': [
                {
                    type: 'feature',
                    title: 'New Customer Representative Role',
                    description: 'Brand new role introduced to handle customer support tickets and complaints — complete with dashboard, ticket management, SLA monitoring, and team coordination.',
                    image: [
                        '/updates/customer-rep/customer_rep_ui_dashboard.png',
                        '/updates/customer-rep/customer_rep_ui_inbox.png',
                        '/updates/customer-rep/customer_rep_ui_notifications.png',
                        '/updates/customer-rep/customer_rep_ui_settings.png',
                        '/updates/customer-rep/customer_rep_ui_templates.png',
                        '/updates/customer-rep/customer_rep_ui_tickets.png'

                    ],
                    details: [
                        'Dashboard with real-time support stats: open tickets, in-progress, resolved, and personal queue',
                        'Ticket management table with search, filtering by priority/status, and detail view with response thread',
                        'SLA Monitoring page tracking first response time, resolution time, compliance %, and overdue tickets',
                        'Internal inbox with folders (Inbox, Sent, Drafts), compose modal, and message detail view',
                        'Team overview showing member availability, workload, and online status',
                        'Canned response templates with categories, tags, copy-to-clipboard, and global/private visibility',
                        'Full backend: SupportTicket model, CannedResponse model, InternalMessage model, and all CRUD controllers'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Customer-Rep Tour Guide',
                    description: 'Full 8-step interactive tour guide for the customer representative role with teal/cyan themed illustrations.',
                    image: [
                        '/updates/customer-rep/customer_rep_tour_1.png',
                        '/updates/customer-rep/customer_rep_tour_2.png',
                        '/updates/customer-rep/customer_rep_tour_3.png',                  
                    ],
                    details: [
                        'Steps: Welcome, Dashboard, Inbox, Tickets, SLA Monitoring, Team, Templates, Complete',
                        'Each step has custom illustrations showing the actual UI layout',
                        'Permission-aware — steps auto-filter based on user module permissions'
                    ]
                }
            ],
            other: [
                {
                    type: 'improvement',
                    title: 'Global UI Polishing & Consistency',
                    description: 'Polished UI across all pages and roles with consistent spacing, typography, and color usage.',
                    image: '/updates/general/global_ui_changes.jpg',
                    details: [
                        'Standardized spacing and layout across all pages for a more cohesive look',
                        'Consistent use of role-based accent colors in buttons, badges, and highlights',
                        'Typography improvements with better font sizes, weights, and line heights for readability',
                        'Updated icons across the app to use a consistent style and size',
                        'Improved responsive design for better usability on mobile devices'
                    ]
                } ,
                {
                    type: 'improvement',
                    title: 'Codebase Cleanup & Refactoring',
                    description: 'Removed unused code, standardized imports, and refactored components for better maintainability.',
                    image: '/updates/general/codebase_cleanup.jpg',
                    details: [
                        'Removed unused imports and components across all modules',
                        'Standardized import paths and component structures for better readability',
                        'Refactored shared components to reduce duplication and improve consistency',
                        'Improved code comments and documentation for key features and workflows'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Avatar Upload Persistence Across All Roles',
                    description: 'Avatar uploads now instantly reflect in the navbar and all pages for every role — no page reload needed.',
                    image: '/updates/general/avatar_upload_persistence.jpg',
                    details: [
                        'Added refetchUser() call after successful avatar upload in all settings pages',
                        'UserContext refreshes globally so navbar, sidebar, and profile sections all update immediately',
                    ]
                },
                {
                    type: 'improvement',
                    title:'Search Functionality – Global Search Bar with Role-Based Results',
                    description:'Implemented a global search bar in the navbar that provides role-based search results across projects, reports, users, and tickets.',
                    image: '/updates/general/global_search_results.png',
                    details: [
                        'Global search input added to the navbar with a search icon',
                        'Search results dropdown that categorizes results by type (Projects, Reports, Users, Tickets)',
                        'Results are filtered based on the user\'s role and permissions — e.g., operators see projects, customer reps see tickets',
                        'Clicking a search result navigates to the relevant page (project detail, report view, user profile, ticket detail)',
                        'Implemented debounced search API calls to optimize performance and reduce server load'
                    ]
                },
                {
                    type:'improvement',
                    title:'Global Nabvar -Role Based Popover Menu change header banner background picture based on the user role',
                    description:'The navbar profile popover now features a header banner that changes its background image based on the user\'s role, providing a more personalized and visually engaging experience.',
                    image:[
                        '/updates/general/navbar_popover_admin.png',
                        '/updates/general/navbar_popover_operator.png',
                        '/updates/general/navbar_popover_qc.png',
                        '/updates/general/navbar_popover_user.png',
                        '/updates/general/navbar_popover_customer.png',
                        '/updates/general/navbar_popover_customer_rep.png'
                    ]
                }
            ]
           
        }
    },
    {
        id: "v1.8.0",
        date: "February 13 – March 7, 2026",
        label: "Major Release",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'feature',
                    title: 'Notification System with Preference Persistence',
                    description: 'Full notification system with real-time dropdown panel, role-based navigation, and per-user preference settings that save to the backend.',
                    image: '/updates/admin/admin_notification_panel.png',
                    details: [
                        'NotificationPanel dropdown in navbar with mark-as-read, delete, and View All navigation',
                        'Notification preferences (email, push, report ready, AI complete, status updates, QC review, defect alerts) persist via shared API routes',
                        'Smart role-based URL rewriting — clicking a notification routes to the correct admin page',
                        '30-second auto-polling with unread count badge in navbar'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Settings – AI Learning Metrics from Real API Data',
                    description: 'Admin settings AI Learning tab now fetches real performance metrics from the backend instead of displaying static values.',
                    details: [
                        'AI metrics pulled from settingsApi.getSettings() with live accuracy and false positive rate',
                        'Avatar upload now instantly reflects in navbar across all pages via refetchUser()',
                        'Fixed broken notificationApi import that had a stray space in the module path'
                    ]
                },
                {
                    type: 'feature',
                    title: 'User Management – Admin-Set Passwords for New Accounts',
                    description: 'Admins can now set custom passwords when creating new user accounts. Customer accounts automatically receive a default password.',
                    image: '/updates/admin/admin_user_creation_password.png',
                    details: [
                        'Password field in the Add User modal for admin, management, operator, and QC technician roles',
                        'Show/hide password toggle with eye icon for easy visibility control',
                        'Customer accounts automatically use the default password "sewercustomer" with a clear info box',
                        'Password validation: minimum 6 characters required for non-customer roles',
                        'Welcome email sent to all new users with their login credentials',
                        'Role-specific info box updates dynamically based on selected role'
                    ]
                },
                {
                    type: 'fix',
                    title: 'Dashboard – AI Detection Distribution Now Shows All Types',
                    description: 'Fixed the AI Detection Distribution chart that was showing no data due to hardcoded detection types that didn\'t match the AI model output.',
                    image: '/updates/admin/admin_dashboard_ai_detection_distribution.png',
                    details: [
                        'Chart now dynamically displays ALL detection types found in the database instead of only 4 hardcoded ones',
                        'Supports all AI model output types: fractures, cracks, blockage, corrosion, infiltration, deformation, pipe hole, manhole, and more',
                        'Detection types are sorted by count (most common first) with proper display names',
                        'New detection types from future AI model updates will appear automatically'
                    ]
                },
                {
                    type: 'imrovement',
                    title:'User Management - Added password input field with show/hide toggle to the Add User modal for all roles, and set a default password for Customer accounts.',
                    description:'Admins can now set custom passwords when creating new user accounts. Customer accounts automatically receive a default password.',
                    image: '/updates/admin/admin_user_creation_password.png',
                    details: [
                        'Added a password input field to the Add User modal for admin, management, operator, and QC technician roles',
                        'Implemented a show/hide toggle with an eye icon for the password field to allow admins to easily view the password they are entering',
                        'For Customer accounts, the password field is hidden and a default password of "sewercustomer" is automatically assigned, with a clear info box explaining this behavior',
                        'Added validation to ensure that passwords entered for non-customer roles meet a minimum length requirement (e.g., at least 6 characters)',
                        'Upon successful user creation, a welcome email is sent to the new user with their login credentials, including the password set by the admin or the default password for customers',
                        'The role-specific info box in the modal dynamically updates based on the selected role to provide relevant information about password requirements and defaults'
                     ]
                }
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Team Leader Notifications Page',
                    description: 'Dedicated notifications page for the User (Team Lead) role with role-specific alert types and blue-themed UI.',
                    details: [
                        'New /user/notifications page with blue-themed UI matching the team leader color scheme',
                        'Role-specific alert types: Report Ready, AI Complete, Status Updates, Task Assignments, Delete Requests',
                        'Notification preferences load from and persist to the backend on each toggle',
                        'Mark All as Read and Delete All bulk actions with confirmation dialogs'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Settings – Avatar Upload Fix',
                    description: 'Avatar upload in User settings now properly persists across the app — navbar and all pages reflect the new avatar immediately without a page reload.',
                    details: [
                        'Added refetchUser() call after successful avatar upload to update the global UserContext',
                        'Avatar changes are now visible in the navbar, sidebar, and all pages instantly'
                    ]
                }
            ],
            qc: [
                {
                    type: 'feature',
                    title: 'QC Dashboard – Pure Metrics Overview',
                    description: 'Completely rebuilt dashboard as a clean metrics and overview page with real-time charts and quick actions.',
                    image: '/updates/qc-tech/qc_dashboard_metrics.png',
                    details: [
                        'Stat cards: Pending QC, Approved, Rejected, Total Reviewed — all from real backend data',
                        '3 interactive Chart.js charts: QC Activity (line), Detection Types (bar), Priority Distribution (pie)',
                        'Quick Action navigation to Quality Control, Projects, Reports, and Calendar',
                        'Assigned Projects list with status badges, priority indicators, and click-through to quality control',
                        '30-second auto-polling via usePolling hook with last-updated timestamp',
                        'Removed redundant detection review interface that duplicated the Quality Control page'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Quality Control – Detection Search & Severity Filter',
                    description: 'Search and filter individual detections within a project by type, description, or severity level.',
                    image: '/updates/qc-tech/qc_quality_control_search_filter.png',
                    details: [
                        'Search input filters detections by type, description, notes, or severity text in real-time',
                        'Severity dropdown filter: All, Critical, Major, Moderate, Minor',
                        'Filtered detection list with useMemo for performance — updates instantly as you type',
                        'Keyboard shortcuts (A/R/Esc/Arrow keys) work correctly with the filtered list',
                        'Post-review confirmation dialog with option to create a report after completing project review'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Reports System – Full Backend CRUD',
                    description: 'Complete reports system with backend auto-calculations, JSON export, and full create/read/update/delete operations.',
                    details: [
                        'Backend createQCReport accepts all form fields (title, date, type, priority, weather, flow, equipment, notes)',
                        'Auto-generates unique inspectionId from report title',
                        'Auto-calculates totalDefects, criticalDefects, and overallGrade from AI detections',
                        'New endpoints: GET/PUT/DELETE /reports/detail/:reportId with project detections included',
                        'Real JSON download export (replaced placeholder alert())',
                        'All API calls use QC-specific endpoints via api() helper'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Settings – Real Dashboard Stats via TanStack Query',
                    description: 'QC Settings page now shows real review statistics fetched from the backend instead of hardcoded placeholder values.',
                    image: '/updates/qc-tech/qc_settings_real_stats.png',
                    details: [
                        'Replaced hardcoded stats (342 reviews, 189 reports, 99.2% accuracy, 410 hours) with real data',
                        'Uses TanStack useQuery with qcApi.getDashboardStats() and 5-minute stale time for efficient caching',
                        'Avatar upload now calls refetchUser() so changes reflect instantly in navbar'
                    ]
                },
                {
                    type: 'fix',
                    title: 'Confidence Display & Timestamp Fixes',
                    description: 'Fixed the 8400% confidence bug and raw seconds timestamp display in detection review.',
                    details: [
                        'Confidence normalization: values 0-1 are multiplied by 100, values 0-100 are displayed as-is',
                        'Timestamp format: raw seconds (e.g. 125) now display as mm:ss (e.g. 2:05)',
                        'Both fixes applied in the Quality Control detection review interface'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Notification Preferences with Backend Persistence',
                    description: 'QC technician notification preferences now load from and save to the backend — toggles are remembered across sessions.',
                    details: [
                        'Preferences load via GET /api/notifications/preferences/:userId on page mount',
                        'Each toggle immediately persists via PUT /api/notifications/preferences/:userId',
                        'Optimistic UI update with automatic rollback if the API call fails',
                        'Shared backend routes used across all roles for consistency'
                    ]
                }
            ],
            operator: [
                {
                    type: 'improvement',
                    title: 'Settings – Real Dashboard Stats via TanStack Query',
                    description: 'Operator settings now shows real inspection statistics from the backend instead of hardcoded mock values.',
                    image: '/updates/operator/operator_settings_real_stats.png',
                    details: [
                        'Replaced hardcoded stats (142 inspections, 89 uploads, 98% completion, 320 hours) with real data',
                        'Uses TanStack useQuery with operatorApi.getDashboardStats() and 5-minute stale time',
                        'Avatar upload now calls refetchUser() so changes reflect instantly in navbar',
                        'Removed stale console.log debug statement from settings page'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Notification Preferences with Backend Persistence',
                    description: 'Operator notification preferences now load from and save to the backend — toggles are remembered across sessions.',
                    details: [
                        'Preferences load via GET /api/notifications/preferences/:userId on page mount',
                        'Each toggle persists via PUT /api/notifications/preferences/:userId',
                        'Optimistic UI update with rollback on failure',
                        'Consistent behavior matching all other roles'
                    ]
                }
            ],
            customer: [],
            other: [
                {
                    type: 'feature',
                    title: 'TanStack Query v5 Integration',
                    description: 'Integrated TanStack React Query across the application for efficient client-side data fetching and caching.',
                    details: [
                        'QueryProvider with 5-minute stale time and 30-minute garbage collection',
                        'useQuery hooks for dashboard stats in QC and operator settings pages',
                        'Automatic background refetching and cache invalidation',
                        'Custom useQueryHooks.js for shared query patterns'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Shared Notification Preference API',
                    description: 'New backend API routes for notification preferences shared across all user roles.',
                    details: [
                        'GET /api/notifications/preferences/:user_id — fetch or auto-create default preferences',
                        'PUT /api/notifications/preferences/:user_id — upsert preferences with any combination of fields',
                        'NotificationPreference model extended with taskAssignment and deleteRequest fields for team leader role',
                        'All 4 roles (admin, user, qc-technician, operator) now persist preferences via the same API'
                    ]
                },
                {
                    type: 'fix',
                    title: 'Route Conflict Resolution & API Fixes',
                    description: 'Fixed Express route param conflicts and broken API imports across the frontend.',
                    details: [
                        'Fixed /reports/:reportId catching /reports/projects/:id — now uses /reports/detail/:reportId',
                        'Specific paths ordered before parameterized routes to prevent conflicts',
                        'Fixed admin notifications broken import (notificationApi with stray space in path)',
                        'Fixed reports page reportsApi calls using wrong argument count — switched to QC-specific api() endpoints'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Avatar Upload Persistence Across All Roles',
                    description: 'Avatar uploads now instantly reflect in the navbar and all pages for every role — no page reload needed.',
                    details: [
                        'Added refetchUser() call after successful avatar upload in QC, operator, and user settings',
                        'Admin settings already had this behavior — now all 4 roles are consistent',
                        'UserContext refreshes globally so navbar, sidebar, and profile sections all update immediately'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Codebase Cleanup & Refactoring',
                    description: 'Removed unused code, standardized imports, and refactored components for better maintainability.',
                    details: [
                        'Removed unused imports and components across all modules',
                        'Standardized import paths and component structures for better readability',
                        'Refactored shared components to reduce duplication and improve consistency',
                        'Improved code comments and documentation for key features and workflows'
                    ]
                },
                {
                    type: 'improvement',
                    title:'Project Console – Observation Panel Availability During AI Processing',
                    description:'The observation panel is now available and functional while videos are being processed by the AI.',
                    image: '/updates/operator/operator_project_console_observation_panel.png',
                    details: [
                        'Observation panel is no longer hidden during AI processing — it remains accessible so users can review and add observations in real time',
                        'Observations added during AI processing are saved and associated with the correct video and timestamp once processing completes',
                        'UI adjustments to ensure the observation panel works smoothly alongside the AI processing modal without layout issues',
                        'This improvement allows operators and QC techs to start reviewing footage and adding notes immediately, rather than waiting for AI processing to finish',
                        'Add pagination to the observation panel to handle cases with many observations without overwhelming the UI'
                    ]
                },
                {
                    type: 'update',
                    title:'SewerVision AI – Improved Detection Accuracy & Expanded Defect Types',
                    description:'The SewerVision AI model has been updated with improved accuracy and now detects a wider range of sewer defects.',
                    details: [
                        'AI model retrained with a larger, more diverse dataset of sewer inspection footage, resulting in improved detection accuracy across all defect types',
                        'Expanded defect type categories to include infiltration, deformation, pipe hole, manhole issues, and more — providing a more comprehensive analysis of sewer conditions',
                        'Updated AI processing logic to handle the new defect types and ensure they are properly categorized and displayed in the project console',
                        'Improved confidence scoring and filtering to reduce false positives and ensure that detected defects are more likely to be accurate',
                        'These enhancements to the SewerVision AI will provide operators and QC techs with more reliable insights and a broader understanding of sewer conditions, ultimately leading to better maintenance decisions and improved infrastructure management'
                        ]

                },
                {
                    type: 'feature',
                    title:'SewerVision Mobile app - Initial Development & Testing',
                    description:'The initial version of the SewerVision Mobile app has been developed and is currently undergoing testing to ensure a seamless user experience on mobile devices.',
                    details: [
                        'Initial development of the SewerVision Mobile app completed with core functionality implemented',
                        'Current testing phase focused on ensuring a seamless user experience on various mobile devices',
                        'Feedback from initial testing sessions is being incorporated to improve performance and usability'
                    ]
                },
                {
                    type:'feature',
                    title:'Whats New Data Structure & Future Update Planning',
                    description:'The structure of the Whats New data has been updated to better organize and present upcoming features, improvements, and fixes across different user roles.',
                    details: [
                        'Whats New data structure updated to include separate sections for each user role (admin, user, qc, operator, customer) as well as a general "other" category for cross-cutting updates',
                        'Each update entry now includes a type (feature, improvement, fix, ui, security, etc.) to categorize the nature of the update',
                        'This new structure allows for clearer communication of updates relevant to each user role and helps users quickly identify changes that impact their experience',
                        'Future updates will be planned and categorized using this structure to maintain consistency and clarity in our release notes',
                        'Make the pictures and the data will be saved to the database and stored as part of the release notes for each version, allowing users to see visual representations of the updates alongside the descriptions'
                        ]
                }
            ]
        }
    },
    {
        id: "v1.7.0",
        date: "February 9-11, 2026",
        label: "Feature Update",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'improvement',
                    title: 'Unified Customer-Driven Client Field',
                    description: 'Simplified project create/edit forms by making Customer the single source of truth for client information.',
                    image: '/updates/admin/admin_create_project_change_1.png',
                    details: [
                        'Removed the separate "Client (Organization Name)" field across admin/user create and edit flows',
                        'Project client value is now derived from the selected customer (name/email) on save',
                        'Applies consistently to admin create, user create, and admin/user edit pages so all roles follow the same pattern'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Project Delete Approval & Team Lead Visibility',
                    description: 'Safer project deletion workflow and clearer ownership signals in Admin Projects.',
                    images: [
                        '/updates/admin/admin_project_delete_approval.png',
                        '/updates/user/user_project_pendeng_deletion_table.png',
                        '/updates/user/user_project_pendeng_deletion.png'      
                    ],
                    details: [
                        'Project cards show Team Lead sourced from managerId instead of only the operator',
                        'New deleteRequestedBy, deleteRequestedAt, and deleteStatus fields power a proper delete request workflow',
                        'Pending Deletion badge plus Approve / Reject buttons when deleteStatus is "pending"',
                        'Backend endpoints for requestProjectDelete, approveProjectDelete, and rejectProjectDelete'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Project Console – AI Processing Modal & Live Logs',
                    description: 'Enhanced SewerVision Project Console for admins with an AI processing modal that shows real-time logs and a clear success state when analysis is complete.',
                    image: '/updates/admin/admin_project_console_ai_modal.png',
                    details: [
                        'AI Processing modal now shows a green success state once AI finishes (status completed or progress 100%)',
                        'Log panel auto-scrolls to the last line so you can follow AI progress without reloading the page',
                        'selectedVideo in ProjectDetail stays in sync with the polled video list so AI progress and status update live',
                        'Polling continues while the modal is open so admins always see up-to-date processing logs'
                    ]
                },
                {
                    type: 'enhancement',
                    title: 'User Management -User Detail Page Overhaul For all Roles',
                    description: 'Enhanced User Detail page with clearer role display, team lead visibility, and user activity insights.',
                    images: [
                        '/updates/admin/admin_user_detail_operator.png',
                        '/updates/admin/admin_user_detail_qc_technician.png',
                        '/updates/admin/admin_user_detail_user.png',
                        '/updates/admin/admin_user_detail_customer.png'
                    ],
                    details: [
                        'User Detail page now shows the user\'s role with a badge and displays their assigned team lead if they have one (managerId)',
                        'For operators and QC techs, added sections showing their recent activity and assigned projects for better context',
                        'For team leads (User role), added a section showing the users they manage (managedMembers) with links to their profiles',
                        'For customers, added a section showing their contact information and any projects they are associated with',
                        'For all roles, improved the layout and styling for better readability and a more professional appearance'
                    ]
                }
            ],
            user: [
                {
                    type: 'feature',
                    title: 'Team Lead Dashboard & Management Portal',
                    description: 'New dedicated workspace for the User (Team Lead) role with its own dashboard, navigation, and management tools.',
                    image: '/updates/user/user_dashboard.png',
                    details: [
                        'User role sees a Management Portal with its own sidebar and navbar, separate from Admin/Operator/QC layouts',
                        'Dashboard highlights the projects you manage, AI processing status, QC progress, and team activity',
                        'Sidebar navigation for Dashboard, My Projects, Track Tasks, Team Management, Device Assignments, and Inbox',
                        'Tour Guide onboarding for the User role explains how to use the new management workspace'
                    ]
                },
                {
                    type: 'feature',
                    title: 'My Projects – Lead View with Grid & Table Modes',
                    description: 'Lead-focused My Projects page that shows only projects where you are the manager, with both grid and table layouts.',
                    image: '/updates/user/user_my_projects_grid_table.png',
                    details: [
                        'Projects scoped by managerId so Team Leads only see projects they own',
                        'Card grid view reuses the rich Admin project cards while hiding admin-only actions',
                        'Table view shows key columns (Project, Client, Location, Status, Priority, Videos) with quick access to the Project Console',
                        'New project create flow for User role reuses the shared wizard and automatically sets you as project manager'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Team Management – View & Manage Your Operators and QC Techs',
                    description: 'Dedicated Team Management page where User role can see all their assigned operators and QC techs, view their activity, and manage assignments.',
                    image: '/updates/user/user_team_management.png',
                    details: [
                        'Team Management page shows all users assigned to your projects (managedMembers) with their role, contact info, and activity status',
                        'Clicking a team member shows their profile with assigned projects, recent activity, and contact options',
                        'Ability to remove users from your team (removes them from managedMembers) or contact them directly via email link',
                        'Future enhancements planned for adding users to your team and managing their project assignments directly from this interface'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Track Tasks – Centralized Task Management for Team Leads',
                    description: 'New Track Tasks page where User role can see all active tasks across their projects, track progress, and manage priorities.',
                    image: '/updates/user/user_task_management.png',
                    details: [
                        'Track Tasks page aggregates all active tasks from your projects (AI processing, QC reviews, report generation) into a single view',
                        'Tasks are categorized by project and type, with status indicators and due dates',
                        'Ability to click into a task to see more details, view related project information, and contact the assigned operator or QC tech if needed',
                        'Future plans to add task management features like priority setting, due date adjustments, and progress updates directly from this interface'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Device Assignments – Monitor and Manage Your Team\'s Equipment',
                    description: 'Device Assignments page where User role can see all equipment assigned to their team, monitor status, and manage assignments.',
                    image: '/updates/user/user_device_assignments.png',
                    details: [
                        'Device Assignments page shows all equipment assigned to users on your team (managedMembers) with real-time status indicators',
                        'Ability to click into a device to see more details, view which team member it\'s assigned to, and contact them if there are any issues',
                        'Future enhancements planned for managing device assignments directly from this interface, including reassigning devices and tracking maintenance schedules'
                     ]
                },
                {
                    type: 'feature',
                    title: 'Inbox & Notifications for Team Leads',
                    description: 'Centralized inbox for the User role to receive notifications about their projects, team activity, and important updates.',
                    image: '/updates/user/user_incomming_soon_inbox.png',
                    details: [
                        'Inbox page where Team Leads receive notifications about project updates, AI processing status changes, QC review completions, and team member activity',
                        'Notifications are categorized by type (Project Updates, Team Activity, System Alerts) with clear indicators for unread messages',
                        'Ability to click into a notification to see more details, view related project or team information, and contact relevant users if needed',
                        'Future plans to allow Team Leads to customize their notification preferences and set up alerts for specific events or thresholds'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Tour Guide Onboarding for User Role',
                    description: 'Interactive tour guide that walks new User role (Team Leads) through their unique dashboard, features, and workflows.',
                    images:[
                        '/updates/user/user_tour_1.png',
                        '/updates/user/user_tour_2.png',
                        '/updates/user/user_tour_3.png',
                        '/updates/user/user_tour_4.png',
                        '/updates/user/user_tour_5.png'
                    ] ,
                    details: [
                        'When a user with the User role logs in for the first time, they are prompted to take a tour of their new dashboard and features',
                        'The tour highlights key areas of the dashboard, explains the purpose of each section, and provides tips on how to use the management tools effectively', 
                        'Users can choose to skip the tour or revisit it later from their profile settings',
                        'The tour is designed to help Team Leads quickly understand how to navigate their workspace, manage their projects and teams, and make the most of the new features available to them'
                    ]

                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Real-Time AI Processing Console for Admin & Operator',
                    description: 'Improved SewerVision.ai AI processing modal with live logs and clear completion state shared by admin and operator consoles.',
                    image: '/updates/operator/operator_project_console_ai_modal.png',
                    details: [
                        'AI processing modal now shows a dedicated success state when status reaches completed or progress hits 100%',
                        'Log panel auto-scrolls to the latest line so operators and admins can follow AI progress without manual scrolling',
                        'selectedVideo stays in sync with the polled video list so AI status and progress update in real time',
                        'Polling continues while the modal is open, updating every few seconds until AI processing is done'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Project Console – Smarter Video Selection & Status Updates',
                    description: 'Enhanced video selection logic in the Project Console that automatically focuses on videos currently being processed by AI.',
                    image: '/updates/operator/operator_project_console_video_selection.png',
                    details: [
                        'When AI processing starts, the video being processed is automatically selected in the console so operators can see real-time status and logs',
                        'If you manually select a different video while AI is processing, the console respects your choice and doesn\'t auto-switch until you refresh or open the modal again',
                        'Once AI processing completes, the console updates to show the final status and allows you to select any video for review'
                    ]
                    
                }
            ],
            qc: [],
            customer: [],
            other: [
                {
                    type: 'security',
                    title: 'Authentication & Storage Hardening',
                    description: 'Improved auth/session handling and storage to be safer in development and production.',
                    details: [
                        'Replaced fragile localStorage-based auth handling with cookie-based storage for tokens and session data',
                        'Adjusted login form and authentication flow for more robust, secure handling of credentials',
                        'Backend and database updates aligned with the new managerId / managedMembers / deleteStatus model fields'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Codebase Cleanup & Refactoring',
                    description: 'Removed unused code, standardized imports, and refactored components for better maintainability.',
                    details: [
                        'Removed unused imports and components across admin and user modules',
                        'Standardized import paths and component structures for better readability',
                        'Refactored shared components to reduce duplication and improve consistency',
                        'Improved code comments and documentation for key features and workflows'
                    ]
                }
            ]
        }
    },
    {
        id: "v1.6.0",
        date: "February 3-6, 2026",
        label: "Major Release",
        isNew: false,
        updates: {
            qc: [
                {
                    type: 'feature',
                    title: 'Report Creation Wizard with Sidebar Navigation',
                    description: '5-step wizard interface for creating comprehensive PACP sewer inspection reports with validation and review.',
                    image: '/updates/qc-tech/qc_tech_create_new_report_modal_ui.png',
                    details: [
                        'Multi-step wizard: Project → Details → Conditions → Template → Review',
                        'Sidebar navigation with fixed 500px content height',
                        'Smart validation (project & title required)',
                        'Review step with full summary and edit capabilities',
                        'Next/Back buttons with progress tracking',
                        'Instruction cards on each step'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Enhanced PACP Template System',
                    description: 'Comprehensive default template with 13 industry-standard sections for complete sewer inspection documentation.',
                    image: '/updates/qc-tech/qc_tech_new_default_template_ui.png',
                    details: [
                        '13 comprehensive PACP sections',
                        'Executive Summary with overall ratings',
                        'AI Detection Results and validation',
                        'Structural and O&M Defects Analysis',
                        'Detailed Observations with PACP codes',
                        'Grading, Scoring, and Recommendations',
                        'QC Verification and compliance tracking'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Template Editor with Section Builder',
                    description: 'Advanced template editor allowing QC techs to create and customize report templates.',
                    image: '/updates/qc-tech/qc_tech_create_new_template_modal_ui.png',
                    details: [
                        'Sidebar-tabbed modal interface',
                        'Dynamic section add/remove functionality',
                        'Field management with comma-separated inputs',
                        'Live template summary with section/field counts',
                        'PACP section suggestions and guidance',
                        'Edit existing templates including defaults'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Enhanced Report Management UI',
                    description: 'Clean, modern card-based interface for managing quality control reports.',
                    image: '/updates/qc-tech/qc_tech_my_report_new_ui.png',
                    details: [
                        'Compact card layout with action dropdowns',
                        'View, Download, Delete, Edit, Share options',
                        'Status badges and grade indicators',
                        'Project filtering (only assigned projects)',
                        'Real-time report statistics',
                        'Detailed 2-day report views'
                    ]
                },
                {
                    type: 'ui',
                    title: 'Premium QC Dashboard Transformation',
                    description: 'Completely rebuilt dashboard with corporate 3-column layout and integrated detection review.',
                    details: [
                        'Visual KPI stat cards for immediate status awareness',
                        'Quick Actions for one-click access',
                        'Integrated Detection Review workflow',
                        'Professional cohesive workspace',
                        'Reduces clicks and improves focus',
                        'Real-time project monitoring'
                    ]
                },
                {
                    type: 'ui',
                    title: 'QC Settings Corporate Style Update',
                    description: 'Sidebar navigation layout matching Operator and Admin settings for consistency.',
                    details: [
                        'Cards + Sidebar design pattern',
                        'Profile, Notifications, System, Security sections',
                        'Consistent lucide-react icons',
                        'Rose/Red theme integration',
                        'Enhanced validation and feedback',
                        'Improved password change workflow'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Advanced Report Detail Interface',
                    description: 'Data-rich detail view with visualizations for defect analysis.',
                    details: [
                        'Linear Pipe Graph visualizing defects',
                        'Severity doughnut charts',
                        'Risk assessment displays',
                        'Full project context strings',
                        'Interactive defect timeline',
                        'Comprehensive metadata display'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Device Management with Glassmorphism',
                    description: 'Modern device tracking interface with status monitoring and maintenance tracking.',
                    image: '/updates/qc-tech/qc_tech_device_management_new_ui.png',
                    details: [
                        'Glassmorphism design with backdrop-blur',
                        'Statistics cards (Total, Active, Offline, Maintenance)',
                        'Real-time search and status filtering',
                        'Status indicators with pulse animations',
                        'Enhanced information display',
                        'Responsive grid layout'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Certifications Module Revamp',
                    description: 'Enhanced certification management with expiration tracking and status badges.',
                    image: '/updates/qc-tech/qc_tech_certifications_new_ui.png',
                    details: [
                        'Glassmorphism design consistency',
                        'Statistics dashboard (Total, Active, Expiring, Expired)',
                        'Enhanced filtering by status',
                        'Gradient status badges',
                        'Expiration date tracking and warnings',
                        'Document upload and retrieval'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Rich-Text Notes with Markdown Support',
                    description: 'Enhanced note-taking with formatting toolbar and markdown syntax.',
                    details: [
                        'Rich text toolbar (Bold, Italic, Code)',
                        'Bullet and numbered lists',
                        'Link formatting [text](url)',
                        'Full markdown syntax support',
                        'Location/Context field for organization',
                        'Extensible metadata support'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Real-Time Toast Notification System',
                    description: 'Multi-toast support with stacking animations and modern design.',
                    details: [
                        'Multi-toast simultaneous display',
                        'Stacking with sequential delays',
                        'Glassmorphism with gradient accents',
                        '4 types: Success, Error, Info, Warning',
                        'Auto-dismiss with configurable duration',
                        'Manual close button on each toast'
                    ]
                }
            ],
            admin: [
                {
                    type: 'feature',
                    title: 'User Management Complete Revamp',
                    description: 'Modern, compact user management interface with tabs, bulk actions, and enhanced workflows.',
                    details: [
                        'Tabbed interface (User Management / Audit Logs)',
                        'Bulk actions: Export, Email, Disable, Delete',
                        'Compact UI design (not full-height)',
                        'Enhanced table with functional checkboxes',
                        'Real-time user statistics',
                        'Professional action dropdowns'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Email Integration with Resend',
                    description: 'Automated email sending for account creation with secure temporary passwords.',
                    image: '/updates/admin/resend_integration_dashboard.png',
                    details: [
                        'Welcome emails with temporary passwords',
                        'Secure password generation (12 chars, mixed)',
                        'Works with Vercel deployment',
                        'Graceful error handling',
                        'Email templates with branding',
                        'Auto-notification system'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Enhanced Add User Modal',
                    description: 'Improved user creation with validation, role-specific fields, and better UX.',
                    details: [
                        'Client-side validation',
                        'Role-specific required fields',
                        'Email format validation',
                        'Loading states during submission',
                        'Clear error messages',
                        'Account creation notice box'
                    ]
                },
                {
                    type: 'planned',
                    title: '🎯 New "User" Role System (Planned)',
                    description: 'Advanced role hierarchy with Team Leaders, Supervisors, and Multi-role access for enhanced team management.',
                    image: '/updates/admin/new_user_role_system_diagram.png',
                    details: [
                        '👥 User Role Types:',
                        '  • Team Head (Operator Teams)',
                        '  • QC Supervisor (Quality Control Teams)',
                        '  • Customer Relations Manager',
                        '  • Cross-functional Team Leads',
                        '',
                        '🔐 Enhanced Permissions:',
                        '  • Higher privileges than base roles',
                        '  • Access to both Operator and QC modules',
                        '  • Team management capabilities',
                        '  • Performance monitoring',
                        '  • Task assignment and delegation',
                        '',
                        '⚙️ Admin Controls:',
                        '  • Admin can create User role accounts',
                        '  • Granular permission assignment',
                        '  • Module access configuration',
                        '  • Custom role combinations',
                        '  • Audit trail for all actions',
                        '',
                        '📊 Management Features:',
                        '  • View and manage operator activities',
                        '  • Oversee QC tech workflows',
                        '  • Generate team performance reports',
                        '  • Approve critical operations',
                        '  • Handle customer escalations',
                        '',
                        '🎯 Use Cases:',
                        '  • Field Operations Manager overseeing operators',
                        '  • Quality Assurance Lead managing QC techs',
                        '  • Account Manager handling customer relations',
                        '  • Project Coordinator with cross-team access',
                        '',
                        '📝 Implementation Roadmap:',
                        '  • Phase 1: Role definition and permissions',
                        '  • Phase 2: User management interface',
                        '  • Phase 3: Module access controls',
                        '  • Phase 4: Team management features',
                        '  • Phase 5: Reporting and analytics'
                    ]
                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'Calendar & Schedule Management',
                    description: 'Complete calendar system with event management, grid/list views, and real-time statistics.',
                    image: '/updates/operator/new_operator_calendar_page.png',
                    details: [
                        'Dual view modes: Calendar Grid & List',
                        'Event types: Inspection, Maintenance, Meeting, Deadline',
                        'Color-coded event categories',
                        'Create, Edit, Delete event operations',
                        'Status tracking (Scheduled, In Progress, Completed)',
                        'Today\'s schedule widget on dashboard',
                        'Priority levels and location tracking',
                        'Full backend integration with statistics'
                    ]
                },
                {
                    type: 'feature',
                    title: 'My Equipment Management Revamp',
                    description: 'Professional equipment tracking with gradient statistics and enhanced device cards.',
                    image: '/updates/operator/operator_new_equipement_page.png',
                    details: [
                        'Gradient statistics dashboard (Total, Online, Recording, Offline)',
                        'Enhanced device cards with status bars',
                        'Battery, Signal, Activity indicators',
                        'Location tracking per device',
                        'Action dropdown menus (View, Settings, Power)',
                        'Real-time status updates',
                        'Search and filter functionality',
                        'Clean operator design language'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Inspection Logs Dashboard',
                    description: 'Card-based inspection logs with AI workflow pipeline visualization and detailed metrics.',
                    image: '/updates/operator/operator_new_inspection_logs_page.png',
                    details: [
                        'Gradient statistics (Total, AI Processing, QC Review, Completed)',
                        'Card-based layout replacing traditional table',
                        'Visual workflow status pipeline with animations',
                        '4-stage workflow: Upload → AI Analysis → QC Review → Delivery',
                        'Detailed inspection metadata (pipeline ID, location, date, time)',
                        'Video stats (size, duration, issues, confidence)',
                        'Action dropdown per log (Play, View Report, Download, Share)',
                        'AI Workflow Process Overview section'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Inspection Reports Management',
                    description: 'Complete reports module with card-based display, advanced filtering, and bulk actions.',
                    image: '/updates/operator/operator_new_inspection_reports_page.png',
                    details: [
                        'Gradient statistics dashboard (Total, Completed, In Review, Footage)',
                        'Card-based report layout with horizontal design',
                        'Status indicators with pulse animations',
                        'Multi-select with bulk actions (Download, Share, Print)',
                        'Advanced search (ID, Location, Project)',
                        'Filter by status and date range',
                        'Action dropdown per report',
                        'Issues display with color-coded badges'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Generate Report Modal',
                    description: 'Beautiful report creation modal with project selection, smart auto-fill, and validation.',
                    image: '/updates/operator/operator_new_generate_report_modal.png',
                    details: [
                        'Project dropdown (shows only assigned projects)',
                        'Auto-fill location from selected project',
                        'Report title, inspection date, report type',
                        'Footage and location fields',
                        'Initial notes textarea',
                        'Smart validation (required fields)',
                        'Loading states and success handling',
                        'Draft report creation',
                        'Auto-refresh reports after creation'
                    ]
                }
            ],
            customer: [
                
            ],
            other: [
                {
                    type: 'feature',
                    title: 'Backblaze B2 Cloud Storage Migration',
                    description: 'Complete migration from GridFS to Backblaze B2 S3-compatible object storage.',
                    details: [
                        'Private bucket configuration',
                        'Signed URLs for secure downloads',
                        'Streaming support for large videos',
                        'Automatic token management and refresh',
                        'Video and avatar upload to cloud',
                        'Improved scalability and performance'
                    ]
                },
                {
                    type: 'security',
                    title: 'Advanced Confirmation Dialog System',
                    description: 'Professional confirmation dialogs with type-coded styling for critical actions.',
                    details: [
                        'Promise-based async API (showConfirm)',
                        'Danger/Warning/Info type coding',
                        'Smooth animations and backdrop blur',
                        'Customizable titles, messages, and buttons',
                        'Integrated with delete actions',
                        'Prevents accidental data loss'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'API Standardization',
                    description: 'Complete standardization of API calls across all QC modules.',
                    details: [
                        'Centralized API helper (@/lib/helper)',
                        'Consistent error handling patterns',
                        'Standardized authentication headers',
                        'Improved response handling',
                        'Better error messages',
                        'Easier maintenance'
                    ]
                }
            ]
        }
    },
    {
        id: "v1.5.0",
        date: "February 2, 2026",
        label: "Major Release",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'ui',
                    title: 'Redesigned Admin Settings UI',
                    description: 'Modern, tab-based settings interface with integrated profile management and system controls.',
                    image: '/updates/admin/admin_settings_new_ui.png',
                    details: [
                        'Vertical sidebar navigation',
                        'Integrated profile & password management',
                        'Enhanced AI model configuration',
                        'User-friendly system maintenance controls'
                    ]
                },
                {
                    type: 'feature',
                    title: 'User Management Enhancements',
                    description: 'Streamlined user administration with new direct action capabilities.',
                    image: '/updates/admin/admin_user_detail_new_ui.png',
                    details: [
                        'Direct "Send Email" feature in user table',
                        'One-click Account Disable/Enable toggle',
                        'Improved user status visibility',
                        'Quick access to operator settings'
                    ]
                }
            ],
            qc: [
                {
                    type: 'feature',
                    title: 'AI-Powered Defect Detection',
                    description: 'Advanced AI algorithms for automated defect identification with 95%+ accuracy.',
                    details: [
                        'Real-time defect classification',
                        'Severity scoring system',
                        'Historical comparison analytics',
                        'Export reports in multiple formats'
                    ]
                },
                {
                    type: 'feature',
                    title: 'PACP Compliance Reports',
                    description: 'Generate industry-standard PACP compliant reports with one click.',
                    details: [
                        'Automated PACP code assignment',
                        'Customizable report templates',
                        'Photo documentation integration',
                        'Digital signature support'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Enhanced QC Workflow',
                    description: 'Streamlined quality control process with intelligent task prioritization.',
                    details: [
                        'Priority-based task queue',
                        'Collaborative review process',
                        'Mobile-friendly interface',
                        'Offline mode support'
                    ]
                }
            ],
            operator: [
                {
                    type: 'feature',
                    title: 'New Data-Rich Operator Dashboard',
                    description: 'Comprehensive dashboard showing all active inspections, equipment status, and performance metrics.',
                    image: '/updates/operator/new_operator_dashboard.png',
                    details: [
                        'Real-time equipment status tracking',
                        'Active inspection monitoring',
                        'Performance analytics and KPIs',
                        'Quick access to recent projects'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Dedicated Task Management System',
                    description: 'Organize and prioritize your daily operations with our new task management interface.',
                    image: '/updates/operator/new_operator_task_ui.png',
                    details: [
                        'Drag-and-drop task organization',
                        'Status tracking and progress updates',
                        'Assignment notifications',
                        'Calendar integration'
                    ]
                },
                {
                    type: 'improvement',
                    title: 'Streamlined Operations Workflow',
                    description: 'Simplified workflow for creating and managing inspection operations.',
                    image: '/updates/operator/new_operation_ui.png',
                    details: [
                        'Step-by-step operation wizard',
                        'Template-based quick start',
                        'Equipment checklist integration',
                        'Pre-inspection safety checks'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Real-time Smart Notifications',
                    description: 'Stay informed with intelligent notifications for critical events and updates.',
                    image: '/updates/operator/operator_notification_new_ui.png',
                    details: [
                        'Customizable notification preferences',
                        'Priority-based alerts',
                        'In-app and email notifications',
                        'Notification history and archive'
                    ]
                }
            ],
            customer: [
                {
                    type: 'feature',
                    title: 'Interactive Project Dashboard',
                    description: 'View all your projects and inspection reports in one centralized location.',
                    details: [
                        'Project timeline visualization',
                        'Real-time status updates',
                        'Quick report access',
                        'Download all project files'
                    ]
                },
                {
                    type: 'ui',
                    title: 'Enhanced Report Viewer',
                    description: 'Beautiful, interactive report viewer with zoom, annotations, and sharing capabilities.',
                    details: [
                        'High-resolution image viewing',
                        'Video playback with timeline',
                        'Defect highlighting',
                        'One-click sharing options'
                    ]
                }
            ],
            other: [
                {
                    type: 'ui',
                    title: 'Redesigned Homepage',
                    description: 'Beautiful new homepage with immersive animations and modern design.',
                    image: '/updates/general/homepage_new_ui.png',
                    details: [
                        'Smooth scroll animations',
                        'Responsive design for all devices',
                        'Fast loading performance',
                        'Accessibility improvements'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Enhanced Login Experience',
                    description: 'Modern authentication flow with glassmorphism design and improved security.',
                    image: '/updates/general/login_form_ui_new.png',
                    details: [
                        'Glassmorphism UI design',
                        'Social login integration',
                        'Remember me functionality',
                        'Password strength indicator'
                    ]
                },
                {
                    type: 'feature',
                    title: 'New Registration Flow',
                    description: 'Streamlined registration process for all user roles with guided onboarding.',
                    image: '/updates/general/new_registration_form.png',
                    details: [
                        'Role-based registration forms',
                        'Progressive form validation',
                        'Welcome email automation',
                        'Account verification system'
                    ]
                },
                {
                    type: 'security',
                    title: 'Secure Password Reset',
                    description: 'Enhanced password recovery with secure token-based authentication.',
                    image: '/updates/general/reset_link_new_ui.png',
                    details: [
                        'Secure token generation',
                        'Email verification required',
                        'Password strength validation',
                        'Auto-expiring reset links'
                    ]
                },
                {
                    type: 'ui',
                    title: 'Revamped Forgot Password UI',
                    description: 'Clean, user-friendly interface for password recovery.',
                    image: '/updates/general/forgot_password_new_ui.png',
                    details: [
                        'Split-screen design',
                        'Clear instructions',
                        'Success confirmation',
                        'Easy navigation back to login'
                    ]
                },
                {
                    type: 'feature',
                    title: 'Avatar Pop-over Menu',
                    description: 'Quick access to profile settings and account options.',
                    image: '/updates/general/avatar_pop_over_new_ui.png',
                    details: [
                        'Profile quick view',
                        'Theme toggle',
                        'Notification preferences',
                        'Quick logout option'
                    ]
                }
            ]
        }
    },
    {
        id: "v1.2.0",
        date: "January 20, 2026",
        label: "Stability Update",
        isNew: false,
        updates: {
            admin: [
                {
                    type: 'fix',
                    title: 'Fixed authentication redirect loops',
                    description: 'Resolved an issue where users would get stuck in authentication loops.',
                    details: [
                        'Improved session handling',
                        'Better error messages',
                        'Automatic retry mechanism'
                    ]
                }
            ],
            qc: [
                {
                    type: 'feature',
                    title: 'Reports Analytics Dashboard',
                    description: 'New analytics dashboard with interactive charts and insights.',
                    details: [
                        'Interactive data visualization',
                        'Custom date range filtering',
                        'Export to Excel/PDF',
                        'Trend analysis'
                    ]
                }
            ],
            operator: [
                {
                    type: 'improvement',
                    title: 'Performance Optimization',
                    description: 'Improved loading times and overall performance.',
                    details: [
                        'Faster page loads',
                        'Optimized image loading',
                        'Reduced memory usage'
                    ]
                }
            ],
            customer: [],
            other: [
                {
                    type: 'security',
                    title: 'Next.js Security Updates',
                    description: 'Updated to Next.js v15.3.x with latest security patches.',
                    details: [
                        'Framework security updates',
                        'Dependency vulnerability fixes',
                        'Improved CSRF protection'
                    ]
                }
            ]
        }
    }
];
