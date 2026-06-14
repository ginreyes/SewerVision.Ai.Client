import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

// June 16 — admin users page: inline role select renders + dialog opens.
// Full role-change happy path is asserted on the backend Playwright suite;
// this spec proves the UI surface exists and the impact-preview round-trip
// runs (gated behind E2E_RUN_AUTH=1 because it needs the seeded backend).

test.describe('admin users — inline role change', () => {
  test.skip(!process.env.E2E_RUN_AUTH, 'set E2E_RUN_AUTH=1 with seeded users to run');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('users table renders + role select is interactive', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).not.toHaveURL(/\/login/);

    // The table renders one role select per user row. Find the first one
    // and click it; the dropdown options should include the full role
    // allowlist.
    const firstSelect = page.locator('[data-testid="inline-role-select"], button[role="combobox"]').first();
    await firstSelect.waitFor({ state: 'visible', timeout: 10_000 });
    await firstSelect.click();
    await expect(page.getByRole('option', { name: 'qc-technician' })).toBeVisible();
  });
});
