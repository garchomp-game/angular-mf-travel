import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

export interface AppConfig {
  apiBaseUrl: string;
}

/**
 * Runtime application configuration via InjectionToken.
 *
 * Values are read from window.__APP_CONFIG__ or fall back to
 * the Angular dev server proxy (/api → localhost:3000).
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => {
    const runtimeConfig = window.__APP_CONFIG__ ?? {};
    return {
      apiBaseUrl: runtimeConfig.apiBaseUrl ?? '/api',
    };
  },
});
