import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Load .env.local for local development (Playwright doesn't auto-load .env files)
const envLocalPath = join(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

export const TEST_EMAIL = 'e2e-test@example.com';
export const TEST_PASSWORD = 'e2e-test-password';

const seedExpenses = [
  {
    travel_date: '2026-03-08',
    visit_to: '大阪本社',
    route_text: 'JR東海 / 新幹線往復',
    amount: 27200,
    category_code: '旅費交通費',
    tax_code: '課税',
    memo: '会議出張',
  },
  {
    travel_date: '2026-03-10',
    visit_to: '福岡支店',
    route_text: '博多駅タクシー / 客先訪問移動',
    amount: 3200,
    category_code: '旅費交通費',
    tax_code: '課税',
    memo: '雨天のため利用',
  },
  {
    travel_date: '2026-02-14',
    visit_to: '名古屋営業所',
    route_text: '近鉄 / 顧客訪問',
    amount: 1800,
    category_code: '旅費交通費',
    tax_code: '課税',
    memo: '定例訪問',
  },
];

export default async function globalSetup(config: FullConfig): Promise<void> {
  const supabaseUrl = process.env['SUPABASE_URL'] ?? 'http://127.0.0.1:54321';
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const anonKey = process.env['SUPABASE_ANON_KEY'];

  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required for E2E setup');
  if (!anonKey) throw new Error('SUPABASE_ANON_KEY env var is required for E2E setup');

  // --- 1. Seed data via admin API ---
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Delete existing test user
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const testUser = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);
  if (testUser) {
    await admin.from('expense_records').delete().eq('user_id', testUser.id);
    await admin.auth.admin.deleteUser(testUser.id);
  }

  // Create test user
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (createError || !newUser.user) throw new Error(`Create user failed: ${createError?.message}`);

  // Seed expenses
  const { error: seedError } = await admin
    .from('expense_records')
    .insert(seedExpenses.map((e) => ({ ...e, user_id: newUser.user.id })));
  if (seedError) throw new Error(`Seed expenses failed: ${seedError.message}`);

  // --- 2. Login via browser to capture correct storageState ---
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://127.0.0.1:4200';
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto('/login');
  await page.getByPlaceholder('user@example.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('6文字以上').fill(TEST_PASSWORD);
  await page.locator('form').getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('**/list**', { timeout: 15000 });

  // Save authenticated state
  const authDir = join(process.cwd(), 'e2e/.auth');
  mkdirSync(authDir, { recursive: true });
  const storagePath = join(authDir, 'storageState.json');
  await page.context().storageState({ path: storagePath });

  await browser.close();
  console.log(`E2E setup: user=${TEST_EMAIL}, expenses=${seedExpenses.length}, storageState saved`);
}
