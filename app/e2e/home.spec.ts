import { expect, test } from '@playwright/test';

test('home redirects to monthly list', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/list/);
  await expect(page.getByRole('heading', { level: 1, name: '経費一覧' })).toBeVisible();
});
