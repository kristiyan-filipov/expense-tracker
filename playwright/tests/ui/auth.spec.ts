import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';

/**
 * Auth Spec — Unauthenticated Tests
 *
 * Project: unauthenticated (no stored session state)
 *
 * Covers:
 *  - Login page rendering
 *  - Invalid credentials error feedback
 *  - Successful login → dashboard redirect
 *  - Signup page rendering
 *  - Cross-link navigation (login ↔ signup)
 *  - Authenticated-user root redirect
 */

test.describe('Login page', () => {
  test('renders all key elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.signUpLink).toBeVisible();
  });

  test('shows an error message for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    // Submit with deliberately wrong password
    await loginPage.login('nobody@example.com', 'wrong-password-xyz');

    // Server action redirects to /login?error=... — expect the error text
    await expect(page).toHaveURL(/\/login\?error=/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('redirects to /dashboard after successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    await loginPage.login(email, password);

    // Must land on the dashboard without any error param
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});

test.describe('Signup page', () => {
  test('renders all key elements', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();

    await expect(signupPage.heading).toBeVisible();
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.passwordInput).toBeVisible();
    await expect(signupPage.submitButton).toBeVisible();
    await expect(signupPage.signInLink).toBeVisible();
  });
});

test.describe('Auth navigation links', () => {
  test('login page → signup page via "Sign up" link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    await loginPage.signUpLink.click();

    await expect(page).toHaveURL(/\/signup/);
    await expect(new SignupPage(page).heading).toBeVisible();
  });

  test('signup page → login page via "Sign in" link', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();

    await signupPage.signInLink.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});

test.describe('Authenticated-user redirects', () => {
  test('authenticated user visiting / is redirected to /dashboard', async ({ browser }) => {
    // Create a fresh context, manually inject the saved session state so
    // this test can verify the redirect without the project-level storageState.
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();

    await page.goto('/');

    await expect(page).toHaveURL(/\/dashboard/);

    await context.close();
  });
});
