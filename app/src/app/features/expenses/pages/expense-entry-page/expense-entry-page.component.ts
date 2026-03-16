import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseSupabaseService } from '../../data/expense-supabase.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../../core/auth.service';

const DETAIL_PANEL_STORAGE_KEY = 'expense-entry-details-expanded';

@Component({
  selector: 'app-expense-entry-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionCardComponent,
    BottomNavComponent,
    ThemeToggleComponent,
  ],
  template: `
    <main class="max-w-[720px] mx-auto p-4 grid gap-4">
      <div class="navbar bg-base-200 rounded-box shadow-sm border border-base-300">
        <div class="navbar-start">
          <h1 class="text-xl font-bold px-2">{{ editId ? '経費編集' : '経費入力' }}</h1>
        </div>
        <div class="navbar-end gap-2">
          <app-theme-toggle />
          <button type="button" (click)="logout()" class="btn btn-outline btn-sm">
            ログアウト
          </button>
        </div>
      </div>

      <app-section-card>
        <form [formGroup]="expenseForm" (ngSubmit)="submit()" class="grid gap-4">
          <label class="floating-label">
            <span>日付 *</span>
            <input type="date" formControlName="date" class="input input-bordered w-full" />
          </label>

          <label class="floating-label">
            <span>訪問先 *</span>
            <input
              type="text"
              formControlName="destination"
              placeholder="例: 大阪本社"
              class="input input-bordered w-full"
            />
          </label>

          <label class="floating-label">
            <span>支払先・内容 *</span>
            <input
              type="text"
              formControlName="payerDetail"
              placeholder="例: JR東海 / 新幹線"
              class="input input-bordered w-full"
            />
          </label>

          <label class="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              formControlName="isRoundTrip"
              class="checkbox checkbox-primary"
            />
            <span class="label-text">往復</span>
          </label>

          <!-- 詳細項目 collapse -->
          <div class="collapse collapse-arrow bg-base-300 rounded-box">
            <input
              type="checkbox"
              [checked]="detailsExpanded"
              (change)="toggleDetails()"
              aria-controls="expense-details-panel"
            />
            <div class="collapse-title font-medium">詳細項目</div>
            <div class="collapse-content" id="expense-details-panel">
              <div class="grid gap-3 pt-2">
                <label class="floating-label">
                  <span>経費科目</span>
                  <input
                    type="text"
                    formControlName="category"
                    class="input input-bordered w-full"
                  />
                </label>
                <label class="floating-label">
                  <span>税区分</span>
                  <input
                    type="text"
                    formControlName="taxType"
                    class="input input-bordered w-full"
                  />
                </label>
                <label class="floating-label">
                  <span>事前申請番号</span>
                  <input
                    type="text"
                    formControlName="preApprovalNumber"
                    class="input input-bordered w-full"
                  />
                </label>
                <label class="floating-label">
                  <span>メモ</span>
                  <textarea
                    rows="4"
                    formControlName="memo"
                    class="textarea textarea-bordered w-full"
                  ></textarea>
                </label>
              </div>
            </div>
          </div>

          <p class="text-error m-0" *ngIf="expenseForm.invalid && expenseForm.touched">
            必須項目を入力してください。
          </p>
          <p class="text-error m-0" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <button type="submit" [disabled]="saving" class="btn btn-primary btn-lg w-full">
            {{ saving ? '保存中...' : editId ? '更新' : '保存' }}
          </button>
        </form>
      </app-section-card>

      <app-bottom-nav />
    </main>
  `,
})
export class ExpenseEntryPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expenseService = inject(ExpenseSupabaseService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  detailsExpanded = false;
  editId: string | null = null;
  saving = false;
  errorMessage = '';

  readonly expenseForm = this.fb.group({
    date: ['', Validators.required],
    destination: ['', Validators.required],
    payerDetail: ['', Validators.required],
    isRoundTrip: [false],
    category: [''],
    taxType: [''],
    preApprovalNumber: [''],
    memo: [''],
  });

  async ngOnInit(): Promise<void> {
    this.detailsExpanded = localStorage.getItem(DETAIL_PANEL_STORAGE_KEY) === 'true';

    const editId = this.route.snapshot.queryParamMap.get('edit');
    if (!editId) return;

    const target = await this.expenseService.findById(editId);
    if (!target) return;

    this.editId = target.id;
    this.expenseForm.patchValue({
      date: target.date,
      destination: target.destination,
      payerDetail: target.payerDetail,
      isRoundTrip: target.isRoundTrip,
      category: target.category ?? '',
      taxType: target.taxType ?? '',
      preApprovalNumber: target.preApprovalNumber ?? '',
      memo: target.memo ?? '',
    });
    this.detailsExpanded = true;
    this.cdr.detectChanges();
  }

  toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
    localStorage.setItem(DETAIL_PANEL_STORAGE_KEY, `${this.detailsExpanded}`);
  }

  async submit(): Promise<void> {
    this.expenseForm.markAllAsTouched();
    if (this.expenseForm.invalid) return;

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      date: this.expenseForm.controls.date.value ?? '',
      destination: this.expenseForm.controls.destination.value ?? '',
      payerDetail: this.expenseForm.controls.payerDetail.value ?? '',
      isRoundTrip: this.expenseForm.controls.isRoundTrip.value ?? false,
      category: this.expenseForm.controls.category.value ?? '',
      taxType: this.expenseForm.controls.taxType.value ?? '',
      preApprovalNumber: this.expenseForm.controls.preApprovalNumber.value ?? '',
      memo: this.expenseForm.controls.memo.value ?? '',
    };

    const result = await this.expenseService.save(payload, this.editId ?? undefined);
    this.saving = false;

    if (!result) {
      this.errorMessage = '保存に失敗しました。再度お試しください。';
      this.cdr.detectChanges();
      return;
    }

    this.zone.run(() => {
      this.saving = false;
      this.cdr.detectChanges();
      void this.router.navigate(['/list'], {
        queryParams: { status: this.editId ? 'updated' : 'saved' },
      });
    });
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
