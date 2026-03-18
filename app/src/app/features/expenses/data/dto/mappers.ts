import type { ExpenseRecord, ExpenseDraft } from '../expense-supabase.service';
import type { ExpenseTemplate, TemplateDraft } from '../expense-template.service';
import type {
  ExpenseRecordRow,
  ExpenseRecordInsert,
  ExpenseTemplateRow,
  ExpenseTemplateInsert,
} from './db-row';

// ═══════════════════════════════════════════════
// ExpenseRecord <-> ExpenseRecordRow
// ═══════════════════════════════════════════════

/** DB 行 → フロントエンドモデル */
export function toExpenseRecord(row: ExpenseRecordRow): ExpenseRecord {
  return {
    id: row.id,
    date: row.travel_date,
    destination: row.visit_to,
    payerDetail: row.route_text,
    isRoundTrip: row.is_round_trip ?? false,
    category: row.category_code || undefined,
    taxType: row.tax_code || undefined,
    preApprovalNumber: row.pre_approval_no || undefined,
    memo: row.memo || undefined,
  };
}

/** フロントエンドモデル → DB INSERT/UPDATE 行 */
export function fromExpenseDraft(draft: ExpenseDraft): ExpenseRecordInsert {
  return {
    travel_date: draft.date,
    visit_to: draft.destination,
    route_text: draft.payerDetail,
    is_round_trip: draft.isRoundTrip,
    category_code: draft.category ?? '',
    tax_code: draft.taxType ?? '',
    pre_approval_no: draft.preApprovalNumber ?? null,
    memo: draft.memo ?? null,
  };
}

// ═══════════════════════════════════════════════
// ExpenseTemplate <-> ExpenseTemplateRow
// ═══════════════════════════════════════════════

/** DB 行 → フロントエンドモデル */
export function toExpenseTemplate(row: ExpenseTemplateRow): ExpenseTemplate {
  return {
    id: row.id,
    name: row.template_name,
    destination: row.visit_to,
    payerDetail: row.route_text,
    isRoundTrip: row.is_round_trip ?? false,
    category: row.category_code || undefined,
    taxType: row.tax_code || undefined,
    preApprovalNumber: row.pre_approval_no || undefined,
  };
}

/** フロントエンドモデル → DB INSERT 行 (user_id は呼び出し側で付与) */
export function fromTemplateDraft(draft: TemplateDraft, userId: string): ExpenseTemplateInsert {
  return {
    user_id: userId,
    template_name: draft.name,
    visit_to: draft.destination,
    route_text: draft.payerDetail,
    is_round_trip: draft.isRoundTrip,
    category_code: draft.category ?? '',
    tax_code: draft.taxType ?? '',
    pre_approval_no: draft.preApprovalNumber ?? null,
  };
}
