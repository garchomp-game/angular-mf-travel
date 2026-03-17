import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/supabase.service';
import { LoggerService } from '../../../core/logger.service';

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

interface DbRow {
  id: string;
  name: string;
  visit_to: string;
  route_text: string;
  is_round_trip: boolean;
  category_code: string;
  tax_code: string;
  pre_approval_no: string | null;
}

function toTemplate(row: DbRow): ExpenseTemplate {
  return {
    id: row.id,
    name: row.name,
    destination: row.visit_to,
    payerDetail: row.route_text,
    isRoundTrip: row.is_round_trip ?? false,
    category: row.category_code || undefined,
    taxType: row.tax_code || undefined,
    preApprovalNumber: row.pre_approval_no || undefined,
  };
}

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
      return (data as DbRow[]).map(toTemplate);
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

      const row = {
        user_id: session.user.id,
        name: draft.name,
        visit_to: draft.destination,
        route_text: draft.payerDetail,
        is_round_trip: draft.isRoundTrip,
        category_code: draft.category ?? '',
        tax_code: draft.taxType ?? '',
        pre_approval_no: draft.preApprovalNumber ?? null,
      };

      const { data, error } = await this.sb.client
        .from('expense_templates')
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      this.logger.info('[Template] 保存成功', { id: data.id });
      return toTemplate(data as DbRow);
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
