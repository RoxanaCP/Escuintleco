import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DevolucionRequest {
  ventaId?: number;
  productoId: number;
  cantidad: number;
  motivo: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class DevolucionService {
  private api = 'http://localhost:8080/api/devoluciones';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  crear(request: DevolucionRequest): Observable<any> {
    return this.http.post(this.api, request);
  }
}
