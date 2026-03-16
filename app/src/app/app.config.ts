import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/global-error-handler';
import { httpErrorInterceptor } from './core/http-error.interceptor';

registerLocaleData(localeJa);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    { provide: LOCALE_ID, useValue: 'ja' },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    importProvidersFrom(
      LoggerModule.forRoot({
        level: NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.OFF,
        disableConsoleLogging: false,
      }),
    ),
  ],
};
