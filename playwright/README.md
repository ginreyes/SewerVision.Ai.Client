Playwright E2E — concertina frontend

Purpose: real-browser end-to-end coverage for the per-role flows (admin / user / operator / qc-technician / customer-rep / customer). Complements the backend Playwright suite — frontend specs assert UI behavior; backend specs assert API behavior under the same scenarios.

Run locally
1. Make sure the backend is reachable from NEXT_PUBLIC_API_URL (or whichever env var your /api proxy expects)
2. Run: npm run e2e            (Playwright starts `next dev` on port 3100 automatically)
   Or:  npm run e2e:ui         (interactive runner)
   Or:  npm run e2e:headed     (debug mode)
   Or:  E2E_NO_SERVER=1 npm run e2e   (if you already have next dev running on E2E_BASE_URL)

Environment
- E2E_PORT — port for the auto-started next dev (default 3100)
- E2E_BASE_URL — explicit URL override (e.g. when pointing at a staging deploy)
- E2E_RUN_AUTH — set to 1 to run specs that require a seeded backend with login credentials
- E2E_<ROLE>_EMAIL / E2E_<ROLE>_PW — override default seeded credentials

Layout
- playwright/specs/        Per-area specs (smoke, admin-nav, future per-role features)
- playwright/fixtures/     Shared helpers (login, role landing pages, .auth storage state)
- playwright/.auth/        Cached storage state per role (gitignored)

Run order in CI (recommended)
1. Backend Playwright (npm run e2e in concertine_back_end) — gates the API contract
2. Frontend Playwright (npm run e2e in concertina_front_end) — gates the UI flows
3. Both should run against an isolated Mongo URI so audit-log writes don't pollute dev
