import { type Page, type Locator } from '@playwright/test';

/**
 * SignupPage — Page Object Model
 *
 * Encapsulates all locators and user interaction workflows for the /signup route.
 * No assertions (expect) live here — those belong in spec files.
 */
export class SignupPage {
  readonly page: Page;

  // ── Locators (user-facing, accessibility-first) ───────────────────────────
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly signInLink: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Create Account' });
    this.errorMessage = page.locator('[class*="destructive"]');
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
    this.heading = page.getByRole('heading', { name: 'Create an Account' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Navigate to the signup page. */
  async navigate(): Promise<void> {
    await this.page.goto('/signup');
  }

  /**
   * Fill the signup form with the provided credentials and submit.
   * Does not assert the outcome — callers decide what to expect.
   */
  async signup(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
