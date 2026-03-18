import { TestBed } from '@angular/core/testing';
import { ExpenseEntryPageComponent } from './expense-entry-page.component';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { ExpenseTemplateService } from '../../data/expense-template.service';
import { AuthService } from '../../../../core/auth.service';
import { TemplateNameModalComponent } from '../../components/template-name-modal/template-name-modal.component';

describe('ExpenseEntryPageComponent', () => {
  const mockExpenseService = {
    findById: vi.fn().mockResolvedValue(undefined),
    findDuplicate: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue({
      id: 'new-1',
      date: '2026-03-20',
      destination: 'テスト',
      payerDetail: 'JR',
      isRoundTrip: false,
    }),
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
    localStorage.clear();
    vi.clearAllMocks();

    // Re-apply default mock implementations after clearAllMocks
    mockExpenseService.findById.mockResolvedValue(undefined);
    mockExpenseService.findDuplicate.mockResolvedValue(undefined);
    mockExpenseService.save.mockResolvedValue({
      id: 'new-1',
      date: '2026-03-20',
      destination: 'テスト',
      payerDetail: 'JR',
      isRoundTrip: false,
    });
    mockTemplateService.list.mockResolvedValue([]);
    mockTemplateService.save.mockResolvedValue({ id: 'tpl-1', name: 'テスト' });

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
        { provide: ExpenseTemplateService, useValue: mockTemplateService },
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

  it('should call save with valid form data', async () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.expenseForm.patchValue({
      date: '2026-03-20',
      destination: 'テスト先',
      payerDetail: 'JR東海',
      isRoundTrip: true,
    });
    await fixture.componentInstance.submit();
    expect(mockExpenseService.save).toHaveBeenCalled();
  });

  it('should show error message when save fails', async () => {
    mockExpenseService.save.mockResolvedValue(undefined);
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.expenseForm.patchValue({
      date: '2026-03-20',
      destination: 'テスト先',
      payerDetail: 'JR東海',
      isRoundTrip: false,
    });
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.errorMessage).toBeTruthy();
  });

  it('should warn on duplicate and cancel if user declines', async () => {
    mockExpenseService.findDuplicate.mockResolvedValue({
      id: 'dup-1',
      date: '2026-03-20',
      destination: 'テスト先',
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.expenseForm.patchValue({
      date: '2026-03-20',
      destination: 'テスト先',
      payerDetail: 'JR東海',
      isRoundTrip: false,
    });
    await fixture.componentInstance.submit();
    expect(mockExpenseService.save).not.toHaveBeenCalled();
  });

  it('should proceed with duplicate when user confirms', async () => {
    mockExpenseService.findDuplicate.mockResolvedValue({
      id: 'dup-1',
      date: '2026-03-20',
      destination: 'テスト先',
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.expenseForm.patchValue({
      date: '2026-03-20',
      destination: 'テスト先',
      payerDetail: 'JR東海',
      isRoundTrip: false,
    });
    await fixture.componentInstance.submit();
    expect(mockExpenseService.save).toHaveBeenCalled();
  });

  it('should open modal for template name when saveAsTemplate is checked', async () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();

    // Mock the modal's open method
    const modal = fixture.componentInstance[
      'templateNameModal'
    ] as unknown as TemplateNameModalComponent;
    vi.spyOn(modal, 'open').mockResolvedValue('カスタム名');

    fixture.componentInstance.saveAsTemplate = true;
    fixture.componentInstance.expenseForm.patchValue({
      date: '2026-03-20',
      destination: 'テスト先',
      payerDetail: 'JR東海',
      isRoundTrip: false,
    });
    await fixture.componentInstance.submit();
    expect(modal.open).toHaveBeenCalledWith('テスト先');
    expect(mockTemplateService.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'カスタム名' }),
    );
  });

  it('should not save template when modal is cancelled', async () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();

    const modal = fixture.componentInstance[
      'templateNameModal'
    ] as unknown as TemplateNameModalComponent;
    vi.spyOn(modal, 'open').mockResolvedValue(null);

    fixture.componentInstance.saveAsTemplate = true;
    fixture.componentInstance.expenseForm.patchValue({
      date: '2026-03-20',
      destination: 'テスト先',
      payerDetail: 'JR東海',
      isRoundTrip: false,
    });
    await fixture.componentInstance.submit();
    expect(modal.open).toHaveBeenCalled();
    expect(mockTemplateService.save).not.toHaveBeenCalled();
  });

  describe('applyTemplate', () => {
    const mockTemplate = {
      id: 'tpl-1',
      name: '大阪出張',
      destination: '大阪本社',
      payerDetail: 'JR東海 / 新幹線',
      isRoundTrip: true,
      category: '旅費交通費',
      taxType: '課税',
      preApprovalNumber: 'AP-001',
    };

    it('should populate form fields from template', async () => {
      mockTemplateService.list.mockResolvedValue([mockTemplate]);
      const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
      await fixture.componentInstance.ngOnInit();
      fixture.detectChanges();

      const event = { target: { value: 'tpl-1' } } as unknown as Event;
      fixture.componentInstance.applyTemplate(event);

      const form = fixture.componentInstance.expenseForm;
      expect(form.controls.destination.value).toBe('大阪本社');
      expect(form.controls.payerDetail.value).toBe('JR東海 / 新幹線');
      expect(form.controls.isRoundTrip.value).toBe(true);
      expect(form.controls.category.value).toBe('旅費交通費');
      expect(form.controls.taxType.value).toBe('課税');
      expect(form.controls.preApprovalNumber.value).toBe('AP-001');
    });

    it('should not modify date field when template is applied', async () => {
      mockTemplateService.list.mockResolvedValue([mockTemplate]);
      const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
      await fixture.componentInstance.ngOnInit();
      fixture.detectChanges();

      // 日付は空のまま、テンプレートは日付を設定しない
      expect(fixture.componentInstance.expenseForm.controls.date.value).toBe('');
      const event = { target: { value: 'tpl-1' } } as unknown as Event;
      fixture.componentInstance.applyTemplate(event);
      expect(fixture.componentInstance.expenseForm.controls.date.value).toBe('');
    });
  });
});
