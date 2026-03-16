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
    expect(fixture.nativeElement.textContent).toContain('ダークテーマ');
  });

  it('should toggle to dark theme', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.isDark).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('ライトテーマ');
    expect(document.body.classList.contains('theme-dark')).toBe(true);
  });

  it('should persist theme preference', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    fixture.componentInstance.toggleTheme();
    expect(localStorage.getItem('expenses-theme')).toBe('dark');
  });
});
