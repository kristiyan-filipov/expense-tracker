import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { AddExpensePage } from '../../pages/AddExpensePage';
import { EditExpensePage } from '../../pages/EditExpensePage';

/**
 * Expenses Spec — Authenticated Tests
 *
 * Project: authenticated (pre-loads playwright/.auth/user.json)
 * Setup dependency: the 'setup' project runs auth.setup.ts first.
 *
 * All tests start on an authenticated dashboard session.
 * Test data uses Date.now() suffixes to guarantee isolation across runs.
 * Every test that creates an expense MUST delete it before completion (teardown).
 *
 * Prohibited patterns:
 *  - page.waitForTimeout() or any manual delay
 *  - Hardcoded credential strings
 *  - Cross-test state dependencies
 */

test.describe('Dashboard page', () => {
  test('renders the heading, stats cards, and expense table', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();

    // Heading
    await expect(dashboard.heading).toBeVisible();

    // Three spending-period stat cards
    await expect(dashboard.weekStatCard).toBeVisible();
    await expect(dashboard.monthStatCard).toBeVisible();
    await expect(dashboard.yearStatCard).toBeVisible();

    // Expense list section header
    await expect(dashboard.recentExpensesHeading).toBeVisible();
  });
});

test.describe('Expense CRUD lifecycle', () => {
  test('full journey: Create → Read → Update → Delete', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const addPage = new AddExpensePage(page);
    const editPage = new EditExpensePage(page);

    // Unique test data — timestamp suffix prevents collisions across runs
    const timestamp = Date.now();
    const originalName = `Test Expense ${timestamp}`;
    const originalAmount = 12.34;
    const updatedName = `Updated Expense ${timestamp}`;
    const updatedAmount = 99.99;

    // ── CREATE ────────────────────────────────────────────────────────────────
    await addPage.navigate();
    await expect(addPage.heading).toBeVisible();

    await addPage.fillAndSubmit(originalName, originalAmount);

    // Server action redirects to /dashboard — auto-waiting assertion
    await expect(page).toHaveURL(/\/dashboard/);

    // ── READ ──────────────────────────────────────────────────────────────────
    // Expense row must be visible with the correct name
    await expect(dashboard.expenseRow(originalName)).toBeVisible();

    // Formatted amount must appear within the row ($12.34)
    await expect(dashboard.expenseAmount(originalName)).toContainText('12.34');

    // ── UPDATE ────────────────────────────────────────────────────────────────
    await dashboard.clickEditOnExpense(originalName);

    // Must arrive on the edit page
    await expect(page).toHaveURL(/\/edit-expense\//);
    await expect(editPage.heading).toBeVisible();

    // Verify form is pre-populated with the original values
    await expect(editPage.nameInput).toHaveValue(originalName);
    await expect(editPage.amountInput).toHaveValue(String(originalAmount));

    // Fill new values and save
    await editPage.fillAndSubmit(updatedName, updatedAmount);

    // Redirects back to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Updated row must be visible; original name must no longer appear
    await expect(dashboard.expenseRow(updatedName)).toBeVisible();
    await expect(dashboard.expenseAmount(updatedName)).toContainText('99.99');
    await expect(dashboard.expenseRow(originalName)).not.toBeVisible();

    // ── DELETE (built-in teardown) ────────────────────────────────────────────
    await dashboard.clickDeleteOnExpense(updatedName);

    // Row must disappear — auto-waiting, no sleep
    await expect(dashboard.expenseRow(updatedName)).not.toBeVisible();
  });
});

test.describe('Add expense page', () => {
  test('does not submit when required name field is empty', async ({ page }) => {
    const addPage = new AddExpensePage(page);
    await addPage.navigate();

    // Fill only the amount — leave name empty
    await addPage.amountInput.fill('50');
    await addPage.submitButton.click();

    // HTML5 required validation keeps the user on the page
    await expect(page).toHaveURL(/\/add-expense/);
    await expect(addPage.heading).toBeVisible();
  });

  test('does not submit when required amount field is empty', async ({ page }) => {
    const addPage = new AddExpensePage(page);
    await addPage.navigate();

    // Fill only the name — leave amount empty
    await addPage.nameInput.fill('Orphan Expense');
    await addPage.submitButton.click();

    // HTML5 required validation keeps the user on the page
    await expect(page).toHaveURL(/\/add-expense/);
    await expect(addPage.heading).toBeVisible();
  });
});

test.describe('Edit expense page', () => {
  /**
   * Create a helper expense, use it for the cancel test, then clean it up.
   * Each test is self-contained — no inter-test state.
   */
  test('Cancel returns to dashboard without saving changes', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const addPage = new AddExpensePage(page);
    const editPage = new EditExpensePage(page);

    const timestamp = Date.now();
    const name = `Cancel Test Expense ${timestamp}`;

    // ── Setup: create a temporary expense ────────────────────────────────────
    await addPage.navigate();
    await addPage.fillAndSubmit(name, 5.00);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(dashboard.expenseRow(name)).toBeVisible();

    // ── Navigate to edit and cancel ───────────────────────────────────────────
    await dashboard.clickEditOnExpense(name);
    await expect(page).toHaveURL(/\/edit-expense\//);
    await expect(editPage.heading).toBeVisible();

    await editPage.cancel();

    // Must land back on /dashboard — original expense unchanged
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(dashboard.expenseRow(name)).toBeVisible();

    // ── Teardown: delete the temporary expense ────────────────────────────────
    await dashboard.clickDeleteOnExpense(name);
    await expect(dashboard.expenseRow(name)).not.toBeVisible();
  });
});

test.describe('Auth guard', () => {
  test('unauthenticated user is redirected from /dashboard to /login', async ({ browser }) => {
    // Fresh context with NO storage state — simulates a logged-out user
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/dashboard');

    // Next.js SSR auth guard redirects to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await context.close();
  });

  test('unauthenticated user is redirected from /add-expense to /login', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/add-expense');

    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });
});
