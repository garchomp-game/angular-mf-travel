import { expect, test } from '@playwright/test';

test('保存成功条件: 必須項目入力後に保存すると一覧へ反映される', async ({ page }) => {
  await page.goto('/entry');

  await page.getByLabel('日付 *').fill('2026-03-20');
  await page.getByLabel('訪問先 *').fill('札幌支店');
  await page.getByLabel('支払先・内容 *').fill('ANA / 空港連絡バス');
  await page.getByLabel('金額 *').fill('8500');
  await page.getByRole('button', { name: '保存' }).click();

  await expect(page).toHaveURL(/\/list\?status=saved/);
  await expect(page.getByText('保存に成功しました。')).toBeVisible();
  await expect(page.getByText('札幌支店')).toBeVisible();
  await expect(page.getByText('ANA / 空港連絡バス')).toBeVisible();
});
