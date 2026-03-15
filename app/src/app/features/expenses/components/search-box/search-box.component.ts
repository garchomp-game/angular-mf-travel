import { Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-box',
  imports: [ReactiveFormsModule],
  template: `
    <label class="flex flex-col gap-2">
      <span>検索</span>
      <input
        type="search"
        [formControl]="searchControl"
        placeholder="訪問先・内容で検索"
        aria-label="経費検索"
        class="border border-(--color-border) rounded-md px-3 py-2 bg-(--color-surface) text-(--color-text)"
      />
    </label>
  `,
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
