import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export type Role = 'admin' | 'user' | 'operator' | 'qc-technician' | 'customer-rep' | 'customer';

const credentials: Record<Role, { email: string; password: string; landing: string }> = {
  admin:           { email: process.env.E2E_ADMIN_EMAIL    || 'admin@example.com',    password: process.env.E2E_ADMIN_PW    || 'admin123',    landing: '/admin/dashboard' },
  user:            { email: process.env.E2E_USER_EMAIL     || 'teamlead@example.com', password: process.env.E2E_USER_PW     || 'user123',     landing: '/user/dashboard' },
  operator:        { email: process.env.E2E_OPERATOR_EMAIL || 'operator@example.com', password: process.env.E2E_OPERATOR_PW || 'operator123', landing: '/operator/dashboard' },
  'qc-technician': { email: process.env.E2E_QC_EMAIL       || 'qc@example.com',       password: process.env.E2E_QC_PW       || 'qc123',       landing: '/qc-technician/dashboard' },
  'customer-rep':  { email: process.env.E2E_CR_EMAIL       || 'rep@example.com',      password: process.env.E2E_CR_PW       || 'rep123',      landing: '/customer-rep/dashboard' },
  customer:        { email: process.env.E2E_CUSTOMER_EMAIL || 'customer@example.com', password: process.env.E2E_CUSTOMER_PW || 'customer123', landing: '/customer/dashboard' },
};

const AUTH_DIR = path.join(__dirname, '..', '.auth');

export function storageStatePathFor(role: Role): string {
  return path.join(AUTH_DIR, `${role}.json`);
}

export async function loginAs(page: Page, role: Role): Promise<void> {
  const { email, password } = credentials[role];
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log ?in/i }).click();
  await page.waitForURL(/\/(admin|user|operator|qc-technician|customer-rep|customer)\//);
}

export function landingFor(role: Role): string {
  return credentials[role].landing;
}

export function ensureAuthDir(): void {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
}
