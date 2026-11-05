import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VentaService, VentaRequest, Venta } from './venta';

describe('VentaService', () => {
  let service: VentaService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8080/api/ventas';

  const venta = { id: 1, numeroFactura: 'FAC-1', total: 40 } as Venta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VentaService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VentaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('procesarVenta hace POST con el detalle de la venta', () => {
    const request: VentaRequest = {
      formaPago: 'EFECTIVO',
      detalles: [{ productoId: 1, cantidad: 5 }],
    };

    service.procesarVenta(request).subscribe((res) => {
      expect(res.numeroFactura).toBe('FAC-1');
    });

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.formaPago).toBe('EFECTIVO');
    expect(req.request.body.detalles.length).toBe(1);
    req.flush(venta);
  });

  it('buscarPorId hace GET al id correcto', () => {
    service.buscarPorId(1).subscribe((res) => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(venta);
  });

  it('listar hace GET y devuelve las ventas', () => {
    service.listar().subscribe((res) => {
      expect(res.length).toBe(2);
    });

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');
    req.flush([venta, venta]);
  });
});
