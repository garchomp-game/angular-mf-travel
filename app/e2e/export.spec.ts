import { expect, test } from '@playwright/test';

test('編集成功条件: 編集保存後に一覧へ更新内容が反映される', async ({ page }) => {
  await page.goto('/list');

  await page
    .locator('[data-testid="expense-item-exp-seed-1"]')
    .getByRole('button', { name: '編集' })
    .click();
  await expect(page.getByRole('heading', { name: '経費編集' })).toBeVisible();

  await page.getByLabel('訪問先 *').fill('大阪本社(更新)');
  await page.getByRole('button', { name: '更新' }).click();

  await expect(page.getByText('編集に成功しました。')).toBeVisible();
  await expect(page.getByText('大阪本社(更新)')).toBeVisible();
});

test('削除成功条件: 確認ダイアログで確定後に一覧から除外される', async ({ page }) => {
  await page.goto('/list');

  page.once('dialog', (dialog) => dialog.accept());
  await page
    .locator('[data-testid="expense-item-exp-seed-2"]')
    .getByRole('button', { name: '削除' })
    .click();

  await expect(page.getByText('削除に成功しました。')).toBeVisible();
  await expect(page.locator('[data-testid="expense-item-exp-seed-2"]')).toHaveCount(0);
});

test('CSV出力成功条件: 表示中の絞り込み結果を含むCSVをダウンロードする', async ({ page }) => {
  await page.goto('/list');

  await page.getByLabel('経費検索').fill('福岡');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV出力' }).click();
  const download = await downloadPromise;

  await expect(page.getByText('CSV出力に成功しました。')).toBeVisible();
  expect(download.suggestedFilename()).toContain('expenses-2026-03.csv');

  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  if (!stream) {
    return;
  }

  let csv = '';
  for await (const chunk of stream) {
    csv += chunk.toString();
  }

  expect(csv).toContain('福岡支店');
  expect(csv).not.toContain('大阪本社');
});
