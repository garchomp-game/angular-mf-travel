import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  imports: [NgIf],
  template: `
    <section class="p-4 rounded-lg bg-(--color-surface) shadow-sm border border-(--color-border)">
      <h2 *ngIf="title" class="m-0 mb-3 text-base">{{ title }}</h2>
      <ng-content />
    </section>
  `,
})
export class SectionCardComponent {
  @Input() title = '';
}
