package com.agendaamiga.backend.service;

import com.agendaamiga.backend.domain.model.PasswordResetToken;
import com.agendaamiga.backend.domain.model.User;
import com.agendaamiga.backend.domain.repository.PasswordResetTokenRepository;
import com.agendaamiga.backend.domain.repository.UserRepository;
import com.agendaamiga.backend.dto.auth.*;
import com.agendaamiga.backend.security.JwtTokenProvider;
import com.agendaamiga.backend.service.notification.NotificationService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final NotificationService notificationService;
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final int passwordResetTtlMinutes;
    private final boolean exposeRecoveryToken;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
        UserRepository userRepository,
        PasswordResetTokenRepository passwordResetTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider,
        NotificationService notificationService,
        @Value("${app.auth.password-reset-ttl-minutes:30}") int passwordResetTtlMinutes,
        @Value("${app.auth.expose-recovery-token:false}") boolean exposeRecoveryToken
    ) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.notificationService = notificationService;
        this.passwordResetTtlMinutes = passwordResetTtlMinutes;
        this.exposeRecoveryToken = exposeRecoveryToken;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Creating user {} ({})", request.nome(), request.email());
        ensureUniqueEmailAndCpf(request.email(), request.cpf());
        final User user = new User();
        user.setNome(request.nome());
        user.setCpf(request.cpf());
        user.setEmail(request.email());
        final String temporaryPassword = generateTemporaryPassword();
        user.setSenhaHash(passwordEncoder.encode(temporaryPassword));
        final User saved = userRepository.save(user);
        log.info("User {} saved. Sending welcome email with temporary password.", saved.getEmail());
        notificationService.notifyRegistration(saved, temporaryPassword);
        return mapToAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        final Optional<User> candidate = findByCpfOrEmail(request.cpf(), request.email());
        final User user = candidate.orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Credenciais invalidas."
        ));
        if (!passwordEncoder.matches(request.senha(), user.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas.");
        }
        return mapToAuthResponse(user);
    }

    @Transactional
    public Optional<String> requestPasswordRecovery(RecoverRequest request) {
        final Optional<User> candidate = findByCpfOrEmail(request.cpf(), request.email());
        if (candidate.isEmpty()) {
            return Optional.empty();
        }
        final User user = candidate.get();
        passwordResetTokenRepository.deleteByUserId(user.getId());
        final String token = UUID.randomUUID().toString().replace("-", "");
        final Instant expiresAt = Instant.now().plus(passwordResetTtlMinutes, ChronoUnit.MINUTES);
        final PasswordResetToken record = new PasswordResetToken();
        record.setUser(user);
        record.setToken(token);
        record.setExpiresAt(expiresAt);
        passwordResetTokenRepository.save(record);
        notificationService.notifyPasswordRecovery(user, token, passwordResetTtlMinutes);
        return exposeRecoveryToken ? Optional.of(token) : Optional.empty();
    }

    @Transactional
    public void confirmPasswordRecovery(RecoverConfirmRequest request) {
        final PasswordResetToken record = passwordResetTokenRepository.findByToken(request.token())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Codigo invalido ou expirado."));
        if (record.getUsedAt() != null || record.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo invalido ou expirado.");
        }
        final User user = record.getUser();
        user.setSenhaHash(passwordEncoder.encode(request.senha()));
        userRepository.save(user);
        record.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(record);
    }

    public AuthUserDto currentUser(UUID userId) {
        return userRepository.findById(userId)
            .map(this::mapToUserDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
    }

    public int getPasswordResetTtlMinutes() {
        return passwordResetTtlMinutes;
    }

    public TemporaryPasswordResponse sendTemporaryPassword(TemporaryPasswordRequest request) {
        final User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
        final String temporaryPassword = generateTemporaryPassword();
        user.setSenhaHash(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);
        notificationService.notifyTemporaryPassword(user, temporaryPassword);
        return new TemporaryPasswordResponse("Senha temporaria enviada para o email cadastrado.", temporaryPassword);
    }

    private String generateTemporaryPassword() {
        final String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        final char[] buffer = new char[6 + secureRandom.nextInt(3)];
        for (int i = 0; i < buffer.length; i++) {
            buffer[i] = alphabet.charAt(secureRandom.nextInt(alphabet.length()));
        }
        return new String(buffer);
    }

    private AuthResponse mapToAuthResponse(User user) {
        return new AuthResponse(jwtTokenProvider.generateToken(user.getId()), mapToUserDto(user));
    }

    private AuthUserDto mapToUserDto(User user) {
        final AuthUserDto.ResponsavelDto responsavel = new AuthUserDto.ResponsavelDto(
            user.getResponsavelNome(),
            user.getResponsavelParentesco(),
            user.getResponsavelTelefone(),
            user.getResponsavelCpf()
        );
        return new AuthUserDto(
            user.getId().toString(),
            user.getNome(),
            user.getEmail(),
            user.getEmail() != null,
            user.getCpf(),
            user.getCriadoEm().toString(),
            user.getAtualizadoEm().toString(),
            responsavel
        );
    }

    private Optional<User> findByCpfOrEmail(String cpf, String email) {
        if (cpf != null && !cpf.isBlank()) {
            return userRepository.findByCpf(cpf);
        }
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email);
        }
        return Optional.empty();
    }

    private void ensureUniqueEmailAndCpf(String email, String cpf) {
        if (cpf != null && userRepository.findByCpf(cpf).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF ja cadastrado.");
        }
        if (email != null && userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado.");
        }
    }
}
