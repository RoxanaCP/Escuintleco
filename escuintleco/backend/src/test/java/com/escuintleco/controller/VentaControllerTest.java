package com.escuintleco.controller;

import com.escuintleco.dto.VentaRequest;
import com.escuintleco.model.Venta;
import com.escuintleco.service.VentaService;
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
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = VentaController.class)
@Import(TestSecurityConfig.class)
class VentaControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private VentaService ventaService;

    private Venta crearVenta(Long id, String factura, String total) {
        Venta v = new Venta();
        v.setId(id);
        v.setNumeroFactura(factura);
        v.setTotal(new BigDecimal(total));
        v.setFormaPago("EFECTIVO");
        return v;
    }

    @Test
    @WithMockUser(username = "admin")
    void procesarVenta_devuelve200YLaVentaCreada() throws Exception {
        VentaRequest request = new VentaRequest();
        request.setFormaPago("EFECTIVO");
        VentaRequest.DetalleVentaRequest detalle = new VentaRequest.DetalleVentaRequest();
        detalle.setProductoId(1L);
        detalle.setCantidad(2);
        request.setDetalles(Collections.singletonList(detalle));

        when(ventaService.procesarVenta(any(VentaRequest.class), eq("admin")))
                .thenReturn(crearVenta(10L, "FAC-20261101-0001", "16.00"));

        mockMvc.perform(post("/api/ventas")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.numeroFactura").value("FAC-20261101-0001"))
                .andExpect(jsonPath("$.total").value(16.00));

        verify(ventaService).procesarVenta(any(VentaRequest.class), eq("admin"));
    }

    @Test
    @WithMockUser
    void buscarPorId_devuelve200YLaVenta() throws Exception {
        when(ventaService.buscarPorId(5L)).thenReturn(crearVenta(5L, "FAC-20261101-0005", "40.00"));

        mockMvc.perform(get("/api/ventas/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroFactura").value("FAC-20261101-0005"));
    }

    @Test
    @WithMockUser
    void listarTodas_devuelve200YLaLista() throws Exception {
        when(ventaService.listarTodas()).thenReturn(List.of(
                crearVenta(1L, "FAC-1", "10.00"),
                crearVenta(2L, "FAC-2", "20.00")));

        mockMvc.perform(get("/api/ventas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].numeroFactura").value("FAC-2"));
    }
}
