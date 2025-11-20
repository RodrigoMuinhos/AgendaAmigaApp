package com.agendaamiga.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RecoverConfirmRequest(
    @NotBlank
    @Size(min = 6)
    String token,

    @NotBlank
    @Size(min = 6, max = 128)
    String senha
) {}
