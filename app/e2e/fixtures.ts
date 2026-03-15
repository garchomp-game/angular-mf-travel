/**
 * Playwright fixtures for authenticated tests.
 * 
 * 使い方: import { test, expect } from './fixtures';
 * 
 * goto('/list') など認証が必要なページへのgotoで自動的に
 * ログインページへリダイレクトされた場合は再ログインし、
 * 元の URL へ再遷移する。
 */
import { test as base, expect } from '@playwright/test';

const TEST_EMAIL = 'e2e-test@example.com';
const TEST_PASSWORD = 'e2e-test-password';

export const test = base.extend({
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page);
    page.goto = async (url: string, options?: Parameters<typeof originalGoto>[1]) => {
      const response = await originalGoto(url, options);

      // If redirected to login, re-authenticate then navigate to the original target
      if (page.url().includes('/login') && !url.includes('/login')) {
        await page.getByPlaceholder('user@example.com').fill(TEST_EMAIL);
        await page.getByPlaceholder('6文字以上').fill(TEST_PASSWORD);
        await page.locator('form').getByRole('button', { name: 'ログイン' }).click();
        await page.waitForURL('**/list**', { timeout: 15000 });

        // If original target is not /list, navigate again
        if (!url.includes('/list') && url !== '/') {
          return originalGoto(url, options);
        }
      }

      return response;
    };

    await use(page);
  },
});

export { expect };
