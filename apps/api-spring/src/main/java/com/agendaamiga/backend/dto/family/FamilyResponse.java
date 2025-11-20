package com.agendaamiga.backend.dto.family;

import java.util.List;

public record FamilyResponse(
    String id,
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
