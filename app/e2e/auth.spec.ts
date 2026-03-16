/**
 * 認証フロー E2E テスト
 * - 新規登録 → ログイン → /list 遷移
 * - 未認証リダイレクト
 * - バリデーション
 *
 * NOTE: ログアウトテストは z-logout.spec.ts に分離
 * （SupabaseのサーバーサイドセッションをinvalidateするためE2Eの最後に実行）
 */
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // 未認証

  test('未認証で /list にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('経費精算');
  });

  test('未認証で /entry にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/entry');
    await expect(page).toHaveURL(/\/login/);
  });

  test('新規登録 → ログイン → /list 遷移の完全フロー', async ({ page }) => {
    const email = `e2e-auth-${Date.now()}@example.com`;

    await page.goto('/login');

    // 新規登録
    await page.getByRole('tab', { name: '新規登録' }).click();
    await page.getByPlaceholder('user@example.com').fill(email);
    await page.getByPlaceholder('6文字以上').fill('testpass123');
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('登録が完了しました')).toBeVisible({ timeout: 10000 });

    // ログイン
    await page.getByPlaceholder('user@example.com').fill(email);
    await page.getByPlaceholder('6文字以上').fill('testpass123');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await page.waitForURL('**/list**', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('経費一覧');
  });

  test('パスワード不足でバリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@example.com').fill('test@example.com');
    await page.getByPlaceholder('6文字以上').fill('abc');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスとパスワード')).toBeVisible();
  });

  test('不正な認証情報でエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@example.com').fill('wrong@example.com');
    await page.getByPlaceholder('6文字以上').fill('wrongpassword');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible({
      timeout: 10000,
    });
  });
});
