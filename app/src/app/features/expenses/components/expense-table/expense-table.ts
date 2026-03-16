import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseRecord } from '../../data/expense-supabase.service';

@Component({
  selector: 'app-expense-table',
  imports: [CommonModule, DatePipe],
  template: `
    <div class="overflow-x-auto">
      <table class="table table-zebra table-sm">
        <thead>
          <tr>
            <th>日付</th>
            <th>訪問先</th>
            <th>支払先・内容</th>
            <th>往復</th>
            <th>科目</th>
            <th>税区分</th>
            <th>メモ</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          @for (expense of expenses; track expense.id) {
            <tr [attr.data-testid]="'expense-row-' + expense.id">
              <td class="whitespace-nowrap">
                {{ expense.date | date: 'M/d (EEE)' : '' : 'ja-JP' }}
              </td>
              <td class="font-medium">{{ expense.destination }}</td>
              <td>{{ expense.payerDetail }}</td>
              <td class="text-center">
                <span
                  class="badge badge-sm"
                  [class]="expense.isRoundTrip ? 'badge-info' : 'badge-success'"
                >
                  {{ expense.isRoundTrip ? '往復' : '片道' }}
                </span>
              </td>
              <td>{{ expense.category || '-' }}</td>
              <td>{{ expense.taxType || '-' }}</td>
              <td class="max-w-[200px] truncate" [title]="expense.memo || ''">
                {{ expense.memo || '-' }}
              </td>
              <td class="whitespace-nowrap">
                <div class="flex gap-1">
                  <button class="btn btn-ghost btn-xs" (click)="editClick.emit(expense.id)">
                    編集
                  </button>
                  <button
                    class="btn btn-error btn-xs btn-outline"
                    (click)="deleteClick.emit(expense.id)"
                  >
                    削除
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (expenses.length === 0) {
        <p class="text-center py-8 opacity-60">該当データなし</p>
      }
    </div>
  `,
})
export class ExpenseTableComponent {
  @Input({ required: true }) expenses: ExpenseRecord[] = [];
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();
}
