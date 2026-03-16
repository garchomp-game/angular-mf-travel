import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';

export const TEST_EMAIL = 'e2e-test@example.com';
export const TEST_PASSWORD = 'e2e-test-password';

const API_BASE = 'http://127.0.0.1:3000/api';

const seedExpenses = [
  {
    date: '2026-03-08',
    destination: '大阪本社',
    payerDetail: 'JR東海 / 新幹線',
    isRoundTrip: true,
    category: '旅費交通費',
    taxType: '課税',
    memo: '会議出張',
  },
  {
    date: '2026-03-10',
    destination: '福岡支店',
    payerDetail: '博多駅タクシー / 客先訪問移動',
    isRoundTrip: false,
    category: '旅費交通費',
    taxType: '課税',
    memo: '雨天のため利用',
  },
  {
    date: '2026-02-14',
    destination: '名古屋営業所',
    payerDetail: '近鉄 / 顧客訪問',
    isRoundTrip: true,
    category: '旅費交通費',
    taxType: '課税',
    memo: '定例訪問',
  },
];

async function apiPost(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${err}`);
  }
  return res.json();
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  // --- 1. Register test user (or login if already exists) ---
  let token: string;

  try {
    const registerRes = await apiPost('/auth/register', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    token = registerRes.token;
  } catch {
    // User may already exist from a previous run — try login instead
    const loginRes = await apiPost('/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    token = loginRes.token;
  }

  // --- 2. Seed expense data ---
  // Delete any existing expenses first (list and delete one by one)
  const listRes = await fetch(`${API_BASE}/expenses?month=2026年03月`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const existing = (await listRes.json()) as { data: { id: string }[] };
  for (const exp of existing.data) {
    await fetch(`${API_BASE}/expenses/${exp.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Also clean February data
  const listFeb = await fetch(`${API_BASE}/expenses?month=2026年02月`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const existingFeb = (await listFeb.json()) as { data: { id: string }[] };
  for (const exp of existingFeb.data) {
    await fetch(`${API_BASE}/expenses/${exp.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Insert seed expenses
  for (const expense of seedExpenses) {
    await apiPost('/expenses', expense, token);
  }

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
