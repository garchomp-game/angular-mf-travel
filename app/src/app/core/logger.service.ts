import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  constructor(private readonly logger: NGXLogger) {}

  info(message: string, payload?: unknown): void {
    this.logger.info(message, payload);
  }

  warn(message: string, payload?: unknown): void {
    this.logger.warn(message, payload);
  }

  error(message: string, payload?: unknown): void {
    this.logger.error(message, payload);
  }
}
