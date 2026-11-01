package com.escuintleco.controller;

import com.escuintleco.model.Cliente;
import com.escuintleco.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findByActivoTrue();
    }

    @GetMapping("/nit/{nit}")
    public ResponseEntity<Cliente> buscarPorNit(@PathVariable String nit) {
        return clienteRepository.findByNit(nit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cliente crear(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        return clienteRepository.findById(id).map(c -> {
            c.setNombre(cliente.getNombre());
            c.setNit(cliente.getNit());
            c.setTelefono(cliente.getTelefono());
            c.setEmail(cliente.getEmail());
            c.setDireccion(cliente.getDireccion());
            return ResponseEntity.ok(clienteRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }
}
