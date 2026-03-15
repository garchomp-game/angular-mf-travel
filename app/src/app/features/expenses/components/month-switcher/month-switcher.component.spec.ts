import { TestBed } from '@angular/core/testing';
import { MonthSwitcherComponent } from './month-switcher.component';

describe('MonthSwitcherComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthSwitcherComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MonthSwitcherComponent);
    fixture.componentInstance.currentMonth = '2026年03月';
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display current month', () => {
    const fixture = TestBed.createComponent(MonthSwitcherComponent);
    fixture.componentInstance.currentMonth = '2026年03月';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('2026年03月');
  });

  it('should emit previous event', () => {
    const fixture = TestBed.createComponent(MonthSwitcherComponent);
    fixture.componentInstance.currentMonth = '2026年03月';
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.previous, 'emit');
    const button = fixture.nativeElement.querySelector('button[aria-label="前月"]');
    button.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit next event', () => {
    const fixture = TestBed.createComponent(MonthSwitcherComponent);
    fixture.componentInstance.currentMonth = '2026年03月';
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.next, 'emit');
    const button = fixture.nativeElement.querySelector('button[aria-label="翌月"]');
    button.click();
    expect(spy).toHaveBeenCalled();
  });
});
