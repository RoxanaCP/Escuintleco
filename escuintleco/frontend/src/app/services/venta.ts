import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetalleVentaRequest { productoId: number; cantidad: number; }
export interface VentaRequest { clienteId?: number; formaPago: string; detalles: DetalleVentaRequest[]; }

export interface DetalleVenta {
  id: number;
  producto: { id: number; nombre: string; codigo: string };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  numeroFactura: string;
  cliente?: { id: number; nombre: string; nit: string };
  usuario: { nombre: string };
  fecha: string;
  subtotal: number;
  descuento: number;
  total: number;
  formaPago: string;
  estado: string;
  qrCode: string;
  detalles: DetalleVenta[];
}

@Injectable({ providedIn: 'root' })
export class VentaService {
  private api = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  procesarVenta(request: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.api, request);
  }

  buscarPorId(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.api}/${id}`);
  }

  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.api);
  }
}
