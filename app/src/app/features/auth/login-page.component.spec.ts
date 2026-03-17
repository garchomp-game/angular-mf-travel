import { TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';

describe('LoginPageComponent', () => {
  const mockAuthService = {
    signIn: vi.fn().mockResolvedValue({ success: true }),
    signUp: vi.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show login tab by default', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isSignUp).toBe(false);
  });

  it('should validate empty form', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.errorMessage).toBeTruthy();
    expect(mockAuthService.signIn).not.toHaveBeenCalled();
  });

  it('should call signIn with valid credentials', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });
    await fixture.componentInstance.submit();
    expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should call signUp when in signup mode', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.isSignUp = true;
    fixture.componentInstance.loginForm.patchValue({
      email: 'new@example.com',
      password: 'password123',
    });
    await fixture.componentInstance.submit();
    expect(mockAuthService.signUp).toHaveBeenCalledWith('new@example.com', 'password123');
  });

  it('should display error message on signIn failure', async () => {
    mockAuthService.signIn.mockResolvedValue({ success: false, error: 'Invalid credentials' });
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpass',
    });
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.errorMessage).toBe('Invalid credentials');
  });

  it('should show confirmation message on signUp with needsEmailConfirmation', async () => {
    mockAuthService.signUp.mockResolvedValue({ success: true, needsEmailConfirmation: true });
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.isSignUp = true;
    fixture.componentInstance.loginForm.patchValue({
      email: 'new@example.com',
      password: 'password123',
    });
    await fixture.componentInstance.submit();

    expect(fixture.componentInstance.successMessage).toContain('確認メール');
    expect(fixture.componentInstance.isSignUp).toBe(false);
  });

  it('should set loading = true during submit', async () => {
    let loadingDuringCall = false;
    mockAuthService.signIn.mockImplementation(async () => {
      loadingDuringCall = fixture.componentInstance.loading;
      return { success: true };
    });

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });
    await fixture.componentInstance.submit();
    expect(loadingDuringCall).toBe(true);
    expect(fixture.componentInstance.loading).toBe(false);
  });

  it('should reject invalid email format', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginForm.patchValue({
      email: 'not-an-email',
      password: 'password123',
    });
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.errorMessage).toBeTruthy();
    expect(mockAuthService.signIn).not.toHaveBeenCalled();
  });

  it('should reject password with 5 chars (boundary: min-1)', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginForm.patchValue({
      email: 'test@example.com',
      password: '12345',
    });
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.errorMessage).toBeTruthy();
    expect(mockAuthService.signIn).not.toHaveBeenCalled();
  });

  it('should accept password with 6 chars (boundary: min)', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginForm.patchValue({
      email: 'test@example.com',
      password: '123456',
    });
    await fixture.componentInstance.submit();
    expect(mockAuthService.signIn).toHaveBeenCalled();
  });
});
