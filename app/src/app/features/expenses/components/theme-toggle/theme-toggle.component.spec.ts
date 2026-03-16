import { TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('theme-dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default to light theme', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDark).toBe(false);
    // Now uses SVG swap icons instead of text
    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('should toggle to dark theme', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.autoDetectChanges();

    fixture.componentInstance.toggleTheme();

    expect(fixture.componentInstance.isDark).toBe(true);
    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dim');
  });

  it('should persist theme preference', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    fixture.componentInstance.toggleTheme();
    expect(localStorage.getItem('expenses-theme')).toBe('dark');
  });
});
