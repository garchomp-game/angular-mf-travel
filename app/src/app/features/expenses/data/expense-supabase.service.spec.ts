import { TestBed } from '@angular/core/testing';
import { ExpenseSupabaseService } from './expense-supabase.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { AuthService } from '../../../core/auth.service';

describe('ExpenseSupabaseService', () => {
  const mockAuthService = {
    currentUser: { id: 'user-1' },
    user$: { pipe: vi.fn().mockReturnValue({ subscribe: vi.fn() }) },
    isAuthenticated$: { pipe: vi.fn().mockReturnValue({ subscribe: vi.fn() }) },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot({ level: NgxLoggerLevel.OFF, disableConsoleLogging: true })],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(ExpenseSupabaseService);
    expect(service).toBeTruthy();
  });

  it('should generate CSV from expenses', () => {
    const service = TestBed.inject(ExpenseSupabaseService);
    const csv = service.toCsv([
      {
        id: '1',
        date: '2026-03-01',
        destination: 'テスト',
        payerDetail: 'JR',
        amount: 1000,
        category: '旅費',
        memo: 'テスト',
      },
    ]);
    expect(csv).toContain('日付');
    expect(csv).toContain('テスト');
    expect(csv).toContain('1000');
  });

  it('should return empty array when supabase is not configured', async () => {
    const service = TestBed.inject(ExpenseSupabaseService);
    // supabase is null in test env (no env vars), so this should return empty
    const result = await service.listByMonth('2026年03月');
    expect(Array.isArray(result)).toBe(true);
  });
});
