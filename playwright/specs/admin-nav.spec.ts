import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

const adminPages = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/training',
  '/admin/devices',
  '/admin/uploads',
  '/admin/notifications',
  '/admin/system-management',
  '/admin/audit-log',
  '/admin/equipment-issues',
  '/admin/analytics',
  '/admin/settings',
];

test.describe('admin sidebar surface — regression net', () => {
  test.skip(!process.env.E2E_RUN_AUTH, 'set E2E_RUN_AUTH=1 with seeded users to run');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  for (const route of adminPages) {
    test(`admin page loads — ${route}`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status() ?? 0).toBeLessThan(500);
      await expect(page).not.toHaveURL(/\/login/);
    });
  }
});
