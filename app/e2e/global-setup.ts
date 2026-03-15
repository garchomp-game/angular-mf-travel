import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FullConfig } from '@playwright/test';

const STORAGE_KEY = 'travel-expenses';

const seedExpenses = [
  {
    id: 'exp-seed-1',
    date: '2026-03-08',
    destination: '大阪本社',
    payerDetail: 'JR東海 / 新幹線往復',
    amount: 27200,
    category: '旅費交通費',
    memo: '会議出張',
  },
  {
    id: 'exp-seed-2',
    date: '2026-03-10',
    destination: '福岡支店',
    payerDetail: '博多駅タクシー / 客先訪問移動',
    amount: 3200,
    category: '旅費交通費',
    memo: '雨天のため利用',
  },
  {
    id: 'exp-seed-3',
    date: '2026-02-14',
    destination: '名古屋営業所',
    payerDetail: '近鉄 / 顧客訪問',
    amount: 1800,
    category: '旅費交通費',
    memo: '定例訪問',
  },
];

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (typeof baseURL !== 'string') {
    throw new Error('baseURL is required for e2e storageState generation');
  }

  const state = {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [{ name: STORAGE_KEY, value: JSON.stringify(seedExpenses) }],
      },
    ],
  };

  const authDir = join(process.cwd(), 'e2e/.auth');
  mkdirSync(authDir, { recursive: true });
  writeFileSync(join(authDir, 'storageState.json'), JSON.stringify(state, null, 2), 'utf-8');
}
