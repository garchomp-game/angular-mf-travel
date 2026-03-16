import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, gte, lt, desc } from 'drizzle-orm';
import { db } from '../db';
import { expenseRecords } from '../db/schema';

type JwtPayload = { sub: string; email: string };

const expenses = new Hono<{ Variables: { jwtPayload: JwtPayload } }>();

const expenseSchema = z.object({
  date: z.string().min(1),
  destination: z.string().min(1),
  payerDetail: z.string().min(1),
  isRoundTrip: z.boolean().default(false),
  category: z.string().optional().default(''),
  taxType: z.string().optional().default(''),
  preApprovalNumber: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
});

function toRecord(row: typeof expenseRecords.$inferSelect) {
  return {
    id: row.id,
    date: row.travelDate,
    destination: row.visitTo,
    payerDetail: row.routeText,
    isRoundTrip: row.isRoundTrip ?? false,
    category: row.categoryCode || undefined,
    taxType: row.taxCode || undefined,
    preApprovalNumber: row.preApprovalNo || undefined,
    memo: row.memo || undefined,
  };
}

// List by month: GET /api/expenses?month=2026年03月
expenses.get('/', async (c) => {
  const userId = c.get('jwtPayload').sub;
  const monthLabel = c.req.query('month') ?? '';

  const match = monthLabel.match(/(\d{4})年(\d{2})月/);
  if (!match) {
    return c.json({ data: [] });
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  const rows = await db
    .select()
    .from(expenseRecords)
    .where(
      and(
        eq(expenseRecords.userId, userId),
        gte(expenseRecords.travelDate, start),
        lt(expenseRecords.travelDate, end),
      ),
    )
    .orderBy(desc(expenseRecords.travelDate));

  return c.json({ data: rows.map(toRecord) });
});

// Get by ID: GET /api/expenses/:id
expenses.get('/:id', async (c) => {
  const userId = c.get('jwtPayload').sub;
  const id = c.req.param('id');

  const row = await db
    .select()
    .from(expenseRecords)
    .where(and(eq(expenseRecords.id, id), eq(expenseRecords.userId, userId)))
    .get();

  if (!row) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ data: toRecord(row) });
});

// Create: POST /api/expenses
expenses.post('/', zValidator('json', expenseSchema), async (c) => {
  const userId = c.get('jwtPayload').sub;
  const body = c.req.valid('json');

  const row = await db
    .insert(expenseRecords)
    .values({
      userId,
      travelDate: body.date,
      visitTo: body.destination,
      routeText: body.payerDetail,
      isRoundTrip: body.isRoundTrip,
      categoryCode: body.category ?? '',
      taxCode: body.taxType ?? '',
      preApprovalNo: body.preApprovalNumber ?? null,
      memo: body.memo ?? null,
    })
    .returning()
    .get();

  return c.json({ data: toRecord(row) }, 201);
});

// Update: PUT /api/expenses/:id
expenses.put('/:id', zValidator('json', expenseSchema), async (c) => {
  const userId = c.get('jwtPayload').sub;
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const row = await db
    .update(expenseRecords)
    .set({
      travelDate: body.date,
      visitTo: body.destination,
      routeText: body.payerDetail,
      isRoundTrip: body.isRoundTrip,
      categoryCode: body.category ?? '',
      taxCode: body.taxType ?? '',
      preApprovalNo: body.preApprovalNumber ?? null,
      memo: body.memo ?? null,
    })
    .where(and(eq(expenseRecords.id, id), eq(expenseRecords.userId, userId)))
    .returning()
    .get();

  if (!row) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ data: toRecord(row) });
});

// Delete: DELETE /api/expenses/:id
expenses.delete('/:id', async (c) => {
  const userId = c.get('jwtPayload').sub;
  const id = c.req.param('id');

  const deleted = await db
    .delete(expenseRecords)
    .where(and(eq(expenseRecords.id, id), eq(expenseRecords.userId, userId)))
    .returning()
    .get();

  if (!deleted) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ success: true });
});

export default expenses;
