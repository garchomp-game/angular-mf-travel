import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';

const THEME_STORAGE_KEY = 'expenses-theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
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
