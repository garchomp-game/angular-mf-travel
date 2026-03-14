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
  standalone: true,
  imports: [
    CommonModule,
    MonthSwitcherComponent,
    SearchBoxComponent,
    ExpenseCardComponent,
    BottomNavComponent,
    ThemeToggleComponent,
    SectionCardComponent,
  ],
  templateUrl: './monthly-list-page.component.html',
  styleUrl: './monthly-list-page.component.scss',
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
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
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
