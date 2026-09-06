import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local as the single source of truth for all config.
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Path where the authenticated session state is serialized to disk.
const AUTH_STATE_PATH = 'playwright/.auth/user.json';

export default defineConfig({
  // ── 1. Point testDir to the new nested directory ────────────────────────
  testDir: './playwright/tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in source */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel workers on CI for determinism */
  workers: process.env.CI ? 1 : undefined,

  /* ─── Reporters ─────────────────────────────────────────────────────────── */
  reporter: [
    ['html', { open: 'on-failure' }],
    ['list'],
  ],

  /* ─── Shared use settings for all projects ──────────────────────────────── */
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* ─── Project Segmentation ───────────────────────────────────────────────── */
  projects: [
    // ── 2. Global setup regex updated to playwright/tests/setup/ ──────────
    {
      name: 'setup',
      testMatch: /playwright\/tests\/setup\/auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── 3. Unauthenticated regex updated to playwright/tests/ui/ ──────────
    {
      name: 'unauthenticated',
      testMatch: /playwright\/tests\/ui\/auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── 4. Authenticated regex updated to playwright/tests/ui/ ────────────
    {
      name: 'authenticated',
      testMatch: /playwright\/tests\/ui\/expenses\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
    },

    // ── 5. API Integration project ──────────────────────────────────────────
    {
      name: 'api',
      testMatch: /playwright\/tests\/api\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: AUTH_STATE_PATH,
      },
    },

    // ── 6. Database Automation project ──────────────────────────────────────
    {
      name: 'db',
      testMatch: /playwright\/tests\/db\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: AUTH_STATE_PATH,
      },
    },
  ],

  /* ─── Web Server ─────────────────────────────────────────────────────────── */
  webServer: {
    command: 'npm run start',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});