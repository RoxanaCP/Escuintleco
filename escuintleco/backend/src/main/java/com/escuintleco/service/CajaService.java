package com.escuintleco.service;

import com.escuintleco.model.AperturaCaja;
import com.escuintleco.model.Venta;
import com.escuintleco.repository.AperturaCajaRepository;
import com.escuintleco.repository.UsuarioRepository;
import com.escuintleco.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class CajaService {

    @Autowired private AperturaCajaRepository cajaRepository;
    @Autowired private VentaRepository ventaRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    public AperturaCaja abrir(BigDecimal montoApertura, String username) {
        Long usuarioId = usuarioRepository.findByUsername(username)
                .map(u -> u.getId()).orElse(null);

        AperturaCaja caja = new AperturaCaja();
        caja.setUsuarioId(usuarioId);
        caja.setFecha(LocalDate.now());
        caja.setMontoApertura(montoApertura);
        caja.setEstado("ABIERTA");
        return cajaRepository.save(caja);
    }

    public AperturaCaja cerrar() {
        LocalDate hoy = LocalDate.now();
        AperturaCaja caja = cajaRepository
                .findFirstByFechaAndEstadoOrderByIdDesc(hoy, "ABIERTA")
                .orElseThrow(() -> new RuntimeException("No hay caja abierta para hoy"));

        BigDecimal totalVentas = calcularVentasDelDia();
        caja.setMontoCierre(caja.getMontoApertura().add(totalVentas));
        caja.setEstado("CERRADA");
        return cajaRepository.save(caja);
    }

    public CorteCaja corteDelDia() {
        LocalDate hoy = LocalDate.now();
        BigDecimal totalVentas = calcularVentasDelDia();
        List<Venta> ventas = ventasDelDia();

        BigDecimal apertura = cajaRepository.findByFecha(hoy).stream()
                .findFirst().map(AperturaCaja::getMontoApertura).orElse(BigDecimal.ZERO);

        CorteCaja corte = new CorteCaja();
        corte.setFecha(hoy.toString());
        corte.setMontoApertura(apertura);
        corte.setTotalVentas(totalVentas);
        corte.setNumeroTransacciones(ventas.size());
        corte.setTotalEnCaja(apertura.add(totalVentas));
        return corte;
    }

    private BigDecimal calcularVentasDelDia() {
        return ventasDelDia().stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<Venta> ventasDelDia() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicio = hoy.atStartOfDay();
        LocalDateTime fin = hoy.atTime(LocalTime.MAX);
        return ventaRepository.findByFechaBetween(inicio, fin);
    }

    // Clase interna para el corte
    public static class CorteCaja {
        private String fecha;
        private BigDecimal montoApertura;
        private BigDecimal totalVentas;
        private Integer numeroTransacciones;
        private BigDecimal totalEnCaja;

        public String getFecha() { return fecha; }
        public void setFecha(String fecha) { this.fecha = fecha; }
        public BigDecimal getMontoApertura() { return montoApertura; }
        public void setMontoApertura(BigDecimal m) { this.montoApertura = m; }
        public BigDecimal getTotalVentas() { return totalVentas; }
        public void setTotalVentas(BigDecimal t) { this.totalVentas = t; }
        public Integer getNumeroTransacciones() { return numeroTransacciones; }
        public void setNumeroTransacciones(Integer n) { this.numeroTransacciones = n; }
        public BigDecimal getTotalEnCaja() { return totalEnCaja; }
        public void setTotalEnCaja(BigDecimal t) { this.totalEnCaja = t; }
    }
}
