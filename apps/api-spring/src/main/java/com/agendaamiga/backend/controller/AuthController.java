package com.agendaamiga.backend.controller;

import com.agendaamiga.backend.dto.auth.*;
import com.agendaamiga.backend.security.UserPrincipal;
import com.agendaamiga.backend.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for CPF {} / email {}", request.cpf(), request.email());
        final AuthResponse response = authService.register(request);
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/recover")
    public ResponseEntity<RecoverPasswordResponse> recover(@Valid @RequestBody RecoverRequest request) {
        final Optional<String> recoveryToken = authService.requestPasswordRecovery(request);
        final RecoverPasswordResponse payload = new RecoverPasswordResponse(
            "Se a conta existir, enviaremos as instrucoes para o email.",
            authService.getPasswordResetTtlMinutes(),
            recoveryToken.orElse(null)
        );
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/recover/confirm")
    public ResponseEntity<Map<String, String>> confirm(@Valid @RequestBody RecoverConfirmRequest request) {
        authService.confirmPasswordRecovery(request);
        return ResponseEntity.ok(Map.of("message", "Senha redefinida. Agora voce pode fazer login."));
    }

    @PostMapping("/send-temporary-password")
    public ResponseEntity<TemporaryPasswordResponse> sendTemporaryPassword(@Valid @RequestBody TemporaryPasswordRequest request) {
        return ResponseEntity.ok(authService.sendTemporaryPassword(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, AuthUserDto>> me(Authentication authentication) {
        final UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of("user", authService.currentUser(principal.getId())));
    }
}
