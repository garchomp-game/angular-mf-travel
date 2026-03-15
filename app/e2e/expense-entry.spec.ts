/**
 * 経費入力・編集ページ E2E テスト
 */
import { expect, test } from '@playwright/test';

test.describe('経費入力ページ', () => {
  test('新規経費を作成して一覧に反映される', async ({ page }) => {
    await page.goto('/entry');
    await expect(page.locator('h1')).toContainText('経費入力');

    await page.getByLabel('日付 *').fill('2026-03-15');
    await page.getByLabel('訪問先 *').fill('札幌支社');
    await page.getByLabel('支払先・内容 *').fill('ANA / 往復航空券');
    await page.getByLabel('金額 *').fill('45000');

    await page.getByRole('button', { name: '保存' }).click();
    await page.waitForURL('**/list**', { timeout: 15000 });
    await expect(page.getByText('保存に成功しました')).toBeVisible();
    await expect(page.getByText('札幌支社')).toBeVisible();
  });

  test('必須項目未入力で保存されない', async ({ page }) => {
    await page.goto('/entry');
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByText('必須項目を入力してください')).toBeVisible();
    await expect(page).toHaveURL(/\/entry/);
  });

  test('金額0で保存されない', async ({ page }) => {
    await page.goto('/entry');
    await page.getByLabel('日付 *').fill('2026-03-15');
    await page.getByLabel('訪問先 *').fill('テスト');
    await page.getByLabel('支払先・内容 *').fill('テスト');
    await page.getByLabel('金額 *').fill('0');

    await page.getByRole('button', { name: '保存' }).click();
    await expect(page).toHaveURL(/\/entry/);
  });

  test('詳細パネルの開閉', async ({ page }) => {
    await page.goto('/entry');

    // 初期: 閉じている
    await expect(page.locator('#expense-details-panel')).toBeHidden();

    // 開く
    await page.getByRole('button', { name: '詳細項目を開く' }).click();
    await expect(page.locator('#expense-details-panel')).toBeVisible();

    // 閉じる
    await page.getByRole('button', { name: '詳細項目を閉じる' }).click();
    await expect(page.locator('#expense-details-panel')).toBeHidden();
  });

  test('詳細項目を含めて保存', async ({ page }) => {
    await page.goto('/entry');

    await page.getByLabel('日付 *').fill('2026-03-16');
    await page.getByLabel('訪問先 *').fill('仙台営業所');
    await page.getByLabel('支払先・内容 *').fill('新幹線やまびこ');
    await page.getByLabel('金額 *').fill('11000');

    await page.getByRole('button', { name: '詳細項目を開く' }).click();
    await page.getByLabel('経費科目').fill('旅費交通費');
    await page.getByLabel('メモ').fill('定例報告');

    await page.getByRole('button', { name: '保存' }).click();
    await page.waitForURL('**/list**', { timeout: 15000 });
    await expect(page.getByText('仙台営業所')).toBeVisible();
  });
});

test.describe('経費編集ページ', () => {
  test('一覧から編集ボタンで既存データがロードされる', async ({ page }) => {
    await page.goto('/list');
    await expect(page.getByText('読み込み中...')).toBeHidden({ timeout: 10000 });

    await page.getByRole('button', { name: '編集' }).first().click();
    await expect(page.locator('h1')).toContainText('経費編集');

    // 訪問先にデータが入っているはず
    const destinationInput = page.getByLabel('訪問先 *');
    await expect(destinationInput).not.toHaveValue('', { timeout: 10000 });
  });

  test('編集保存後に一覧へ更新内容が反映される', async ({ page }) => {
    await page.goto('/list');
    await expect(page.getByText('読み込み中...')).toBeHidden({ timeout: 10000 });

    await page.getByRole('button', { name: '編集' }).first().click();
    await expect(page.locator('h1')).toContainText('経費編集');

    // 訪問先を更新
    const input = page.getByLabel('訪問先 *');
    await expect(input).not.toHaveValue('', { timeout: 10000 });
    await input.fill('更新済テスト');

    await page.getByRole('button', { name: '更新' }).click();
    await page.waitForURL('**/list**', { timeout: 15000 });
    await expect(page.getByText('編集に成功しました')).toBeVisible();
    await expect(page.getByText('更新済テスト')).toBeVisible();
  });
});
