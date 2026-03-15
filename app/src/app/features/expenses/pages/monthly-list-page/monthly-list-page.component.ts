import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { ExpenseCardComponent } from '../../components/expense-card/expense-card.component';
import { MonthSwitcherComponent } from '../../components/month-switcher/month-switcher.component';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { ExpenseRecord, ExpenseStoreService } from '../../data/expense-store.service';

@Component({
  selector: 'app-monthly-list-page',
  imports: [
    CommonModule,
    MonthSwitcherComponent,
    SearchBoxComponent,
    ExpenseCardComponent,
    BottomNavComponent,
    ThemeToggleComponent,
    SectionCardComponent,
  ],
  template: `
    <main class="max-w-[720px] mx-auto p-4 grid gap-4">
      <header class="flex items-center justify-between">
        <h1>経費一覧</h1>
        <app-theme-toggle />
      </header>

      <app-section-card>
        <app-month-switcher
          [currentMonth]="currentMonth"
          (previous)="previousMonth()"
          (next)="nextMonth()"
        />
      </app-section-card>

      <app-section-card>
        <app-search-box (queryChange)="query = $event" />
        <button type="button" (click)="exportCsv()"
                class="mt-2 border border-(--color-border) rounded-md bg-(--color-surface) text-(--color-text) px-3 py-2">CSV出力</button>
      </app-section-card>

      <p *ngIf="notice" class="text-(--color-primary) font-medium">{{ notice }}</p>

      <div class="grid gap-3">
        @for (expense of filteredExpenses; track expense.id) {
          <div [attr.data-testid]="'expense-item-' + expense.id">
            <app-expense-card [expense]="expense" />
            <div class="flex gap-2 mt-1">
              <button type="button" (click)="edit(expense.id)"
                      class="border border-(--color-border) rounded-md bg-(--color-surface) text-(--color-text) px-3 py-1 text-sm">編集</button>
              <button type="button" (click)="remove(expense.id)"
                      class="border border-(--color-danger) rounded-md bg-(--color-surface) text-(--color-danger) px-3 py-1 text-sm">削除</button>
            </div>
          </div>
        }

        @if (filteredExpenses.length === 0) {
          <p class="text-(--color-muted) text-center">該当データなし</p>
        }
      </div>

      <app-bottom-nav />
    </main>
  `,
})
export class MonthlyListPageComponent implements OnInit {
  private readonly expenseStore = inject(ExpenseStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  months = ['2026年03月', '2026年02月', '2026年01月'];
  monthIndex = 0;
  query = '';
  notice = '';

  get currentMonth(): string {
    return this.months[this.monthIndex];
  }

  get filteredExpenses(): ExpenseRecord[] {
    const monthExpenses = this.expenseStore.listByMonth(this.currentMonth);
    if (!this.query) {
      return monthExpenses;
    }

    return monthExpenses.filter((expense) => {
      const target =
        `${expense.destination} ${expense.payerDetail} ${expense.memo ?? ''}`.toLowerCase();
      return target.includes(this.query.toLowerCase());
    });
  }

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === 'saved') {
      this.notice = '保存に成功しました。';
    } else if (status === 'updated') {
      this.notice = '編集に成功しました。';
    }
  }

  previousMonth(): void {
    this.monthIndex = (this.monthIndex + 1) % this.months.length;
  }

  nextMonth(): void {
    this.monthIndex = (this.monthIndex - 1 + this.months.length) % this.months.length;
  }

  edit(id: string): void {
    void this.router.navigate(['/entry'], { queryParams: { edit: id } });
  }

  remove(id: string): void {
    const accepted = window.confirm('この明細を削除しますか？');
    if (!accepted) {
      return;
    }

    this.expenseStore.remove(id);
    this.notice = '削除に成功しました。';
  }

  exportCsv(): void {
    const csv = this.expenseStore.toCsv(this.filteredExpenses);
    const bom = '\ufeff';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${this.currentMonth.replace('年', '-').replace('月', '')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    this.notice = 'CSV出力に成功しました。';
  }
}
