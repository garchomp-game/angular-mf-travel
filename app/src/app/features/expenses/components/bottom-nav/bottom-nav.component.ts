import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="sticky bottom-0 grid grid-cols-2 border border-(--color-border) rounded-xl overflow-hidden bg-(--color-surface) shadow-md"
      aria-label="メインナビゲーション"
    >
      <a
        routerLink="/list"
        routerLinkActive="!bg-(--color-primary-soft) !text-(--color-primary) font-bold"
        class="text-center py-3 no-underline text-(--color-muted)"
        >一覧</a
      >
      <a
        routerLink="/entry"
        routerLinkActive="!bg-(--color-primary-soft) !text-(--color-primary) font-bold"
        class="text-center py-3 no-underline text-(--color-muted)"
        >入力</a
      >
    </nav>
  `,
})
export class BottomNavComponent {}
