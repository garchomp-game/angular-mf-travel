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
});
