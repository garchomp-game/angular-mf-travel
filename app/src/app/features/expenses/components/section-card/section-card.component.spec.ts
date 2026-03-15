import { TestBed } from '@angular/core/testing';
import { SectionCardComponent } from './section-card.component';

describe('SectionCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCardComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SectionCardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display title when provided', () => {
    const fixture = TestBed.createComponent(SectionCardComponent);
    fixture.componentInstance.title = 'テスト見出し';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('テスト見出し');
  });

  it('should not show h2 when title is empty', () => {
    const fixture = TestBed.createComponent(SectionCardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2')).toBeNull();
  });
});
