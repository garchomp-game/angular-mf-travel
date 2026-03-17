/**
 * 経費一覧ページ E2E テスト
 */
import { expect, test } from '@playwright/test';

test.describe('経費一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('h1')).toContainText('経費一覧', {
      timeout: 10000,
    });
    // 読み込み完了を待つ
    await expect(page.getByText('読み込み中...')).toBeHidden({
      timeout: 10000,
    });
  });

  test('シード経費データが表示される', async ({ page }) => {
    await expect(page.getByText('大阪本社')).toBeVisible();
    await expect(page.getByText('福岡支店')).toBeVisible();
  });

  test('月切替で対象月データのみ表示される', async ({ page }) => {
    // 前月へ (◀ ボタン)
    await page.getByRole('button', { name: '前月' }).click();

    // 2月データが表示されるまで待つ
    await expect(page.getByText('名古屋営業所')).toBeVisible({
      timeout: 10000,
    });

    // 3月データは非表示
    await expect(page.getByText('大阪本社')).not.toBeVisible();
  });

  test('キーワード検索で一致のみ表示', async ({ page }) => {
    await page.getByLabel('経費検索').fill('福岡');
    await expect(page.getByText('福岡支店')).toBeVisible();
    await expect(page.getByText('大阪本社')).not.toBeVisible();

    // クリア
    await page.getByLabel('経費検索').fill('');
    await expect(page.getByText('大阪本社')).toBeVisible();
    await expect(page.getByText('福岡支店')).toBeVisible();
  });

  test('存在しないキーワードで「該当データなし」が表示される', async ({ page }) => {
    await page.getByLabel('経費検索').fill('存在しないデータ');
    await expect(page.getByText('該当データなし')).toBeVisible();
  });

  test('テーブル表示に切替できる', async ({ page }) => {
    // 初期はカード表示
    await expect(page.getByRole('button', { name: '📋 テーブル' })).toBeVisible();

    // テーブルに切替
    await page.getByRole('button', { name: '📋 テーブル' }).click();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th')).toContainText(['日付']);

    // カードに戻す
    await page.getByRole('button', { name: '📇 カード' }).click();
    await expect(page.locator('table')).not.toBeVisible();
  });

  test('テーブル表示で往復バッジが表示される', async ({ page }) => {
    await page.getByRole('button', { name: '📋 テーブル' }).click();
    await expect(page.locator('table')).toBeVisible();

    // 大阪本社は往復
    await expect(page.getByText('往復').first()).toBeVisible();
    // 福岡支店は片道
    await expect(page.getByText('片道').first()).toBeVisible();
  });

  test('削除: 確認ダイアログで承認後に成功メッセージ表示', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: '削除' }).first().click();
    await expect(page.getByText('削除に成功しました')).toBeVisible({
      timeout: 10000,
    });
  });

  test('削除: キャンセルでデータ変化なし', async ({ page }) => {
    const countBefore = await page.getByRole('button', { name: '削除' }).count();
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: '削除' }).first().click();
    // 削除ボタンの数は変わらない
    await expect(page.getByRole('button', { name: '削除' })).toHaveCount(countBefore);
  });
});
