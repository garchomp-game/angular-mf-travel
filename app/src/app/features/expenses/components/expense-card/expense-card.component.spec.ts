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
      amount: 1000,
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
      amount: 27200,
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('大阪本社');
  });

  it('should display formatted amount', () => {
    const fixture = TestBed.createComponent(ExpenseCardComponent);
    fixture.componentInstance.expense = {
      id: '1',
      date: '2026-03-01',
      destination: 'テスト',
      payerDetail: 'JR',
      amount: 27200,
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('27,200');
  });
});
