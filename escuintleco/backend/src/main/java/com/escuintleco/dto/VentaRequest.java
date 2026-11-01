package com.escuintleco.dto;

import lombok.Data;
import java.util.List;

@Data
public class VentaRequest {
    private Long clienteId;
    private String formaPago;
    private List<DetalleVentaRequest> detalles;

    @Data
    public static class DetalleVentaRequest {
        private Long productoId;
        private Integer cantidad;
    }
}
