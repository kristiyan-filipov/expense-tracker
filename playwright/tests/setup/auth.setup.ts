import { test as setup, expect } from '@playwright/test';
import path from 'path';

/**
 * Global Auth Setup Script
 *
 * Runs once before any authenticated project spec is executed.
 * Navigates to the login page, submits the test user's credentials from
 * environment variables, verifies successful navigation to the dashboard,
 * then serializes the full browser session (cookies + localStorage) to disk.
 *
 * Subsequent authenticated specs load this state directly — no repeated UI
 * sign-in, no extra auth service load.
 */

const AUTH_STATE_PATH = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local before running the test suite.',
    );
  }

  // ── Navigate to the login page ────────────────────────────────────────────
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  // ── Fill credentials from env vars — zero hardcoded secrets ──────────────
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);

  // ── Submit the login form ─────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Sign In' }).click();

  // ── Assert successful authentication — must land on /dashboard ────────────
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // ── Serialize session state (cookies + localStorage) to disk ─────────────
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
