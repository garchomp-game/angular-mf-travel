import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseRecord } from '../../data/expense-supabase.service';

@Component({
  selector: 'app-expense-card',
  imports: [DatePipe, NgIf],
  template: `
    <article class="card card-border bg-base-200 shadow-sm hover:shadow-md transition-shadow">
      <div class="card-body p-4">
        <header class="flex justify-between items-center">
          <p class="m-0 text-sm opacity-60 font-mono">
            {{ expense.date | date: 'M/d (EEE)' : '' : 'ja-JP' }}
          </p>
          <span
            class="badge badge-sm"
            [class]="expense.isRoundTrip ? 'badge-info' : 'badge-success'"
          >
            {{ expense.isRoundTrip ? '往復' : '片道' }}
          </span>
        </header>
        <h3 class="card-title text-base">{{ expense.destination }}</h3>
        <p class="m-0 text-sm opacity-70">{{ expense.payerDetail }}</p>
        <small *ngIf="expense.category" class="badge badge-ghost badge-xs mt-1">
          {{ expense.category }}
        </small>
        <div class="card-actions justify-end mt-2">
          <button
            type="button"
            (click)="templateClick.emit(expense.id)"
            class="btn btn-ghost btn-xs"
            title="テンプレートに追加"
          >
            📋
          </button>
          <button type="button" (click)="editClick.emit(expense.id)" class="btn btn-outline btn-xs">
            編集
          </button>
          <button
            type="button"
            (click)="deleteClick.emit(expense.id)"
            class="btn btn-error btn-xs btn-outline"
          >
            削除
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ExpenseCardComponent {
  @Input({ required: true }) expense!: ExpenseRecord;
  @Output() readonly editClick = new EventEmitter<string>();
  @Output() readonly deleteClick = new EventEmitter<string>();
  @Output() readonly templateClick = new EventEmitter<string>();
}
