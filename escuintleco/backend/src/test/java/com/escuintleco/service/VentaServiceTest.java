package com.escuintleco.service;

import com.escuintleco.dto.VentaRequest;
import com.escuintleco.model.Producto;
import com.escuintleco.model.Usuario;
import com.escuintleco.model.Venta;
import com.escuintleco.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock private VentaRepository ventaRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private ClienteRepository clienteRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private QrService qrService;

    @InjectMocks
    private VentaService ventaService;

    private Usuario usuario;
    private Producto producto;

    @BeforeEach
    void setup() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUsername("admin");
        usuario.setNombre("Administrador");

        producto = new Producto();
        producto.setId(1L);
        producto.setCodigo("PAS001");
        producto.setNombre("Fideos");
        producto.setPrecioVenta(new BigDecimal("8.00"));
        producto.setStock(100);
    }

    private VentaRequest crearRequest(Long productoId, int cantidad) {
        VentaRequest req = new VentaRequest();
        req.setFormaPago("EFECTIVO");
        VentaRequest.DetalleVentaRequest d = new VentaRequest.DetalleVentaRequest();
        d.setProductoId(productoId);
        d.setCantidad(cantidad);
        req.setDetalles(Collections.singletonList(d));
        return req;
    }

    @Test
    void procesarVenta_calculaSubtotalYTotalCorrectamente() {
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(ventaRepository.count()).thenReturn(0L);
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(qrService.generarQrBase64(any())).thenReturn("data:image/png;base64,xxx");

        // 5 unidades a Q8.00 = Q40.00
        Venta venta = ventaService.procesarVenta(crearRequest(1L, 5), "admin");

        assertThat(venta.getSubtotal()).isEqualByComparingTo("40.00");
        assertThat(venta.getTotal()).isEqualByComparingTo("40.00");
    }

    @Test
    void procesarVenta_descuentaStock() {
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(ventaRepository.count()).thenReturn(0L);
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(qrService.generarQrBase64(any())).thenReturn("qr");

        ventaService.procesarVenta(crearRequest(1L, 10), "admin");

        // stock inicial 100 - 10 vendidos = 90
        assertThat(producto.getStock()).isEqualTo(90);
        verify(productoRepository).save(producto);
    }

    @Test
    void procesarVenta_stockInsuficiente_lanzaExcepcion() {
        producto.setStock(3);
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        assertThatThrownBy(() -> ventaService.procesarVenta(crearRequest(1L, 10), "admin"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Stock insuficiente");
    }

    @Test
    void procesarVenta_usuarioInexistente_lanzaExcepcion() {
        when(usuarioRepository.findByUsername("fantasma")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ventaService.procesarVenta(crearRequest(1L, 1), "fantasma"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }

    @Test
    void procesarVenta_generaNumeroFacturaYQr() {
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(ventaRepository.count()).thenReturn(0L);
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(qrService.generarQrBase64(any())).thenReturn("data:image/png;base64,qr");

        Venta venta = ventaService.procesarVenta(crearRequest(1L, 1), "admin");

        assertThat(venta.getNumeroFactura()).startsWith("FAC-");
        assertThat(venta.getQrCode()).contains("base64");
    }

    @Test
    void buscarPorId_inexistente_lanzaExcepcion() {
        when(ventaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ventaService.buscarPorId(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("no encontrada");
    }

    @Test
    void listarTodas_devuelveLista() {
        when(ventaRepository.findAll()).thenReturn(List.of(new Venta()));

        List<Venta> resultado = ventaService.listarTodas();

        assertThat(resultado).hasSize(1);
    }
}
