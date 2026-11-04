package com.escuintleco.service;

import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

class QrServiceTest {

    private final QrService qrService = new QrService();

    private static final String PREFIJO = "data:image/png;base64,";

    @Test
    void generarQrBase64_devuelveUnaImagenPngEnBase64() {
        String resultado = qrService.generarQrBase64("FACTURA: FAC-20261101-0001");

        assertThat(resultado).startsWith(PREFIJO);
        assertThat(resultado.length()).isGreaterThan(PREFIJO.length());
    }

    @Test
    void generarQrBase64_elContenidoDecodificadoEsUnPngValido() {
        String resultado = qrService.generarQrBase64("contenido de prueba");

        byte[] bytes = Base64.getDecoder().decode(resultado.substring(PREFIJO.length()));

        // Todo archivo PNG empieza con la firma 0x89 'P' 'N' 'G'
        assertThat(bytes[0]).isEqualTo((byte) 0x89);
        assertThat(bytes[1]).isEqualTo((byte) 'P');
        assertThat(bytes[2]).isEqualTo((byte) 'N');
        assertThat(bytes[3]).isEqualTo((byte) 'G');
    }

    @Test
    void generarQrBase64_contenidosDistintosGeneranImagenesDistintas() {
        String a = qrService.generarQrBase64("FACTURA A");
        String b = qrService.generarQrBase64("FACTURA B");

        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void generarQrBase64_mismoContenidoGeneraLaMismaImagen() {
        String a = qrService.generarQrBase64("FACTURA IGUAL");
        String b = qrService.generarQrBase64("FACTURA IGUAL");

        assertThat(a).isEqualTo(b);
    }
}
