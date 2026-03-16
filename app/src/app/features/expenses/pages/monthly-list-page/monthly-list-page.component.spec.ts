import { TestBed } from '@angular/core/testing';
import { MonthlyListPageComponent } from './monthly-list-page.component';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { LOCALE_ID } from '@angular/core';
import { ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { AuthService } from '../../../../core/auth.service';
import { ApiService } from '../../../../core/api.service';

registerLocaleData(localeJa);

describe('MonthlyListPageComponent', () => {
  const mockExpenseService = {
    listByMonth: vi.fn().mockResolvedValue([
      {
        id: '1',
        date: '2026-03-08',
        destination: '大阪本社',
        payerDetail: 'JR東海',
        isRoundTrip: true,
      },
      {
        id: '2',
        date: '2026-03-10',
        destination: '福岡支店',
        payerDetail: 'タクシー',
        isRoundTrip: false,
      },
    ]),
    remove: vi.fn().mockResolvedValue(true),
  };

  const mockApiService = {
    token: 'test-token',
    get isAuthenticated() {
      return true;
    },
  };

  const mockAuthService = {
    signOut: vi.fn().mockResolvedValue(undefined),
    currentUser: { id: 'user-1', email: 'test@example.com' },
    user$: {
      pipe: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    },
    isAuthenticated$: {
      pipe: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    },
    ready$: {
      pipe: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [
        MonthlyListPageComponent,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.OFF,
          disableConsoleLogging: true,
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'ja' },
        { provide: ExpenseSupabaseService, useValue: mockExpenseService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ApiService, useValue: mockApiService },
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

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

  it('should toggle view mode', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.viewMode).toBe('card');
    fixture.componentInstance.toggleViewMode();
    expect(fixture.componentInstance.viewMode).toBe('table');
    expect(localStorage.getItem('expense-list-view-mode')).toBe('table');
  });
});
