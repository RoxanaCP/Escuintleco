import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClienteService, Cliente } from '../../services/cliente';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  busqueda = '';
  mostrarFormulario = false;
  modoEdicion = false;
  loading = false;
  mensaje = '';
  error = '';

  clienteForm: Cliente = this.clienteVacio();

  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.clienteService.listar().subscribe({
      next: (data) => { this.clientes = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.error = 'Error cargando clientes'; this.loading = false; }
    });
  }

  clientesFiltrados(): Cliente[] {
    if (!this.busqueda) return this.clientes;
    return this.clientes.filter(c =>
      (c.nombre || '').toLowerCase().includes(this.busqueda.toLowerCase()) ||
      (c.nit || '').toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  nuevo() {
    this.clienteForm = this.clienteVacio();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.error = '';
  }

  editar(c: Cliente) {
    this.clienteForm = { ...c };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.error = '';
  }

  guardar() {
    if (!this.clienteForm.nombre || !this.clienteForm.nit) {
      this.error = 'Nombre y NIT son obligatorios';
      return;
    }
    if (this.modoEdicion && this.clienteForm.id) {
      this.clienteService.actualizar(this.clienteForm.id, this.clienteForm).subscribe({
        next: () => { this.mensaje = 'Cliente actualizado'; this.cerrar(); this.cargar(); },
        error: () => this.error = 'Error al actualizar'
      });
    } else {
      this.clienteService.crear(this.clienteForm).subscribe({
        next: () => { this.mensaje = 'Cliente creado'; this.cerrar(); this.cargar(); },
        error: () => this.error = 'Error al crear cliente'
      });
    }
  }

  cerrar() { this.mostrarFormulario = false; }

  clienteVacio(): Cliente {
    return { nombre: '', nit: '', telefono: '', email: '', direccion: '' };
  }
}
