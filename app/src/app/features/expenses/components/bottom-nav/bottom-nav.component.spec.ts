import { TestBed } from '@angular/core/testing';
import { BottomNavComponent } from './bottom-nav.component';
import { provideRouter } from '@angular/router';

describe('BottomNavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render navigation links', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain('一覧');
    expect(links[1].textContent).toContain('入力');
  });
});
