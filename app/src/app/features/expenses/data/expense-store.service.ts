import { Injectable, inject } from '@angular/core';
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

const STORAGE_KEY = 'travel-expenses';

const DEFAULT_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-seed-1',
    date: '2026-03-08',
    destination: '大阪本社',
    payerDetail: 'JR東海 / 新幹線',
    isRoundTrip: true,
    category: '旅費交通費',
    memo: '会議出張',
  },
  {
    id: 'exp-seed-2',
    date: '2026-03-10',
    destination: '福岡支店',
    payerDetail: '博多駅タクシー / 客先訪問移動',
    isRoundTrip: false,
    category: '旅費交通費',
    memo: '雨天のため利用',
  },
  {
    id: 'exp-seed-3',
    date: '2026-02-14',
    destination: '名古屋営業所',
    payerDetail: '近鉄 / 顧客訪問',
    isRoundTrip: true,
    category: '旅費交通費',
    memo: '定例訪問',
  },
];

@Injectable({ providedIn: 'root' })
export class ExpenseStoreService {
  private readonly logger = inject(LoggerService);
  listByMonth(monthLabel: string): ExpenseRecord[] {
    const month = this.toMonthKey(monthLabel);
    if (!month) {
      return [];
    }

    return this.read().filter((expense) => expense.date.startsWith(month));
  }

  findById(id: string): ExpenseRecord | undefined {
    return this.read().find((expense) => expense.id === id);
  }

  save(draft: ExpenseDraft, id?: string): ExpenseRecord {
    const current = this.read();
    if (id) {
      const existing = current.find((item) => item.id === id);
      if (!existing) {
        throw new Error(`Expense not found: ${id}`);
      }

      const updated: ExpenseRecord = { ...draft, id };
      const next = current.map((item) => (item.id === id ? updated : item));
      this.write(next);
      return updated;
    }

    const created: ExpenseRecord = { ...draft, id: this.createId() };
    this.write([created, ...current]);
    return created;
  }

  remove(id: string): void {
    this.write(this.read().filter((expense) => expense.id !== id));
  }

  private read(): ExpenseRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.write(DEFAULT_EXPENSES);
      return [...DEFAULT_EXPENSES];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this.write(DEFAULT_EXPENSES);
        return [...DEFAULT_EXPENSES];
      }

      return parsed.filter(this.isExpenseRecord);
    } catch {
      this.write(DEFAULT_EXPENSES);
      return [...DEFAULT_EXPENSES];
    }
  }

  private write(expenses: ExpenseRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }

  private createId(): string {
    return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private isExpenseRecord(value: unknown): value is ExpenseRecord {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as Partial<ExpenseRecord>;
    return (
      typeof record.id === 'string' &&
      typeof record.date === 'string' &&
      typeof record.destination === 'string' &&
      typeof record.payerDetail === 'string' &&
      typeof record.isRoundTrip === 'boolean'
    );
  }

  private toMonthKey(monthLabel: string): string {
    const matched = monthLabel.match(/(\d{4})年(\d{2})月/);
    if (!matched) {
      return '';
    }
    const [, year, month] = matched;
    return `${year}-${month}`;
  }
}
