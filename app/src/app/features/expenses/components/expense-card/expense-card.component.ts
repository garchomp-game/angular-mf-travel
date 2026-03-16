import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ExpenseRecord } from '../../data/expense-supabase.service';

@Component({
  selector: 'app-expense-card',
  imports: [DatePipe, CurrencyPipe, NgIf],
  template: `
    <article class="p-4 border border-(--color-border) rounded-lg bg-(--color-surface) shadow-sm">
      <header class="flex justify-between items-center mb-2">
        <p class="m-0 text-(--color-muted)">
          {{ expense.date | date: 'M/d (EEE)' : '' : 'ja-JP' }}
        </p>
        <strong>{{ expense.amount | currency: 'JPY' : 'symbol' : '1.0-0' : 'ja' }}</strong>
      </header>
      <h3 class="m-0 mb-1">{{ expense.destination }}</h3>
      <p class="m-0 text-(--color-muted)">{{ expense.payerDetail }}</p>
      <small *ngIf="expense.category" class="text-(--color-muted)">{{ expense.category }}</small>
    </article>
  `,
})
export class ExpenseCardComponent {
  @Input({ required: true }) expense!: ExpenseRecord;
}
