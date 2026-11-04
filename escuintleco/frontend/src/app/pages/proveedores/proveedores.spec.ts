import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProveedoresComponent } from './proveedores';
import { ProveedorService, Proveedor } from '../../services/proveedor';

describe('ProveedoresComponent', () => {
  let component: ProveedoresComponent;
  let fixture: ComponentFixture<ProveedoresComponent>;
  let proveedorSpy: jasmine.SpyObj<ProveedorService>;

  const proveedores: Proveedor[] = [
    { id: 1, nombre: 'Distribuidora Guatemala' },
    { id: 2, nombre: 'Carnes del Norte' },
  ];

  beforeEach(async () => {
    proveedorSpy = jasmine.createSpyObj('ProveedorService', [
      'listar',
      'crear',
      'actualizar',
      'eliminar',
    ]);
    proveedorSpy.listar.and.returnValue(of(proveedores));

    await TestBed.configureTestingModule({
      imports: [ProveedoresComponent],
      providers: [{ provide: ProveedorService, useValue: proveedorSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('al iniciar carga la lista de proveedores', () => {
    expect(component.proveedores.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('muestra error si falla la carga', () => {
    proveedorSpy.listar.and.returnValue(throwError(() => new Error('500')));

    component.cargar();

    expect(component.error).toBe('Error cargando proveedores');
  });

  it('proveedoresFiltrados filtra por nombre', () => {
    component.busqueda = 'carnes';
    expect(component.proveedoresFiltrados().length).toBe(1);
  });

  it('proveedoresFiltrados sin busqueda devuelve todos', () => {
    expect(component.proveedoresFiltrados().length).toBe(2);
  });

  it('nuevo abre el formulario vacio', () => {
    component.nuevo();

    expect(component.mostrarFormulario).toBeTrue();
    expect(component.modoEdicion).toBeFalse();
  });

  it('editar abre el formulario con los datos del proveedor', () => {
    component.editar(proveedores[1]);

    expect(component.modoEdicion).toBeTrue();
    expect(component.proveedorForm.nombre).toBe('Carnes del Norte');
  });

  it('guardar exige el nombre', () => {
    component.nuevo();
    component.guardar();

    expect(component.error).toBe('El nombre es obligatorio');
    expect(proveedorSpy.crear).not.toHaveBeenCalled();
  });

  it('guardar crea un proveedor nuevo', () => {
    proveedorSpy.crear.and.returnValue(of(proveedores[0]));
    component.nuevo();
    component.proveedorForm = { nombre: 'Nuevo proveedor' };

    component.guardar();

    expect(proveedorSpy.crear).toHaveBeenCalled();
    expect(component.mensaje).toBe('Proveedor creado');
    expect(component.mostrarFormulario).toBeFalse();
  });

  it('guardar en modo edicion actualiza el proveedor', () => {
    proveedorSpy.actualizar.and.returnValue(of(proveedores[0]));
    component.editar(proveedores[0]);

    component.guardar();

    expect(proveedorSpy.actualizar).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(component.mensaje).toBe('Proveedor actualizado');
  });

  it('eliminar confirma, elimina y recarga la lista', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    proveedorSpy.eliminar.and.returnValue(of(undefined));

    component.eliminar(1);

    expect(proveedorSpy.eliminar).toHaveBeenCalledWith(1);
    expect(component.mensaje).toBe('Proveedor eliminado');
    expect(proveedorSpy.listar).toHaveBeenCalledTimes(2);
  });

  it('eliminar no hace nada si el usuario cancela', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.eliminar(1);

    expect(proveedorSpy.eliminar).not.toHaveBeenCalled();
  });

  it('eliminar muestra error si el servidor falla', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    proveedorSpy.eliminar.and.returnValue(throwError(() => new Error('500')));

    component.eliminar(1);

    expect(component.error).toBe('Error al eliminar');
  });
});
