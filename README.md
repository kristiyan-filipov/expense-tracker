# Expense Tracker

A simple and practical web application to track daily expenses, manage budgets, and visualize spending habits.

**Live Demo:** https://expense-tracker-five-blue-30.vercel.app/

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Database & Auth:** [Supabase](https://supabase.com/) (Auth, Database, `@supabase/ssr`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Utilities:** [date-fns](https://date-fns.org/)
- **Testing & QA:** [Playwright](https://playwright.dev/) (E2E UI, API integration & PostgreSQL DB automation)
- **Database Driver:** [node-postgres (`pg`)](https://node-postgres.com/) (Direct DB testing)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## Features

- **User Authentication:** Secure sign-up, sign-in, and sign-out powered by Supabase Auth.
- **Dashboard:** An overview of your spending, including total expenses, and recent transaction history.
- **Expense Logging:** Quickly add, edit or remove expenses with descriptions and amounts, and loading indicators for each action.
- **Comprehensive QA Suite:** End-to-end multi-layer automated testing covering UI, REST API, Database integrity, and CI/CD.

## Getting Started

### 1. Prerequisites

Ensure you have Node.js and npm installed.

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials along with the QA test suite variables:

```env
# Application (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# QA & Automated Testing (Playwright)
TEST_USER_EMAIL=test-user@example.com
TEST_USER_PASSWORD=your-test-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:6543/postgres
```

### 3. Database Setup (Supabase)

Create an `expenses` table in your Supabase project (either via the Table Editor UI or the SQL Editor) with the following configuration:

1. **Columns**:
   - `id`: `uuid` (Primary Key, default: `gen_random_uuid()`)
   - `user_id`: `uuid` (Foreign Key referencing `auth.users.id`, non-nullable)
   - `name`: `text` (non-nullable)
   - `amount`: `numeric` (non-nullable)
   - `created_at`: `timestamptz` (default: `now()`)

2. **Row Level Security (RLS)**:
   - Enable RLS on the `expenses` table.
   - Add policies allowing users to **insert**, **select**, and **delete** only their own records (e.g., checking that `auth.uid() = user_id`).


### 4. Installation

Install project dependencies:

```bash
npm install
```

### 5. Run Locally


Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## QA & Automated Testing

The project includes an enterprise-grade, multi-layer automated test suite built with **[Playwright](https://playwright.dev/)**. It covers end-to-end browser UI interactions, REST API integration, direct PostgreSQL database verification, and CI/CD pipelines.

### Architecture & Key Highlights

- **Page Object Model (POM):** Reusable page object abstractions in [`playwright/pages/`](file:///c:/Users/Kris/Projects/expense-tracker/playwright/pages) (`DashboardPage`, `AddExpensePage`, `EditExpensePage`, `LoginPage`, `SignupPage`) ensuring clean separation of concerns and maintainable selectors.
- **Session Caching (`auth.setup.ts`):** Global setup script authenticates via the UI once before test execution, serializing cookies and local storage to `playwright/.auth/user.json`. Downstream authenticated specs reuse this storage state, bypassing repeated login steps for faster, flake-free runs.
- **Zero-Delay Dynamic Assertions:** Strictly uses Playwright's web-first auto-waiting assertions rather than arbitrary sleep timeouts (`page.waitForTimeout()`).
- **Test Isolation & Teardown:** Dynamically generated test data using unique timestamp suffixes (`Date.now()`) with self-cleaning teardown ensures tests remain isolated and leave no residual records.
- **Direct Database Assertions (`pg`):** Connects to PostgreSQL directly through the Supabase connection pooler (compatible with transaction mode PgBouncer) via [`playwright/utils/db.ts`](file:///c:/Users/Kris/Projects/expense-tracker/playwright/utils/db.ts) to verify data integrity and row counts independently of the UI.

### Test Projects & Coverage

The test suite is partitioned into specialized projects configured in [`playwright.config.ts`](file:///c:/Users/Kris/Projects/expense-tracker/playwright.config.ts):

| Project | Target Spec | Description |
| :--- | :--- | :--- |
| **`setup`** | [`playwright/tests/setup/auth.setup.ts`](file:///c:/Users/Kris/Projects/expense-tracker/playwright/tests/setup/auth.setup.ts) | Authenticates the test user and writes the session state (`user.json`). |
| **`unauthenticated`** | [`playwright/tests/ui/auth.spec.ts`](file:///c:/Users/Kris/Projects/expense-tracker/playwright/tests/ui/auth.spec.ts) | Tests login & signup form rendering, invalid credentials error feedback, cross-links, and root route redirects without a session. |
| **`authenticated`** | [`playwright/tests/ui/expenses.spec.ts`](file:///c:/Users/Kris/Projects/expense-tracker/playwright/tests/ui/expenses.spec.ts) | Full UI E2E CRUD lifecycle (Create, Read, Update, Delete), stat card calculations (week/month/year), form validation, edit cancel actions, and SSR auth route guards. |
| **`api`** | [`playwright/tests/api/expenses.api.spec.ts`](file:///c:/Users/Kris/Projects/expense-tracker/playwright/tests/api/expenses.api.spec.ts) | Headless REST API testing for `/api/expenses` and `/api/expenses/[id]` using Playwright's API request context. Verifies 201 Created, 200 OK, 400 Bad Request (payload validation), 404 Not Found, and 401 Unauthorized checks. |
| **`db`** | [`playwright/tests/db/expenses.db.spec.ts`](file:///c:/Users/Kris/Projects/expense-tracker/playwright/tests/db/expenses.db.spec.ts) | Direct PostgreSQL assertions verifying schema columns, record persistence, row deletion, and row count tracking. Gracefully skips if `DATABASE_URL` is omitted. |

### Running the Tests

Ensure browser binaries are installed:

```bash
npx playwright install --with-deps chromium
```

#### Run All Tests
Executes all test projects across the test suite (automatically orchestrates the Next.js server):

```bash
npm test
# or
npx playwright test
```

#### Run Specific Test Projects

```bash
# Run only UI authenticated tests
npx playwright test --project=authenticated

# Run only UI unauthenticated tests
npx playwright test --project=unauthenticated

# Run only API integration tests
npx playwright test --project=api

# Run only Database tests
npx playwright test --project=db
```

#### Interactive & Debug Modes

```bash
# Open interactive Playwright UI Mode
npm run test:ui

# Run tests in headed browser mode
npx playwright test --headed

# Run in debug mode with the Playwright Inspector
npx playwright test --debug
```

#### View HTML Test Reports

```bash
npm run test:report
# or
npx playwright show-report
```

### Continuous Integration (CI/CD)

The test suite is fully automated via GitHub Actions in [`.github/workflows/playwright.yml`](file:///c:/Users/Kris/Projects/expense-tracker/.github/workflows/playwright.yml):
- Automatically triggers on `push` and `pull_request` against `main` and `master` branches.
- Installs dependencies (`npm ci`), sets up Chromium, and builds the Next.js production bundle.
- Runs the test suite in headless mode with deterministic worker settings and automatic retries (`retries: 2`).
- Retains and uploads HTML test reports as downloadable artifacts for 30 days.

