import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private api = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) {}

  cierreDia(): Observable<any> {
    return this.http.get(`${this.api}/cierre-dia`);
  }

  existencias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/existencias`);
  }

  clientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/clientes`);
  }
}
