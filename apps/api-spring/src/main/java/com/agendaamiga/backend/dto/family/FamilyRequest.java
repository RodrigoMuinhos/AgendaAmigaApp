package com.agendaamiga.backend.dto.family;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record FamilyRequest(
    @NotBlank
    @Size(max = 160)
    String name,

    String postalCode,
    String address,
    String neighborhood,
    String city,
    String state,
    String primaryCaregiver,
    String primaryCaregiverRelationship,
    String contact,
    String caregiverPhone,
    String careFocus,
    String notes,
    List<FamilyMemberDto> members,
    List<CaregiverDto> caregivers
) {}
