import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductoService, Producto } from '../../services/producto';
import { VentaService } from '../../services/venta';

interface ItemCarrito { producto: Producto; cantidad: number; subtotal: number; }

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './venta.html',
  styleUrl: './venta.scss'
})
export class VentaComponent implements OnInit {
  productos: Producto[] = [];
  categorias: any[] = [];
  clientes: any[] = [];
  carrito: ItemCarrito[] = [];
  busqueda = '';
  categoriaSeleccionada = '';
  clienteId: number | null = null;
  formaPago = 'EFECTIVO';
  error = '';
  loading = false;

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private http: HttpClient,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = Array.isArray(data) ? data : [];
        this.changeDetector.markForCheck();
      },
      error: (err) => {
        console.error('Error productos:', err);
        this.error = 'Error cargando productos';
        this.changeDetector.markForCheck();
      }
    });
    this.http.get<any[]>('http://localhost:8080/api/categorias').subscribe({
      next: (data) => {
        this.categorias = Array.isArray(data) ? data : [];
        this.changeDetector.markForCheck();
      },
      error: (err) => console.error('Error categorias:', err)
    });
    this.http.get<any[]>('http://localhost:8080/api/clientes').subscribe({
      next: (data) => {
        this.clientes = Array.isArray(data) ? data : [];
        this.changeDetector.markForCheck();
      },
      error: (err) => console.error('Error clientes:', err)
    });
  }

  productosFiltrados(): Producto[] {
    return this.productos.filter(p => {
      const matchNombre = !this.busqueda || p.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
      const matchCat = !this.categoriaSeleccionada || p.categoria?.id == +this.categoriaSeleccionada;
      return matchNombre && matchCat;
    });
  }

  agregarAlCarrito(producto: Producto) {
    const existente = this.carrito.find(i => i.producto.id === producto.id);
    if (existente) {
      existente.cantidad++;
      existente.subtotal = existente.cantidad * producto.precioVenta;
    } else {
      this.carrito.push({ producto, cantidad: 1, subtotal: producto.precioVenta });
    }
  }

  cambiarCantidad(item: ItemCarrito, delta: number) {
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      this.carrito = this.carrito.filter(i => i !== item);
    } else {
      item.subtotal = item.cantidad * item.producto.precioVenta;
    }
  }

  quitarItem(item: ItemCarrito) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

  getTotal(): number {
    return this.carrito.reduce((acc, i) => acc + i.subtotal, 0);
  }

  procesarVenta() {
    if (this.carrito.length === 0) { this.error = 'El carrito está vacío'; return; }
    this.loading = true;
    this.error = '';
    const request: any = {
      formaPago: this.formaPago,
      detalles: this.carrito.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad }))
    };
    if (this.clienteId) request.clienteId = this.clienteId;

    this.ventaService.procesarVenta(request).subscribe({
      next: (venta) => this.router.navigate(['/factura', venta.id]),
      error: (e) => { this.error = e.error?.message || 'Error al procesar venta'; this.loading = false; }
    });
  }
}
