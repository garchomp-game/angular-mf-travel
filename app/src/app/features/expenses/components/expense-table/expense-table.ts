import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpenseRecord } from '../../data/expense-supabase.service';

@Component({
  selector: 'app-expense-table',
  imports: [CommonModule, DatePipe],
  styles: [
    `
      :host {
        display: block;
      }

      .table-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 700px;
        font-size: 0.875rem;
      }

      th {
        position: sticky;
        top: 0;
        background: var(--color-surface);
        text-align: left;
        padding: 0.75rem 0.5rem;
        border-bottom: 2px solid var(--color-border);
        white-space: nowrap;
        font-weight: 600;
        color: var(--color-muted);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      td {
        padding: 0.625rem 0.5rem;
        border-bottom: 1px solid var(--color-border);
        vertical-align: top;
        color: var(--color-text);
      }

      tr:hover td {
        background: var(--color-primary-soft);
      }

      .col-date {
        white-space: nowrap;
        width: 100px;
      }

      .col-destination {
        font-weight: 500;
        min-width: 120px;
      }

      .col-route {
        min-width: 160px;
      }

      .col-trip {
        text-align: center;
        width: 60px;
      }

      .col-actions {
        white-space: nowrap;
        width: 120px;
      }

      .badge {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 500;
      }

      .badge-round {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .badge-oneway {
        background: #f3f4f6;
        color: #4b5563;
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 0.75rem;
        cursor: pointer;
      }

      .btn-sm:hover {
        background: var(--color-primary-soft);
      }

      .btn-danger {
        border-color: var(--color-danger);
        color: var(--color-danger);
      }

      .btn-danger:hover {
        background: #fef2f2;
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--color-muted);
      }

      .memo-cell {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
  template: `
    <div class="table-scroll">
      <table>
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
              <td class="col-date">
                {{ expense.date | date: 'M/d (EEE)' : '' : 'ja-JP' }}
              </td>
              <td class="col-destination">{{ expense.destination }}</td>
              <td class="col-route">{{ expense.payerDetail }}</td>
              <td class="col-trip">
                <span
                  class="badge"
                  [class.badge-round]="expense.isRoundTrip"
                  [class.badge-oneway]="!expense.isRoundTrip"
                >
                  {{ expense.isRoundTrip ? '往復' : '片道' }}
                </span>
              </td>
              <td>{{ expense.category || '-' }}</td>
              <td>{{ expense.taxType || '-' }}</td>
              <td class="memo-cell" [title]="expense.memo || ''">
                {{ expense.memo || '-' }}
              </td>
              <td class="col-actions">
                <button class="btn-sm" (click)="editClick.emit(expense.id)">編集</button>
                <button class="btn-sm btn-danger" (click)="deleteClick.emit(expense.id)">
                  削除
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (expenses.length === 0) {
        <p class="empty-state">該当データなし</p>
      }
    </div>
  `,
})
export class ExpenseTableComponent {
  @Input({ required: true }) expenses: ExpenseRecord[] = [];
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();
}
