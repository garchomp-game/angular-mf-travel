import { TestBed } from '@angular/core/testing';
import { ExpenseCardComponent } from './expense-card.component';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeJa);

describe('ExpenseCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCardComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'ja' }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ExpenseCardComponent);
    fixture.componentInstance.expense = {
      id: '1',
      date: '2026-03-01',
      destination: 'テスト',
      payerDetail: 'JR',
      isRoundTrip: false,
    };
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display expense destination', () => {
    const fixture = TestBed.createComponent(ExpenseCardComponent);
    fixture.componentInstance.expense = {
      id: '1',
      date: '2026-03-01',
      destination: '大阪本社',
      payerDetail: 'JR東海',
      isRoundTrip: true,
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('大阪本社');
  });

  it('should show round-trip badge', () => {
    const fixture = TestBed.createComponent(ExpenseCardComponent);
    fixture.componentInstance.expense = {
      id: '1',
      date: '2026-03-01',
      destination: 'テスト',
      payerDetail: 'JR',
      isRoundTrip: true,
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('往復');
  });
});
