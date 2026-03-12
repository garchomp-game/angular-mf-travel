import { Routes } from '@angular/router';
import { ExpenseEntryPageComponent } from './features/expenses/pages/expense-entry-page/expense-entry-page.component';
import { MonthlyListPageComponent } from './features/expenses/pages/monthly-list-page/monthly-list-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: MonthlyListPageComponent },
  { path: 'entry', component: ExpenseEntryPageComponent },
  { path: '**', redirectTo: 'list' }
];
