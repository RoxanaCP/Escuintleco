import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, LoginResponse } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('login guarda el token y el usuario en localStorage', () => {
    const respuesta: LoginResponse = {
      token: 'token-xyz',
      username: 'admin',
      nombre: 'Administrador',
      rol: 'ADMIN',
    };

    service.login({ username: 'admin', password: 'admin123' }).subscribe((res) => {
      expect(res.token).toBe('token-xyz');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(respuesta);

    expect(localStorage.getItem('token')).toBe('token-xyz');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('logout limpia el token', () => {
    localStorage.setItem('token', 'algo');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('getUsuario devuelve el usuario guardado', () => {
    const usuario = { token: 't', username: 'admin', nombre: 'Admin', rol: 'ADMIN' };
    localStorage.setItem('usuario', JSON.stringify(usuario));
    expect(service.getUsuario()?.username).toBe('admin');
  });

  it('getUsuario devuelve null si no hay usuario', () => {
    expect(service.getUsuario()).toBeNull();
  });
});
