import { type Page, type Locator } from '@playwright/test';

/**
 * AddExpensePage — Page Object Model
 *
 * Encapsulates all locators and user interaction workflows for the /add-expense route.
 * No assertions (expect) live here — those belong in spec files.
 */
export class AddExpensePage {
  readonly page: Page;

  // ── Locators (user-facing, accessibility-first) ───────────────────────────
  readonly nameInput: Locator;
  readonly amountInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Expense Name');
    // The amount label is "Amount ($)" — use an exact substring match
    this.amountInput = page.getByLabel('Amount ($)');
    this.submitButton = page.getByRole('button', { name: 'Save Expense' });
    this.errorMessage = page.locator('[class*="destructive"]');
    this.heading = page.getByRole('heading', { name: 'Add Expense' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Navigate to the add expense page. */
  async navigate(): Promise<void> {
    await this.page.goto('/add-expense');
  }

  /**
   * Fill the expense form with the provided values and submit.
   * Does not assert the outcome — callers decide what to expect.
   *
   * @param name   - Expense name / description
   * @param amount - Numeric amount (e.g. 42.50)
   */
  async fillAndSubmit(name: string, amount: number): Promise<void> {
    await this.nameInput.fill(name);
    await this.amountInput.fill(String(amount));
    await this.submitButton.click();
  }
}
