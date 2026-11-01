package com.escuintleco.service;

import com.escuintleco.dto.LoginRequest;
import com.escuintleco.dto.LoginResponse;
import com.escuintleco.model.Usuario;
import com.escuintleco.repository.UsuarioRepository;
import com.escuintleco.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol());

        return new LoginResponse(token, usuario.getUsername(), usuario.getNombre(), usuario.getRol());
    }
}
