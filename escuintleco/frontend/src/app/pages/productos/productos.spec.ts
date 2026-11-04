import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductosComponent } from './productos';
import { ProductoService, Producto } from '../../services/producto';

describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;
  let productoSpy: jasmine.SpyObj<ProductoService>;
  let httpMock: HttpTestingController;

  const productos: Producto[] = [
    { id: 1, codigo: 'PAS001', nombre: 'Fideos', precioCompra: 5, precioVenta: 8, stock: 100 },
    { id: 2, codigo: 'GAS001', nombre: 'Coca Cola', precioCompra: 5, precioVenta: 8, stock: 150 },
  ];

  // Responde las peticiones de categorias y proveedores que el componente hace al cargar
  function responderPeticionesPendientes() {
    httpMock.match(() => true).forEach((req) => req.flush([]));
  }

  beforeEach(async () => {
    productoSpy = jasmine.createSpyObj('ProductoService', [
      'listar',
      'crear',
      'actualizar',
      'eliminar',
    ]);
    productoSpy.listar.and.returnValue(of(productos));

    await TestBed.configureTestingModule({
      imports: [ProductosComponent],
      providers: [
        { provide: ProductoService, useValue: productoSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    responderPeticionesPendientes();
    httpMock.verify();
  });

  it('al iniciar carga los productos, categorias y proveedores', () => {
    const categorias = httpMock.expectOne('http://localhost:8080/api/categorias');
    const proveedores = httpMock.expectOne('http://localhost:8080/api/proveedores');
    categorias.flush([{ id: 1, nombre: 'Pastas' }]);
    proveedores.flush([{ id: 1, nombre: 'Distribuidora' }]);

    expect(component.productos.length).toBe(2);
    expect(component.categorias.length).toBe(1);
    expect(component.proveedores.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('muestra error y lista vacia si falla la carga de productos', () => {
    productoSpy.listar.and.returnValue(throwError(() => ({ status: 500 })));

    component.cargarDatos();

    expect(component.productos).toEqual([]);
    expect(component.error).toContain('Error cargando productos');
    expect(component.loading).toBeFalse();
  });

  it('productosFiltrados filtra por nombre', () => {
    component.busqueda = 'coca';
    expect(component.productosFiltrados().length).toBe(1);
    expect(component.productosFiltrados()[0].codigo).toBe('GAS001');
  });

  it('productosFiltrados filtra por codigo', () => {
    component.busqueda = 'pas001';
    expect(component.productosFiltrados()[0].nombre).toBe('Fideos');
  });

  it('productosFiltrados sin busqueda devuelve todos', () => {
    expect(component.productosFiltrados().length).toBe(2);
  });

  it('nuevo abre el formulario vacio en modo creacion', () => {
    component.nuevo();

    expect(component.mostrarFormulario).toBeTrue();
    expect(component.modoEdicion).toBeFalse();
    expect(component.productoForm.codigo).toBe('');
    expect(component.productoForm.stockMinimo).toBe(5);
  });

  it('editar abre el formulario con los datos del producto', () => {
    component.editar(productos[0]);

    expect(component.modoEdicion).toBeTrue();
    expect(component.mostrarFormulario).toBeTrue();
    expect(component.productoForm.nombre).toBe('Fideos');
  });

  it('guardar crea un producto nuevo y recarga la lista', () => {
    productoSpy.crear.and.returnValue(of(productos[0]));
    component.nuevo();
    component.productoForm = { codigo: 'NUE001', nombre: 'Nuevo', precioCompra: 1, precioVenta: 2, stock: 3 };

    component.guardar();

    expect(productoSpy.crear).toHaveBeenCalled();
    expect(component.mensaje).toBe('Producto creado');
    expect(component.mostrarFormulario).toBeFalse();
    expect(productoSpy.listar).toHaveBeenCalledTimes(2);
  });

  it('guardar envia la categoria y el proveedor seleccionados como objetos con id', () => {
    productoSpy.crear.and.returnValue(of(productos[0]));
    component.nuevo();
    component.productoForm = {
      codigo: 'X', nombre: 'X', precioCompra: 1, precioVenta: 2, stock: 1,
      categoriaId: 3, proveedorId: 4,
    } as unknown as Producto;

    component.guardar();

    const payload = productoSpy.crear.calls.mostRecent().args[0] as unknown as Record<string, unknown>;
    expect(payload['categoria']).toEqual({ id: 3 });
    expect(payload['proveedor']).toEqual({ id: 4 });
  });

  it('guardar en modo edicion actualiza el producto', () => {
    productoSpy.actualizar.and.returnValue(of(productos[0]));
    component.editar(productos[0]);

    component.guardar();

    expect(productoSpy.actualizar).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(component.mensaje).toBe('Producto actualizado');
  });

  it('guardar muestra error si el servidor rechaza la creacion', () => {
    productoSpy.crear.and.returnValue(throwError(() => new Error('409')));
    component.nuevo();

    component.guardar();

    expect(component.error).toBe('Error al crear producto');
  });

  it('guardar muestra error si falla la actualizacion', () => {
    productoSpy.actualizar.and.returnValue(throwError(() => new Error('500')));
    component.editar(productos[0]);

    component.guardar();

    expect(component.error).toBe('Error al actualizar');
  });

  it('eliminar confirma, elimina y recarga la lista', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    productoSpy.eliminar.and.returnValue(of(undefined));

    component.eliminar(1);

    expect(productoSpy.eliminar).toHaveBeenCalledWith(1);
    expect(component.mensaje).toBe('Producto eliminado');
    expect(productoSpy.listar).toHaveBeenCalledTimes(2);
  });

  it('eliminar no hace nada si el usuario cancela', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.eliminar(1);

    expect(productoSpy.eliminar).not.toHaveBeenCalled();
  });

  it('eliminar muestra error si el servidor falla', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    productoSpy.eliminar.and.returnValue(throwError(() => new Error('500')));

    component.eliminar(1);

    expect(component.error).toBe('Error al eliminar');
  });

  it('cerrar oculta el formulario', () => {
    component.nuevo();
    component.cerrar();

    expect(component.mostrarFormulario).toBeFalse();
  });
});
