import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/global-error-handler';
import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localeJa);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'ja' },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    importProvidersFrom(
      LoggerModule.forRoot({
        level: environment.production ? NgxLoggerLevel.ERROR : NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.OFF,
        disableConsoleLogging: environment.production,
      }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
