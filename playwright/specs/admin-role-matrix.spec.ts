import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

// June 17 — Role Capability Matrix page loads behind admin auth.
// When FEATURE_ROLE_MATRIX is off the page renders an "off" card;
// when on it should render the grid headers.

test.describe('admin Role Capability Matrix page', () => {
  test.skip(!process.env.E2E_RUN_AUTH, 'set E2E_RUN_AUTH=1 with seeded users to run');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('renders heading regardless of flag', async ({ page }) => {
    await page.goto('/admin/role-matrix');
    await expect(page.getByRole('heading', { name: /Role Capability Matrix/i })).toBeVisible();
  });
});
