import { type Page, type Locator } from '@playwright/test';

/**
 * DashboardPage — Page Object Model
 *
 * Encapsulates all locators and user interaction workflows for the /dashboard route.
 *
 * Dynamic locators for expense rows use relative scoping:
 *   1. Find the text node matching the expense name.
 *   2. Traverse up to the row container (the closest div sibling ancestor).
 *   3. Scope child element queries (Edit, Delete buttons) to that container.
 *
 * This avoids brittle XPath/CSS selectors and handles multiple expenses correctly.
 *
 * No assertions (expect) live here — those belong in spec files.
 */
export class DashboardPage {
  readonly page: Page;

  // ── Static Locators ───────────────────────────────────────────────────────
  readonly heading: Locator;
  readonly recentExpensesHeading: Locator;
  readonly weekStatCard: Locator;
  readonly monthStatCard: Locator;
  readonly yearStatCard: Locator;
  readonly addExpenseNavLink: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.recentExpensesHeading = page.getByRole('heading', { name: 'Recent Expenses' });
    this.weekStatCard = page.getByText('This Week');
    this.monthStatCard = page.getByText('This Month');
    this.yearStatCard = page.getByText('This Year');
    this.addExpenseNavLink = page.getByRole('link', { name: /Add Expense/i });
    this.emptyState = page.getByText('No expenses found. Start adding some!');
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Navigate to the dashboard. */
  async navigate(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  /**
   * Locate the full row container for an expense by its name.
   *
   * Strategy: find the <span> that contains the expense name text,
   * then traverse up to the parent row <div> (the flex container that holds
   * both the name/date column and the amount/actions column).
   *
   * This scoping ensures Edit and Delete clicks target only the correct row
   * even when multiple expenses share similar names.
   */
  private getExpenseRow(name: string): Locator {
    // The expense name renders inside a <span class="...text-slate-200 text-lg">
    // Its parent row is the <div class="p-6 flex items-center justify-between ...">
    return this.page
      .locator('span', { hasText: name })
      .locator('xpath=ancestor::div[contains(@class,"p-6")]')
      .first();
  }

  /**
   * Returns a Locator for the expense row matching the given name.
   * Use in assertions: await expect(dashboardPage.expenseRow('My Expense')).toBeVisible()
   */
  expenseRow(name: string): Locator {
    return this.getExpenseRow(name);
  }

  /** Click the Edit (pencil) icon for the expense with the given name. */
  async clickEditOnExpense(name: string): Promise<void> {
    const row = this.getExpenseRow(name);
    await row.getByRole('link', { name: 'Edit expense' }).click();
  }

  /** Click the Delete (trash) button for the expense with the given name. */
  async clickDeleteOnExpense(name: string): Promise<void> {
    const row = this.getExpenseRow(name);
    await row.getByRole('button', { name: 'Delete expense' }).click();
  }

  /** Click the "Add Expense" navigation link in the navbar. */
  async clickAddExpense(): Promise<void> {
    await this.addExpenseNavLink.click();
  }

  /**
   * Returns a Locator for the displayed amount within the named expense row.
   * Use in assertions: await expect(dashboardPage.expenseAmount('Groceries')).toHaveText(...)
   */
  expenseAmount(name: string): Locator {
    // The amount is in a <div class="font-semibold text-xl ..."> within the same row
    return this.getExpenseRow(name).locator('div.font-semibold.text-xl').first();
  }
}
