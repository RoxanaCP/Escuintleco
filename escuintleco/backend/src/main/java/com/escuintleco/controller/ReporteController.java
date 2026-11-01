package com.escuintleco.controller;

import com.escuintleco.model.Producto;
import com.escuintleco.repository.ClienteRepository;
import com.escuintleco.repository.ProductoRepository;
import com.escuintleco.service.CajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired private ProductoRepository productoRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private CajaService cajaService;

    @GetMapping("/cierre-dia")
    public CajaService.CorteCaja cierreDia() {
        return cajaService.corteDelDia();
    }

    @GetMapping("/existencias")
    public List<Map<String, Object>> existencias() {
        return productoRepository.findByActivoTrue().stream().map(p -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("nombre", p.getNombre());
            m.put("codigo", p.getCodigo());
            m.put("stock", p.getStock());
            m.put("stockMinimo", p.getStockMinimo());
            m.put("estado", p.getStock() <= p.getStockMinimo() ? "BAJO" : "OK");
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/clientes")
    public Object reporteClientes() {
        return clienteRepository.findByActivoTrue();
    }
}
