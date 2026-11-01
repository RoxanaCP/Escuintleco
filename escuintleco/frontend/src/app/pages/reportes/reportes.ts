import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReporteService } from '../../services/reporte';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss'
})
export class ReportesComponent implements OnInit {
  reporteActivo = 'ventas';

  cierre: any = null;
  existencias: any[] = [];
  clientes: any[] = [];

  constructor(private reporteService: ReporteService) {}

  ngOnInit() {
    this.cargar('ventas');
  }

  cargar(tipo: string) {
    this.reporteActivo = tipo;
    if (tipo === 'ventas') {
      this.reporteService.cierreDia().subscribe(c => this.cierre = c);
    } else if (tipo === 'compras') {
      this.reporteService.existencias().subscribe(d => this.existencias = Array.isArray(d) ? d : []);
    } else if (tipo === 'clientes') {
      this.reporteService.clientes().subscribe(d => this.clientes = Array.isArray(d) ? d : []);
    }
  }
}
