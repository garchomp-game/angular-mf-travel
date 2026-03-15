import { TestBed } from '@angular/core/testing';
import { SearchBoxComponent } from './search-box.component';

describe('SearchBoxComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBoxComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SearchBoxComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit queryChange on input', () => {
    const fixture = TestBed.createComponent(SearchBoxComponent);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.queryChange, 'emit');
    fixture.componentInstance.searchControl.setValue('福岡');
    expect(spy).toHaveBeenCalledWith('福岡');
  });

  it('should trim whitespace from query', () => {
    const fixture = TestBed.createComponent(SearchBoxComponent);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance.queryChange, 'emit');
    fixture.componentInstance.searchControl.setValue('  福岡  ');
    expect(spy).toHaveBeenCalledWith('福岡');
  });
});
