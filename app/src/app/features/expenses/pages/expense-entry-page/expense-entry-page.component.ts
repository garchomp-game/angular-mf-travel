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
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionCardComponent,
    BottomNavComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './expense-entry-page.component.html',
  styleUrl: './expense-entry-page.component.scss',
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
