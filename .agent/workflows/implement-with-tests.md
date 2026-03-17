---
description: 実装時に必ずテストを書くワークフロー（ユニットテスト + E2E）
---

# 実装 + テスト必須ワークフロー

すべての機能追加・変更時に以下を必ず実施すること。

## 1. ユニットテスト
// turbo-all

- 新規サービス/コンポーネントには `.spec.ts` を同時に作成する
- 境界値テスト（最小/最小-1/最大/最大+1）を含める
- 正常系 + エラー系を網羅する
- テスト実行: `bun run test:ci`

## 2. E2E テスト（Playwright）

- 新機能には E2E spec を追加する（`app/e2e/` 配下）
- ブラウザ検証が必要な場合は `browser_subagent` ではなく使い捨てスクリプト（`/tmp/`）で dry-run する
- locator は `.first()` を使ってstrict mode violationを防ぐ
- ローカル Supabase の速度を考慮し、タイミング依存テストには route intercept を使う

## 3. 検証

```bash
# 全チェック（typecheck + lint + format + unit + e2e）
bun check
```

## 4. コミット前チェックリスト

- [ ] ユニットテスト追加済み
- [ ] E2E テスト追加済み（UI変更がある場合）
- [ ] `bun check` 全パス
- [ ] ブラウザ直接使用を避け、Playwright / dry-run スクリプトで検証
