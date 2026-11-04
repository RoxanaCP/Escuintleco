import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PromocionesComponent } from './promociones';

describe('PromocionesComponent', () => {
  let component: PromocionesComponent;
  let fixture: ComponentFixture<PromocionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocionesComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PromocionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('inicia con el tipo "producto gratuito" seleccionado y sin promociones', () => {
    expect(component.tipoSeleccionado).toBe('producto-gratis');
    expect(component.promociones.length).toBe(0);
  });

  it('seleccionarTipo cambia el tipo y limpia el formulario', () => {
    component.formulario.nombre = 'Algo';
    component.seleccionarTipo('mayoreo');

    expect(component.tipoSeleccionado).toBe('mayoreo');
    expect(component.formulario.nombre).toBe('');
  });

  it('no agrega la promocion si faltan datos', () => {
    component.agregarVistaPrevia();

    expect(component.error).toContain('Completa el nombre');
    expect(component.promociones.length).toBe(0);
  });

  it('agrega una promocion de producto gratuito con su resumen', () => {
    component.formulario.nombre = 'Lleva y recibe';
    component.formulario.producto = 'Fideos';
    component.formulario.productoGratis = 'Salsa';

    component.agregarVistaPrevia();

    expect(component.promociones.length).toBe(1);
    expect(component.promociones[0].resumen).toBe('Al comprar Fideos, recibe gratis Salsa.');
    expect(component.error).toBe('');
  });

  it('agrega una promocion de segundo producto a mitad de precio', () => {
    component.seleccionarTipo('segundo-mitad');
    component.formulario.nombre = '2da mitad';
    component.formulario.producto = 'Gaseosa';

    component.agregarVistaPrevia();

    expect(component.promociones[0].resumen).toContain('50% de descuento');
  });

  it('agrega un vale de regalo solo si el monto es mayor que cero', () => {
    component.seleccionarTipo('vale-regalo');
    component.formulario.nombre = 'Vale';
    component.formulario.regalo = 'Proxima compra';
    component.formulario.montoVale = 0;

    component.agregarVistaPrevia();
    expect(component.promociones.length).toBe(0);

    component.formulario.montoVale = 25;
    component.agregarVistaPrevia();
    expect(component.promociones[0].resumen).toBe('Vale de Q 25.00 para Proxima compra.');
  });

  it('agrega una promocion de mayoreo con cantidad minima y precio', () => {
    component.seleccionarTipo('mayoreo');
    component.formulario.nombre = 'Mayoreo';
    component.formulario.producto = 'Dulces';
    component.formulario.cantidadMinima = 10;
    component.formulario.precioMayorista = 3.5;

    component.agregarVistaPrevia();

    expect(component.promociones[0].resumen).toBe('Dulces: desde 10 unidades, Q 3.50 c/u.');
  });

  it('agrega una promocion de puntos', () => {
    component.seleccionarTipo('puntos');
    component.formulario.nombre = 'Puntos';
    component.formulario.producto = 'Lacteos';
    component.formulario.puntosPorUnidad = 2;
    component.formulario.valorPunto = 0.25;

    component.agregarVistaPrevia();

    expect(component.promociones[0].resumen).toContain('2 puntos por unidad');
  });

  it('quitarVistaPrevia elimina la promocion indicada', () => {
    component.formulario.nombre = 'Promo';
    component.formulario.producto = 'A';
    component.formulario.productoGratis = 'B';
    component.agregarVistaPrevia();
    const id = component.promociones[0].id;

    component.quitarVistaPrevia(id);

    expect(component.promociones.length).toBe(0);
  });

  it('tituloTipo devuelve el titulo del tipo', () => {
    expect(component.tituloTipo('vale-regalo')).toBe('Vale de regalo');
  });
});
