package com.escuintleco.dto;

import lombok.Data;

@Data
public class DevolucionRequest {
    private Long ventaId;
    private Long productoId;
    private Integer cantidad;
    private String motivo;
    private String descripcion;
}
