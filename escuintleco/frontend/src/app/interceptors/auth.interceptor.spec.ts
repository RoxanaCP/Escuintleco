import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('agrega el header Authorization cuando hay token', () => {
    authSpy.getToken.and.returnValue('token-abc');

    http.get('/api/prueba').subscribe();

    const req = httpMock.expectOne('/api/prueba');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush({});
  });

  it('no agrega el header Authorization cuando no hay token', () => {
    authSpy.getToken.and.returnValue(null);

    http.get('/api/prueba').subscribe();

    const req = httpMock.expectOne('/api/prueba');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
