import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeToggleComponent } from '../expenses/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, ThemeToggleComponent],
  template: `
    <main class="min-h-dvh flex items-center justify-center p-4">
      <div class="card card-border bg-base-200 shadow-xl w-full max-w-md">
        <div class="card-body">
          <div class="flex items-center justify-between mb-2">
            <h1 class="card-title text-2xl">経費精算</h1>
            <app-theme-toggle />
          </div>

          <!-- Tab switcher -->
          <div role="tablist" class="tabs tabs-box mb-4">
            <button
              type="button"
              role="tab"
              (click)="isSignUp = false"
              [class.tab-active]="!isSignUp"
              class="tab"
            >
              ログイン
            </button>
            <button
              type="button"
              role="tab"
              (click)="isSignUp = true"
              [class.tab-active]="isSignUp"
              class="tab"
            >
              新規登録
            </button>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="submit()" class="grid gap-4">
            <label class="floating-label">
              <span>メールアドレス</span>
              <input
                type="email"
                formControlName="email"
                placeholder="user@example.com"
                autocomplete="email"
                class="input input-bordered w-full"
              />
            </label>

            <label class="floating-label">
              <span>パスワード</span>
              <input
                type="password"
                formControlName="password"
                placeholder="6文字以上"
                autocomplete="current-password"
                class="input input-bordered w-full"
              />
            </label>

            <p *ngIf="errorMessage" class="text-error text-sm m-0">{{ errorMessage }}</p>
            <p *ngIf="successMessage" class="text-success text-sm m-0">{{ successMessage }}</p>

            <button type="submit" [disabled]="loading" class="btn btn-primary w-full">
              {{ loading ? '処理中...' : isSignUp ? '登録' : 'ログイン' }}
            </button>
          </form>
        </div>
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

    this.cdr.detectChanges();
    void this.router.navigate(['/list']);
  }
}
