import { TestBed } from '@angular/core/testing';
import { ExpenseTemplateService } from './expense-template.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { SupabaseService } from '../../../core/supabase.service';

function createChainMock(resolvedValue: { data: unknown; error: unknown }) {
  const terminal = {
    ...resolvedValue,
    then: (fn: (v: typeof resolvedValue) => void) => Promise.resolve(fn(resolvedValue)),
  };

  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ['select', 'insert', 'delete', 'eq', 'order', 'single']) {
    chain[method] = vi.fn().mockReturnValue({ ...chain, ...terminal });
  }
  for (const method of Object.keys(chain)) {
    chain[method].mockReturnValue({ ...chain, ...terminal });
  }
  return chain;
}

describe('ExpenseTemplateService', () => {
  let chain: ReturnType<typeof createChainMock>;
  const mockSupabaseService = {
    client: {
      from: vi.fn(),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id' } } },
        }),
      },
    },
  };

  beforeEach(() => {
    chain = createChainMock({
      data: [
        {
          id: 't1',
          name: '大阪出張',
          visit_to: '大阪本社',
          route_text: 'JR東海 / 新幹線',
          is_round_trip: true,
          category_code: '旅費交通費',
          tax_code: '課税',
          pre_approval_no: null,
        },
      ],
      error: null,
    });
    mockSupabaseService.client.from.mockReturnValue(chain);

    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot({
          level: NgxLoggerLevel.OFF,
          disableConsoleLogging: true,
        }),
      ],
      providers: [{ provide: SupabaseService, useValue: mockSupabaseService }],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(ExpenseTemplateService);
    expect(service).toBeTruthy();
  });

  // ── list ──

  it('should return template list', async () => {
    const service = TestBed.inject(ExpenseTemplateService);
    const result = await service.list();

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('大阪出張');
    expect(result[0].destination).toBe('大阪本社');
    expect(result[0].isRoundTrip).toBe(true);
    expect(mockSupabaseService.client.from).toHaveBeenCalledWith('expense_templates');
  });

  it('should return empty array on list error', async () => {
    const errorChain = createChainMock({ data: null, error: { message: 'DB error' } });
    mockSupabaseService.client.from.mockReturnValue(errorChain);

    const service = TestBed.inject(ExpenseTemplateService);
    const result = await service.list();
    expect(result).toEqual([]);
  });

  // ── save ──

  it('should save a new template', async () => {
    const savedRow = {
      id: 't-new',
      name: '名古屋日帰り',
      visit_to: '名古屋支社',
      route_text: 'JR東海',
      is_round_trip: false,
      category_code: '',
      tax_code: '',
      pre_approval_no: null,
    };
    const saveChain = createChainMock({ data: savedRow, error: null });
    mockSupabaseService.client.from.mockReturnValue(saveChain);

    const service = TestBed.inject(ExpenseTemplateService);
    const result = await service.save({
      name: '名古屋日帰り',
      destination: '名古屋支社',
      payerDetail: 'JR東海',
      isRoundTrip: false,
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe('名古屋日帰り');
    expect(result?.destination).toBe('名古屋支社');
  });

  it('should return undefined when save has no session', async () => {
    mockSupabaseService.client.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    const service = TestBed.inject(ExpenseTemplateService);
    const result = await service.save({
      name: 'テスト',
      destination: 'テスト',
      payerDetail: 'テスト',
      isRoundTrip: false,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined on save error', async () => {
    const errorChain = createChainMock({ data: null, error: { message: 'Insert failed' } });
    mockSupabaseService.client.from.mockReturnValue(errorChain);

    const service = TestBed.inject(ExpenseTemplateService);
    const result = await service.save({
      name: 'テスト',
      destination: 'テスト',
      payerDetail: 'テスト',
      isRoundTrip: false,
    });

    expect(result).toBeUndefined();
  });

  // ── remove ──

  it('should remove a template and return true', async () => {
    const deleteChain = createChainMock({ data: null, error: null });
    mockSupabaseService.client.from.mockReturnValue(deleteChain);

    const service = TestBed.inject(ExpenseTemplateService);
    const result = await service.remove('t1');

    expect(result).toBe(true);
    expect(mockSupabaseService.client.from).toHaveBeenCalledWith('expense_templates');
  });

  it('should return false on remove error', async () => {
    const errorChain = createChainMock({ data: null, error: { message: 'Delete failed' } });
    mockSupabaseService.client.from.mockReturnValue(errorChain);

    const service = TestBed.inject(ExpenseTemplateService);
    const result = await service.remove('t1');

    expect(result).toBe(false);
  });
});
