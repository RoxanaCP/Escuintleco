package com.escuintleco.service;

import com.escuintleco.dto.DevolucionRequest;
import com.escuintleco.model.Devolucion;
import com.escuintleco.model.Producto;
import com.escuintleco.repository.DevolucionRepository;
import com.escuintleco.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DevolucionServiceTest {

    @Mock private DevolucionRepository devolucionRepository;
    @Mock private ProductoRepository productoRepository;

    @InjectMocks
    private DevolucionService devolucionService;

    private Producto producto;

    @BeforeEach
    void setup() {
        producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Fideos");
        producto.setStock(50);
    }

    private DevolucionRequest crearRequest(Integer cantidad) {
        DevolucionRequest req = new DevolucionRequest();
        req.setProductoId(1L);
        req.setCantidad(cantidad);
        req.setMotivo("DANO");
        req.setDescripcion("Empaque roto");
        return req;
    }

    @Test
    void procesar_devuelveStockAlInventario() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(devolucionRepository.save(any(Devolucion.class))).thenAnswer(inv -> inv.getArgument(0));

        devolucionService.procesar(crearRequest(5));

        // stock inicial 50 + 5 devueltos = 55
        assertThat(producto.getStock()).isEqualTo(55);
        verify(productoRepository).save(producto);
    }

    @Test
    void procesar_registraDatosDeLaDevolucion() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(devolucionRepository.save(any(Devolucion.class))).thenAnswer(inv -> inv.getArgument(0));

        Devolucion resultado = devolucionService.procesar(crearRequest(3));

        assertThat(resultado.getCantidad()).isEqualTo(3);
        assertThat(resultado.getMotivo()).isEqualTo("DANO");
        assertThat(resultado.getProducto()).isEqualTo(producto);
        assertThat(resultado.getFecha()).isNotNull();
    }

    @Test
    void procesar_cantidadCero_lanzaExcepcion() {
        assertThatThrownBy(() -> devolucionService.procesar(crearRequest(0)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("mayor que cero");
        verify(devolucionRepository, never()).save(any());
    }

    @Test
    void procesar_cantidadNegativa_lanzaExcepcion() {
        assertThatThrownBy(() -> devolucionService.procesar(crearRequest(-2)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("mayor que cero");
    }

    @Test
    void procesar_cantidadNula_lanzaExcepcion() {
        assertThatThrownBy(() -> devolucionService.procesar(crearRequest(null)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("mayor que cero");
    }

    @Test
    void procesar_productoInexistente_lanzaExcepcion() {
        when(productoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> devolucionService.procesar(crearRequest(2)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Producto no encontrado");
    }

    @Test
    void listar_devuelveTodasLasDevoluciones() {
        when(devolucionRepository.findAll()).thenReturn(List.of(new Devolucion(), new Devolucion()));

        assertThat(devolucionService.listar()).hasSize(2);
    }
}
