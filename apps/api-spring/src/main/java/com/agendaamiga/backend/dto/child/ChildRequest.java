package com.agendaamiga.backend.dto.child;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChildRequest(
    @NotBlank
    String nome,

    @NotBlank
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Data deve estar no formato YYYY-MM-DD")
    String nascimentoISO,

    String sexo,
    String cartaoSUS,
    String cpf,
    String convenioOperadora,
    String convenioNumero,
    String tipoSanguineo,
    ResponsavelDto responsavel
) {
    public record ResponsavelDto(String nome, String parentesco, String telefone) {}
}
