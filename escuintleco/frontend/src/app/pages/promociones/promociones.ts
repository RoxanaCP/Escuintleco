import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

type TipoPromocion = 'producto-gratis' | 'vale-regalo' | 'segundo-mitad' | 'mayoreo' | 'puntos';

interface PromocionPrototipo {
  id: number;
  tipo: TipoPromocion;
  nombre: string;
  resumen: string;
}

interface FormularioPromocion {
  nombre: string;
  producto: string;
  productoGratis: string;
  regalo: string;
  montoVale: number;
  cantidadMinima: number;
  precioMayorista: number;
  puntosPorUnidad: number;
  valorPunto: number;
}

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './promociones.html',
  styleUrl: './promociones.scss'
})
export class PromocionesComponent {
  tipoSeleccionado: TipoPromocion = 'producto-gratis';
  error = '';
  promociones: PromocionPrototipo[] = [];
  formulario: FormularioPromocion = this.formularioVacio();

  readonly tipos: { id: TipoPromocion; titulo: string; descripcion: string }[] = [
    { id: 'producto-gratis', titulo: 'Producto gratuito', descripcion: 'Regala un producto al cumplir una condición de compra.' },
    { id: 'vale-regalo', titulo: 'Vale de regalo', descripcion: 'Ofrece un vale con valor o beneficio para otra compra.' },
    { id: 'segundo-mitad', titulo: 'Segundo producto a mitad de precio', descripcion: 'Aplica 50% de descuento a la segunda unidad.' },
    { id: 'mayoreo', titulo: 'Compra por mayoreo', descripcion: 'Define precio especial al alcanzar cierta cantidad.' },
    { id: 'puntos', titulo: 'Puntos por producto o familia', descripcion: 'Asigna puntos canjeables en una próxima compra.' }
  ];

  seleccionarTipo(tipo: TipoPromocion) {
    this.tipoSeleccionado = tipo;
    this.error = '';
    this.formulario = this.formularioVacio();
  }

  agregarVistaPrevia() {
    const resumen = this.crearResumen();
    if (!this.formulario.nombre.trim() || !resumen) {
      this.error = 'Completa el nombre y los datos requeridos para ver la promoción.';
      return;
    }

    this.promociones = [{
      id: Date.now(),
      tipo: this.tipoSeleccionado,
      nombre: this.formulario.nombre.trim(),
      resumen
    }, ...this.promociones];
    this.error = '';
    this.formulario = this.formularioVacio();
  }

  quitarVistaPrevia(id: number) {
    this.promociones = this.promociones.filter((promocion) => promocion.id !== id);
  }

  tituloTipo(tipo: TipoPromocion): string {
    return this.tipos.find((item) => item.id === tipo)?.titulo || '';
  }

  private crearResumen(): string {
    const f = this.formulario;
    switch (this.tipoSeleccionado) {
      case 'producto-gratis':
        return f.producto.trim() && f.productoGratis.trim()
          ? `Al comprar ${f.producto}, recibe gratis ${f.productoGratis}.`
          : '';
      case 'vale-regalo':
        return f.regalo.trim() && f.montoVale > 0
          ? `Vale de Q ${f.montoVale.toFixed(2)} para ${f.regalo}.`
          : '';
      case 'segundo-mitad':
        return f.producto.trim()
          ? `La segunda unidad de ${f.producto} tiene 50% de descuento.`
          : '';
      case 'mayoreo':
        return f.producto.trim() && f.cantidadMinima > 1 && f.precioMayorista > 0
          ? `${f.producto}: desde ${f.cantidadMinima} unidades, Q ${f.precioMayorista.toFixed(2)} c/u.`
          : '';
      case 'puntos':
        return f.producto.trim() && f.puntosPorUnidad > 0 && f.valorPunto > 0
          ? `${f.producto}: ${f.puntosPorUnidad} puntos por unidad (Q ${f.valorPunto.toFixed(2)} de descuento por punto).`
          : '';
    }
  }

  private formularioVacio(): FormularioPromocion {
    return {
      nombre: '',
      producto: '',
      productoGratis: '',
      regalo: '',
      montoVale: 0,
      cantidadMinima: 3,
      precioMayorista: 0,
      puntosPorUnidad: 1,
      valorPunto: 0.1
    };
  }
}
