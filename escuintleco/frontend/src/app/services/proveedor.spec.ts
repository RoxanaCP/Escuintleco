import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProveedorService, Proveedor } from './proveedor';

describe('ProveedorService', () => {
  let service: ProveedorService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8080/api/proveedores';

  const proveedor: Proveedor = { id: 1, nombre: 'Distribuidora Guatemala' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProveedorService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProveedorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar hace GET y devuelve los proveedores', () => {
    service.listar().subscribe((res) => {
      expect(res[0].nombre).toBe('Distribuidora Guatemala');
    });

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');
    req.flush([proveedor]);
  });

  it('crear hace POST con el proveedor', () => {
    service.crear(proveedor).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nombre).toBe('Distribuidora Guatemala');
    req.flush(proveedor);
  });

  it('actualizar hace PUT al id correcto', () => {
    service.actualizar(1, proveedor).subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(proveedor);
  });

  it('eliminar hace DELETE al id correcto', () => {
    service.eliminar(1).subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
