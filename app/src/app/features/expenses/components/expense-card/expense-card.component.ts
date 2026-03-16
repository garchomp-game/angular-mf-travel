import { DatePipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ExpenseRecord } from '../../data/expense-supabase.service';

@Component({
  selector: 'app-expense-card',
  imports: [DatePipe, NgIf],
  template: `
    <article class="p-4 border border-(--color-border) rounded-lg bg-(--color-surface) shadow-sm">
      <header class="flex justify-between items-center mb-2">
        <p class="m-0 text-(--color-muted)">
          {{ expense.date | date: 'M/d (EEE)' : '' : 'ja-JP' }}
        </p>
        <span
          class="px-2 py-0.5 rounded-full text-xs font-medium"
          [class]="expense.isRoundTrip ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
        >
          {{ expense.isRoundTrip ? '往復' : '片道' }}
        </span>
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
