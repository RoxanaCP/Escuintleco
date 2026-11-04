import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClientesComponent } from './clientes';
import { ClienteService, Cliente } from '../../services/cliente';

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;
  let clienteSpy: jasmine.SpyObj<ClienteService>;

  const clientes: Cliente[] = [
    { id: 1, nombre: 'Maria Garcia', nit: '1234567-8' },
    { id: 2, nombre: 'Juan Lopez', nit: '9876543-2' },
  ];

  beforeEach(async () => {
    clienteSpy = jasmine.createSpyObj('ClienteService', ['listar', 'crear', 'actualizar']);
    clienteSpy.listar.and.returnValue(of(clientes));

    await TestBed.configureTestingModule({
      imports: [ClientesComponent],
      providers: [{ provide: ClienteService, useValue: clienteSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('al iniciar carga la lista de clientes', () => {
    expect(component.clientes.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('muestra error si falla la carga', () => {
    clienteSpy.listar.and.returnValue(throwError(() => new Error('500')));

    component.cargar();

    expect(component.error).toBe('Error cargando clientes');
    expect(component.loading).toBeFalse();
  });

  it('clientesFiltrados filtra por nombre', () => {
    component.busqueda = 'maria';
    expect(component.clientesFiltrados().length).toBe(1);
    expect(component.clientesFiltrados()[0].nit).toBe('1234567-8');
  });

  it('clientesFiltrados filtra por NIT', () => {
    component.busqueda = '9876';
    expect(component.clientesFiltrados()[0].nombre).toBe('Juan Lopez');
  });

  it('clientesFiltrados sin busqueda devuelve todos', () => {
    component.busqueda = '';
    expect(component.clientesFiltrados().length).toBe(2);
  });

  it('nuevo abre el formulario vacio en modo creacion', () => {
    component.nuevo();

    expect(component.mostrarFormulario).toBeTrue();
    expect(component.modoEdicion).toBeFalse();
    expect(component.clienteForm.nombre).toBe('');
  });

  it('editar abre el formulario con los datos del cliente', () => {
    component.editar(clientes[0]);

    expect(component.mostrarFormulario).toBeTrue();
    expect(component.modoEdicion).toBeTrue();
    expect(component.clienteForm.nombre).toBe('Maria Garcia');
  });

  it('guardar exige nombre y NIT', () => {
    component.nuevo();
    component.guardar();

    expect(component.error).toBe('Nombre y NIT son obligatorios');
    expect(clienteSpy.crear).not.toHaveBeenCalled();
  });

  it('guardar crea un cliente nuevo y recarga la lista', () => {
    clienteSpy.crear.and.returnValue(of(clientes[0]));
    component.nuevo();
    component.clienteForm = { nombre: 'Nuevo', nit: '555' };

    component.guardar();

    expect(clienteSpy.crear).toHaveBeenCalled();
    expect(component.mensaje).toBe('Cliente creado');
    expect(component.mostrarFormulario).toBeFalse();
    expect(clienteSpy.listar).toHaveBeenCalledTimes(2);
  });

  it('guardar en modo edicion actualiza el cliente', () => {
    clienteSpy.actualizar.and.returnValue(of(clientes[0]));
    component.editar(clientes[0]);

    component.guardar();

    expect(clienteSpy.actualizar).toHaveBeenCalledWith(1, jasmine.objectContaining({ nit: '1234567-8' }));
    expect(component.mensaje).toBe('Cliente actualizado');
  });

  it('guardar muestra error si el servidor rechaza la creacion', () => {
    clienteSpy.crear.and.returnValue(throwError(() => new Error('409')));
    component.nuevo();
    component.clienteForm = { nombre: 'Duplicado', nit: '1234567-8' };

    component.guardar();

    expect(component.error).toBe('Error al crear cliente');
  });

  it('cerrar oculta el formulario', () => {
    component.nuevo();
    component.cerrar();

    expect(component.mostrarFormulario).toBeFalse();
  });
});
