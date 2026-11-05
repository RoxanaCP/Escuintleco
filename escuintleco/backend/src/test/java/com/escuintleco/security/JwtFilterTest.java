package com.escuintleco.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock private JwtUtil jwtUtil;
    @Mock private UserDetailsService userDetailsService;
    @Mock private FilterChain chain;

    private JwtFilter filtro;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setup() {
        filtro = new JwtFilter(jwtUtil, userDetailsService);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void limpiar() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void tokenValido_autenticaAlUsuarioYContinuaLaCadena() throws Exception {
        request.addHeader("Authorization", "Bearer token-valido");
        UserDetails usuario = User.builder().username("admin").password("x").roles("ADMIN").build();
        when(jwtUtil.validateToken("token-valido")).thenReturn(true);
        when(jwtUtil.extractUsername("token-valido")).thenReturn("admin");
        when(userDetailsService.loadUserByUsername("admin")).thenReturn(usuario);

        filtro.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("admin");
        verify(chain).doFilter(request, response);
    }

    @Test
    void tokenInvalido_noAutenticaPeroContinuaLaCadena() throws Exception {
        request.addHeader("Authorization", "Bearer token-malo");
        when(jwtUtil.validateToken("token-malo")).thenReturn(false);

        filtro.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(chain).doFilter(request, response);
    }

    @Test
    void sinHeaderAuthorization_noAutenticaPeroContinuaLaCadena() throws Exception {
        filtro.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil);
        verify(chain).doFilter(request, response);
    }

    @Test
    void headerSinPrefijoBearer_seIgnora() throws Exception {
        request.addHeader("Authorization", "Basic abc123");

        filtro.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtUtil);
        verify(chain).doFilter(request, response);
    }
}
