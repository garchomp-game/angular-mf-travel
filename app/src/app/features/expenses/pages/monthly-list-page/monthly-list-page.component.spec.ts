import { TestBed } from '@angular/core/testing';
import { MonthlyListPageComponent } from './monthly-list-page.component';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeJa);

describe('MonthlyListPageComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [
        MonthlyListPageComponent,
        LoggerModule.forRoot({ level: NgxLoggerLevel.OFF, disableConsoleLogging: true }),
      ],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'ja' },
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show 経費一覧 heading', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('経費一覧');
  });

  it('should display default month', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.currentMonth).toBe('2026年03月');
  });

  it('should switch to previous month', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.previousMonth();
    expect(fixture.componentInstance.currentMonth).toBe('2026年02月');
  });

  it('should filter expenses by query', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.query = '福岡';
    const filtered = fixture.componentInstance.filteredExpenses;
    expect(filtered.every((e) =>
      e.destination.includes('福岡') ||
      e.payerDetail.includes('福岡') ||
      (e.memo ?? '').includes('福岡')
    )).toBe(true);
  });

  it('should show all expenses when query is empty', () => {
    const fixture = TestBed.createComponent(MonthlyListPageComponent);
    fixture.detectChanges();
    const all = fixture.componentInstance.filteredExpenses;
    expect(all.length).toBeGreaterThan(0);
  });
});
