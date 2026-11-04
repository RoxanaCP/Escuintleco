import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DevolucionService, DevolucionRequest } from './devolucion';

describe('DevolucionService', () => {
  let service: DevolucionService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8080/api/devoluciones';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DevolucionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DevolucionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar hace GET y devuelve las devoluciones', () => {
    service.listar().subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, motivo: 'VENCIDO' }]);
  });

  it('crear hace POST con los datos de la devolucion', () => {
    const request: DevolucionRequest = {
      productoId: 1,
      cantidad: 2,
      motivo: 'DANO',
      descripcion: 'Empaque roto',
    };

    service.crear(request).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.productoId).toBe(1);
    expect(req.request.body.motivo).toBe('DANO');
    req.flush({ id: 9 });
  });
});
