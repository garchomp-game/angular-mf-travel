import { DatePipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ExpenseRecord } from '../../data/expense-supabase.service';

@Component({
  selector: 'app-expense-card',
  imports: [DatePipe, NgIf],
  template: `
    <article class="p-5 glass-panel transition-all hover:scale-[1.01] hover:shadow-lg">
      <header class="flex justify-between items-center mb-3">
        <p class="m-0 text-(--color-muted) font-mono text-sm">
          {{ expense.date | date: 'M/d (EEE)' : '' : 'ja-JP' }}
        </p>
        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border"
          [class]="
            expense.isRoundTrip
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          "
        >
          {{ expense.isRoundTrip ? '往復' : '片道' }}
        </span>
      </header>
      <h3 class="m-0 mb-1.5 text-lg font-bold">{{ expense.destination }}</h3>
      <p class="m-0 text-(--color-muted) mb-2">{{ expense.payerDetail }}</p>
      <small
        *ngIf="expense.category"
        class="inline-block px-2 py-0.5 rounded-md bg-black/20 text-(--color-muted) border border-(--color-border) text-xs"
      >
        {{ expense.category }}
      </small>
    </article>
  `,
})
export class ExpenseCardComponent {
  @Input({ required: true }) expense!: ExpenseRecord;
}
