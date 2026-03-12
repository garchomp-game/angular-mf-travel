import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import createDebug from 'debug';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly uiDebug = createDebug('app:ui');

  constructor(private readonly logger: NGXLogger) {}

  info(message: string, payload?: unknown): void {
    this.logger.info(message, payload);
    this.uiDebug(message, payload);
  }

  warn(message: string, payload?: unknown): void {
    this.logger.warn(message, payload);
    this.uiDebug('WARN:', message, payload);
  }

  error(message: string, payload?: unknown): void {
    this.logger.error(message, payload);
    this.uiDebug('ERROR:', message, payload);
  }
}
