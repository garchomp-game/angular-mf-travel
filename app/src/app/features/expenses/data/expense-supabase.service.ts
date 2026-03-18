import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { LoggerService } from '../../../core/logger.service';
import { type ExpenseRecordRow, toExpenseRecord, fromExpenseDraft } from './dto';

export interface ExpenseRecord {
  id: string;
  date: string;
  destination: string;
  payerDetail: string;
  isRoundTrip: boolean;
  category?: string;
  taxType?: string;
  preApprovalNumber?: string;
  memo?: string;
}

export type ExpenseDraft = Omit<ExpenseRecord, 'id'>;

@Injectable({ providedIn: 'root' })
export class ExpenseSupabaseService {
  private readonly sb = inject(SupabaseService);
  private readonly logger = inject(LoggerService);

  async listByMonth(monthLabel: string): Promise<ExpenseRecord[]> {
    const match = monthLabel.match(/(\d{4})年(\d{2})月/);
    if (!match) return [];

    const year = Number(match[1]);
    const month = Number(match[2]);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    try {
      const { data, error } = await this.sb.client
        .from('expense_records')
        .select('*')
        .gte('travel_date', start)
        .lt('travel_date', end)
        .order('travel_date', { ascending: false });

      if (error) throw error;
      return (data as ExpenseRecordRow[]).map(toExpenseRecord);
    } catch (e) {
      this.logger.error('[ExpenseApi] listByMonth failed', e);
      return [];
    }
  }

  async findById(id: string): Promise<ExpenseRecord | undefined> {
    try {
      const { data, error } = await this.sb.client
        .from('expense_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return toExpenseRecord(data as ExpenseRecordRow);
    } catch (e) {
      this.logger.error('[ExpenseApi] findById failed', { id, error: e });
      return undefined;
    }
  }

  async findDuplicate(date: string, destination: string): Promise<ExpenseRecord | undefined> {
    try {
      const { data, error } = await this.sb.client
        .from('expense_records')
        .select('*')
        .eq('travel_date', date)
        .eq('visit_to', destination)
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return undefined;
      return toExpenseRecord(data[0] as ExpenseRecordRow);
    } catch (e) {
      this.logger.error('[ExpenseApi] findDuplicate failed', e);
      return undefined;
    }
  }

  async save(draft: ExpenseDraft, id?: string): Promise<ExpenseRecord | undefined> {
    const row = fromExpenseDraft(draft);

    try {
      if (id) {
        const { data, error } = await this.sb.client
          .from('expense_records')
          .update(row)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        this.logger.info('[ExpenseApi] 更新成功', { id });
        return toExpenseRecord(data as ExpenseRecordRow);
      }

      // Get user_id from current session
      const {
        data: { session },
      } = await this.sb.client.auth.getSession();
      if (!session?.user) {
        this.logger.error('[ExpenseApi] save failed: no active session');
        return undefined;
      }
      const { data, error } = await this.sb.client
        .from('expense_records')
        .insert({ ...row, user_id: session.user.id })
        .select()
        .single();

      if (error) throw error;
      this.logger.info('[ExpenseApi] 作成成功', { id: data.id });
      return toExpenseRecord(data as ExpenseRecordRow);
    } catch (e: unknown) {
      this.logger.error('[ExpenseApi] save failed', e instanceof Error ? e.message : e);
      return undefined;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const { error } = await this.sb.client.from('expense_records').delete().eq('id', id);

      if (error) throw error;
      this.logger.info('[ExpenseApi] 削除成功', { id });
      return true;
    } catch (e) {
      this.logger.error('[ExpenseApi] delete failed', { id, error: e });
      return false;
    }
  }
}
