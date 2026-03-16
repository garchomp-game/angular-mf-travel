import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map, switchMap, take } from 'rxjs/operators';

/**
 * Auth guard: waits for the AuthService to initialize (getSession() resolve)
 * before checking authentication status.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ready$.pipe(
    filter((ready) => ready), // Wait until auth state is resolved
    take(1),
    switchMap(() => auth.isAuthenticated$),
    take(1),
    map((isAuth) => {
      if (isAuth) return true;
      return router.createUrlTree(['/login']);
    }),
  );
};
