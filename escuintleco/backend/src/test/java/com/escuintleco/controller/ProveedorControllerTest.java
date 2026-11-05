package com.escuintleco.controller;

import com.escuintleco.model.Proveedor;
import com.escuintleco.repository.ProveedorRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProveedorController.class)
@Import(TestSecurityConfig.class)
class ProveedorControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ProveedorRepository proveedorRepository;

    private Proveedor crearProveedor(Long id, String nombre) {
        Proveedor p = new Proveedor();
        p.setId(id);
        p.setNombre(nombre);
        p.setActivo(true);
        return p;
    }

    @Test
    @WithMockUser
    void listar_devuelveLosProveedoresActivos() throws Exception {
        when(proveedorRepository.findByActivoTrue()).thenReturn(List.of(
                crearProveedor(1L, "Distribuidora Guatemala")));

        mockMvc.perform(get("/api/proveedores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Distribuidora Guatemala"));
    }

    @Test
    @WithMockUser
    void buscarPorId_existente_devuelve200() throws Exception {
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(crearProveedor(1L, "Carnes del Norte")));

        mockMvc.perform(get("/api/proveedores/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Carnes del Norte"));
    }

    @Test
    @WithMockUser
    void buscarPorId_inexistente_devuelve404() throws Exception {
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/proveedores/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void crear_guardaYDevuelveElProveedor() throws Exception {
        when(proveedorRepository.save(any(Proveedor.class))).thenReturn(crearProveedor(5L, "Lacteos San Jose"));

        mockMvc.perform(post("/api/proveedores")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearProveedor(null, "Lacteos San Jose"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    @WithMockUser
    void actualizar_existente_devuelveElProveedorModificado() throws Exception {
        when(proveedorRepository.findById(2L)).thenReturn(Optional.of(crearProveedor(2L, "Nombre viejo")));
        when(proveedorRepository.save(any(Proveedor.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/proveedores/2")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearProveedor(2L, "Nombre nuevo"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Nombre nuevo"));
    }

    @Test
    @WithMockUser
    void actualizar_inexistente_devuelve404() throws Exception {
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/proveedores/99")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearProveedor(99L, "X"))))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void eliminar_existente_haceSoftDeleteYDevuelve204() throws Exception {
        Proveedor existente = crearProveedor(3L, "Para borrar");
        when(proveedorRepository.findById(3L)).thenReturn(Optional.of(existente));

        mockMvc.perform(delete("/api/proveedores/3").with(csrf()))
                .andExpect(status().isNoContent());

        assertThat(existente.getActivo()).isFalse();
        verify(proveedorRepository).save(existente);
    }

    @Test
    @WithMockUser
    void eliminar_inexistente_devuelve404() throws Exception {
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/proveedores/99").with(csrf()))
                .andExpect(status().isNotFound());
    }
}
