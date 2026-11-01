import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DevolucionService } from '../../services/devolucion';
import { ProductoService, Producto } from '../../services/producto';

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './devoluciones.html',
  styleUrl: './devoluciones.scss'
})
export class DevolucionesComponent implements OnInit {
  productos: Producto[] = [];
  devoluciones: any[] = [];

  productoId: number | null = null;
  cantidad = 1;
  motivo = '';
  descripcion = '';
  ventaId: number | null = null;

  mensaje = '';
  error = '';

  constructor(
    private devolucionService: DevolucionService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.productoService.listar().subscribe(d => this.productos = d);
    this.cargarDevoluciones();
  }

  cargarDevoluciones() {
    this.devolucionService.listar().subscribe({
      next: (d) => this.devoluciones = Array.isArray(d) ? d : [],
      error: () => {}
    });
  }

  registrar() {
    this.error = '';
    this.mensaje = '';
    if (!this.productoId) { this.error = 'Selecciona un producto'; return; }
    if (!this.motivo) { this.error = 'Selecciona el motivo'; return; }
    if (this.cantidad <= 0) { this.error = 'La cantidad debe ser mayor que cero'; return; }

    this.devolucionService.crear({
      ventaId: this.ventaId || undefined,
      productoId: this.productoId,
      cantidad: this.cantidad,
      motivo: this.motivo,
      descripcion: this.descripcion
    }).subscribe({
      next: () => {
        this.mensaje = 'Devolucion registrada. El producto volvio al inventario.';
        this.limpiar();
        this.cargarDevoluciones();
      },
      error: (e) => this.error = e.error?.message || 'Error al registrar la devolucion'
    });
  }

  limpiar() {
    this.productoId = null;
    this.cantidad = 1;
    this.motivo = '';
    this.descripcion = '';
    this.ventaId = null;
  }
}
