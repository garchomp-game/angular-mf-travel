import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { provideRouter, Router } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

type AuthChangeCallback = (event: string, session: unknown) => void;

describe('AuthService', () => {
  let authChangeCallback: AuthChangeCallback;
  const unsubscribeSpy = vi.fn();

  const mockSupabaseService = {
    client: {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
        }),
        onAuthStateChange: vi.fn().mockImplementation((cb: AuthChangeCallback) => {
          authChangeCallback = cb;
          return { data: { subscription: { unsubscribe: unsubscribeSpy } } };
        }),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseService.client.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot({
          level: NgxLoggerLevel.OFF,
          disableConsoleLogging: true,
        }),
      ],
      providers: [
        provideRouter([{ path: 'login', component: {} as never }]),
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });
  });

  // ── signIn ──

  it('signIn 成功時に user を設定し { success: true } を返す', async () => {
    mockSupabaseService.client.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });

    const service = TestBed.inject(AuthService);
    const result = await service.signIn('a@b.com', 'pass123');

    expect(result).toEqual({ success: true });
    expect(service.currentUser).toEqual({ id: 'u1', email: 'a@b.com' });
  });

  it('signIn エラー時に { success: false, error } を返す', async () => {
    mockSupabaseService.client.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' },
    });

    const service = TestBed.inject(AuthService);
    const result = await service.signIn('a@b.com', 'wrong');

    expect(result).toEqual({ success: false, error: 'Invalid credentials' });
    expect(service.currentUser).toBeNull();
  });

  it('signIn data.user が null でエラーなし → デフォルトエラーメッセージ', async () => {
    mockSupabaseService.client.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const service = TestBed.inject(AuthService);
    const result = await service.signIn('a@b.com', 'pass');

    expect(result.success).toBe(false);
    expect(result.error).toBe('ログインに失敗しました');
  });

  // ── signUp ──

  it('signUp 成功（session あり / 即時ログイン）→ user 設定', async () => {
    mockSupabaseService.client.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'u2', email: 'new@b.com' },
        session: { access_token: 'tok' },
      },
      error: null,
    });

    const service = TestBed.inject(AuthService);
    const result = await service.signUp('new@b.com', 'pass123');

    expect(result).toEqual({ success: true });
    expect(service.currentUser).toEqual({ id: 'u2', email: 'new@b.com' });
  });

  it('signUp 成功（session null / メール確認要）→ needsEmailConfirmation', async () => {
    mockSupabaseService.client.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'u3', email: 'confirm@b.com' },
        session: null,
      },
      error: null,
    });

    const service = TestBed.inject(AuthService);
    const result = await service.signUp('confirm@b.com', 'pass123');

    expect(result).toEqual({ success: true, needsEmailConfirmation: true });
    expect(service.currentUser).toBeNull();
  });

  it('signUp エラー → { success: false, error }', async () => {
    mockSupabaseService.client.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already exists' },
    });

    const service = TestBed.inject(AuthService);
    const result = await service.signUp('dup@b.com', 'pass123');

    expect(result).toEqual({ success: false, error: 'User already exists' });
  });

  it('signUp data.user が null でエラーなし → デフォルトエラーメッセージ', async () => {
    mockSupabaseService.client.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    const service = TestBed.inject(AuthService);
    const result = await service.signUp('x@b.com', 'pass');

    expect(result.success).toBe(false);
    expect(result.error).toBe('登録に失敗しました');
  });

  // ── signOut ──

  it('signOut 成功 → user null + /login ナビゲート', async () => {
    // First sign in
    mockSupabaseService.client.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    mockSupabaseService.client.auth.signOut.mockResolvedValue({ error: null });

    const service = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await service.signIn('a@b.com', 'pass');
    expect(service.currentUser).not.toBeNull();

    await service.signOut();
    expect(service.currentUser).toBeNull();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });

  it('signOut API 失敗でもローカル状態はクリアされる', async () => {
    mockSupabaseService.client.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    mockSupabaseService.client.auth.signOut.mockRejectedValue(new Error('Network error'));

    const service = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await service.signIn('a@b.com', 'pass');
    await service.signOut();

    expect(service.currentUser).toBeNull();
  });

  // ── initAuthState ──

  it('initAuthState session あり → user 設定 + ready = true', async () => {
    mockSupabaseService.client.auth.getSession.mockResolvedValue({
      data: {
        session: { user: { id: 'restored', email: 'r@b.com' } },
      },
    });

    const service = TestBed.inject(AuthService);
    // Wait for constructor's initAuthState to complete
    await vi.waitFor(() => expect(service.isReady).toBe(true));

    expect(service.currentUser).toEqual({ id: 'restored', email: 'r@b.com' });
  });

  it('initAuthState session なし → user = null + ready = true', async () => {
    const service = TestBed.inject(AuthService);
    await vi.waitFor(() => expect(service.isReady).toBe(true));

    expect(service.currentUser).toBeNull();
  });

  // ── onAuthStateChange ──

  it('onAuthStateChange で session 変更時に userSubject が更新される', async () => {
    const service = TestBed.inject(AuthService);
    await vi.waitFor(() => expect(service.isReady).toBe(true));

    // Simulate auth state change
    authChangeCallback('SIGNED_IN', {
      user: { id: 'changed', email: 'changed@b.com' },
    });

    expect(service.currentUser).toEqual({ id: 'changed', email: 'changed@b.com' });
  });

  it('onAuthStateChange で session null 時に user が null になる', async () => {
    mockSupabaseService.client.auth.getSession.mockResolvedValue({
      data: {
        session: { user: { id: 'u1', email: 'a@b.com' } },
      },
    });

    const service = TestBed.inject(AuthService);
    await vi.waitFor(() => expect(service.isReady).toBe(true));
    expect(service.currentUser).not.toBeNull();

    authChangeCallback('SIGNED_OUT', null);
    expect(service.currentUser).toBeNull();
  });
});
