package com.escuintleco.service;

import com.escuintleco.model.Producto;
import com.escuintleco.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    private Producto crearProducto(Long id, String codigo, String nombre) {
        Producto p = new Producto();
        p.setId(id);
        p.setCodigo(codigo);
        p.setNombre(nombre);
        p.setPrecioCompra(new BigDecimal("5.00"));
        p.setPrecioVenta(new BigDecimal("8.00"));
        p.setStock(100);
        p.setStockMinimo(5);
        p.setActivo(true);
        return p;
    }

    @Test
    void listarActivos_devuelveSoloActivos() {
        List<Producto> activos = Arrays.asList(
                crearProducto(1L, "PAS001", "Fideos"),
                crearProducto(2L, "GAS001", "Coca Cola")
        );
        when(productoRepository.findByActivoTrue()).thenReturn(activos);

        List<Producto> resultado = productoService.listarActivos();

        assertThat(resultado).hasSize(2);
        verify(productoRepository).findByActivoTrue();
    }

    @Test
    void buscarPorId_existente_devuelveProducto() {
        Producto p = crearProducto(1L, "PAS001", "Fideos");
        when(productoRepository.findById(1L)).thenReturn(Optional.of(p));

        Producto resultado = productoService.buscarPorId(1L);

        assertThat(resultado.getNombre()).isEqualTo("Fideos");
    }

    @Test
    void buscarPorId_inexistente_lanzaExcepcion() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productoService.buscarPorId(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("no encontrado");
    }

    @Test
    void guardar_productoNuevo_asignaFechaYGuarda() {
        Producto nuevo = crearProducto(null, "LAC001", "Crema");
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        Producto resultado = productoService.guardar(nuevo);

        assertThat(resultado.getCreatedAt()).isNotNull();
        verify(productoRepository).save(nuevo);
    }

    @Test
    void actualizar_modificaCamposYGuarda() {
        Producto existente = crearProducto(1L, "PAS001", "Fideos");
        Producto cambios = crearProducto(1L, "PAS001", "Fideos Premium");
        cambios.setPrecioVenta(new BigDecimal("10.00"));

        when(productoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        Producto resultado = productoService.actualizar(1L, cambios);

        assertThat(resultado.getNombre()).isEqualTo("Fideos Premium");
        assertThat(resultado.getPrecioVenta()).isEqualByComparingTo("10.00");
    }

    @Test
    void eliminar_haceSoftDelete() {
        Producto p = crearProducto(1L, "PAS001", "Fideos");
        when(productoRepository.findById(1L)).thenReturn(Optional.of(p));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        productoService.eliminar(1L);

        assertThat(p.getActivo()).isFalse();
        verify(productoRepository).save(p);
    }
}
