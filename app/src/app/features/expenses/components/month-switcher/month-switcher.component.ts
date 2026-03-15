import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-month-switcher',
  template: `
    <div class="flex items-center justify-between gap-3">
      <button type="button" (click)="previous.emit()" aria-label="前月"
              class="w-8 h-8 border border-(--color-border) rounded-sm bg-(--color-surface) text-(--color-text)">◀</button>
      <strong>{{ currentMonth }}</strong>
      <button type="button" (click)="next.emit()" aria-label="翌月"
              class="w-8 h-8 border border-(--color-border) rounded-sm bg-(--color-surface) text-(--color-text)">▶</button>
    </div>
  `,
})
export class MonthSwitcherComponent {
  @Input({ required: true }) currentMonth = '';
  @Output() readonly previous = new EventEmitter<void>();
  @Output() readonly next = new EventEmitter<void>();
}
