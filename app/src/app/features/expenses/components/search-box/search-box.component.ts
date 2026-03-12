import { Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly queryChange = new EventEmitter<string>();

  readonly searchControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.queryChange.emit(value.trim());
      });
  }
}
