package com.escuintleco.controller;

import com.escuintleco.model.AperturaCaja;
import com.escuintleco.service.CajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/caja")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    @PostMapping("/abrir")
    public ResponseEntity<AperturaCaja> abrir(@RequestBody Map<String, Object> body, Authentication auth) {
        BigDecimal monto = new BigDecimal(body.get("montoApertura").toString());
        return ResponseEntity.ok(cajaService.abrir(monto, auth.getName()));
    }

    @PostMapping("/cerrar")
    public ResponseEntity<AperturaCaja> cerrar() {
        return ResponseEntity.ok(cajaService.cerrar());
    }

    @GetMapping("/corte")
    public ResponseEntity<CajaService.CorteCaja> corte() {
        return ResponseEntity.ok(cajaService.corteDelDia());
    }
}
