import { NgIf } from "@angular/common";
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss'
})
export class SectionCardComponent {
  @Input() title = '';
}
