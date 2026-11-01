package com.escuintleco.controller;

import com.escuintleco.model.Producto;
import com.escuintleco.service.ProductoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ProductoController.class)
@Import(TestSecurityConfig.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductoService productoService;

    private Producto crearProducto(Long id, String codigo, String nombre) {
        Producto p = new Producto();
        p.setId(id);
        p.setCodigo(codigo);
        p.setNombre(nombre);
        p.setPrecioCompra(new BigDecimal("5.00"));
        p.setPrecioVenta(new BigDecimal("8.00"));
        p.setStock(100);
        p.setActivo(true);
        return p;
    }

    @Test
    @WithMockUser
    void listar_devuelve200YLista() throws Exception {
        when(productoService.listarActivos()).thenReturn(List.of(
                crearProducto(1L, "PAS001", "Fideos")
        ));

        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("PAS001"))
                .andExpect(jsonPath("$[0].nombre").value("Fideos"));
    }

    @Test
    @WithMockUser
    void buscarPorId_devuelve200YProducto() throws Exception {
        when(productoService.buscarPorId(1L)).thenReturn(crearProducto(1L, "PAS001", "Fideos"));

        mockMvc.perform(get("/api/productos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Fideos"));
    }

    @Test
    @WithMockUser
    void crear_devuelve200YProductoCreado() throws Exception {
        Producto nuevo = crearProducto(null, "LAC001", "Crema");
        Producto guardado = crearProducto(5L, "LAC001", "Crema");
        when(productoService.guardar(any(Producto.class))).thenReturn(guardado);

        mockMvc.perform(post("/api/productos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.codigo").value("LAC001"));
    }

    @Test
    @WithMockUser
    void actualizar_devuelve200YProductoActualizado() throws Exception {
        Producto cambios = crearProducto(1L, "PAS001", "Fideos Premium");
        when(productoService.actualizar(eq(1L), any(Producto.class))).thenReturn(cambios);

        mockMvc.perform(put("/api/productos/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambios)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Fideos Premium"));
    }

    @Test
    @WithMockUser
    void eliminar_devuelve204() throws Exception {
        doNothing().when(productoService).eliminar(1L);

        mockMvc.perform(delete("/api/productos/1").with(csrf()))
                .andExpect(status().isNoContent());

        verify(productoService).eliminar(1L);
    }
}
