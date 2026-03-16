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
});
