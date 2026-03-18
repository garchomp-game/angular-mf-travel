import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  {
    path: 'list',
    loadComponent: () =>
      import('./features/expenses/pages/monthly-list-page/monthly-list-page.component').then(
        (m) => m.MonthlyListPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'entry',
    loadComponent: () =>
      import('./features/expenses/pages/expense-entry-page/expense-entry-page.component').then(
        (m) => m.ExpenseEntryPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'templates',
    loadComponent: () =>
      import('./features/expenses/pages/template-list-page/template-list-page.component').then(
        (m) => m.TemplateListPageComponent,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'list' },
];
