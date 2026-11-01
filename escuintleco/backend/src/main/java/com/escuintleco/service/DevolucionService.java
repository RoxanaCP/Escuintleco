package com.escuintleco.service;

import com.escuintleco.dto.DevolucionRequest;
import com.escuintleco.model.Devolucion;
import com.escuintleco.model.Producto;
import com.escuintleco.repository.DevolucionRepository;
import com.escuintleco.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DevolucionService {

    @Autowired private DevolucionRepository devolucionRepository;
    @Autowired private ProductoRepository productoRepository;

    @Transactional
    public Devolucion procesar(DevolucionRequest request) {
        if (request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor que cero");
        }

        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Devolucion dev = new Devolucion();
        dev.setVentaId(request.getVentaId());
        dev.setProducto(producto);
        dev.setCantidad(request.getCantidad());
        dev.setMotivo(request.getMotivo());
        dev.setDescripcion(request.getDescripcion());
        dev.setFecha(LocalDateTime.now());

        // Devolver el producto al inventario (RN-08)
        producto.setStock(producto.getStock() + request.getCantidad());
        productoRepository.save(producto);

        return devolucionRepository.save(dev);
    }

    public List<Devolucion> listar() {
        return devolucionRepository.findAll();
    }
}
