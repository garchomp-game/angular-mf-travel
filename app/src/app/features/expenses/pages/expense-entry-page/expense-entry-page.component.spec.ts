import { TestBed } from '@angular/core/testing';
import { ExpenseEntryPageComponent } from './expense-entry-page.component';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

describe('ExpenseEntryPageComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [
        ExpenseEntryPageComponent,
        LoggerModule.forRoot({ level: NgxLoggerLevel.OFF, disableConsoleLogging: true }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show 経費入力 heading for new entry', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('経費入力');
  });

  it('should have required form controls', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance.expenseForm;
    expect(form.get('date')).toBeTruthy();
    expect(form.get('destination')).toBeTruthy();
    expect(form.get('payerDetail')).toBeTruthy();
    expect(form.get('amount')).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.expenseForm.touched).toBe(true);
  });

  it('should toggle details panel', () => {
    const fixture = TestBed.createComponent(ExpenseEntryPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.detailsExpanded).toBe(false);
    fixture.componentInstance.toggleDetails();
    expect(fixture.componentInstance.detailsExpanded).toBe(true);
  });
});
