package com.agendaamiga.backend.dto.auth;

import jakarta.validation.constraints.Pattern;

public record RecoverRequest(
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 digitos")
    String cpf,

    String email
) {}
