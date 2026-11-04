import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VentaComponent } from './venta';
import { ProductoService, Producto } from '../../services/producto';
import { VentaService, Venta } from '../../services/venta';

describe('VentaComponent', () => {
  let component: VentaComponent;
  let fixture: ComponentFixture<VentaComponent>;
  let productoSpy: jasmine.SpyObj<ProductoService>;
  let ventaSpy: jasmine.SpyObj<VentaService>;
  let httpMock: HttpTestingController;
  let router: Router;

  const fideos: Producto = {
    id: 1, codigo: 'PAS001', nombre: 'Fideos', precioCompra: 5, precioVenta: 8, stock: 100,
    categoria: { id: 1, nombre: 'Pastas' },
  };
  const cola: Producto = {
    id: 2, codigo: 'GAS001', nombre: 'Coca Cola', precioCompra: 5, precioVenta: 10, stock: 150,
    categoria: { id: 6, nombre: 'Gaseosas' },
  };

  beforeEach(async () => {
    productoSpy = jasmine.createSpyObj('ProductoService', ['listar']);
    ventaSpy = jasmine.createSpyObj('VentaService', ['procesarVenta']);
    productoSpy.listar.and.returnValue(of([fideos, cola]));

    await TestBed.configureTestingModule({
      imports: [VentaComponent],
      providers: [
        { provide: ProductoService, useValue: productoSpy },
        { provide: VentaService, useValue: ventaSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(VentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.match(() => true).forEach((req) => req.flush([]));
    httpMock.verify();
  });

  it('al iniciar carga productos, categorias y clientes', () => {
    httpMock.expectOne('http://localhost:8080/api/categorias').flush([{ id: 1, nombre: 'Pastas' }]);
    httpMock.expectOne('http://localhost:8080/api/clientes').flush([{ id: 1, nombre: 'CF' }]);

    expect(component.productos.length).toBe(2);
    expect(component.categorias.length).toBe(1);
    expect(component.clientes.length).toBe(1);
  });

  it('muestra error si falla la carga de productos', () => {
    productoSpy.listar.and.returnValue(throwError(() => new Error('500')));

    component.ngOnInit();

    expect(component.error).toBe('Error cargando productos');
  });

  it('productosFiltrados filtra por nombre', () => {
    component.busqueda = 'cola';
    expect(component.productosFiltrados().map((p) => p.codigo)).toEqual(['GAS001']);
  });

  it('productosFiltrados filtra por categoria', () => {
    component.categoriaSeleccionada = '1';
    expect(component.productosFiltrados().map((p) => p.codigo)).toEqual(['PAS001']);
  });

  it('agregarAlCarrito agrega un producto nuevo con cantidad 1', () => {
    component.agregarAlCarrito(fideos);

    expect(component.carrito.length).toBe(1);
    expect(component.carrito[0].cantidad).toBe(1);
    expect(component.carrito[0].subtotal).toBe(8);
  });

  it('agregarAlCarrito dos veces el mismo producto aumenta la cantidad (RN-04)', () => {
    component.agregarAlCarrito(fideos);
    component.agregarAlCarrito(fideos);

    expect(component.carrito.length).toBe(1);
    expect(component.carrito[0].cantidad).toBe(2);
    // subtotal = cantidad x precio unitario
    expect(component.carrito[0].subtotal).toBe(16);
  });

  it('cambiarCantidad actualiza cantidad y subtotal', () => {
    component.agregarAlCarrito(cola);

    component.cambiarCantidad(component.carrito[0], 3);

    expect(component.carrito[0].cantidad).toBe(4);
    expect(component.carrito[0].subtotal).toBe(40);
  });

  it('cambiarCantidad quita el item cuando la cantidad llega a cero (RN-02)', () => {
    component.agregarAlCarrito(fideos);

    component.cambiarCantidad(component.carrito[0], -1);

    expect(component.carrito.length).toBe(0);
  });

  it('quitarItem elimina solo el item indicado', () => {
    component.agregarAlCarrito(fideos);
    component.agregarAlCarrito(cola);

    component.quitarItem(component.carrito[0]);

    expect(component.carrito.length).toBe(1);
    expect(component.carrito[0].producto.codigo).toBe('GAS001');
  });

  it('getTotal suma los subtotales del carrito', () => {
    component.agregarAlCarrito(fideos);
    component.agregarAlCarrito(cola);
    component.agregarAlCarrito(cola);

    // 8 + (10 x 2) = 28
    expect(component.getTotal()).toBe(28);
  });

  it('getTotal con carrito vacio es cero', () => {
    expect(component.getTotal()).toBe(0);
  });

  it('procesarVenta con carrito vacio muestra error y no llama al servicio (RN-01)', () => {
    component.procesarVenta();

    expect(component.error).toContain('carrito');
    expect(ventaSpy.procesarVenta).not.toHaveBeenCalled();
  });

  it('procesarVenta envia el detalle y navega a la factura', () => {
    ventaSpy.procesarVenta.and.returnValue(of({ id: 5 } as Venta));
    component.agregarAlCarrito(fideos);
    component.agregarAlCarrito(fideos);
    component.formaPago = 'TARJETA';

    component.procesarVenta();

    const request = ventaSpy.procesarVenta.calls.mostRecent().args[0];
    expect(request.formaPago).toBe('TARJETA');
    expect(request.detalles).toEqual([{ productoId: 1, cantidad: 2 }]);
    expect(router.navigate).toHaveBeenCalledWith(['/factura', 5]);
  });

  it('procesarVenta incluye el cliente cuando se selecciona uno', () => {
    ventaSpy.procesarVenta.and.returnValue(of({ id: 6 } as Venta));
    component.agregarAlCarrito(fideos);
    component.clienteId = 3;

    component.procesarVenta();

    expect(ventaSpy.procesarVenta.calls.mostRecent().args[0].clienteId).toBe(3);
  });

  it('procesarVenta muestra el mensaje del servidor si falla (RN-03)', () => {
    ventaSpy.procesarVenta.and.returnValue(
      throwError(() => ({ error: { message: 'Stock insuficiente para: Fideos' } }))
    );
    component.agregarAlCarrito(fideos);

    component.procesarVenta();

    expect(component.error).toBe('Stock insuficiente para: Fideos');
    expect(component.loading).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('procesarVenta usa un mensaje generico si el error no trae detalle', () => {
    ventaSpy.procesarVenta.and.returnValue(throwError(() => ({})));
    component.agregarAlCarrito(fideos);

    component.procesarVenta();

    expect(component.error).toBe('Error al procesar venta');
  });
});
