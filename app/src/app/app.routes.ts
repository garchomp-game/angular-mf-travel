import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/auth/login-page.component';
import { ExpenseEntryPageComponent } from './features/expenses/pages/expense-entry-page/expense-entry-page.component';
import { MonthlyListPageComponent } from './features/expenses/pages/monthly-list-page/monthly-list-page.component';
import { TemplateListPageComponent } from './features/expenses/pages/template-list-page/template-list-page.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: MonthlyListPageComponent, canActivate: [authGuard] },
  { path: 'entry', component: ExpenseEntryPageComponent, canActivate: [authGuard] },
  { path: 'templates', component: TemplateListPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'list' },
];
