import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Floating Pill Navigation -->
    <div class="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50">
      <nav
        class="flex gap-2 p-1.5 pointer-events-auto border border-(--color-glass-border) rounded-full shadow-2xl glass-panel"
        aria-label="メインナビゲーション"
      >
        <a
          routerLink="/list"
          routerLinkActive="bg-(--color-primary) text-white font-medium shadow-md"
          class="flex items-center justify-center w-24 py-2.5 rounded-full no-underline text-(--color-text) transition-all duration-300"
          >💳 一覧</a
        >
        <a
          routerLink="/entry"
          routerLinkActive="bg-(--color-primary) text-white font-medium shadow-md"
          class="flex items-center justify-center w-24 py-2.5 rounded-full no-underline text-(--color-text) transition-all duration-300"
          >✏️ 入力</a
        >
      </nav>
    </div>
    <!-- Add padding to bottom so content isn't hidden behind floating nav -->
    <div class="h-20"></div>
  `,
})
export class BottomNavComponent {}
