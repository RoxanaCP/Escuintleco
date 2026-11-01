import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VentaService, Venta } from '../../services/venta';

@Component({
  selector: 'app-factura',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './factura.html',
  styleUrl: './factura.scss'
})
export class FacturaComponent implements OnInit {
  venta: Venta | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private ventaService: VentaService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const id = Number(idParam);

      if (!idParam || !Number.isFinite(id) || id <= 0) {
        this.venta = null;
        this.error = 'No se encontró la factura';
        this.loading = false;
        this.changeDetector.markForCheck();
        return;
      }

      this.loading = true;
      this.error = '';
      this.venta = null;
      this.changeDetector.markForCheck();

      this.ventaService.buscarPorId(id).subscribe({
        next: (v) => {
          this.venta = v;
          this.loading = false;
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.error = 'No se pudo cargar la factura';
          this.loading = false;
          this.changeDetector.markForCheck();
        }
      });
    });
  }

  imprimir() { window.print(); }
}
