import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReporteService } from './reporte';

describe('ReporteService', () => {
  let service: ReporteService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8080/api/reportes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReporteService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReporteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('cierreDia hace GET a /cierre-dia', () => {
    service.cierreDia().subscribe((res) => {
      expect(res.totalVentas).toBe(250);
    });

    const req = httpMock.expectOne(`${api}/cierre-dia`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalVentas: 250 });
  });

  it('existencias hace GET a /existencias', () => {
    service.existencias().subscribe((res) => {
      expect(res[0].estado).toBe('BAJO');
    });

    const req = httpMock.expectOne(`${api}/existencias`);
    expect(req.request.method).toBe('GET');
    req.flush([{ nombre: 'Queso', estado: 'BAJO' }]);
  });

  it('clientes hace GET a /clientes', () => {
    service.clientes().subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${api}/clientes`);
    expect(req.request.method).toBe('GET');
    req.flush([{ nombre: 'Consumidor Final' }]);
  });
});
