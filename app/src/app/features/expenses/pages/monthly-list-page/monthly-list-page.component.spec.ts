import { TestBed } from '@angular/core/testing';
import { MonthlyListPageComponent } from './monthly-list-page.component';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { LOCALE_ID } from '@angular/core';
import { ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { AuthService } from '../../../../core/auth.service';

registerLocaleData(localeJa);

describe('MonthlyListPageComponent', () => {
  const mockExpenseService = {
    listByMonth: vi.fn().mockResolvedValue([
      { id: '1', date: '2026-03-08', destination: '大阪本社', payerDetail: 'JR東海', amount: 27200 },
      { id: '2', date: '2026-03-10', destination: '福岡支店', payerDetail: 'タクシー', amount: 3200 },
    ]),
    remove: vi.fn().mockResolvedValue(true),
    toCsv: vi.fn().mockReturnValue('"日付"\n"2026-03-08"'),
  };

  const mockAuthService = {
    signOut: vi.fn().mockResolvedValue(undefined),
    currentUser: { id: 'user-1' },
    user$: { pipe: vi.fn().mockReturnValue({ subscribe: vi.fn() }) },
    isAuthenticated$: { pipe: vi.fn().mockReturnValue({ subscribe: vi.fn() }) },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [
        MonthlyListPageComponent,
        LoggerModule.forRoot({ level: NgxLoggerLevel.OFF, disableConsoleLogging: true }),
      ],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'ja' },
        { provide: ExpenseSupabaseService, useValue: mockExpenseService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display default month', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    expect(fixture.componentInstance.currentMonth).toBe('2026年03月');
  });

  it('should load expenses on init', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
    expect(mockExpenseService.listByMonth).toHaveBeenCalledWith('2026年03月');
    expect(fixture.componentInstance.expenses.length).toBe(2);
  });

  it('should switch to previous month and reload', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.previousMonth();
    expect(fixture.componentInstance.currentMonth).toBe('2026年02月');
    expect(mockExpenseService.listByMonth).toHaveBeenCalledWith('2026年02月');
  });

  it('should filter expenses by query', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.componentInstance.query = '福岡';
    expect(fixture.componentInstance.filteredExpenses.length).toBe(1);
    expect(fixture.componentInstance.filteredExpenses[0].destination).toBe('福岡支店');
  });
});
