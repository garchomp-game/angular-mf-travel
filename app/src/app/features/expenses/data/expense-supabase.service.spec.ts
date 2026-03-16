import { TestBed } from '@angular/core/testing';
import { ExpenseSupabaseService } from './expense-supabase.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ApiService } from '../../../core/api.service';

describe('ExpenseSupabaseService', () => {
  const mockApiService = {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { id: '1' } }),
    put: vi.fn().mockResolvedValue({ data: { id: '1' } }),
    delete: vi.fn().mockResolvedValue({ success: true }),
    token: 'test-token',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot({
          level: NgxLoggerLevel.OFF,
          disableConsoleLogging: true,
        }),
      ],
      providers: [{ provide: ApiService, useValue: mockApiService }],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(ExpenseSupabaseService);
    expect(service).toBeTruthy();
  });

  it('should call API for listByMonth', async () => {
    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.listByMonth('2026年03月');
    expect(Array.isArray(result)).toBe(true);
    expect(mockApiService.get).toHaveBeenCalled();
  });

  it('should call API for findById', async () => {
    mockApiService.get.mockResolvedValueOnce({
      data: { id: '1', date: '2026-03-01' },
    });
    const service = TestBed.inject(ExpenseSupabaseService);
    const result = await service.findById('1');
    expect(result).toBeDefined();
  });
});
