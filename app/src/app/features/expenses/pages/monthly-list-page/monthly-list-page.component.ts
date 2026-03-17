import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { ExpenseCardComponent } from '../../components/expense-card/expense-card.component';
import { ExpenseTableComponent } from '../../components/expense-table/expense-table';
import { MonthSwitcherComponent } from '../../components/month-switcher/month-switcher.component';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { ExpenseRecord, ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { ExpenseTemplateService } from '../../data/expense-template.service';
import { AuthService } from '../../../../core/auth.service';

const VIEW_MODE_KEY = 'expense-list-view-mode';

@Component({
  selector: 'app-monthly-list-page',
  imports: [
    CommonModule,
    MonthSwitcherComponent,
    SearchBoxComponent,
    ExpenseCardComponent,
    ExpenseTableComponent,
    BottomNavComponent,
    ThemeToggleComponent,
    SectionCardComponent,
  ],
  template: `
    <main class="max-w-[720px] mx-auto p-4 grid gap-4">
      <div class="navbar bg-base-200 rounded-box shadow-sm border border-base-300">
        <div class="navbar-start">
          <h1 class="text-xl font-bold px-2">経費一覧</h1>
        </div>
        <div class="navbar-end gap-2">
          <app-theme-toggle />
          <button type="button" (click)="logout()" class="btn btn-outline btn-sm">
            ログアウト
          </button>
        </div>
      </div>

      <app-section-card>
        <app-month-switcher
          [currentMonth]="currentMonth"
          (previous)="previousMonth()"
          (next)="nextMonth()"
        />
      </app-section-card>

      <app-section-card>
        <div class="flex items-center gap-2">
          <app-search-box (queryChange)="query = $event" class="flex-1" />
          <button
            type="button"
            (click)="toggleViewMode()"
            class="btn btn-outline btn-sm"
            [title]="viewMode === 'card' ? 'テーブル表示に切替' : 'カード表示に切替'"
          >
            {{ viewMode === 'card' ? '📋 テーブル' : '📇 カード' }}
          </button>
        </div>
      </app-section-card>

      <div *ngIf="notice" class="alert alert-info">
        <span>{{ notice }}</span>
      </div>

      @if (loading) {
        <p class="text-center py-8 opacity-60">読み込み中...</p>
      } @else {
        @if (viewMode === 'table') {
          <app-section-card>
            <app-expense-table
              [expenses]="filteredExpenses"
              (editClick)="edit($event)"
              (deleteClick)="remove($event)"
            />
          </app-section-card>
        } @else {
          <div class="grid gap-3">
            @for (expense of filteredExpenses; track expense.id) {
              <div [attr.data-testid]="'expense-item-' + expense.id">
                <app-expense-card
                  [expense]="expense"
                  (editClick)="edit($event)"
                  (deleteClick)="remove($event)"
                  (templateClick)="addToTemplate($event)"
                />
              </div>
            }

            @if (filteredExpenses.length === 0) {
              <p class="text-center opacity-60">該当データなし</p>
            }
          </div>
        }
      }

      <app-bottom-nav />
    </main>
  `,
})
export class MonthlyListPageComponent implements OnInit {
  private readonly expenseService = inject(ExpenseSupabaseService);
  private readonly templateService = inject(ExpenseTemplateService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  months = ['2026年03月', '2026年02月', '2026年01月'];
  monthIndex = 0;
  query = '';
  notice = '';
  loading = false;
  expenses: ExpenseRecord[] = [];
  viewMode: 'card' | 'table' = 'card';

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
    this.viewMode = (localStorage.getItem(VIEW_MODE_KEY) as 'card' | 'table') || 'card';

    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === 'saved') {
      this.notice = '保存に成功しました。';
    } else if (status === 'updated') {
      this.notice = '編集に成功しました。';
    }

    await this.loadExpenses();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
    localStorage.setItem(VIEW_MODE_KEY, this.viewMode);
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
    this.cdr.detectChanges();
  }

  async addToTemplate(id: string): Promise<void> {
    const expense = this.expenses.find((e) => e.id === id);
    if (!expense) return;

    const name = window.prompt('テンプレート名を入力してください', expense.destination);
    if (!name) return;

    const result = await this.templateService.save({
      name,
      destination: expense.destination,
      payerDetail: expense.payerDetail,
      isRoundTrip: expense.isRoundTrip,
      category: expense.category,
      taxType: expense.taxType,
      preApprovalNumber: expense.preApprovalNumber,
    });

    if (result) {
      this.notice = `テンプレート「${name}」を追加しました。`;
    }
    this.cdr.detectChanges();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }

  private async loadExpenses(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    this.expenses = await this.expenseService.listByMonth(this.currentMonth);
    this.loading = false;
    this.cdr.detectChanges();
  }
}
