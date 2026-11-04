import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../services/auth';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['getUsuario', 'logout']);
    authSpy.getUsuario.and.returnValue({
      token: 't',
      username: 'admin',
      nombre: 'Administrador',
      rol: 'ADMIN',
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: AuthService, useValue: authSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('deberia crearse', () => {
    expect(component).toBeTruthy();
  });

  it('carga el usuario de la sesion al iniciar', () => {
    expect(component.usuario.nombre).toBe('Administrador');
    expect(authSpy.getUsuario).toHaveBeenCalled();
  });

  it('el menu incluye las secciones principales', () => {
    const rutas = component.menuItems.map((i) => i.ruta);
    expect(rutas).toContain('/productos');
    expect(rutas).toContain('/venta');
    expect(rutas).toContain('/caja');
    expect(rutas).toContain('/reportes');
  });

  it('logout cierra la sesion y redirige al login', () => {
    component.logout();

    expect(authSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('irA navega a la ruta indicada', () => {
    component.irA('/productos');

    expect(router.navigate).toHaveBeenCalledWith(['/productos']);
  });
});
