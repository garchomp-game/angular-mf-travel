import { expect, test } from '@playwright/test';

test('月次一覧シナリオ: 月切替で対象月データのみを表示する', async ({ page }) => {
  await page.goto('/list');

  await expect(page.getByText('大阪本社')).toBeVisible();
  await page.getByRole('button', { name: '前月' }).click();

  await expect(page.getByText('名古屋営業所')).toBeVisible();
  await expect(page.getByText('大阪本社')).toHaveCount(0);

  await page.getByRole('button', { name: '前月' }).click();
  await expect(page.getByText('該当データなし')).toBeVisible();
});
