import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase.client';
import { AuthService } from '../../../core/auth.service';
import { LoggerService } from '../../../core/logger.service';

export interface ExpenseRecord {
  id: string;
  date: string;
  destination: string;
  payerDetail: string;
  amount: number;
  category?: string;
  taxType?: string;
  preApprovalNumber?: string;
  memo?: string;
}

export type ExpenseDraft = Omit<ExpenseRecord, 'id'>;

@Injectable({ providedIn: 'root' })
export class ExpenseSupabaseService {
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly auth = inject(AuthService);
  private readonly logger = inject(LoggerService);

  async listByMonth(monthLabel: string): Promise<ExpenseRecord[]> {
    if (!this.supabase) return [];

    const range = this.toMonthRange(monthLabel);
    if (!range) return [];

    const { data, error } = await this.supabase
      .from('expense_records')
      .select('*')
      .gte('travel_date', range.start)
      .lt('travel_date', range.end)
      .order('travel_date', { ascending: false });

    if (error) {
      this.logger.error('[ExpenseSupabase] listByMonth failed', error);
      return [];
    }

    return (data ?? []).map(this.fromDb);
  }

  async findById(id: string): Promise<ExpenseRecord | undefined> {
    if (!this.supabase) return undefined;

    const { data, error } = await this.supabase
      .from('expense_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('[ExpenseSupabase] findById failed', { id, error });
      return undefined;
    }

    return data ? this.fromDb(data) : undefined;
  }

  async save(draft: ExpenseDraft, id?: string): Promise<ExpenseRecord | undefined> {
    if (!this.supabase) return undefined;

    const userId = this.auth.currentUser?.id;
    if (!userId) {
      this.logger.error('[ExpenseSupabase] save called without auth');
      return undefined;
    }

    const dbRecord = this.toDb(draft, userId);

    if (id) {
      const { data, error } = await this.supabase
        .from('expense_records')
        .update(dbRecord)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('[ExpenseSupabase] update failed', { id, error });
        return undefined;
      }

      this.logger.info('[ExpenseSupabase] 更新成功', { id });
      return data ? this.fromDb(data) : undefined;
    }

    const { data, error } = await this.supabase
      .from('expense_records')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      this.logger.error('[ExpenseSupabase] insert failed', error);
      return undefined;
    }

    this.logger.info('[ExpenseSupabase] 作成成功', { id: data?.id });
    return data ? this.fromDb(data) : undefined;
  }

  async remove(id: string): Promise<boolean> {
    if (!this.supabase) return false;

    const { error } = await this.supabase.from('expense_records').delete().eq('id', id);

    if (error) {
      this.logger.error('[ExpenseSupabase] delete failed', { id, error });
      return false;
    }

    this.logger.info('[ExpenseSupabase] 削除成功', { id });
    return true;
  }

  toCsv(expenses: ExpenseRecord[]): string {
    const header = ['日付', '訪問先', '支払先・内容', '金額', '経費科目', 'メモ'];
    const rows = expenses.map((e) => [
      e.date,
      e.destination,
      e.payerDetail,
      `${e.amount}`,
      e.category ?? '',
      e.memo ?? '',
    ]);
    return [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
  }

  private fromDb(row: Record<string, unknown>): ExpenseRecord {
    return {
      id: row['id'] as string,
      date: row['travel_date'] as string,
      destination: row['visit_to'] as string,
      payerDetail: row['route_text'] as string,
      amount: Number(row['amount']),
      category: (row['category_code'] as string) || undefined,
      taxType: (row['tax_code'] as string) || undefined,
      preApprovalNumber: (row['pre_approval_no'] as string) || undefined,
      memo: (row['memo'] as string) || undefined,
    };
  }

  private toDb(draft: ExpenseDraft, userId: string): Record<string, unknown> {
    return {
      user_id: userId,
      travel_date: draft.date,
      visit_to: draft.destination,
      route_text: draft.payerDetail,
      amount: draft.amount,
      category_code: draft.category || '',
      tax_code: draft.taxType || '',
      pre_approval_no: draft.preApprovalNumber || null,
      memo: draft.memo || null,
    };
  }

  private toMonthRange(monthLabel: string): { start: string; end: string } | null {
    const matched = monthLabel.match(/(\d{4})年(\d{2})月/);
    if (!matched) return null;

    const year = Number(matched[1]);
    const month = Number(matched[2]);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    return { start, end };
  }
}
