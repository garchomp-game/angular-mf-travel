import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { LoggerService } from '../../../core/logger.service';
import { type ExpenseTemplateRow, toExpenseTemplate, fromTemplateDraft } from './dto';

export interface ExpenseTemplate {
  id: string;
  name: string;
  destination: string;
  payerDetail: string;
  isRoundTrip: boolean;
  category?: string;
  taxType?: string;
  preApprovalNumber?: string;
}

export type TemplateDraft = Omit<ExpenseTemplate, 'id'>;

@Injectable({ providedIn: 'root' })
export class ExpenseTemplateService {
  private readonly sb = inject(SupabaseService);
  private readonly logger = inject(LoggerService);

  async list(): Promise<ExpenseTemplate[]> {
    try {
      const { data, error } = await this.sb.client
        .from('expense_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as ExpenseTemplateRow[]).map(toExpenseTemplate);
    } catch (e) {
      this.logger.error('[Template] list failed', e);
      return [];
    }
  }

  async save(draft: TemplateDraft): Promise<ExpenseTemplate | undefined> {
    try {
      const {
        data: { session },
      } = await this.sb.client.auth.getSession();
      if (!session?.user) {
        this.logger.error('[Template] save failed: no active session');
        return undefined;
      }

      const row = fromTemplateDraft(draft, session.user.id);

      const { data, error } = await this.sb.client
        .from('expense_templates')
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      this.logger.info('[Template] 保存成功', { id: data.id });
      return toExpenseTemplate(data as ExpenseTemplateRow);
    } catch (e: unknown) {
      this.logger.error('[Template] save failed', e instanceof Error ? e.message : e);
      return undefined;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const { error } = await this.sb.client.from('expense_templates').delete().eq('id', id);

      if (error) throw error;
      this.logger.info('[Template] 削除成功', { id });
      return true;
    } catch (e) {
      this.logger.error('[Template] delete failed', { id, error: e });
      return false;
    }
  }
}
