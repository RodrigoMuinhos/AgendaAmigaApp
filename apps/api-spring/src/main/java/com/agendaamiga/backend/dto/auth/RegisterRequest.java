package com.agendaamiga.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank
    @Size(max = 160)
    String nome,

    @NotBlank
    @Pattern(regexp = "\\d{9,11}", message = "Documento deve conter entre 9 e 11 digitos")
    String cpf,

    @Email
    @Size(max = 160)
    String email
) {}
