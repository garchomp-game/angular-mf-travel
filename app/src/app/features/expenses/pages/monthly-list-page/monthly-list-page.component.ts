import { Component } from '@angular/core';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { ExpenseCardComponent, ExpenseItem } from '../../components/expense-card/expense-card.component';
import { MonthSwitcherComponent } from '../../components/month-switcher/month-switcher.component';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-monthly-list-page',
  standalone: true,
  imports: [
    MonthSwitcherComponent,
    SearchBoxComponent,
    ExpenseCardComponent,
    BottomNavComponent,
    ThemeToggleComponent,
    SectionCardComponent
  ],
  templateUrl: './monthly-list-page.component.html',
  styleUrl: './monthly-list-page.component.scss'
})
export class MonthlyListPageComponent {
  months = ['2026年03月', '2026年02月', '2026年01月'];
  monthIndex = 0;
  query = '';

  readonly expenses: ExpenseItem[] = [
    {
      date: '2026-03-08',
      destination: '大阪本社',
      payer: 'JR東海',
      detail: '新幹線往復',
      amount: 27200,
      category: '旅費交通費'
    },
    {
      date: '2026-03-10',
      destination: '福岡支店',
      payer: '博多駅タクシー',
      detail: '客先訪問移動',
      amount: 3200,
      category: '旅費交通費'
    }
  ];

  get currentMonth(): string {
    return this.months[this.monthIndex];
  }

  get filteredExpenses(): ExpenseItem[] {
    if (!this.query) {
      return this.expenses;
    }

    return this.expenses.filter((expense) => {
      const target = `${expense.destination} ${expense.detail} ${expense.payer}`.toLowerCase();
      return target.includes(this.query.toLowerCase());
    });
  }

  previousMonth(): void {
    this.monthIndex = (this.monthIndex + 1) % this.months.length;
  }

  nextMonth(): void {
    this.monthIndex = (this.monthIndex - 1 + this.months.length) % this.months.length;
  }
}
