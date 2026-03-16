import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoggerService } from './logger.service';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly api = inject(ApiService);

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
    try {
      const res = await this.api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      this.api.token = res.token;
      this.userSubject.next(res.user);
      this.logger.info('[Auth] ログイン成功', { userId: res.user.id });
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ログインに失敗しました';
      this.logger.warn('[Auth] ログイン失敗', { email, error: message });
      return { success: false, error: message };
    }
  }

  async signUp(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await this.api.post<AuthResponse>('/auth/register', {
        email,
        password,
      });
      this.api.token = res.token;
      this.userSubject.next(res.user);
      this.logger.info('[Auth] 登録成功', { userId: res.user.id });
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : '登録に失敗しました';
      this.logger.warn('[Auth] 登録失敗', { email, error: message });
      return { success: false, error: message };
    }
  }

  async signOut(): Promise<void> {
    this.api.token = null;
    this.zone.run(() => {
      this.userSubject.next(null);
      this.logger.info('[Auth] ログアウト');
      void this.router.navigate(['/login']);
    });
  }

  private initAuthState(): void {
    // If we have a stored token, decode user info from JWT payload
    const token = this.api.token;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check expiry
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          this.userSubject.next({ id: payload.sub, email: payload.email });
        } else {
          this.api.token = null;
        }
      } catch {
        this.api.token = null;
      }
    }
    this.readySubject.next(true);
  }
}
