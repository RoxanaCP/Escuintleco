import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CajaService, CorteCaja } from './caja';

describe('CajaService', () => {
  let service: CajaService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8080/api/caja';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CajaService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CajaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('abrir hace POST con el monto de apertura', () => {
    service.abrir(500).subscribe();

    const req = httpMock.expectOne(`${api}/abrir`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ montoApertura: 500 });
    req.flush({});
  });

  it('cerrar hace POST a /cerrar', () => {
    service.cerrar().subscribe();

    const req = httpMock.expectOne(`${api}/cerrar`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('corte hace GET y devuelve el resumen del dia', () => {
    const corte: CorteCaja = {
      fecha: '2026-11-01',
      montoApertura: 200,
      totalVentas: 125,
      numeroTransacciones: 3,
      totalEnCaja: 325,
    };

    service.corte().subscribe((res) => {
      expect(res.totalEnCaja).toBe(325);
      expect(res.numeroTransacciones).toBe(3);
    });

    const req = httpMock.expectOne(`${api}/corte`);
    expect(req.request.method).toBe('GET');
    req.flush(corte);
  });
});
