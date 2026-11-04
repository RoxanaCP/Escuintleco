import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClienteService, Cliente } from './cliente';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:8080/api/clientes';

  const cliente: Cliente = { id: 1, nombre: 'Maria Garcia', nit: '1234567-8' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClienteService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar hace GET y devuelve los clientes', () => {
    service.listar().subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].nit).toBe('1234567-8');
    });

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');
    req.flush([cliente]);
  });

  it('crear hace POST con el cliente', () => {
    service.crear(cliente).subscribe((res) => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nombre).toBe('Maria Garcia');
    req.flush(cliente);
  });

  it('actualizar hace PUT al id correcto', () => {
    service.actualizar(1, cliente).subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(cliente);
  });
});
