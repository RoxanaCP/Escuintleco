import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductoService, Producto } from './producto';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8080/api/productos';

  const producto: Producto = {
    id: 1,
    codigo: 'PAS001',
    nombre: 'Fideos',
    precioCompra: 5,
    precioVenta: 8,
    stock: 100,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('listar hace GET y devuelve productos', () => {
    service.listar().subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].codigo).toBe('PAS001');
    });
    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');
    req.flush([producto]);
  });

  it('buscarPorId hace GET al id correcto', () => {
    service.buscarPorId(1).subscribe((res) => {
      expect(res.nombre).toBe('Fideos');
    });
    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(producto);
  });

  it('crear hace POST con el producto', () => {
    service.crear(producto).subscribe((res) => {
      expect(res.id).toBe(1);
    });
    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.codigo).toBe('PAS001');
    req.flush(producto);
  });

  it('actualizar hace PUT al id correcto', () => {
    service.actualizar(1, producto).subscribe((res) => {
      expect(res.id).toBe(1);
    });
    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(producto);
  });

  it('eliminar hace DELETE al id correcto', () => {
    service.eliminar(1).subscribe();
    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
