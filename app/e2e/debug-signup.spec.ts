/**
 * Playwright デバッグスクリプト
 *
 * ブラウザを起動せずに (headless) 動作確認し、console.log やネットワークエラーをキャプチャ。
 *
 * 使い方:
 *   npx playwright test e2e/debug-signup.spec.ts --headed   # ブラウザ表示あり
 *   npx playwright test e2e/debug-signup.spec.ts            # headless (dry-run)
 */
import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } }); // ログインなし状態

test('signup → login → list ページ表示まで', async ({ page }) => {
  // コンソールログ収集
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // ネットワークレスポンス収集
  const networkLogs: string[] = [];
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('3000')) {
      networkLogs.push(`${response.status()} ${response.request().method()} ${url}`);
    }
  });

  page.on('requestfailed', (request) => {
    networkLogs.push(
      `FAILED ${request.method()} ${request.url()} - ${request.failure()?.errorText}`,
    );
  });

  // ログインページへ
  await page.goto('/login');
  await expect(page.locator('h1')).toContainText('経費精算');

  // ユニークなメールで新規登録
  const email = `test-${Date.now()}@example.com`;

  // 新規登録タブ切替
  await page.getByRole('tab', { name: '新規登録' }).click();

  // フォーム入力
  await page.getByPlaceholder('user@example.com').fill(email);
  await page.getByPlaceholder('6文字以上').fill('password123');

  // 登録ボタンクリック
  await page.getByRole('button', { name: '登録' }).click();

  // 「処理中...」が消えるまで待つ (NgZone.run のテスト)
  await expect(page.getByRole('button', { name: '処理中...' })).toBeHidden({ timeout: 10000 });

  console.log('\n=== 1. 新規登録後の状態 ===');
  console.log('Page text:', (await page.locator('body').textContent())?.trim());

  // 登録完了メッセージ確認
  await expect(page.getByText('登録が完了しました')).toBeVisible({ timeout: 5000 });
  console.log('✓ 登録完了メッセージ表示');

  // ログインタブに自動切替されたはず
  // 同じメールでログイン
  await page.getByPlaceholder('user@example.com').fill(email);
  await page.getByPlaceholder('6文字以上').fill('password123');
  await page.locator('form').getByRole('button', { name: 'ログイン' }).click();

  // /list へ遷移を待つ
  await page.waitForURL('**/list**', { timeout: 10000 });
  console.log('✓ /list へ遷移成功');

  console.log('\n=== Console Logs ===');
  consoleLogs.forEach((log) => console.log(log));

  console.log('\n=== Network Logs (API) ===');
  networkLogs.forEach((log) => console.log(log));

  // スクリーンショット
  await page.screenshot({ path: 'test-results/debug-signup.png', fullPage: true });
  console.log('\nScreenshot: test-results/debug-signup.png');
});
