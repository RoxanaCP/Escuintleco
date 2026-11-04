import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CajaComponent } from './caja';
import { CajaService, CorteCaja } from '../../services/caja';

describe('CajaComponent', () => {
  let component: CajaComponent;
  let fixture: ComponentFixture<CajaComponent>;
  let cajaSpy: jasmine.SpyObj<CajaService>;

  const corte: CorteCaja = {
    fecha: '2026-11-01',
    montoApertura: 200,
    totalVentas: 125,
    numeroTransacciones: 3,
    totalEnCaja: 325,
  };

  beforeEach(async () => {
    cajaSpy = jasmine.createSpyObj('CajaService', ['abrir', 'cerrar', 'corte']);
    cajaSpy.corte.and.returnValue(of(corte));

    await TestBed.configureTestingModule({
      imports: [CajaComponent],
      providers: [{ provide: CajaService, useValue: cajaSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('al iniciar carga el corte del dia', () => {
    expect(cajaSpy.corte).toHaveBeenCalled();
    expect(component.corte?.totalEnCaja).toBe(325);
  });

  it('abrirCaja muestra mensaje de exito y recarga el corte', () => {
    cajaSpy.abrir.and.returnValue(of({}));
    component.montoApertura = 800;

    component.abrirCaja();

    expect(cajaSpy.abrir).toHaveBeenCalledWith(800);
    expect(component.mensaje).toContain('800');
    expect(component.error).toBe('');
    expect(cajaSpy.corte).toHaveBeenCalledTimes(2);
  });

  it('abrirCaja muestra el error del servidor si falla', () => {
    cajaSpy.abrir.and.returnValue(throwError(() => ({ error: { message: 'Caja ya abierta' } })));

    component.abrirCaja();

    expect(component.error).toBe('Caja ya abierta');
    expect(component.mensaje).toBe('');
  });

  it('abrirCaja usa un mensaje generico si el error no trae detalle', () => {
    cajaSpy.abrir.and.returnValue(throwError(() => ({})));

    component.abrirCaja();

    expect(component.error).toBe('Error al abrir caja');
  });

  it('cerrarCaja muestra el monto final y recarga el corte', () => {
    cajaSpy.cerrar.and.returnValue(of({ montoCierre: 650.5 }));

    component.cerrarCaja();

    expect(component.mensaje).toContain('650.5');
    expect(cajaSpy.corte).toHaveBeenCalledTimes(2);
  });

  it('cerrarCaja muestra el error si no hay caja abierta', () => {
    cajaSpy.cerrar.and.returnValue(
      throwError(() => ({ error: { message: 'No hay caja abierta para hoy' } }))
    );

    component.cerrarCaja();

    expect(component.error).toBe('No hay caja abierta para hoy');
  });
});
