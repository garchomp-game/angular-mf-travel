import { TestBed } from '@angular/core/testing';
import { ExpenseStoreService, ExpenseRecord } from './expense-store.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

describe('ExpenseStoreService', () => {
  let service: ExpenseStoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot({ level: NgxLoggerLevel.OFF, disableConsoleLogging: true })],
    });
    service = TestBed.inject(ExpenseStoreService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default expenses when localStorage is empty', () => {
    const result = service.listByMonth('2026年03月');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].destination).toBe('大阪本社');
  });

  it('should filter expenses by month', () => {
    const march = service.listByMonth('2026年03月');
    const february = service.listByMonth('2026年02月');

    expect(march.some((e) => e.destination === '大阪本社')).toBe(true);
    expect(march.some((e) => e.destination === '名古屋営業所')).toBe(false);
    expect(february.some((e) => e.destination === '名古屋営業所')).toBe(true);
  });

  it('should return empty array for invalid month label', () => {
    expect(service.listByMonth('invalid')).toEqual([]);
  });

  it('should find an expense by id', () => {
    const found = service.findById('exp-seed-1');
    expect(found).toBeDefined();
    expect(found!.destination).toBe('大阪本社');
  });

  it('should return undefined for non-existent id', () => {
    expect(service.findById('non-existent')).toBeUndefined();
  });

  it('should save a new expense', () => {
    const draft = {
      date: '2026-03-20',
      destination: '札幌支店',
      payerDetail: 'ANA / 空港バス',
      amount: 8500,
    };

    const created = service.save(draft);
    expect(created.id).toBeTruthy();
    expect(created.destination).toBe('札幌支店');

    const found = service.findById(created.id);
    expect(found).toBeDefined();
  });

  it('should update an existing expense', () => {
    const updated = service.save(
      {
        date: '2026-03-08',
        destination: '大阪本社(更新)',
        payerDetail: 'JR東海',
        amount: 30000,
      },
      'exp-seed-1',
    );

    expect(updated.destination).toBe('大阪本社(更新)');
    expect(service.findById('exp-seed-1')?.destination).toBe('大阪本社(更新)');
  });

  it('should throw when updating non-existent expense', () => {
    expect(() =>
      service.save({ date: '', destination: '', payerDetail: '', amount: 0 }, 'non-existent'),
    ).toThrow();
  });

  it('should remove an expense', () => {
    service.remove('exp-seed-1');
    expect(service.findById('exp-seed-1')).toBeUndefined();
  });

  it('should generate CSV with headers', () => {
    const expenses: ExpenseRecord[] = [
      {
        id: '1',
        date: '2026-03-01',
        destination: 'テスト社',
        payerDetail: 'JR',
        amount: 1000,
        category: '旅費',
        memo: 'テスト',
      },
    ];

    const csv = service.toCsv(expenses);
    expect(csv).toContain('日付');
    expect(csv).toContain('テスト社');
    expect(csv).toContain('1000');
  });

  it('should recover from corrupted localStorage', () => {
    localStorage.setItem('travel-expenses', 'invalid-json');
    const result = service.listByMonth('2026年03月');
    expect(result.length).toBeGreaterThan(0);
  });
});
