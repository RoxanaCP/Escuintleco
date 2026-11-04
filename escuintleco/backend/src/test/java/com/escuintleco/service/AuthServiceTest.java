package com.escuintleco.service;

import com.escuintleco.dto.LoginRequest;
import com.escuintleco.dto.LoginResponse;
import com.escuintleco.model.Usuario;
import com.escuintleco.repository.UsuarioRepository;
import com.escuintleco.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private LoginRequest crearRequest(String username, String password) {
        LoginRequest req = new LoginRequest();
        req.setUsername(username);
        req.setPassword(password);
        return req;
    }

    @Test
    void login_credencialesValidas_devuelveTokenYDatosDelUsuario() {
        Usuario usuario = new Usuario();
        usuario.setUsername("admin");
        usuario.setNombre("Administrador");
        usuario.setRol("ADMIN");
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateToken("admin", "ADMIN")).thenReturn("token-xyz");

        LoginResponse respuesta = authService.login(crearRequest("admin", "admin123"));

        assertThat(respuesta.getToken()).isEqualTo("token-xyz");
        assertThat(respuesta.getUsername()).isEqualTo("admin");
        assertThat(respuesta.getNombre()).isEqualTo("Administrador");
        assertThat(respuesta.getRol()).isEqualTo("ADMIN");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_credencialesInvalidas_propagaLaExcepcionYNoGeneraToken() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("credenciales invalidas"));

        assertThatThrownBy(() -> authService.login(crearRequest("admin", "mala")))
                .isInstanceOf(BadCredentialsException.class);

        verify(jwtUtil, never()).generateToken(any(), any());
    }

    @Test
    void login_usuarioAutenticadoPeroInexistenteEnBd_lanzaExcepcion() {
        when(usuarioRepository.findByUsername("fantasma")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(crearRequest("fantasma", "x")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }
}
