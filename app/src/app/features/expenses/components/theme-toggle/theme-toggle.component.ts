import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';

const THEME_STORAGE_KEY = 'expenses-theme';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button type="button" (click)="toggleTheme()"
            class="border border-(--color-border) rounded-md bg-(--color-surface) text-(--color-text) px-3 py-2">
      {{ isDark ? 'ライトテーマ' : 'ダークテーマ' }}
    </button>
  `,
})
export class ThemeToggleComponent implements OnInit {
  isDark = false;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    this.isDark = localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    this.applyThemeClass();
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem(THEME_STORAGE_KEY, this.isDark ? 'dark' : 'light');
    this.applyThemeClass();
  }

  private applyThemeClass(): void {
    this.document.body.classList.toggle('theme-dark', this.isDark);
  }
}
