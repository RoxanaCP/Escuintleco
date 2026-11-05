import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ReportesComponent } from './reportes';
import { ReporteService } from '../../services/reporte';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;
  let reporteSpy: jasmine.SpyObj<ReporteService>;

  beforeEach(async () => {
    reporteSpy = jasmine.createSpyObj('ReporteService', ['cierreDia', 'existencias', 'clientes']);
    reporteSpy.cierreDia.and.returnValue(of({ totalVentas: 250, numeroTransacciones: 4 }));
    reporteSpy.existencias.and.returnValue(of([{ nombre: 'Queso', estado: 'BAJO' }]));
    reporteSpy.clientes.and.returnValue(of([{ nombre: 'Consumidor Final' }]));

    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [{ provide: ReporteService, useValue: reporteSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('al iniciar carga el cierre del dia', () => {
    expect(component.reporteActivo).toBe('ventas');
    expect(reporteSpy.cierreDia).toHaveBeenCalled();
    expect(component.cierre.totalVentas).toBe(250);
  });

  it('cargar("compras") obtiene las existencias', () => {
    component.cargar('compras');

    expect(component.reporteActivo).toBe('compras');
    expect(reporteSpy.existencias).toHaveBeenCalled();
    expect(component.existencias.length).toBe(1);
  });

  it('cargar("clientes") obtiene los clientes', () => {
    component.cargar('clientes');

    expect(component.reporteActivo).toBe('clientes');
    expect(reporteSpy.clientes).toHaveBeenCalled();
    expect(component.clientes[0].nombre).toBe('Consumidor Final');
  });

  it('si la respuesta no es una lista, deja el arreglo vacio', () => {
    reporteSpy.existencias.and.returnValue(of(null as unknown as never[]));

    component.cargar('compras');

    expect(component.existencias).toEqual([]);
  });
});
