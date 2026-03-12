import { expect, test } from '@playwright/test';

test('検索フィルターシナリオ: キーワード一致のみ表示し、クリアで全件に戻る', async ({ page }) => {
  await page.goto('/list');

  const search = page.getByLabel('経費検索');
  await search.fill('福岡');
  await expect(page.getByText('福岡支店')).toBeVisible();
  await expect(page.getByText('大阪本社')).toHaveCount(0);

  await search.fill('会議');
  await expect(page.getByText('大阪本社')).toBeVisible();
  await expect(page.getByText('福岡支店')).toHaveCount(0);

  await search.clear();
  await expect(page.getByText('大阪本社')).toBeVisible();
  await expect(page.getByText('福岡支店')).toBeVisible();
});
