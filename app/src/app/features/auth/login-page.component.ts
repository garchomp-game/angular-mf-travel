import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="min-h-dvh flex items-center justify-center bg-(--color-bg) p-4">
      <div class="w-full max-w-md bg-(--color-surface) rounded-xl shadow-md border border-(--color-border) p-6">
        <h1 class="text-2xl font-bold text-center mb-6">経費精算</h1>

        <!-- Tab switcher -->
        <div class="grid grid-cols-2 mb-6 border border-(--color-border) rounded-lg overflow-hidden">
          <button type="button"
                  (click)="isSignUp = false"
                  [class]="isSignUp ? 'py-2 text-(--color-muted) bg-(--color-surface)' : 'py-2 bg-(--color-primary-soft) text-(--color-primary) font-bold'">
            ログイン
          </button>
          <button type="button"
                  (click)="isSignUp = true"
                  [class]="!isSignUp ? 'py-2 text-(--color-muted) bg-(--color-surface)' : 'py-2 bg-(--color-primary-soft) text-(--color-primary) font-bold'">
            新規登録
          </button>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="submit()" class="grid gap-4">
          <label class="grid gap-1">
            <span class="text-sm text-(--color-muted)">メールアドレス</span>
            <input type="email" formControlName="email" placeholder="user@example.com" autocomplete="email"
                   class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
          </label>

          <label class="grid gap-1">
            <span class="text-sm text-(--color-muted)">パスワード</span>
            <input type="password" formControlName="password" placeholder="6文字以上" autocomplete="current-password"
                   class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
          </label>

          <p *ngIf="errorMessage" class="text-(--color-danger) text-sm m-0">{{ errorMessage }}</p>
          <p *ngIf="successMessage" class="text-green-600 text-sm m-0">{{ successMessage }}</p>

          <button type="submit" [disabled]="loading"
                  class="rounded-md py-3 bg-(--color-primary) text-white border-none cursor-pointer disabled:opacity-50">
            {{ loading ? '処理中...' : (isSignUp ? '登録' : 'ログイン') }}
          </button>
        </form>
      </div>
    </main>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  isSignUp = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      this.errorMessage = 'メールアドレスとパスワード（6文字以上）を入力してください';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.loginForm.controls.email.value!;
    const password = this.loginForm.controls.password.value!;

    const result = this.isSignUp
      ? await this.auth.signUp(email, password)
      : await this.auth.signIn(email, password);

    this.loading = false;

    if (!result.success) {
      this.errorMessage = result.error ?? '不明なエラーが発生しました';
      this.cdr.detectChanges();
      return;
    }

    if (this.isSignUp) {
      this.successMessage = '登録が完了しました。ログインしてください。';
      this.isSignUp = false;
      this.cdr.detectChanges();
      return;
    }

    this.cdr.detectChanges();
    void this.router.navigate(['/list']);
  }
}
