import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
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

interface ExpenseListResponse {
  data: ExpenseRecord[];
}

interface ExpenseResponse {
  data: ExpenseRecord;
}

@Injectable({ providedIn: 'root' })
export class ExpenseSupabaseService {
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);

  async listByMonth(monthLabel: string): Promise<ExpenseRecord[]> {
    try {
      const res = await this.api.get<ExpenseListResponse>(
        `/expenses?month=${encodeURIComponent(monthLabel)}`,
      );
      return res.data;
    } catch (e) {
      this.logger.error('[ExpenseApi] listByMonth failed', e);
      return [];
    }
  }

  async findById(id: string): Promise<ExpenseRecord | undefined> {
    try {
      const res = await this.api.get<ExpenseResponse>(`/expenses/${id}`);
      return res.data;
    } catch (e) {
      this.logger.error('[ExpenseApi] findById failed', { id, error: e });
      return undefined;
    }
  }

  async save(draft: ExpenseDraft, id?: string): Promise<ExpenseRecord | undefined> {
    try {
      if (id) {
        const res = await this.api.put<ExpenseResponse>(`/expenses/${id}`, draft);
        this.logger.info('[ExpenseApi] 更新成功', { id });
        return res.data;
      }

      const res = await this.api.post<ExpenseResponse>('/expenses', draft);
      this.logger.info('[ExpenseApi] 作成成功', { id: res.data.id });
      return res.data;
    } catch (e) {
      this.logger.error('[ExpenseApi] save failed', e);
      return undefined;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.api.delete(`/expenses/${id}`);
      this.logger.info('[ExpenseApi] 削除成功', { id });
      return true;
    } catch (e) {
      this.logger.error('[ExpenseApi] delete failed', { id, error: e });
      return false;
    }
  }
}
