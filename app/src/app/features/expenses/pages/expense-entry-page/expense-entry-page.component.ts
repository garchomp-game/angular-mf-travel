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
      <header class="flex items-center justify-between">
        <h1>{{ editId ? '経費編集' : '経費入力' }}</h1>
        <div class="flex items-center gap-2">
          <app-theme-toggle />
          <button
            type="button"
            (click)="logout()"
            class="border border-(--color-border) rounded-md bg-(--color-surface) text-(--color-muted) px-3 py-2 text-sm"
          >
            ログアウト
          </button>
        </div>
      </header>

      <app-section-card>
        <form [formGroup]="expenseForm" (ngSubmit)="submit()" class="grid gap-3">
          <label class="grid gap-2">
            日付 *
            <input
              type="date"
              formControlName="date"
              class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"
            />
          </label>

          <label class="grid gap-2">
            訪問先 *
            <input
              type="text"
              formControlName="destination"
              placeholder="例: 大阪本社"
              class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"
            />
          </label>

          <label class="grid gap-2">
            支払先・内容 *
            <input
              type="text"
              formControlName="payerDetail"
              placeholder="例: JR東海 / 新幹線"
              class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"
            />
          </label>

          <label class="flex items-center gap-2 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              formControlName="isRoundTrip"
              class="w-5 h-5 accent-(--color-primary) cursor-pointer"
            />
            <span>往復</span>
          </label>

          <button
            type="button"
            class="rounded-md py-3 bg-(--color-primary) text-white border-none cursor-pointer"
            (click)="toggleDetails()"
            [attr.aria-expanded]="detailsExpanded"
            aria-controls="expense-details-panel"
          >
            {{ detailsExpanded ? '詳細項目を閉じる' : '詳細項目を開く' }}
          </button>

          <section
            id="expense-details-panel"
            class="grid gap-3 p-3 rounded-md border border-dashed border-(--color-border) bg-(--color-primary-soft)"
            [hidden]="!detailsExpanded"
          >
            <label class="grid gap-2">
              経費科目
              <input
                type="text"
                formControlName="category"
                class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"
              />
            </label>
            <label class="grid gap-2">
              税区分
              <input
                type="text"
                formControlName="taxType"
                class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"
              />
            </label>
            <label class="grid gap-2">
              事前申請番号
              <input
                type="text"
                formControlName="preApprovalNumber"
                class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"
              />
            </label>
            <label class="grid gap-2">
              メモ
              <textarea
                rows="4"
                formControlName="memo"
                class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"
              ></textarea>
            </label>
          </section>

          <p class="text-(--color-danger) m-0" *ngIf="expenseForm.invalid && expenseForm.touched">
            必須項目を入力してください。
          </p>
          <p class="text-(--color-danger) m-0" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            [disabled]="saving"
            class="rounded-md py-3 bg-(--color-primary) text-white border-none cursor-pointer disabled:opacity-50"
          >
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
