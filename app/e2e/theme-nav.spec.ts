/**
 * テーマ切替 + ナビゲーション E2E テスト
 */
import { expect, test } from '@playwright/test';

test.describe('テーマ切替', () => {
  test('ログイン画面でダークテーマに切替できる', async ({ page }) => {
    // Navigate to login page (unauthenticated users are redirected here)
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('経費精算');

    // ダークテーマに切替
    await page.getByRole('button', { name: 'ダークテーマ' }).click();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // ライトテーマに戻す
    await page.getByRole('button', { name: 'ライトテーマ' }).click();
    await expect(page.locator('body')).not.toHaveClass(/theme-dark/);
  });

  test('一覧ページでテーマ切替が永続化される', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('h1')).toContainText('経費一覧');

    // ダークテーマに切替
    await page.getByRole('button', { name: 'ダークテーマ' }).click();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // ページリロード
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);

    // ライトに戻す（クリーンアップ）
    await page.getByRole('button', { name: 'ライトテーマ' }).click();
  });
});

test.describe('ボトムナビゲーション', () => {
  test('一覧 → 入力 → 一覧の遷移', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('h1')).toContainText('経費一覧');

    // 入力へ遷移(リンク)
    await page.getByRole('link', { name: '入力' }).click();
    await expect(page).toHaveURL(/\/entry/);
    await expect(page.locator('h1')).toContainText('経費入力');

    // 一覧へ戻る
    await page.getByRole('link', { name: '一覧' }).click();
    await expect(page).toHaveURL(/\/list/);
    await expect(page.locator('h1')).toContainText('経費一覧');
  });
});

test.describe('ホームリダイレクト', () => {
  test('/ にアクセスすると /list にリダイレクトされる', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/list/, { timeout: 10000 });
  });
});
