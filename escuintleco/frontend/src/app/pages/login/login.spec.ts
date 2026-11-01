import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crearse', () => {
    expect(component).toBeTruthy();
  });

  it('muestra error si faltan usuario o contraseña', () => {
    component.username = '';
    component.password = '';
    component.login();
    expect(component.error).toBe('Ingresa usuario y contraseña');
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('invoca authService.login con credenciales validas', () => {
    authSpy.login.and.returnValue(of({ token: 't', username: 'admin', nombre: 'Admin', rol: 'ADMIN' }));
    component.username = 'admin';
    component.password = 'admin123';
    component.login();
    expect(authSpy.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' });
  });

  it('muestra error si el login falla', () => {
    authSpy.login.and.returnValue(throwError(() => new Error('401')));
    component.username = 'admin';
    component.password = 'mala';
    component.login();
    expect(component.error).toBe('Usuario o contraseña incorrectos');
    expect(component.loading).toBeFalse();
  });
});
