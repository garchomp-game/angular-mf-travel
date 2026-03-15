import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from './supabase.client';
import { LoggerService } from './logger.service';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly readySubject = new BehaviorSubject<boolean>(false);

  readonly user$: Observable<User | null> = this.userSubject.asObservable();
  readonly isAuthenticated$ = this.user$.pipe(map((u) => !!u));
  readonly ready$ = this.readySubject.asObservable();

  constructor() {
    this.initAuthState();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isReady(): boolean {
    return this.readySubject.value;
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      return { success: false, error: 'Supabase が設定されていません' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      this.logger.warn('[Auth] ログイン失敗', { email, error: error.message });
      return { success: false, error: this.translateError(error) };
    }

    this.userSubject.next(data.user);
    this.logger.info('[Auth] ログイン成功', { userId: data.user.id });
    return { success: true };
  }

  async signUp(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      return { success: false, error: 'Supabase が設定されていません' };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      this.logger.warn('[Auth] 登録失敗', { email, error: error.message });
      return { success: false, error: this.translateError(error) };
    }

    this.userSubject.next(data.user);
    this.logger.info('[Auth] 登録成功', { userId: data.user?.id });
    return { success: true };
  }

  async signOut(): Promise<void> {
    if (!supabase) return;

    await supabase.auth.signOut();
    this.zone.run(() => {
      this.userSubject.next(null);
      this.logger.info('[Auth] ログアウト');
      void this.router.navigate(['/login']);
    });
  }

  private initAuthState(): void {
    if (!supabase) {
      this.readySubject.next(true);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      this.zone.run(() => {
        this.userSubject.next(data.session?.user ?? null);
        this.readySubject.next(true);
      });
    });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this.zone.run(() => {
        this.userSubject.next(session?.user ?? null);
        if (!this.readySubject.value) {
          this.readySubject.next(true);
        }
      });
    });
  }

  private translateError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'メールアドレスまたはパスワードが正しくありません';
      case 'User already registered':
        return 'このメールアドレスは既に登録されています';
      case 'Password should be at least 6 characters':
        return 'パスワードは6文字以上で入力してください';
      default:
        return error.message;
    }
  }
}
