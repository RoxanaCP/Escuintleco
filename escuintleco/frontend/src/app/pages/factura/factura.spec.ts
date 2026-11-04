import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { FacturaComponent } from './factura';
import { VentaService, Venta } from '../../services/venta';

describe('FacturaComponent', () => {
  let fixture: ComponentFixture<FacturaComponent>;
  let component: FacturaComponent;
  let ventaSpy: jasmine.SpyObj<VentaService>;
  let params$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const venta = {
    id: 5,
    numeroFactura: 'FAC-20261101-0005',
    usuario: { nombre: 'Administrador' },
    detalles: [],
    qrCode: 'data:image/png;base64,xxx',
  } as unknown as Venta;

  async function crear(id: string | null) {
    params$ = new BehaviorSubject(convertToParamMap(id === null ? {} : { id }));

    await TestBed.configureTestingModule({
      imports: [FacturaComponent],
      providers: [
        provideRouter([]),
        // Va despues de provideRouter para sobrescribir el ActivatedRoute real
        { provide: VentaService, useValue: ventaSpy },
        { provide: ActivatedRoute, useValue: { paramMap: params$.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    ventaSpy = jasmine.createSpyObj('VentaService', ['buscarPorId']);
  });

  it('carga la factura cuando el id es valido', async () => {
    ventaSpy.buscarPorId.and.returnValue(of(venta));

    await crear('5');

    expect(ventaSpy.buscarPorId).toHaveBeenCalledWith(5);
    expect(component.venta?.numeroFactura).toBe('FAC-20261101-0005');
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
  });

  it('muestra error si el servidor no encuentra la factura', async () => {
    ventaSpy.buscarPorId.and.returnValue(throwError(() => new Error('404')));

    await crear('5');

    expect(component.venta).toBeNull();
    expect(component.error).toBe('No se pudo cargar la factura');
    expect(component.loading).toBeFalse();
  });

  it('muestra error si el id no es numerico', async () => {
    await crear('abc');

    expect(ventaSpy.buscarPorId).not.toHaveBeenCalled();
    expect(component.error).toBe('No se encontró la factura');
    expect(component.loading).toBeFalse();
  });

  it('muestra error si el id es cero o negativo', async () => {
    await crear('0');

    expect(ventaSpy.buscarPorId).not.toHaveBeenCalled();
    expect(component.error).toBe('No se encontró la factura');
  });

  it('muestra error si la ruta no trae id', async () => {
    await crear(null);

    expect(ventaSpy.buscarPorId).not.toHaveBeenCalled();
    expect(component.error).toBe('No se encontró la factura');
  });

  it('imprimir invoca window.print', async () => {
    ventaSpy.buscarPorId.and.returnValue(of(venta));
    await crear('5');
    const printSpy = spyOn(window, 'print');

    component.imprimir();

    expect(printSpy).toHaveBeenCalled();
  });
});
