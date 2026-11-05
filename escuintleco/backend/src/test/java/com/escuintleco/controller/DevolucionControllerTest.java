package com.escuintleco.controller;

import com.escuintleco.dto.DevolucionRequest;
import com.escuintleco.model.Devolucion;
import com.escuintleco.service.DevolucionService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DevolucionController.class)
@Import(TestSecurityConfig.class)
class DevolucionControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private DevolucionService devolucionService;

    @Test
    @WithMockUser
    void listar_devuelve200YLasDevoluciones() throws Exception {
        Devolucion d = new Devolucion();
        d.setId(1L);
        d.setCantidad(3);
        d.setMotivo("VENCIDO");
        when(devolucionService.listar()).thenReturn(List.of(d));

        mockMvc.perform(get("/api/devoluciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].motivo").value("VENCIDO"))
                .andExpect(jsonPath("$[0].cantidad").value(3));
    }

    @Test
    @WithMockUser
    void crear_devuelve200YLaDevolucionRegistrada() throws Exception {
        DevolucionRequest request = new DevolucionRequest();
        request.setProductoId(1L);
        request.setCantidad(2);
        request.setMotivo("DANO");

        Devolucion registrada = new Devolucion();
        registrada.setId(9L);
        registrada.setCantidad(2);
        registrada.setMotivo("DANO");
        when(devolucionService.procesar(any(DevolucionRequest.class))).thenReturn(registrada);

        mockMvc.perform(post("/api/devoluciones")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.motivo").value("DANO"));

        verify(devolucionService).procesar(any(DevolucionRequest.class));
    }
}
