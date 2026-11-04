package com.escuintleco.controller;

import com.escuintleco.model.Cliente;
import com.escuintleco.model.Producto;
import com.escuintleco.repository.ClienteRepository;
import com.escuintleco.repository.ProductoRepository;
import com.escuintleco.service.CajaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReporteController.class)
@Import(TestSecurityConfig.class)
class ReporteControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private ProductoRepository productoRepository;
    @MockBean private ClienteRepository clienteRepository;
    @MockBean private CajaService cajaService;

    private Producto crearProducto(String nombre, String codigo, int stock, int stockMinimo) {
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setCodigo(codigo);
        p.setStock(stock);
        p.setStockMinimo(stockMinimo);
        return p;
    }

    @Test
    @WithMockUser
    void cierreDia_devuelveElCorteDelDia() throws Exception {
        CajaService.CorteCaja corte = new CajaService.CorteCaja();
        corte.setNumeroTransacciones(4);
        corte.setTotalVentas(new BigDecimal("250.00"));
        corte.setTotalEnCaja(new BigDecimal("750.00"));
        when(cajaService.corteDelDia()).thenReturn(corte);

        mockMvc.perform(get("/api/reportes/cierre-dia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroTransacciones").value(4))
                .andExpect(jsonPath("$.totalEnCaja").value(750.00));
    }

    @Test
    @WithMockUser
    void existencias_marcaBajoCuandoElStockNoSuperaElMinimo() throws Exception {
        when(productoRepository.findByActivoTrue()).thenReturn(List.of(
                crearProducto("Fideos", "PAS001", 100, 5),
                crearProducto("Crema", "LAC001", 5, 5),
                crearProducto("Queso", "LAC002", 2, 5)));

        mockMvc.perform(get("/api/reportes/existencias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].estado").value("OK"))
                // stock igual al minimo cuenta como BAJO
                .andExpect(jsonPath("$[1].estado").value("BAJO"))
                .andExpect(jsonPath("$[2].estado").value("BAJO"));
    }

    @Test
    @WithMockUser
    void existencias_incluyeNombreCodigoYStock() throws Exception {
        when(productoRepository.findByActivoTrue()).thenReturn(List.of(
                crearProducto("Fideos", "PAS001", 100, 5)));

        mockMvc.perform(get("/api/reportes/existencias"))
                .andExpect(jsonPath("$[0].nombre").value("Fideos"))
                .andExpect(jsonPath("$[0].codigo").value("PAS001"))
                .andExpect(jsonPath("$[0].stock").value(100))
                .andExpect(jsonPath("$[0].stockMinimo").value(5));
    }

    @Test
    @WithMockUser
    void clientes_devuelveLosClientesActivos() throws Exception {
        Cliente c = new Cliente();
        c.setNombre("Consumidor Final");
        c.setNit("CF");
        when(clienteRepository.findByActivoTrue()).thenReturn(List.of(c));

        mockMvc.perform(get("/api/reportes/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nit").value("CF"));
    }
}
