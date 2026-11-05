import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  const ejecutarGuard = () =>
    TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  it('permite el acceso si el usuario esta autenticado', () => {
    authSpy.isLoggedIn.and.returnValue(true);

    expect(ejecutarGuard()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('bloquea el acceso y redirige al login si no hay sesion', () => {
    authSpy.isLoggedIn.and.returnValue(false);

    expect(ejecutarGuard()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
