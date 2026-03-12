import { Component } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent {
  isDark = false;

  toggleTheme(): void {
    this.isDark = !this.isDark;
    document.body.classList.toggle('theme-dark', this.isDark);
  }
}
