import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ProductoService, Producto } from '../../services/producto';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: any[] = [];
  proveedores: any[] = [];
  busqueda = '';
  mostrarFormulario = false;
  modoEdicion = false;
  loading = false;
  mensaje = '';
  error = '';

  productoForm: Producto = this.productoVacio();

  constructor(
    private productoService: ProductoService,
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.error = '';

    this.productoService.listar()
      .pipe(finalize(() => {
        this.loading = false;
        this.changeDetector.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.productos = Array.isArray(data) ? data : [];
        },
        error: (err) => {
          console.error('Error productos:', err);
          this.productos = [];
          this.error = 'Error cargando productos: ' + (err?.message || err?.status || 'desconocido');
        }
      });

    this.http.get<any[]>('http://localhost:8080/api/categorias').subscribe({
      next: (d) => this.categorias = Array.isArray(d) ? d : [],
      error: (err) => console.error('Error categorias:', err)
    });
    this.http.get<any[]>('http://localhost:8080/api/proveedores').subscribe({
      next: (d) => this.proveedores = Array.isArray(d) ? d : [],
      error: (err) => console.error('Error proveedores:', err)
    });
  }

  productosFiltrados(): Producto[] {
    const items = Array.isArray(this.productos) ? this.productos : [];
    if (!this.busqueda) return items;
    return items.filter(p =>
      (p.nombre || '').toLowerCase().includes(this.busqueda.toLowerCase()) ||
      (p.codigo || '').toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  nuevo() {
    this.productoForm = this.productoVacio();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.error = '';
  }

  editar(p: Producto) {
    this.productoForm = { ...p,
      categoria: p.categoria ? { id: p.categoria.id, nombre: p.categoria.nombre } : undefined,
      proveedor: p.proveedor ? { id: p.proveedor.id, nombre: p.proveedor.nombre } : undefined
    };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.error = '';
  }

  guardar() {
    const catId = (this.productoForm as any).categoriaId;
    const provId = (this.productoForm as any).proveedorId;
    const payload: any = { ...this.productoForm };
    if (catId) payload.categoria = { id: catId };
    if (provId) payload.proveedor = { id: provId };

    if (this.modoEdicion && this.productoForm.id) {
      this.productoService.actualizar(this.productoForm.id, payload).subscribe({
        next: () => { this.mensaje = 'Producto actualizado'; this.cerrar(); this.cargarDatos(); },
        error: () => this.error = 'Error al actualizar'
      });
    } else {
      this.productoService.crear(payload).subscribe({
        next: () => { this.mensaje = 'Producto creado'; this.cerrar(); this.cargarDatos(); },
        error: () => this.error = 'Error al crear producto'
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: () => { this.mensaje = 'Producto eliminado'; this.cargarDatos(); },
        error: () => this.error = 'Error al eliminar'
      });
    }
  }

  cerrar() { this.mostrarFormulario = false; }

  productoVacio(): Producto {
    return { codigo: '', nombre: '', descripcion: '', precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5 };
  }
}
