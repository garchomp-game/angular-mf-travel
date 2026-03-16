/**
 * ログアウト E2E テスト
 *
 * このテストはlocalStorageのJWTトークンをクリアするため、
 * ファイル名を z- プレフィックスにしてアルファベット順で最後に実行される。
 */
import { test, expect } from '@playwright/test';

test('ログアウトボタンで /login に遷移する', async ({ page }) => {
  await page.goto('/list');

  // セッション切れの場合は再ログイン
  if (page.url().includes('/login')) {
    await page.getByPlaceholder('user@example.com').fill('e2e-test@example.com');
    await page.getByPlaceholder('6文字以上').fill('e2e-test-password');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('**/list**', { timeout: 10000 });
  }

  await expect(page.locator('h1')).toContainText('経費一覧');
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});
