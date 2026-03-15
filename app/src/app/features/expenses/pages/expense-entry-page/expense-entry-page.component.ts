import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseStoreService } from '../../data/expense-store.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

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
        <app-theme-toggle />
      </header>

      <app-section-card>
        <form [formGroup]="expenseForm" (ngSubmit)="submit()" class="grid gap-3">
          <label class="grid gap-2">
            日付 *
            <input type="date" formControlName="date"
                   class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
          </label>

          <label class="grid gap-2">
            訪問先 *
            <input type="text" formControlName="destination" placeholder="例: 大阪本社"
                   class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
          </label>

          <label class="grid gap-2">
            支払先・内容 *
            <input type="text" formControlName="payerDetail" placeholder="例: JR東海 / 新幹線往復"
                   class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
          </label>

          <label class="grid gap-2">
            金額 *
            <input type="number" min="1" formControlName="amount" placeholder="例: 1200"
                   class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
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
              <input type="text" formControlName="category"
                     class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
            </label>
            <label class="grid gap-2">
              税区分
              <input type="text" formControlName="taxType"
                     class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
            </label>
            <label class="grid gap-2">
              事前申請番号
              <input type="text" formControlName="preApprovalNumber"
                     class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)" />
            </label>
            <label class="grid gap-2">
              メモ
              <textarea rows="4" formControlName="memo"
                        class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-bg) text-(--color-text)"></textarea>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" formControlName="saveTemplate" />
              テンプレートとして保存する
            </label>
          </section>

          <p class="text-(--color-danger) m-0" *ngIf="expenseForm.invalid && expenseForm.touched">
            必須項目を入力してください。
          </p>
          <button type="submit" class="rounded-md py-3 bg-(--color-primary) text-white border-none cursor-pointer">{{ editId ? '更新' : '保存' }}</button>
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
  private readonly expenseStore = inject(ExpenseStoreService);

  detailsExpanded = false;
  editId: string | null = null;
  notice = '';

  readonly expenseForm = this.fb.group({
    date: ['', Validators.required],
    destination: ['', Validators.required],
    payerDetail: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    category: [''],
    taxType: [''],
    preApprovalNumber: [''],
    memo: [''],
    saveTemplate: [false],
  });

  ngOnInit(): void {
    this.detailsExpanded = localStorage.getItem(DETAIL_PANEL_STORAGE_KEY) === 'true';

    const editId = this.route.snapshot.queryParamMap.get('edit');
    if (!editId) {
      return;
    }

    const target = this.expenseStore.findById(editId);
    if (!target) {
      return;
    }

    this.editId = target.id;
    this.expenseForm.patchValue({
      date: target.date,
      destination: target.destination,
      payerDetail: target.payerDetail,
      amount: target.amount,
      category: target.category ?? '',
      taxType: target.taxType ?? '',
      preApprovalNumber: target.preApprovalNumber ?? '',
      memo: target.memo ?? '',
    });
    this.detailsExpanded = true;
  }

  toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
    localStorage.setItem(DETAIL_PANEL_STORAGE_KEY, `${this.detailsExpanded}`);
  }

  submit(): void {
    this.expenseForm.markAllAsTouched();
    if (this.expenseForm.invalid) {
      return;
    }

    const payload = {
      date: this.expenseForm.controls.date.value ?? '',
      destination: this.expenseForm.controls.destination.value ?? '',
      payerDetail: this.expenseForm.controls.payerDetail.value ?? '',
      amount: Number(this.expenseForm.controls.amount.value ?? 0),
      category: this.expenseForm.controls.category.value ?? '',
      taxType: this.expenseForm.controls.taxType.value ?? '',
      preApprovalNumber: this.expenseForm.controls.preApprovalNumber.value ?? '',
      memo: this.expenseForm.controls.memo.value ?? '',
    };

    this.expenseStore.save(payload, this.editId ?? undefined);
    this.notice = this.editId ? '明細を更新しました。' : '明細を保存しました。';
    void this.router.navigate(['/list'], {
      queryParams: { status: this.editId ? 'updated' : 'saved' },
    });
  }
}
