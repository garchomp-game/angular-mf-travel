import { TestBed } from '@angular/core/testing';
import { ExpenseSupabaseService } from './expense-supabase.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { SupabaseService } from '../../../core/supabase.service';

/**
 * Supabase クエリチェーンのモックを組み立てるヘルパー。
 * .from('table').select('*').gte(...).lt(...).order(...) のようなチェーンを再現する。
 */
function createChainMock(resolvedValue: { data: unknown; error: unknown }) {
  const terminal = {
    ...resolvedValue,
    then: (fn: (v: typeof resolvedValue) => void) => Promise.resolve(fn(resolvedValue)),
  };

  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'gte',
    'lt',
    'order',
    'single',
  ]) {
    chain[method] = vi.fn().mockReturnValue({ ...chain, ...terminal });
  }
  // Ensure each method returns the full chain + terminal
  for (const method of Object.keys(chain)) {
    chain[method].mockReturnValue({ ...chain, ...terminal });
  }
  return chain;
}

describe('ExpenseSupabaseService', () => {
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
          id: '1',
          travel_date: '2026-03-08',
          visit_to: '大阪本社',
          route_text: 'JR東海',
          is_round_trip: true,
          category_code: '旅費交通費',
          tax_code: '課税',
          pre_approval_no: null,
          memo: null,
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
    const service = TestBed.inject(ExpenseSupabaseService);
    expect(service).toBeTruthy();
  });

  it('should call Supabase for listByMonth', async () => {
    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.listByMonth('2026年03月');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].destination).toBe('大阪本社');
    expect(mockSupabaseService.client.from).toHaveBeenCalledWith('expense_records');
    expect(chain['select']).toHaveBeenCalledWith('*');
  });

  it('should call Supabase for findById', async () => {
    // single() returns one row
    const singleRow = {
      id: '1',
      travel_date: '2026-03-08',
      visit_to: '大阪本社',
      route_text: 'JR東海',
      is_round_trip: true,
      category_code: '旅費交通費',
      tax_code: '課税',
      pre_approval_no: null,
      memo: null,
    };
    const singleChain = createChainMock({ data: singleRow, error: null });
    mockSupabaseService.client.from.mockReturnValue(singleChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.findById('1');

    expect(result).toBeDefined();
    expect(result?.id).toBe('1');
    expect(result?.destination).toBe('大阪本社');
    expect(mockSupabaseService.client.from).toHaveBeenCalledWith('expense_records');
  });

  it('should return empty array for invalid month format', async () => {
    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.listByMonth('invalid');
    expect(result).toEqual([]);
  });

  it('should return empty array on Supabase error', async () => {
    const errorChain = createChainMock({
      data: null,
      error: { message: 'DB error' },
    });
    mockSupabaseService.client.from.mockReturnValue(errorChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.listByMonth('2026年03月');
    expect(result).toEqual([]);
  });

  it('should save a new expense record', async () => {
    const insertedRow = {
      id: 'new-1',
      travel_date: '2026-03-20',
      visit_to: '札幌支社',
      route_text: 'ANA / 航空券',
      is_round_trip: true,
      category_code: '旅費交通費',
      tax_code: '課税',
      pre_approval_no: null,
      memo: null,
    };
    const saveChain = createChainMock({ data: insertedRow, error: null });
    mockSupabaseService.client.from.mockReturnValue(saveChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.save({
      date: '2026-03-20',
      destination: '札幌支社',
      payerDetail: 'ANA / 航空券',
      isRoundTrip: true,
      category: '旅費交通費',
      taxType: '課税',
    });

    expect(result).toBeDefined();
    expect(result?.destination).toBe('札幌支社');
    expect(mockSupabaseService.client.from).toHaveBeenCalledWith('expense_records');
  });

  it('should update an existing expense record', async () => {
    const updatedRow = {
      id: 'existing-1',
      travel_date: '2026-03-20',
      visit_to: '更新先',
      route_text: 'JR東海',
      is_round_trip: false,
      category_code: '',
      tax_code: '',
      pre_approval_no: null,
      memo: null,
    };
    const updateChain = createChainMock({ data: updatedRow, error: null });
    mockSupabaseService.client.from.mockReturnValue(updateChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.save(
      {
        date: '2026-03-20',
        destination: '更新先',
        payerDetail: 'JR東海',
        isRoundTrip: false,
      },
      'existing-1',
    );

    expect(result).toBeDefined();
    expect(result?.destination).toBe('更新先');
  });

  it('should return undefined when save has no active session', async () => {
    mockSupabaseService.client.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.save({
      date: '2026-03-20',
      destination: 'テスト',
      payerDetail: 'テスト',
      isRoundTrip: false,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined on save Supabase error', async () => {
    const errorChain = createChainMock({
      data: null,
      error: { message: 'Insert failed' },
    });
    mockSupabaseService.client.from.mockReturnValue(errorChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.save(
      {
        date: '2026-03-20',
        destination: 'テスト',
        payerDetail: 'テスト',
        isRoundTrip: false,
      },
      'existing-id',
    );

    expect(result).toBeUndefined();
  });

  it('should remove an expense and return true', async () => {
    const deleteChain = createChainMock({ data: null, error: null });
    mockSupabaseService.client.from.mockReturnValue(deleteChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.remove('del-1');

    expect(result).toBe(true);
    expect(mockSupabaseService.client.from).toHaveBeenCalledWith('expense_records');
  });

  it('should return false on remove Supabase error', async () => {
    const errorChain = createChainMock({
      data: null,
      error: { message: 'Delete failed' },
    });
    mockSupabaseService.client.from.mockReturnValue(errorChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.remove('del-1');

    expect(result).toBe(false);
  });

  it('should return undefined on findById Supabase error', async () => {
    const errorChain = createChainMock({
      data: null,
      error: { message: 'Not found' },
    });
    mockSupabaseService.client.from.mockReturnValue(errorChain);

    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.findById('nonexistent');

    expect(result).toBeUndefined();
  });
});
