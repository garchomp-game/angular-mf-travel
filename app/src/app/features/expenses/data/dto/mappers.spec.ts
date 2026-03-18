import { toExpenseRecord, fromExpenseDraft, toExpenseTemplate, fromTemplateDraft } from './mappers';
import type { ExpenseRecordRow, ExpenseTemplateRow } from './db-row';

describe('DTO Mappers', () => {
  // ── toExpenseRecord ──

  const fullRow: ExpenseRecordRow = {
    id: 'rec-1',
    user_id: 'user-1',
    travel_date: '2026-03-18',
    visit_to: '大阪本社',
    route_text: 'JR東海 / 新幹線',
    is_round_trip: true,
    category_code: '旅費交通費',
    tax_code: '課税',
    pre_approval_no: 'AP-001',
    memo: '定例訪問',
    created_at: '2026-03-18T00:00:00Z',
    updated_at: '2026-03-18T00:00:00Z',
  };

  it('toExpenseRecord: DB 行をフロントモデルに変換する', () => {
    const result = toExpenseRecord(fullRow);
    expect(result).toEqual({
      id: 'rec-1',
      date: '2026-03-18',
      destination: '大阪本社',
      payerDetail: 'JR東海 / 新幹線',
      isRoundTrip: true,
      category: '旅費交通費',
      taxType: '課税',
      preApprovalNumber: 'AP-001',
      memo: '定例訪問',
    });
  });

  it('toExpenseRecord: null/空文字フィールドを undefined に変換する', () => {
    const minimalRow: ExpenseRecordRow = {
      ...fullRow,
      category_code: '',
      tax_code: '',
      pre_approval_no: null,
      memo: null,
    };
    const result = toExpenseRecord(minimalRow);
    expect(result.category).toBeUndefined();
    expect(result.taxType).toBeUndefined();
    expect(result.preApprovalNumber).toBeUndefined();
    expect(result.memo).toBeUndefined();
  });

  // ── fromExpenseDraft ──

  it('fromExpenseDraft: フロントモデルを DB INSERT 行に変換する', () => {
    const result = fromExpenseDraft({
      date: '2026-03-18',
      destination: '大阪本社',
      payerDetail: 'JR東海',
      isRoundTrip: true,
      category: '旅費交通費',
      taxType: '課税',
      preApprovalNumber: 'AP-001',
      memo: 'テスト',
    });
    expect(result).toEqual({
      travel_date: '2026-03-18',
      visit_to: '大阪本社',
      route_text: 'JR東海',
      is_round_trip: true,
      category_code: '旅費交通費',
      tax_code: '課税',
      pre_approval_no: 'AP-001',
      memo: 'テスト',
    });
  });

  it('fromExpenseDraft: 省略フィールドにデフォルト値を適用する', () => {
    const result = fromExpenseDraft({
      date: '2026-03-18',
      destination: 'テスト',
      payerDetail: 'テスト',
      isRoundTrip: false,
    });
    expect(result.category_code).toBe('');
    expect(result.tax_code).toBe('');
    expect(result.pre_approval_no).toBeNull();
    expect(result.memo).toBeNull();
  });

  // ── toExpenseTemplate ──

  const templateRow: ExpenseTemplateRow = {
    id: 'tpl-1',
    user_id: 'user-1',
    template_name: '大阪出張',
    visit_to: '大阪本社',
    route_text: 'JR東海',
    is_round_trip: true,
    category_code: '旅費交通費',
    tax_code: '課税',
    pre_approval_no: null,
    use_count: 3,
    last_used_at: '2026-03-18T00:00:00Z',
    created_at: '2026-03-18T00:00:00Z',
    updated_at: '2026-03-18T00:00:00Z',
  };

  it('toExpenseTemplate: template_name を name にマッピングする', () => {
    const result = toExpenseTemplate(templateRow);
    expect(result.name).toBe('大阪出張');
    expect(result.id).toBe('tpl-1');
    expect(result.destination).toBe('大阪本社');
  });

  // ── fromTemplateDraft ──

  it('fromTemplateDraft: name を template_name にマッピングして user_id を付与する', () => {
    const result = fromTemplateDraft(
      {
        name: 'テストテンプレ',
        destination: 'テスト',
        payerDetail: 'JR',
        isRoundTrip: false,
      },
      'user-123',
    );
    expect(result.template_name).toBe('テストテンプレ');
    expect(result.user_id).toBe('user-123');
    expect(result.visit_to).toBe('テスト');
  });
});
