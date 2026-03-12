import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ExpenseItem {
  date: string;
  destination: string;
  detail: string;
  payer: string;
  amount: number;
  category?: string;
}

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, NgIf],
  templateUrl: './expense-card.component.html',
  styleUrl: './expense-card.component.scss'
})
export class ExpenseCardComponent {
  @Input({ required: true }) expense!: ExpenseItem;
}
