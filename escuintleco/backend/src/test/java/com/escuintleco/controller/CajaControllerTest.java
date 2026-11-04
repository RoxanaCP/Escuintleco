package com.escuintleco.controller;

import com.escuintleco.model.AperturaCaja;
import com.escuintleco.service.CajaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CajaController.class)
@Import(TestSecurityConfig.class)
class CajaControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private CajaService cajaService;

    @Test
    @WithMockUser(username = "cajero1")
    void abrir_devuelve200YLaCajaAbierta() throws Exception {
        AperturaCaja caja = new AperturaCaja();
        caja.setId(1L);
        caja.setMontoApertura(new BigDecimal("500.00"));
        caja.setEstado("ABIERTA");
        when(cajaService.abrir(any(BigDecimal.class), eq("cajero1"))).thenReturn(caja);

        mockMvc.perform(post("/api/caja/abrir")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"montoApertura\": 500.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ABIERTA"))
                .andExpect(jsonPath("$.montoApertura").value(500.00));

        verify(cajaService).abrir(any(BigDecimal.class), eq("cajero1"));
    }

    @Test
    @WithMockUser
    void cerrar_devuelve200YLaCajaCerrada() throws Exception {
        AperturaCaja caja = new AperturaCaja();
        caja.setEstado("CERRADA");
        caja.setMontoCierre(new BigDecimal("650.50"));
        when(cajaService.cerrar()).thenReturn(caja);

        mockMvc.perform(post("/api/caja/cerrar").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CERRADA"))
                .andExpect(jsonPath("$.montoCierre").value(650.50));
    }

    @Test
    @WithMockUser
    void corte_devuelve200YElResumenDelDia() throws Exception {
        CajaService.CorteCaja corte = new CajaService.CorteCaja();
        corte.setFecha("2026-11-01");
        corte.setMontoApertura(new BigDecimal("200.00"));
        corte.setTotalVentas(new BigDecimal("125.00"));
        corte.setNumeroTransacciones(3);
        corte.setTotalEnCaja(new BigDecimal("325.00"));
        when(cajaService.corteDelDia()).thenReturn(corte);

        mockMvc.perform(get("/api/caja/corte"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroTransacciones").value(3))
                .andExpect(jsonPath("$.totalEnCaja").value(325.00));
    }
}
