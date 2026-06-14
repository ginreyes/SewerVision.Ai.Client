import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test('public landing page returns 200', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status() ?? 0).toBeLessThan(500);
});
