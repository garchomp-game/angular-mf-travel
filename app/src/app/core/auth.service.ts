import { Injectable, inject, NgZone } from '@angular/core';
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
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly supabase = inject(SupabaseService);

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
    });

    if (error || !data.user) {
      const message = error?.message ?? '登録に失敗しました';
      this.logger.warn('[Auth] 登録失敗', { email, error: message });
      return { success: false, error: message };
    }

    this.zone.run(() => {
      this.userSubject.next({ id: data.user!.id, email: data.user!.email! });
    });
    this.logger.info('[Auth] 登録成功', { userId: data.user.id });
    return { success: true };
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.zone.run(() => {
      this.userSubject.next(null);
      this.logger.info('[Auth] ログアウト');
      void this.router.navigate(['/login']);
    });
  }

  private async initAuthState(): Promise<void> {
    // Check existing session
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

    // Listen for auth state changes
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
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
  }
}
