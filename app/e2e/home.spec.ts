import { expect, test } from '@playwright/test';

test('home page renders setup and dry-run actions', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Angular + Supabase (Bun)' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Dry-runログ確認' })).toBeVisible();

  await page.getByRole('button', { name: 'INFOログ' }).click();
  await page.getByRole('button', { name: 'WARNログ' }).click();
  await page.getByRole('button', { name: 'ERRORログ' }).click();

  await expect(page.getByText('Supabase未設定（プレースホルダーのまま）')).toBeVisible();
});
