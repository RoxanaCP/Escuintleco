package com.escuintleco.service;

import com.escuintleco.dto.VentaRequest;
import com.escuintleco.model.*;
import com.escuintleco.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class VentaService {

    @Autowired private VentaRepository ventaRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private QrService qrService;

    @Transactional
    public Venta procesarVenta(VentaRequest request, String usernameActual) {
        Usuario usuario = usuarioRepository.findByUsername(usernameActual)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Venta venta = new Venta();
        venta.setNumeroFactura(generarNumeroFactura());
        venta.setFecha(LocalDateTime.now());
        venta.setFormaPago(request.getFormaPago());
        venta.setEstado("PAGADA");
        venta.setUsuario(usuario);
        venta.setDescuento(BigDecimal.ZERO);

        if (request.getClienteId() != null) {
            clienteRepository.findById(request.getClienteId())
                    .ifPresent(venta::setCliente);
        }

        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (VentaRequest.DetalleVentaRequest d : request.getDetalles()) {
            Producto producto = productoRepository.findById(d.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getStock() < d.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(d.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecioVenta());
            BigDecimal subDetalle = producto.getPrecioVenta()
                    .multiply(BigDecimal.valueOf(d.getCantidad()));
            detalle.setSubtotal(subDetalle);
            subtotal = subtotal.add(subDetalle);

            producto.setStock(producto.getStock() - d.getCantidad());
            productoRepository.save(producto);
            detalles.add(detalle);
        }

        venta.setSubtotal(subtotal);
        venta.setTotal(subtotal.subtract(venta.getDescuento()));
        venta.setDetalles(detalles);

        Venta ventaGuardada = ventaRepository.save(venta);

        // Generar QR con datos de la factura
        String qrContenido = buildQrContent(ventaGuardada);
        ventaGuardada.setQrCode(qrService.generarQrBase64(qrContenido));
        return ventaRepository.save(ventaGuardada);
    }

    public Venta buscarPorId(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
    }

    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    private String generarNumeroFactura() {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = ventaRepository.count() + 1;
        return "FAC-" + fecha + "-" + String.format("%04d", count);
    }

    private String buildQrContent(Venta venta) {
        StringBuilder sb = new StringBuilder();
        sb.append("FACTURA: ").append(venta.getNumeroFactura()).append("\n");
        sb.append("FECHA: ").append(venta.getFecha()).append("\n");
        sb.append("TOTAL: Q").append(venta.getTotal()).append("\n");
        sb.append("FORMA PAGO: ").append(venta.getFormaPago()).append("\n");
        sb.append("PROMOCION: Presenta este QR y obtén descuento en tu próxima compra");
        return sb.toString();
    }
}
