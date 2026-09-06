import { test, expect } from '@playwright/test';
import { closePool, countExpenses, getExpenseById, isDbConfigured } from '../../utils/db';

/**
 * Expenses Database Automation Tests (Phase 3)
 *
 * Project: db (pre-loads authenticated storage state from playwright/.auth/user.json)
 *
 * Exercises POST / DELETE via the HTTP API, then asserts the resulting rows
 * directly in PostgreSQL with the `pg` driver.
 */

test.describe('Expenses DB — Persistence, Deletion & Row Counts', () => {
  // Ensure DB lifecycle assertions run serially to prevent parallel worker row count races
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(() => {
    if (!isDbConfigured()) {
      test.skip(
        true,
        'DATABASE_URL is not configured. Set a valid postgresql:// connection string in .env.local to run database tests.',
      );
    }
  });

  test.afterAll(async () => {
    await closePool();
  });

  test('POST /api/expenses persists a row matching the expenses schema', async ({ request }) => {
    const timestamp = Date.now();
    const name = `DB Persist ${timestamp}`;
    const amount = 42.75;

    const createRes = await request.post('/api/expenses', {
      data: { name, amount },
    });

    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    expect(created).toHaveProperty('id');

    const row = await getExpenseById(created.id);
    expect(row).toBeDefined();
    expect(row!.id).toBe(created.id);
    expect(row!.user_id).toBeTruthy();
    expect(typeof row!.user_id).toBe('string');
    expect(row!.name).toBe(name);
    expect(Number(row!.amount)).toBe(amount);
    expect(row!.created_at).toBeTruthy();

    // Cleanup so repeated runs do not accumulate fixture rows.
    const deleteRes = await request.delete(`/api/expenses/${created.id}`);
    expect(deleteRes.status()).toBe(200);
  });

  test('DELETE /api/expenses/[id] purges the row from PostgreSQL', async ({ request }) => {
    const timestamp = Date.now();
    const name = `DB Delete ${timestamp}`;

    const createRes = await request.post('/api/expenses', {
      data: { name, amount: 15.5 },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();

    const beforeDelete = await getExpenseById(created.id);
    expect(beforeDelete).toBeDefined();

    const deleteRes = await request.delete(`/api/expenses/${created.id}`);
    expect(deleteRes.status()).toBe(200);

    const afterDelete = await getExpenseById(created.id);
    expect(afterDelete).toBeUndefined();
  });

  test('row count increments on insert and decrements on delete', async ({ request }) => {
    const timestamp = Date.now();
    const name = `DB Count ${timestamp}`;

    expect(await countExpenses(name)).toBe(0);

    const countBefore = await countExpenses();

    const createRes = await request.post('/api/expenses', {
      data: { name, amount: 7.25 },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();

    expect(await countExpenses(name)).toBe(1);
    expect(await countExpenses()).toBe(countBefore + 1);

    const deleteRes = await request.delete(`/api/expenses/${created.id}`);
    expect(deleteRes.status()).toBe(200);

    expect(await countExpenses(name)).toBe(0);
    expect(await countExpenses()).toBe(countBefore);
  });
});
