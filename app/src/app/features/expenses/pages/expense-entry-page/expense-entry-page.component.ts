import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { SectionCardComponent } from '../../components/section-card/section-card.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-expense-entry-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionCardComponent, BottomNavComponent, ThemeToggleComponent],
  templateUrl: './expense-entry-page.component.html',
  styleUrl: './expense-entry-page.component.scss'
})
export class ExpenseEntryPageComponent {
  private readonly fb = inject(FormBuilder);

  detailsExpanded = false;

  readonly expenseForm = this.fb.group({
    date: ['', Validators.required],
    destination: ['', Validators.required],
    payerDetail: ['', Validators.required],
    category: [''],
    taxType: [''],
    preApprovalNumber: [''],
    memo: [''],
    saveTemplate: [false]
  });


  toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
  }

  submit(): void {
    this.expenseForm.markAllAsTouched();
    if (this.expenseForm.invalid) {
      return;
    }

    console.info('submitted', this.expenseForm.value);
  }
}
