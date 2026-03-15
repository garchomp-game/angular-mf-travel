import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from './logger.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const context = {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
      };

      if (error.status === 0) {
        logger.error('[HTTP] ネットワークエラー: サーバーに接続できません', context);
      } else if (error.status === 401) {
        logger.warn('[HTTP] 認証エラー (401): セッションが期限切れです', context);
        // TODO: Supabase Auth 統合後にログアウト処理を追加
      } else if (error.status >= 400 && error.status < 500) {
        logger.warn(`[HTTP] クライアントエラー (${error.status})`, context);
      } else if (error.status >= 500) {
        logger.error(`[HTTP] サーバーエラー (${error.status})`, context);
      }

      return throwError(() => error);
    }),
  );
};
