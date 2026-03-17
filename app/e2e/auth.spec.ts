/**
 * 認証フロー E2E テスト（Supabase Auth）
 * - 新規登録 → ログイン → /list 遷移
 * - 未認証リダイレクト
 * - バリデーション（境界値含む）
 */
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // 未認証

  // --- リダイレクトテスト ---
  test('未認証で /list にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('経費精算');
  });

  test('未認証で /entry にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/entry');
    await expect(page).toHaveURL(/\/login/);
  });

  // --- 新規登録 → ログイン完全フロー ---
  test('新規登録 → /list 遷移の完全フロー', async ({ page }) => {
    // Admin API でユーザー作成（ブラウザ経由のsignupはレート制限にかかりやすいため）
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env['SUPABASE_URL'] ?? '',
      process.env['SUPABASE_SERVICE_KEY'] ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const email = `e2e-auth-${Date.now()}@test.example.com`;
    const password = 'testpass123';
    await supabase.auth.admin.createUser({ email, password, email_confirm: true });

    // ブラウザでログイン（ローカル GoTrue の場合、登録直後にわずかな遅延が必要な場合がある）
    await page.goto('/login');
    await page.waitForTimeout(500);
    await page.getByPlaceholder('user@example.com').fill(email);
    await page.getByPlaceholder('6文字以上').fill(password);
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await page.waitForURL('**/list**', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('経費一覧');
  });

  // --- バリデーション：境界値テスト ---
  test('パスワード5文字（境界値: 最小-1）でバリデーションエラー', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@example.com').fill('test@example.com');
    await page.getByPlaceholder('6文字以上').fill('abcde'); // 5文字
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスとパスワード')).toBeVisible();
  });

  test('パスワード6文字（境界値: 最小）でバリデーション通過', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@example.com').fill('nonexistent@example.com');
    await page.getByPlaceholder('6文字以上').fill('abcdef'); // 6文字 — フォームは通過、Supabase側エラー
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    // フォームバリデーションは通過するので「メールアドレスとパスワード」は表示されない
    // 代わりにSupabase側のエラーが返る
    await expect(page.getByText('メールアドレスとパスワード（6文字以上）')).not.toBeVisible({
      timeout: 3000,
    });
  });

  test('空のメールアドレスでバリデーションエラー', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('6文字以上').fill('validpassword');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスとパスワード')).toBeVisible();
  });

  test('不正なメールアドレス形式でバリデーションエラー', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@example.com').fill('invalid-email');
    await page.getByPlaceholder('6文字以上').fill('validpassword');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスとパスワード')).toBeVisible();
  });

  test('両方空でバリデーションエラー', async ({ page }) => {
    await page.goto('/login');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスとパスワード')).toBeVisible();
  });

  test('不正な認証情報でエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('user@example.com').fill('wrong@example.com');
    await page.getByPlaceholder('6文字以上').fill('wrongpassword');
    await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    // Supabase returns "Invalid login credentials"
    await expect(page.locator('.text-error')).toBeVisible({ timeout: 10000 });
  });

  // --- タブ切替テスト ---
  test('ログインタブと新規登録タブの切替', async ({ page }) => {
    await page.goto('/login');

    // 初期はログイン
    await expect(page.locator('form').getByRole('button', { name: 'ログイン' })).toBeVisible();

    // 新規登録に切替
    await page.getByRole('tab', { name: '新規登録' }).click();
    await expect(page.locator('form').getByRole('button', { name: '登録' })).toBeVisible();

    // ログインに戻す
    await page.getByRole('tab', { name: 'ログイン' }).click();
    await expect(page.locator('form').getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  // --- 処理中状態テスト ---
  test('ログインボタンが処理中に「処理中...」と表示される', async ({ page }) => {
    await page.goto('/login');

    // Supabase auth API にルート遅延を挿入（ローカル/クラウド問わず確実に loading 表示）
    await page.route('**/auth/v1/token**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.continue();
    });

    await page.getByPlaceholder('user@example.com').fill('slow@example.com');
    await page.getByPlaceholder('6文字以上').fill('validpassword');

    // Click and immediately check for loading state
    const submitPromise = page.locator('form').getByRole('button', { name: 'ログイン' }).click();

    // ボタンテキストが「処理中...」になるか確認
    await expect(page.getByRole('button', { name: '処理中...' })).toBeVisible({ timeout: 2000 });
    await submitPromise;
  });
});
