import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DevolucionesComponent } from './devoluciones';
import { DevolucionService } from '../../services/devolucion';
import { ProductoService, Producto } from '../../services/producto';

describe('DevolucionesComponent', () => {
  let component: DevolucionesComponent;
  let fixture: ComponentFixture<DevolucionesComponent>;
  let devolucionSpy: jasmine.SpyObj<DevolucionService>;
  let productoSpy: jasmine.SpyObj<ProductoService>;

  const productos: Producto[] = [
    { id: 1, codigo: 'PAS001', nombre: 'Fideos', precioCompra: 5, precioVenta: 8, stock: 100 },
  ];

  beforeEach(async () => {
    devolucionSpy = jasmine.createSpyObj('DevolucionService', ['listar', 'crear']);
    productoSpy = jasmine.createSpyObj('ProductoService', ['listar']);
    devolucionSpy.listar.and.returnValue(of([]));
    productoSpy.listar.and.returnValue(of(productos));

    await TestBed.configureTestingModule({
      imports: [DevolucionesComponent],
      providers: [
        { provide: DevolucionService, useValue: devolucionSpy },
        { provide: ProductoService, useValue: productoSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DevolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('al iniciar carga productos y devoluciones', () => {
    expect(component.productos.length).toBe(1);
    expect(devolucionSpy.listar).toHaveBeenCalled();
  });

  it('registrar exige seleccionar un producto', () => {
    component.registrar();

    expect(component.error).toBe('Selecciona un producto');
    expect(devolucionSpy.crear).not.toHaveBeenCalled();
  });

  it('registrar exige seleccionar el motivo', () => {
    component.productoId = 1;
    component.registrar();

    expect(component.error).toBe('Selecciona el motivo');
  });

  it('registrar exige cantidad mayor que cero', () => {
    component.productoId = 1;
    component.motivo = 'DANO';
    component.cantidad = 0;

    component.registrar();

    expect(component.error).toBe('La cantidad debe ser mayor que cero');
    expect(devolucionSpy.crear).not.toHaveBeenCalled();
  });

  it('registrar envia la devolucion y limpia el formulario', () => {
    devolucionSpy.crear.and.returnValue(of({ id: 1 }));
    component.productoId = 1;
    component.cantidad = 3;
    component.motivo = 'VENCIDO';
    component.descripcion = 'Caducado';

    component.registrar();

    expect(devolucionSpy.crear).toHaveBeenCalledWith(
      jasmine.objectContaining({ productoId: 1, cantidad: 3, motivo: 'VENCIDO' })
    );
    expect(component.mensaje).toContain('Devolucion registrada');
    expect(component.productoId).toBeNull();
    expect(component.cantidad).toBe(1);
    expect(devolucionSpy.listar).toHaveBeenCalledTimes(2);
  });

  it('registrar muestra el error del servidor si falla', () => {
    devolucionSpy.crear.and.returnValue(
      throwError(() => ({ error: { message: 'Producto no encontrado' } }))
    );
    component.productoId = 1;
    component.motivo = 'DANO';

    component.registrar();

    expect(component.error).toBe('Producto no encontrado');
  });
});
