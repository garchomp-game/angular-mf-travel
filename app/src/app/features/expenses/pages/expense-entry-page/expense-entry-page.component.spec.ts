import { TestBed } from '@angular/core/testing';
import { ExpenseEntryPageComponent } from './expense-entry-page.component';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { AuthService } from '../../../../core/auth.service';

describe('ExpenseEntryPageComponent', () => {
  const mockExpenseService = {
    findById: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue({
      id: 'new-1',
      date: '2026-03-20',
      destination: 'テスト',
      payerDetail: 'JR',
      isRoundTrip: false,
    }),
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
    localStorage.clear();
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [
        ExpenseEntryPageComponent,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.OFF,
          disableConsoleLogging: true,
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: ExpenseSupabaseService, useValue: mockExpenseService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show 経費入力 heading for new entry', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('経費入力');
  });

  it('should have required form controls', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.expenseForm;
    expect(form.get('date')).toBeTruthy();
    expect(form.get('destination')).toBeTruthy();
    expect(form.get('payerDetail')).toBeTruthy();
    expect(form.get('isRoundTrip')).toBeTruthy();
  });

  it('should not submit when form is invalid', async () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    await fixture.componentInstance.submit();
    expect(mockExpenseService.save).not.toHaveBeenCalled();
  });

  it('should toggle details panel', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.detailsExpanded).toBe(false);
    fixture.componentInstance.toggleDetails();
    expect(fixture.componentInstance.detailsExpanded).toBe(true);
  });
});
