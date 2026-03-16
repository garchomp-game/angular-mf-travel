import { TestBed } from '@angular/core/testing';
import { ExpenseTableComponent } from './expense-table';
import { ExpenseRecord } from '../../data/expense-supabase.service';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeJa);

describe('ExpenseTableComponent', () => {
  const mockExpenses: ExpenseRecord[] = [
    {
      id: '1',
      date: '2026-03-01',
      destination: '大阪本社',
      payerDetail: 'JR東海 / 新幹線',
      isRoundTrip: true,
      category: '旅費交通費',
      taxType: '課税',
      memo: '定例訪問',
    },
    {
      id: '2',
      date: '2026-03-05',
      destination: '名古屋支社',
      payerDetail: 'タクシー',
      isRoundTrip: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseTableComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'ja' }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ExpenseTableComponent);
    fixture.componentInstance.expenses = mockExpenses;
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render table headers', () => {
    const fixture = TestBed.createComponent(ExpenseTableComponent);
    fixture.componentInstance.expenses = mockExpenses;
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(8);
    expect(headers[0].textContent).toContain('日付');
    expect(headers[3].textContent).toContain('往復');
  });

  it('should render expense rows', () => {
    const fixture = TestBed.createComponent(ExpenseTableComponent);
    fixture.componentInstance.expenses = mockExpenses;
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should show round-trip badge', () => {
    const fixture = TestBed.createComponent(ExpenseTableComponent);
    fixture.componentInstance.expenses = [mockExpenses[0]];
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge-round');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('往復');
  });

  it('should show one-way badge', () => {
    const fixture = TestBed.createComponent(ExpenseTableComponent);
    fixture.componentInstance.expenses = [mockExpenses[1]];
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge-oneway');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('片道');
  });

  it('should emit editClick on edit button', () => {
    const fixture = TestBed.createComponent(ExpenseTableComponent);
    fixture.componentInstance.expenses = mockExpenses;
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.editClick, 'emit');
    const editBtn = fixture.nativeElement.querySelector('.btn-sm');
    editBtn.click();
    expect(spy).toHaveBeenCalledWith('1');
  });

  it('should show empty state when no expenses', () => {
    const fixture = TestBed.createComponent(ExpenseTableComponent);
    fixture.componentInstance.expenses = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('該当データなし');
  });
});
