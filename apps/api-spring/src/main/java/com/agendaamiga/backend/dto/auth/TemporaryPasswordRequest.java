package com.agendaamiga.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TemporaryPasswordRequest(
    @NotBlank @Email String email
) {}
