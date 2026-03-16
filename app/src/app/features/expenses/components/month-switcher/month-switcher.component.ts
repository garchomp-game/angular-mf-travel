import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-month-switcher',
  template: `
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        (click)="previous.emit()"
        aria-label="前月"
        class="action-btn flex items-center justify-center w-10 h-10 border border-(--color-border) rounded-full bg-black/10 backdrop-blur-md text-(--color-text) hover:bg-black/20"
      >
        <span class="text-lg">◀</span>
      </button>
      <strong class="text-xl tracking-wider font-mono">{{ currentMonth }}</strong>
      <button
        type="button"
        (click)="next.emit()"
        aria-label="翌月"
        class="action-btn flex items-center justify-center w-10 h-10 border border-(--color-border) rounded-full bg-black/10 backdrop-blur-md text-(--color-text) hover:bg-black/20"
      >
        <span class="text-lg">▶</span>
      </button>
    </div>
  `,
})
export class MonthSwitcherComponent {
  @Input({ required: true }) currentMonth = '';
  @Output() readonly previous = new EventEmitter<void>();
  @Output() readonly next = new EventEmitter<void>();
}
