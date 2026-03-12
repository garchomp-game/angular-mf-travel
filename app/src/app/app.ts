import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoggerService } from './core/logger.service';
import { appConfig } from './core/app-config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'Angular + Supabase (Bun)';

  protected readonly supabaseConfigured =
    appConfig.supabaseUrl.length > 0 && appConfig.supabaseAnonKey.length > 0;

  constructor(private readonly logger: LoggerService) {}

  protected runDryRunLog(level: 'info' | 'warn' | 'error'): void {
    const payload = {
      at: new Date().toISOString(),
      supabaseConfigured: this.supabaseConfigured
    };

    if (level === 'warn') {
      this.logger.warn('Dry-run warning log', payload);
      return;
    }

    if (level === 'error') {
      this.logger.error('Dry-run error log', payload);
      return;
    }

    this.logger.info('Dry-run info log', payload);
  }
}
