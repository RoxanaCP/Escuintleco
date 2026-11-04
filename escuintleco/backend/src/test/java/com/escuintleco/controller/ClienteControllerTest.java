package com.escuintleco.controller;

import com.escuintleco.model.Cliente;
import com.escuintleco.repository.ClienteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ClienteController.class)
@Import(TestSecurityConfig.class)
class ClienteControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ClienteRepository clienteRepository;

    private Cliente crearCliente(Long id, String nombre, String nit) {
        Cliente c = new Cliente();
        c.setId(id);
        c.setNombre(nombre);
        c.setNit(nit);
        return c;
    }

    @Test
    @WithMockUser
    void listar_devuelveLosClientesActivos() throws Exception {
        when(clienteRepository.findByActivoTrue()).thenReturn(List.of(
                crearCliente(1L, "Consumidor Final", "CF")));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nit").value("CF"));
    }

    @Test
    @WithMockUser
    void buscarPorNit_existente_devuelve200() throws Exception {
        when(clienteRepository.findByNit("1234567-8"))
                .thenReturn(Optional.of(crearCliente(2L, "Maria Garcia", "1234567-8")));

        mockMvc.perform(get("/api/clientes/nit/1234567-8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Maria Garcia"));
    }

    @Test
    @WithMockUser
    void buscarPorNit_inexistente_devuelve404() throws Exception {
        when(clienteRepository.findByNit("000")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/clientes/nit/000"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void crear_guardaYDevuelveElCliente() throws Exception {
        Cliente nuevo = crearCliente(null, "Juan Lopez", "9876543-2");
        when(clienteRepository.save(any(Cliente.class)))
                .thenReturn(crearCliente(3L, "Juan Lopez", "9876543-2"));

        mockMvc.perform(post("/api/clientes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.nit").value("9876543-2"));
    }

    @Test
    @WithMockUser
    void actualizar_existente_devuelveElClienteModificado() throws Exception {
        Cliente existente = crearCliente(4L, "Nombre viejo", "111");
        when(clienteRepository.findById(4L)).thenReturn(Optional.of(existente));
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(inv -> inv.getArgument(0));

        Cliente cambios = crearCliente(4L, "Nombre nuevo", "222");

        mockMvc.perform(put("/api/clientes/4")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambios)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Nombre nuevo"))
                .andExpect(jsonPath("$.nit").value("222"));
    }

    @Test
    @WithMockUser
    void actualizar_inexistente_devuelve404() throws Exception {
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/clientes/99")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearCliente(99L, "X", "0"))))
                .andExpect(status().isNotFound());
    }
}
