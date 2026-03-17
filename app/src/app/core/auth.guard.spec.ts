import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { firstValueFrom, map } from 'rxjs';

describe('authGuard', () => {
  let readySubject: BehaviorSubject<boolean>;
  let userSubject: BehaviorSubject<{ id: string; email: string } | null>;

  function setupTestBed(isReady: boolean, user: { id: string; email: string } | null) {
    readySubject = new BehaviorSubject<boolean>(isReady);
    userSubject = new BehaviorSubject<{ id: string; email: string } | null>(user);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: {} as never },
          { path: 'protected', component: {} as never, canActivate: [authGuard] },
        ]),
        {
          provide: AuthService,
          useValue: {
            ready$: readySubject.asObservable(),
            isAuthenticated$: userSubject.pipe(map((u) => !!u)),
            user$: userSubject.asObservable(),
          },
        },
      ],
    });
  }

  it('認証済みの場合 true を返す', async () => {
    setupTestBed(true, { id: 'u1', email: 'a@b.com' });

    const result = await TestBed.runInInjectionContext(() => {
      const guardResult = authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      return firstValueFrom(guardResult as Observable<boolean | UrlTree>);
    });

    expect(result).toBe(true);
  });

  it('未認証の場合 /login への UrlTree を返す', async () => {
    setupTestBed(true, null);

    const result = await TestBed.runInInjectionContext(() => {
      const guardResult = authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      return firstValueFrom(guardResult as Observable<boolean | UrlTree>);
    });

    expect(result).not.toBe(true);
    expect(result instanceof UrlTree).toBe(true);
    const router = TestBed.inject(Router);
    expect((result as UrlTree).toString()).toBe(router.createUrlTree(['/login']).toString());
  });

  it('ready$ が true になるまで待機する', async () => {
    // ready=false で開始
    setupTestBed(false, { id: 'u1', email: 'a@b.com' });

    let resolved = false;
    const promise = TestBed.runInInjectionContext(() => {
      const guardResult = authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      return firstValueFrom(guardResult as Observable<boolean | UrlTree>);
    });

    promise.then(() => {
      resolved = true;
    });

    // まだ resolve されていないはず
    await new Promise((r) => setTimeout(r, 50));
    expect(resolved).toBe(false);

    // ready を true に
    readySubject.next(true);
    const result = await promise;
    expect(result).toBe(true);
  });
});
