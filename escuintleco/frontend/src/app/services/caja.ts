import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CorteCaja {
  fecha: string;
  montoApertura: number;
  totalVentas: number;
  numeroTransacciones: number;
  totalEnCaja: number;
}

@Injectable({ providedIn: 'root' })
export class CajaService {
  private api = 'http://localhost:8080/api/caja';

  constructor(private http: HttpClient) {}

  abrir(montoApertura: number): Observable<any> {
    return this.http.post(`${this.api}/abrir`, { montoApertura });
  }

  cerrar(): Observable<any> {
    return this.http.post(`${this.api}/cerrar`, {});
  }

  corte(): Observable<CorteCaja> {
    return this.http.get<CorteCaja>(`${this.api}/corte`);
  }
}
