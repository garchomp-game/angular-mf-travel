import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  imports: [NgIf],
  template: `
    <section class="card card-border bg-base-200 shadow-sm">
      <div class="card-body p-5">
        <h2 *ngIf="title" class="card-title text-lg">{{ title }}</h2>
        <ng-content />
      </div>
    </section>
  `,
})
export class SectionCardComponent {
  @Input() title = '';
}
