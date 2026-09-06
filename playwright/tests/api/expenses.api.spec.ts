import { test, expect, request as playwrightRequest } from '@playwright/test';

/**
 * Expenses API Integration Tests
 *
 * Project: api (pre-loads authenticated storage state from playwright/.auth/user.json)
 *
 * Tests the /api/expenses and /api/expenses/[id] REST endpoints directly
 * using Playwright's built-in `request` fixture without DOM rendering.
 */

test.describe('Expenses API — CRUD Lifecycle', () => {
  test('full REST lifecycle: POST (create) → GET (read) → PUT (update) → DELETE (remove)', async ({
    request,
  }) => {
    const timestamp = Date.now();
    const originalName = `API Expense ${timestamp}`;
    const originalAmount = 29.99;
    const updatedName = `Updated API Expense ${timestamp}`;
    const updatedAmount = 88.50;

    // ── 1. CREATE (POST /api/expenses) ──────────────────────────────────────
    const createRes = await request.post('/api/expenses', {
      data: {
        name: originalName,
        amount: originalAmount,
      },
    });

    expect(createRes.status()).toBe(201);
    const createdExpense = await createRes.json();

    expect(createdExpense).toHaveProperty('id');
    expect(createdExpense.name).toBe(originalName);
    expect(Number(createdExpense.amount)).toBe(originalAmount);

    const expenseId = createdExpense.id;

    // ── 2. READ SINGLE (GET /api/expenses/[id]) ──────────────────────────────
    const getSingleRes = await request.get(`/api/expenses/${expenseId}`);
    expect(getSingleRes.status()).toBe(200);
    const fetchedExpense = await getSingleRes.json();
    expect(fetchedExpense.id).toBe(expenseId);
    expect(fetchedExpense.name).toBe(originalName);

    // ── 3. READ LIST (GET /api/expenses) ────────────────────────────────────
    const getListRes = await request.get('/api/expenses');
    expect(getListRes.status()).toBe(200);
    const expenseList = await getListRes.json();

    expect(Array.isArray(expenseList)).toBe(true);
    const matchInList = expenseList.find((item: { id: string }) => item.id === expenseId);
    expect(matchInList).toBeDefined();

    // ── 4. UPDATE (PUT /api/expenses/[id]) ──────────────────────────────────
    const updateRes = await request.put(`/api/expenses/${expenseId}`, {
      data: {
        name: updatedName,
        amount: updatedAmount,
      },
    });

    expect(updateRes.status()).toBe(200);
    const updatedExpense = await updateRes.json();
    expect(updatedExpense.id).toBe(expenseId);
    expect(updatedExpense.name).toBe(updatedName);
    expect(Number(updatedExpense.amount)).toBe(updatedAmount);

    // ── 5. DELETE (DELETE /api/expenses/[id]) ───────────────────────────────
    const deleteRes = await request.delete(`/api/expenses/${expenseId}`);
    expect(deleteRes.status()).toBe(200);
    const deleteJson = await deleteRes.json();
    expect(deleteJson.success).toBe(true);

    // ── 6. VERIFY DELETION (GET /api/expenses/[id] → 404) ────────────────────
    const verifyRes = await request.get(`/api/expenses/${expenseId}`);
    expect(verifyRes.status()).toBe(404);
  });
});

test.describe('Expenses API — Input Validation & Edge Cases', () => {
  test('returns 400 Bad Request when POST payload is missing required name', async ({
    request,
  }) => {
    const response = await request.post('/api/expenses', {
      data: {
        amount: 50.0,
      },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Invalid payload');
  });

  test('returns 400 Bad Request when POST payload has invalid/negative amount', async ({
    request,
  }) => {
    const response = await request.post('/api/expenses', {
      data: {
        name: 'Bad Amount Expense',
        amount: -15.0,
      },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Invalid payload');
  });

  test('returns 400 Bad Request when PUT payload contains invalid fields', async ({
    request,
  }) => {
    const response = await request.put('/api/expenses/00000000-0000-0000-0000-000000000000', {
      data: {
        amount: -100,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('returns 404 Not Found when attempting to GET non-existent expense', async ({
    request,
  }) => {
    const response = await request.get('/api/expenses/00000000-0000-0000-0000-000000000000');
    expect(response.status()).toBe(404);
  });

  test('returns 404 Not Found when attempting to DELETE non-existent expense', async ({
    request,
  }) => {
    const response = await request.delete('/api/expenses/00000000-0000-0000-0000-000000000000');
    expect(response.status()).toBe(404);
  });
});

test.describe('Expenses API — Auth Security', () => {
  test('returns 401 Unauthorized for unauthenticated GET /api/expenses', async ({ baseURL }) => {
    // Create an unauthenticated request context with NO storage state
    const unauthContext = await playwrightRequest.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    });

    const response = await unauthContext.get('/api/expenses');
    expect(response.status()).toBe(401);

    await unauthContext.dispose();
  });

  test('returns 401 Unauthorized for unauthenticated POST /api/expenses', async ({ baseURL }) => {
    const unauthContext = await playwrightRequest.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    });

    const response = await unauthContext.post('/api/expenses', {
      data: {
        name: 'Unauthorized Expense',
        amount: 100,
      },
    });

    expect(response.status()).toBe(401);

    await unauthContext.dispose();
  });

  test('returns 401 Unauthorized for unauthenticated DELETE /api/expenses/[id]', async ({
    baseURL,
  }) => {
    const unauthContext = await playwrightRequest.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    });

    const response = await unauthContext.delete('/api/expenses/00000000-0000-0000-0000-000000000000');
    expect(response.status()).toBe(401);

    await unauthContext.dispose();
  });
});
