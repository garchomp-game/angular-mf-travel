import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler';
import { LoggerService } from './logger.service';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let loggerSpy: { error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    loggerSpy = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: LoggerService, useValue: loggerSpy }],
    });

    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('Error オブジェクトを受けた場合に message と stack を含めて logger.error を呼ぶ', () => {
    const err = new Error('test error');

    handler.handleError(err);

    expect(loggerSpy.error).toHaveBeenCalledTimes(1);
    const [msg, payload] = loggerSpy.error.mock.calls[0];
    expect(msg).toContain('test error');
    expect(payload).toEqual({ error: err, stack: err.stack });
  });

  it('文字列エラーを受けた場合に String(error) で logger.error を呼ぶ', () => {
    handler.handleError('string error');

    expect(loggerSpy.error).toHaveBeenCalledTimes(1);
    const [msg, payload] = loggerSpy.error.mock.calls[0];
    expect(msg).toContain('string error');
    expect(payload).toEqual({ error: 'string error', stack: undefined });
  });

  it('未知のオブジェクトが来ても例外をスローしない', () => {
    expect(() => handler.handleError({ code: 42 })).not.toThrow();
    expect(loggerSpy.error).toHaveBeenCalledTimes(1);
  });

  it('null / undefined でも例外をスローしない', () => {
    expect(() => handler.handleError(null)).not.toThrow();
    expect(() => handler.handleError(undefined)).not.toThrow();
    expect(loggerSpy.error).toHaveBeenCalledTimes(2);
  });
});
