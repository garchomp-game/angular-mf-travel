import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      background: var(--color-bg);
      color: var(--color-text);
      /* プレミアムな動的背景（擬似要素でオーブを追加） */
      position: relative;
    }
    :host::before,
    :host::after {
      content: '';
      position: fixed;
      border-radius: 50%;
      filter: blur(100px);
      z-index: -1;
      opacity: 0.5;
      pointer-events: none;
    }
    :host::before {
      top: -10%;
      left: -10%;
      width: 50vw;
      height: 50vw;
      background: var(--color-primary-soft);
    }
    :host::after {
      bottom: -10%;
      right: -10%;
      width: 60vw;
      height: 60vw;
      background: rgba(139, 92, 246, 0.1); /* 紫系のアクセント光 */
    }
  `,
})
export class App {}
