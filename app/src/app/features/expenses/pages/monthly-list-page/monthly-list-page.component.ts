import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { ExpenseCardComponent } from '../../components/expense-card/expense-card.component';
import { MonthSwitcherComponent } from '../../components/month-switcher/month-switcher.component';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { ExpenseRecord, ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { AuthService } from '../../../../core/auth.service';

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
        <div class="flex items-center gap-2">
          <app-theme-toggle />
          <button type="button" (click)="logout()"
                  class="border border-(--color-border) rounded-md bg-(--color-surface) text-(--color-muted) px-3 py-2 text-sm">ログアウト</button>
        </div>
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

      @if (loading) {
        <p class="text-(--color-muted) text-center py-8">読み込み中...</p>
      } @else {
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
      }

      <app-bottom-nav />
    </main>
  `,
})
export class MonthlyListPageComponent implements OnInit {
  private readonly expenseService = inject(ExpenseSupabaseService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  months = ['2026年03月', '2026年02月', '2026年01月'];
  monthIndex = 0;
  query = '';
  notice = '';
  loading = false;
  expenses: ExpenseRecord[] = [];

  get currentMonth(): string {
    return this.months[this.monthIndex];
  }

  get filteredExpenses(): ExpenseRecord[] {
    if (!this.query) return this.expenses;

    return this.expenses.filter((expense) => {
      const target =
        `${expense.destination} ${expense.payerDetail} ${expense.memo ?? ''}`.toLowerCase();
      return target.includes(this.query.toLowerCase());
    });
  }

  async ngOnInit(): Promise<void> {
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === 'saved') {
      this.notice = '保存に成功しました。';
    } else if (status === 'updated') {
      this.notice = '編集に成功しました。';
    }

    await this.loadExpenses();
  }

  async previousMonth(): Promise<void> {
    this.monthIndex = (this.monthIndex + 1) % this.months.length;
    await this.loadExpenses();
  }

  async nextMonth(): Promise<void> {
    this.monthIndex = (this.monthIndex - 1 + this.months.length) % this.months.length;
    await this.loadExpenses();
  }

  edit(id: string): void {
    void this.router.navigate(['/entry'], { queryParams: { edit: id } });
  }

  async remove(id: string): Promise<void> {
    const accepted = window.confirm('この明細を削除しますか？');
    if (!accepted) return;

    const success = await this.expenseService.remove(id);
    if (success) {
      this.notice = '削除に成功しました。';
      await this.loadExpenses();
    }
  }

  exportCsv(): void {
    const csv = this.expenseService.toCsv(this.filteredExpenses);
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

  async logout(): Promise<void> {
    await this.auth.signOut();
  }

  private async loadExpenses(): Promise<void> {
    this.loading = true;
    this.expenses = await this.expenseService.listByMonth(this.currentMonth);
    this.loading = false;
  }
}
