import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot({
          level: NgxLoggerLevel.TRACE,
          disableConsoleLogging: true,
        }),
      ],
    });

    service = TestBed.inject(LoggerService);
  });

  it('info() が例外をスローせずに動作する', () => {
    expect(() => service.info('test message', { key: 'val' })).not.toThrow();
  });

  it('warn() が例外をスローせずに動作する', () => {
    expect(() => service.warn('warning message', { detail: 123 })).not.toThrow();
  });

  it('error() が例外をスローせずに動作する', () => {
    expect(() => service.error('error message', new Error('boom'))).not.toThrow();
  });

  it('payload なしでも info/warn/error が正常に動作する', () => {
    expect(() => service.info('no payload')).not.toThrow();
    expect(() => service.warn('no payload')).not.toThrow();
    expect(() => service.error('no payload')).not.toThrow();
  });

  it('NGXLogger のメソッドが呼ばれる', () => {
    // Access internal logger via any to spy on it
    const internalLogger = (
      service as unknown as { logger: { info: unknown; warn: unknown; error: unknown } }
    ).logger;
    const infoSpy = vi.spyOn(internalLogger, 'info' as never);
    const warnSpy = vi.spyOn(internalLogger, 'warn' as never);
    const errorSpy = vi.spyOn(internalLogger, 'error' as never);

    service.info('msg1', 'p1');
    service.warn('msg2', 'p2');
    service.error('msg3', 'p3');

    expect(infoSpy).toHaveBeenCalledWith('msg1', 'p1');
    expect(warnSpy).toHaveBeenCalledWith('msg2', 'p2');
    expect(errorSpy).toHaveBeenCalledWith('msg3', 'p3');
  });
});
