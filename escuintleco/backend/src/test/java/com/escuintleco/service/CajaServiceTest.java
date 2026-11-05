package com.escuintleco.service;

import com.escuintleco.model.AperturaCaja;
import com.escuintleco.model.Usuario;
import com.escuintleco.model.Venta;
import com.escuintleco.repository.AperturaCajaRepository;
import com.escuintleco.repository.UsuarioRepository;
import com.escuintleco.repository.VentaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CajaServiceTest {

    @Mock private AperturaCajaRepository cajaRepository;
    @Mock private VentaRepository ventaRepository;
    @Mock private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CajaService cajaService;

    private Venta crearVenta(String total) {
        Venta v = new Venta();
        v.setTotal(new BigDecimal(total));
        return v;
    }

    private AperturaCaja crearCaja(String monto) {
        AperturaCaja c = new AperturaCaja();
        c.setMontoApertura(new BigDecimal(monto));
        c.setEstado("ABIERTA");
        c.setFecha(LocalDate.now());
        return c;
    }

    @Test
    void abrir_registraCajaAbiertaConElMontoInicial() {
        Usuario usuario = new Usuario();
        usuario.setId(7L);
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(cajaRepository.save(any(AperturaCaja.class))).thenAnswer(inv -> inv.getArgument(0));

        AperturaCaja caja = cajaService.abrir(new BigDecimal("500.00"), "admin");

        assertThat(caja.getEstado()).isEqualTo("ABIERTA");
        assertThat(caja.getMontoApertura()).isEqualByComparingTo("500.00");
        assertThat(caja.getUsuarioId()).isEqualTo(7L);
        assertThat(caja.getFecha()).isEqualTo(LocalDate.now());
    }

    @Test
    void abrir_usuarioInexistente_guardaSinUsuarioId() {
        when(usuarioRepository.findByUsername("nadie")).thenReturn(Optional.empty());
        when(cajaRepository.save(any(AperturaCaja.class))).thenAnswer(inv -> inv.getArgument(0));

        AperturaCaja caja = cajaService.abrir(new BigDecimal("100.00"), "nadie");

        assertThat(caja.getUsuarioId()).isNull();
    }

    @Test
    void cerrar_sumaLasVentasDelDiaAlMontoDeApertura() {
        AperturaCaja caja = crearCaja("500.00");
        when(cajaRepository.findFirstByFechaAndEstadoOrderByIdDesc(any(LocalDate.class), eq("ABIERTA")))
                .thenReturn(Optional.of(caja));
        when(ventaRepository.findByFechaBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(crearVenta("100.00"), crearVenta("50.50")));
        when(cajaRepository.save(any(AperturaCaja.class))).thenAnswer(inv -> inv.getArgument(0));

        AperturaCaja cerrada = cajaService.cerrar();

        // 500.00 + 100.00 + 50.50 = 650.50
        assertThat(cerrada.getMontoCierre()).isEqualByComparingTo("650.50");
        assertThat(cerrada.getEstado()).isEqualTo("CERRADA");
    }

    @Test
    void cerrar_sinVentas_elMontoDeCierreEsElDeApertura() {
        AperturaCaja caja = crearCaja("300.00");
        when(cajaRepository.findFirstByFechaAndEstadoOrderByIdDesc(any(LocalDate.class), eq("ABIERTA")))
                .thenReturn(Optional.of(caja));
        when(ventaRepository.findByFechaBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(cajaRepository.save(any(AperturaCaja.class))).thenAnswer(inv -> inv.getArgument(0));

        AperturaCaja cerrada = cajaService.cerrar();

        assertThat(cerrada.getMontoCierre()).isEqualByComparingTo("300.00");
    }

    @Test
    void cerrar_sinCajaAbierta_lanzaExcepcion() {
        when(cajaRepository.findFirstByFechaAndEstadoOrderByIdDesc(any(LocalDate.class), eq("ABIERTA")))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> cajaService.cerrar())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("No hay caja abierta");
    }

    @Test
    void corteDelDia_calculaTotalesCorrectamente() {
        when(ventaRepository.findByFechaBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(crearVenta("40.00"), crearVenta("60.00"), crearVenta("25.00")));
        when(cajaRepository.findByFecha(any(LocalDate.class))).thenReturn(List.of(crearCaja("200.00")));

        CajaService.CorteCaja corte = cajaService.corteDelDia();

        assertThat(corte.getNumeroTransacciones()).isEqualTo(3);
        assertThat(corte.getTotalVentas()).isEqualByComparingTo("125.00");
        assertThat(corte.getMontoApertura()).isEqualByComparingTo("200.00");
        assertThat(corte.getTotalEnCaja()).isEqualByComparingTo("325.00");
        assertThat(corte.getFecha()).isEqualTo(LocalDate.now().toString());
    }

    @Test
    void corteDelDia_sinAperturaNiVentas_devuelveCeros() {
        when(ventaRepository.findByFechaBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(cajaRepository.findByFecha(any(LocalDate.class))).thenReturn(List.of());

        CajaService.CorteCaja corte = cajaService.corteDelDia();

        assertThat(corte.getNumeroTransacciones()).isZero();
        assertThat(corte.getTotalVentas()).isEqualByComparingTo("0");
        assertThat(corte.getMontoApertura()).isEqualByComparingTo("0");
        assertThat(corte.getTotalEnCaja()).isEqualByComparingTo("0");
    }
}
