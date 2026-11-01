package com.escuintleco.controller;

import com.escuintleco.dto.DevolucionRequest;
import com.escuintleco.model.Devolucion;
import com.escuintleco.service.DevolucionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devoluciones")
public class DevolucionController {

    @Autowired
    private DevolucionService devolucionService;

    @GetMapping
    public List<Devolucion> listar() {
        return devolucionService.listar();
    }

    @PostMapping
    public ResponseEntity<Devolucion> crear(@RequestBody DevolucionRequest request) {
        return ResponseEntity.ok(devolucionService.procesar(request));
    }
}
