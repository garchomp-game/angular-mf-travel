import { Injectable, inject, NgZone, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { LoggerService } from './logger.service';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly supabase = inject(SupabaseService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  private readonly readySubject = new BehaviorSubject<boolean>(false);

  readonly user$: Observable<AuthUser | null> = this.userSubject.asObservable();
  readonly isAuthenticated$ = this.user$.pipe(map((u) => !!u));
  readonly ready$ = this.readySubject.asObservable();

  constructor() {
    this.initAuthState();
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get isReady(): boolean {
    return this.readySubject.value;
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      const message = error?.message ?? 'ログインに失敗しました';
      this.logger.warn('[Auth] ログイン失敗', { email, error: message });
      return { success: false, error: message };
    }

    this.zone.run(() => {
      this.userSubject.next({ id: data.user.id, email: data.user.email! });
    });
    this.logger.info('[Auth] ログイン成功', { userId: data.user.id });
    return { success: true };
  }

  async signUp(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error || !data.user) {
      const message = error?.message ?? '登録に失敗しました';
      this.logger.warn('[Auth] 登録失敗', { email, error: message });
      return { success: false, error: message };
    }

    // メール確認が有効な場合、session は null になる
    if (data.session) {
      this.zone.run(() => {
        this.userSubject.next({ id: data.user!.id, email: data.user!.email! });
      });
      this.logger.info('[Auth] 登録成功（即時ログイン）', { userId: data.user.id });
      return { success: true };
    }

    // メール確認が必要
    this.logger.info('[Auth] 登録成功（メール確認待ち）', { userId: data.user.id });
    return { success: true, needsEmailConfirmation: true };
  }

  async signOut(): Promise<void> {
    try {
      await this.supabase.client.auth.signOut();
    } catch (e) {
      this.logger.error('[Auth] ログアウトAPI失敗', e);
    } finally {
      // API の成否にかかわらずローカル状態はクリア
      this.zone.run(() => {
        this.userSubject.next(null);
        this.logger.info('[Auth] ログアウト');
        void this.router.navigate(['/login']);
      });
    }
  }

  private async initAuthState(): Promise<void> {
    // getSession() はローカルストレージから読み取り（高速）
    // JWT の実際の検証は Supabase RLS 側で行われる
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();

    if (session?.user) {
      this.userSubject.next({
        id: session.user.id,
        email: session.user.email!,
      });
    }

    this.readySubject.next(true);

    // Listen for auth state changes (subscription を保持して DestroyRef で解除)
    const {
      data: { subscription },
    } = this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.zone.run(() => {
        if (session?.user) {
          this.userSubject.next({
            id: session.user.id,
            email: session.user.email!,
          });
        } else {
          this.userSubject.next(null);
        }
      });
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
