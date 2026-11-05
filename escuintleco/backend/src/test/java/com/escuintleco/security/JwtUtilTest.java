package com.escuintleco.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String SECRETO =
            "secreto_de_prueba_suficientemente_largo_para_hmac_sha256_escuintleco";

    private JwtUtil jwtUtil;

    @BeforeEach
    void setup() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRETO);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3_600_000L);
    }

    @Test
    void generateToken_creaUnTokenConTresPartes() {
        String token = jwtUtil.generateToken("admin", "ADMIN");

        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void extractUsername_devuelveElUsuarioDelToken() {
        String token = jwtUtil.generateToken("cajero1", "CAJERO");

        assertThat(jwtUtil.extractUsername(token)).isEqualTo("cajero1");
    }

    @Test
    void validateToken_tokenValido_devuelveTrue() {
        String token = jwtUtil.generateToken("admin", "ADMIN");

        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_tokenMalformado_devuelveFalse() {
        assertThat(jwtUtil.validateToken("esto.no.es-un-jwt")).isFalse();
    }

    @Test
    void validateToken_cadenaVacia_devuelveFalse() {
        assertThat(jwtUtil.validateToken("")).isFalse();
    }

    @Test
    void validateToken_firmadoConOtroSecreto_devuelveFalse() {
        JwtUtil otro = new JwtUtil();
        ReflectionTestUtils.setField(otro, "secret",
                "otro_secreto_completamente_distinto_y_tambien_muy_largo_123456");
        ReflectionTestUtils.setField(otro, "expiration", 3_600_000L);
        String tokenAjeno = otro.generateToken("admin", "ADMIN");

        assertThat(jwtUtil.validateToken(tokenAjeno)).isFalse();
    }

    @Test
    void validateToken_tokenExpirado_devuelveFalse() {
        ReflectionTestUtils.setField(jwtUtil, "expiration", -1000L);
        String tokenExpirado = jwtUtil.generateToken("admin", "ADMIN");

        assertThat(jwtUtil.validateToken(tokenExpirado)).isFalse();
    }
}
