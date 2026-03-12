import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-month-switcher',
  standalone: true,
  templateUrl: './month-switcher.component.html',
  styleUrl: './month-switcher.component.scss'
})
export class MonthSwitcherComponent {
  @Input({ required: true }) currentMonth = '';
  @Output() readonly previous = new EventEmitter<void>();
  @Output() readonly next = new EventEmitter<void>();
}
