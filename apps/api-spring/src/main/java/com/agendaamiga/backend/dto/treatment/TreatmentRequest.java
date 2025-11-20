package com.agendaamiga.backend.dto.treatment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TreatmentRequest(
    @NotBlank
    String familyId,

    @NotBlank
    String name,

    @NotBlank
    String dose,

    @NotBlank
    String schedule,

    String instructions,

    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}.*", message = "Formato de proxima dose invalido")
    String nextDose
) {}
