import { type Page, type Locator } from '@playwright/test';

/**
 * EditExpensePage — Page Object Model
 *
 * Encapsulates all locators and user interaction workflows for the
 * /edit-expense/[id] dynamic route.
 * No assertions (expect) live here — those belong in spec files.
 */
export class EditExpensePage {
  readonly page: Page;

  // ── Locators (user-facing, accessibility-first) ───────────────────────────
  readonly nameInput: Locator;
  readonly amountInput: Locator;
  readonly saveButton: Locator;
  readonly cancelLink: Locator;
  readonly errorMessage: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Expense Name');
    this.amountInput = page.getByLabel('Amount ($)');
    this.saveButton = page.getByRole('button', { name: 'Save Changes' });
    this.cancelLink = page.getByRole('link', { name: 'Cancel' });
    this.errorMessage = page.locator('[class*="destructive"]');
    this.heading = page.getByRole('heading', { name: 'Edit Expense' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Clear and fill the expense form with new values, then submit.
   * Uses .fill() which clears the existing value before typing — matches
   * how the edit page pre-populates inputs with `defaultValue`.
   * Does not assert the outcome — callers decide what to expect.
   *
   * @param name   - Updated expense name
   * @param amount - Updated numeric amount
   */
  async fillAndSubmit(name: string, amount: number): Promise<void> {
    await this.nameInput.fill(name);
    await this.amountInput.fill(String(amount));
    await this.saveButton.click();
  }

  /**
   * Click the "Cancel" link to discard changes and return to the dashboard.
   */
  async cancel(): Promise<void> {
    await this.cancelLink.click();
  }
}
