import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo?: number;
  categoria?: { id: number; nombre: string };
  proveedor?: { id: number; nombre: string };
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.api);
  }

  buscarPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.api}/${id}`);
  }

  buscarPorCodigo(codigo: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.api}/codigo/${codigo}`);
  }

  buscarPorNombre(nombre: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.api}/buscar?nombre=${nombre}`);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.api, producto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.api}/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
