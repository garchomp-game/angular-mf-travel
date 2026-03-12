import { Injectable } from '@angular/core';

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

const STORAGE_KEY = 'travel-expenses';

const DEFAULT_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-seed-1',
    date: '2026-03-08',
    destination: '大阪本社',
    payerDetail: 'JR東海 / 新幹線往復',
    amount: 27200,
    category: '旅費交通費',
    memo: '会議出張',
  },
  {
    id: 'exp-seed-2',
    date: '2026-03-10',
    destination: '福岡支店',
    payerDetail: '博多駅タクシー / 客先訪問移動',
    amount: 3200,
    category: '旅費交通費',
    memo: '雨天のため利用',
  },
];

@Injectable({ providedIn: 'root' })
export class ExpenseStoreService {
  listByMonth(monthLabel: string): ExpenseRecord[] {
    const month = this.toMonthKey(monthLabel);
    return this.read().filter((expense) => expense.date.startsWith(month));
  }

  findById(id: string): ExpenseRecord | undefined {
    return this.read().find((expense) => expense.id === id);
  }

  save(draft: ExpenseDraft, id?: string): ExpenseRecord {
    const current = this.read();
    if (id) {
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

  toCsv(expenses: ExpenseRecord[]): string {
    const header = ['日付', '訪問先', '支払先・内容', '金額', '経費科目', 'メモ'];
    const rows = expenses.map((expense) => [
      expense.date,
      expense.destination,
      expense.payerDetail,
      `${expense.amount}`,
      expense.category ?? '',
      expense.memo ?? '',
    ]);
    return [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
  }

  private read(): ExpenseRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.write(DEFAULT_EXPENSES);
      return [...DEFAULT_EXPENSES];
    }

    try {
      return JSON.parse(raw) as ExpenseRecord[];
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

  private toMonthKey(monthLabel: string): string {
    const matched = monthLabel.match(/(\d{4})年(\d{2})月/);
    if (!matched) {
      return '';
    }
    const [, year, month] = matched;
    return `${year}-${month}`;
  }
}
