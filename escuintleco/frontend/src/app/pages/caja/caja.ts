import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CajaService, CorteCaja } from '../../services/caja';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './caja.html',
  styleUrl: './caja.scss'
})
export class CajaComponent implements OnInit {
  montoApertura = 500;
  corte: CorteCaja | null = null;
  mensaje = '';
  error = '';

  constructor(private cajaService: CajaService) {}

  ngOnInit() {
    this.cargarCorte();
  }

  cargarCorte() {
    this.cajaService.corte().subscribe({
      next: (c) => this.corte = c,
      error: () => {}
    });
  }

  abrirCaja() {
    this.error = '';
    this.mensaje = '';
    this.cajaService.abrir(this.montoApertura).subscribe({
      next: () => { this.mensaje = 'Caja abierta con Q ' + this.montoApertura; this.cargarCorte(); },
      error: (e) => this.error = e.error?.message || 'Error al abrir caja'
    });
  }

  cerrarCaja() {
    this.error = '';
    this.mensaje = '';
    this.cajaService.cerrar().subscribe({
      next: (c) => { this.mensaje = 'Caja cerrada. Monto final: Q ' + c.montoCierre; this.cargarCorte(); },
      error: (e) => this.error = e.error?.message || 'Error al cerrar caja'
    });
  }
}
