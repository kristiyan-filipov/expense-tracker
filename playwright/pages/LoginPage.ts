import { type Page, type Locator } from '@playwright/test';

/**
 * LoginPage — Page Object Model
 *
 * Encapsulates all locators and user interaction workflows for the /login route.
 * No assertions (expect) live here — those belong in spec files.
 */
export class LoginPage {
  readonly page: Page;

  // ── Locators (user-facing, accessibility-first) ───────────────────────────
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    // Error message is rendered when ?error= query param is present
    this.errorMessage = page.getByText(/Could not authenticate/i);
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Navigate to the login page. */
  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Fill the login form with the provided credentials and submit.
   * Does not assert the outcome — callers decide what to expect.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
