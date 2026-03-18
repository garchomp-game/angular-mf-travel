import { TestBed } from '@angular/core/testing';
import { MonthlyListPageComponent } from './monthly-list-page.component';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { LOCALE_ID } from '@angular/core';
import { ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { ExpenseTemplateService } from '../../data/expense-template.service';
import { TemplateNameModalComponent } from '../../components/template-name-modal/template-name-modal.component';
import { AuthService } from '../../../../core/auth.service';

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

  const mockTemplateService = {
    list: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue({ id: 'tpl-1', name: 'テスト' }),
    remove: vi.fn().mockResolvedValue(true),
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
        { provide: ExpenseTemplateService, useValue: mockTemplateService },
        { provide: AuthService, useValue: mockAuthService },
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

  it('should remove expense and reload list', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    const callsBefore = mockExpenseService.listByMonth.mock.calls.length;
    await fixture.componentInstance.remove('1');
    expect(mockExpenseService.remove).toHaveBeenCalledWith('1');
    // After remove, listByMonth should be called once more to reload
    expect(mockExpenseService.listByMonth.mock.calls.length).toBe(callsBefore + 1);
  });

  it('should show empty filtered list when no match', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.componentInstance.query = '存在しない検索ワード';
    expect(fixture.componentInstance.filteredExpenses.length).toBe(0);
  });

  it('should calculate round trip count', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.roundTripCount).toBe(1);
    expect(fixture.componentInstance.oneWayCount).toBe(1);
  });

  it('should export CSV without errors', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();

    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      set href(_: string) {},
      set download(_: string) {},
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    fixture.componentInstance.exportCsv();
    expect(createSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();

    // Restore to prevent DOM corruption in subsequent tests
    createElementSpy.mockRestore();
  });

  it('should add expense to template when modal confirms', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    const modal = fixture.componentInstance[
      'templateNameModal'
    ] as unknown as TemplateNameModalComponent;
    vi.spyOn(modal, 'open').mockResolvedValue('テストテンプレ');

    await fixture.componentInstance.addToTemplate('1');
    expect(modal.open).toHaveBeenCalledWith('大阪本社');
    expect(mockTemplateService.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'テストテンプレ', destination: '大阪本社' }),
    );
  });

  it('should not save template when modal is cancelled', async () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    const modal = fixture.componentInstance[
      'templateNameModal'
    ] as unknown as TemplateNameModalComponent;
    vi.spyOn(modal, 'open').mockResolvedValue(null);

    await fixture.componentInstance.addToTemplate('1');
    expect(modal.open).toHaveBeenCalled();
    expect(mockTemplateService.save).not.toHaveBeenCalled();
  });
});
