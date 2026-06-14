import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

// June 18 — five new pages, one heading-renders smoke per page.
// Happy-path data assertions live on the backend Playwright suite.

const cases: { role: 'admin' | 'user' | 'operator' | 'qc-technician' | 'customer-rep'; path: string; heading: RegExp }[] = [
  { role: 'customer-rep', path: '/customer-rep/customer-health',            heading: /Customer Health/i },
  { role: 'user',         path: '/user/coverage',                           heading: /Team Coverage Calendar/i },
  { role: 'operator',     path: '/operator/pre-shift-check',                heading: /Pre-Shift Equipment Self-Check/i },
  { role: 'qc-technician',path: '/qc-technician/defect-heatmap',            heading: /Defect Pattern Heatmap/i },
  { role: 'admin',        path: '/admin/notifications-throughput',          heading: /Notification Throughput/i },
];

test.describe('june 18 new pages', () => {
  test.skip(!process.env.E2E_RUN_AUTH, 'set E2E_RUN_AUTH=1 with seeded users to run');

  for (const c of cases) {
    test(`${c.path} renders for ${c.role}`, async ({ page }) => {
      await loginAs(page, c.role);
      await page.goto(c.path);
      await expect(page.getByRole('heading', { name: c.heading })).toBeVisible();
    });
  }
});
