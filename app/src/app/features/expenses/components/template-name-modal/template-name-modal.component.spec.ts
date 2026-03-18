import { TestBed } from '@angular/core/testing';
import { TemplateNameModalComponent } from './template-name-modal.component';

describe('TemplateNameModalComponent', () => {
  let showModalSpy: ReturnType<typeof vi.fn>;
  let closeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    showModalSpy = vi.fn();
    closeSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [TemplateNameModalComponent],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(TemplateNameModalComponent);
    fixture.detectChanges();
    // Mock the native dialog element
    const comp = fixture.componentInstance;
    (comp as unknown as { dialogRef: { nativeElement: Partial<HTMLDialogElement> } }).dialogRef = {
      nativeElement: {
        showModal: showModalSpy,
        close: closeSpy,
      } as Partial<HTMLDialogElement>,
    };
    (
      comp as unknown as { nameInputRef: { nativeElement: Partial<HTMLInputElement> } }
    ).nameInputRef = {
      nativeElement: {
        select: vi.fn(),
      } as Partial<HTMLInputElement>,
    };
    return { fixture, comp };
  }

  it('should create', () => {
    const { comp } = createComponent();
    expect(comp).toBeTruthy();
  });

  it('should open modal with default name', () => {
    const { comp } = createComponent();
    comp.open('テスト訪問先');
    expect(showModalSpy).toHaveBeenCalled();
    expect(comp.templateName).toBe('テスト訪問先');
  });

  it('should resolve with name when confirmed', async () => {
    const { comp } = createComponent();
    const promise = comp.open('デフォルト名');
    comp.templateName = 'カスタム名';
    comp.confirm();
    const result = await promise;
    expect(result).toBe('カスタム名');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should resolve with null when cancelled', async () => {
    const { comp } = createComponent();
    const promise = comp.open('デフォルト名');
    comp.cancel();
    const result = await promise;
    expect(result).toBeNull();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should resolve with null when dialog is closed externally (ESC / backdrop)', async () => {
    const { comp } = createComponent();
    const promise = comp.open('デフォルト名');
    comp.onDialogClose();
    const result = await promise;
    expect(result).toBeNull();
  });

  it('should not confirm when template name is empty', () => {
    const { comp } = createComponent();
    comp.open('');
    comp.templateName = '   ';
    comp.confirm();
    // dialog should not be closed (confirm does nothing for empty name)
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should trim whitespace from template name', async () => {
    const { comp } = createComponent();
    const promise = comp.open('テスト');
    comp.templateName = '  トリミングテスト  ';
    comp.confirm();
    const result = await promise;
    expect(result).toBe('トリミングテスト');
  });
});
