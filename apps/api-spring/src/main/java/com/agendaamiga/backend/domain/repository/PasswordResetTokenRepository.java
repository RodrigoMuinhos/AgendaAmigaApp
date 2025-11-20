package com.agendaamiga.backend.domain.repository;

import com.agendaamiga.backend.domain.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUserId(UUID userId);
}
