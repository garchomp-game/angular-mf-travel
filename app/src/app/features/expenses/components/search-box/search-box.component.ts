import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent {
  query = '';
  @Output() readonly queryChange = new EventEmitter<string>();

  emitQuery(): void {
    this.queryChange.emit(this.query.trim());
  }
}
