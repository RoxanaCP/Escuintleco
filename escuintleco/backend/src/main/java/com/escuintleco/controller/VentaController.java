package com.escuintleco.controller;

import com.escuintleco.dto.VentaRequest;
import com.escuintleco.model.Venta;
import com.escuintleco.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @PostMapping
    public ResponseEntity<Venta> procesarVenta(@RequestBody VentaRequest request,
                                                Authentication auth) {
        Venta venta = ventaService.procesarVenta(request, auth.getName());
        return ResponseEntity.ok(venta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.buscarPorId(id));
    }

    @GetMapping
    public List<Venta> listarTodas() {
        return ventaService.listarTodas();
    }
}
