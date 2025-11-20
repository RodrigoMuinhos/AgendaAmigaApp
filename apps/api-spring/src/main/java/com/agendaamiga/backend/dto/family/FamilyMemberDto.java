package com.agendaamiga.backend.dto.family;

public record FamilyMemberDto(
    String id,
    String name,
    String birthdate,
    String document,
    String postalCode,
    String addressNumber,
    String address,
    String neighborhood,
    String city,
    String state,
    String avatar,
    String medicalHistory,
    String limitations,
    String allergies,
    String weight,
    String height,
    String imc,
    String needs
) {}
