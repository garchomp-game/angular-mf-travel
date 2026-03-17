import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { LoggerService } from '../../../core/logger.service';

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

interface DbRow {
  id: string;
  travel_date: string;
  visit_to: string;
  route_text: string;
  is_round_trip: boolean;
  category_code: string;
  tax_code: string;
  pre_approval_no: string | null;
  memo: string | null;
}

function toRecord(row: DbRow): ExpenseRecord {
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
      return (data as DbRow[]).map(toRecord);
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
      return toRecord(data as DbRow);
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
      return toRecord(data[0] as DbRow);
    } catch (e) {
      this.logger.error('[ExpenseApi] findDuplicate failed', e);
      return undefined;
    }
  }

  async save(draft: ExpenseDraft, id?: string): Promise<ExpenseRecord | undefined> {
    const row = {
      travel_date: draft.date,
      visit_to: draft.destination,
      route_text: draft.payerDetail,
      is_round_trip: draft.isRoundTrip,
      category_code: draft.category ?? '',
      tax_code: draft.taxType ?? '',
      pre_approval_no: draft.preApprovalNumber ?? null,
      memo: draft.memo ?? null,
    };

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
        return toRecord(data as DbRow);
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
      return toRecord(data as DbRow);
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
