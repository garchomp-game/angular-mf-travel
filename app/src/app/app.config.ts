import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';

import { routes } from './app.routes';

registerLocaleData(localeJa);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'ja' },
    importProvidersFrom(
      LoggerModule.forRoot({
        level: NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.OFF,
        disableConsoleLogging: false
      })
    )
  ]
};
