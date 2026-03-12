import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ExpenseRecord } from '../../data/expense-store.service';

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, NgIf],
  templateUrl: './expense-card.component.html',
  styleUrl: './expense-card.component.scss',
})
export class ExpenseCardComponent {
  @Input({ required: true }) expense!: ExpenseRecord;
}
