import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  imports: [NgIf],
  template: `
    <section class="p-5 glass-panel">
      <h2 *ngIf="title" class="m-0 mb-4 text-lg font-semibold tracking-wide">{{ title }}</h2>
      <ng-content />
    </section>
  `,
})
export class SectionCardComponent {
  @Input() title = '';
}
