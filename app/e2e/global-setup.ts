import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

export const TEST_EMAIL = 'e2e-test@example.com';
export const TEST_PASSWORD = 'e2e-test-password123';

const SUPABASE_URL = process.env['SUPABASE_URL'] ?? '';
const SUPABASE_SERVICE_KEY = process.env['SUPABASE_SERVICE_KEY'] ?? '';

const seedExpenses = [
  {
    travel_date: '2026-03-08',
    visit_to: '大阪本社',
    route_text: 'JR東海 / 新幹線',
    is_round_trip: true,
    category_code: '旅費交通費',
    tax_code: '課税',
    memo: '会議出張',
  },
  {
    travel_date: '2026-03-10',
    visit_to: '福岡支店',
    route_text: '博多駅タクシー / 客先訪問移動',
    is_round_trip: false,
    category_code: '旅費交通費',
    tax_code: '課税',
    memo: '雨天のため利用',
  },
  {
    travel_date: '2026-02-14',
    visit_to: '名古屋営業所',
    route_text: '近鉄 / 顧客訪問',
    is_round_trip: true,
    category_code: '旅費交通費',
    tax_code: '課税',
    memo: '定例訪問',
  },
];

export default async function globalSetup(config: FullConfig): Promise<void> {
  // Use service_role key (bypasses RLS) for admin operations
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // --- 0. Clean up ALL test users ---
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  if (allUsers?.users) {
    for (const u of allUsers.users) {
      // e2e-auth-* users from signup test + main test user (recreate fresh)
      if (u.email?.startsWith('e2e-auth-') || u.email === TEST_EMAIL) {
        await supabase.auth.admin.deleteUser(u.id);
      }
    }
  }

  // --- 1. Create test user fresh (avoid stale password hash) ---
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`Failed to create test user: ${error.message}`);
  const userId = newUser.user.id;

  // --- 2. Clean ALL existing test data and seed ---
  await supabase.from('expense_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert seed expenses
  const { error: insertError } = await supabase
    .from('expense_records')
    .insert(seedExpenses.map((e) => ({ ...e, user_id: userId })));
  if (insertError) throw new Error(`Seed insert failed: ${insertError.message}`);

  // --- 3. Login via browser to capture storageState ---
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
