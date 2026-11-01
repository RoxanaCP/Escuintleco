import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProveedorService, Proveedor } from '../../services/proveedor';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss'
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  busqueda = '';
  mostrarFormulario = false;
  modoEdicion = false;
  loading = false;
  mensaje = '';
  error = '';

  proveedorForm: Proveedor = this.proveedorVacio();

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.proveedorService.listar().subscribe({
      next: (data) => { this.proveedores = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.error = 'Error cargando proveedores'; this.loading = false; }
    });
  }

  proveedoresFiltrados(): Proveedor[] {
    if (!this.busqueda) return this.proveedores;
    return this.proveedores.filter(p =>
      (p.nombre || '').toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  nuevo() {
    this.proveedorForm = this.proveedorVacio();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.error = '';
  }

  editar(p: Proveedor) {
    this.proveedorForm = { ...p };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.error = '';
  }

  guardar() {
    if (!this.proveedorForm.nombre) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    if (this.modoEdicion && this.proveedorForm.id) {
      this.proveedorService.actualizar(this.proveedorForm.id, this.proveedorForm).subscribe({
        next: () => { this.mensaje = 'Proveedor actualizado'; this.cerrar(); this.cargar(); },
        error: () => this.error = 'Error al actualizar'
      });
    } else {
      this.proveedorService.crear(this.proveedorForm).subscribe({
        next: () => { this.mensaje = 'Proveedor creado'; this.cerrar(); this.cargar(); },
        error: () => this.error = 'Error al crear proveedor'
      });
    }
  }

  eliminar(id: number) {
    if (confirm('Eliminar este proveedor?')) {
      this.proveedorService.eliminar(id).subscribe({
        next: () => { this.mensaje = 'Proveedor eliminado'; this.cargar(); },
        error: () => this.error = 'Error al eliminar'
      });
    }
  }

  cerrar() { this.mostrarFormulario = false; }

  proveedorVacio(): Proveedor {
    return { nombre: '', telefono: '', email: '', direccion: '' };
  }
}
