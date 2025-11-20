package com.agendaamiga.backend.dto.treatment;

public record TreatmentResponse(
    String id,
    String familyId,
    String name,
    String dose,
    String schedule,
    String instructions,
    String nextDose,
    String createdAt,
    String updatedAt
) {}
