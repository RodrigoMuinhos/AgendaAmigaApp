package com.agendaamiga.backend.service;

import com.agendaamiga.backend.domain.model.Caregiver;
import com.agendaamiga.backend.domain.model.Family;
import com.agendaamiga.backend.domain.model.FamilyMember;
import com.agendaamiga.backend.domain.repository.FamilyRepository;
import com.agendaamiga.backend.dto.family.CaregiverDto;
import com.agendaamiga.backend.dto.family.FamilyMemberDto;
import com.agendaamiga.backend.dto.family.FamilyRequest;
import com.agendaamiga.backend.dto.family.FamilyResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FamilyService {
    private final FamilyRepository familyRepository;

    public FamilyService(FamilyRepository familyRepository) {
        this.familyRepository = familyRepository;
    }

    public List<FamilyResponse> findAllFamilies() {
        return familyRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public FamilyResponse createFamily(FamilyRequest request) {
        final Family family = new Family();
        family.setName(request.name());
        family.setPostalCode(request.postalCode());
        family.setAddress(request.address());
        family.setNeighborhood(request.neighborhood());
        family.setCity(request.city());
        family.setState(request.state());
        family.setPrimaryCaregiver(request.primaryCaregiver());
        family.setPrimaryCaregiverRelationship(request.primaryCaregiverRelationship());
        family.setContact(request.contact());
        family.setCaregiverPhone(request.caregiverPhone());
        family.setCareFocus(request.careFocus());
        family.setNotes(request.notes());

        family.setMembers(safe(request.members()).stream()
            .map(dto -> toFamilyMember(family, dto))
            .collect(Collectors.toList()));
        family.setCaregivers(safe(request.caregivers()).stream()
            .map(dto -> toCaregiver(family, dto))
            .collect(Collectors.toList()));

        final Family saved = familyRepository.save(family);
        return mapToDto(saved);
    }

    private FamilyMember toFamilyMember(Family family, FamilyMemberDto dto) {
        final FamilyMember member = new FamilyMember();
        member.setFamily(family);
        member.setName(dto.name());
        member.setDocument(dto.document());
        member.setPostalCode(dto.postalCode());
        member.setAddressNumber(dto.addressNumber());
        member.setAddress(dto.address());
        member.setNeighborhood(dto.neighborhood());
        member.setCity(dto.city());
        member.setState(dto.state());
        member.setAvatar(dto.avatar());
        member.setMedicalHistory(dto.medicalHistory());
        member.setLimitations(dto.limitations());
        member.setAllergies(dto.allergies());
        member.setWeight(dto.weight());
        member.setHeight(dto.height());
        member.setImc(dto.imc());
        member.setNeeds(dto.needs());
        member.setBirthdate(parseBirthdate(dto.birthdate()));
        return member;
    }

    private Caregiver toCaregiver(Family family, CaregiverDto dto) {
        final Caregiver caregiver = new Caregiver();
        caregiver.setFamily(family);
        caregiver.setName(dto.name());
        caregiver.setRelation(dto.relation());
        caregiver.setPhone(dto.phone());
        return caregiver;
    }

    private FamilyResponse mapToDto(Family family) {
        final List<FamilyMemberDto> members = safe(family.getMembers()).stream().map(this::mapMemberDto)
            .collect(Collectors.toList());
        final List<CaregiverDto> caregivers = safe(family.getCaregivers()).stream().map(this::mapCaregiverDto)
            .collect(Collectors.toList());
        return new FamilyResponse(
            family.getId().toString(),
            family.getName(),
            family.getPostalCode(),
            family.getAddress(),
            family.getNeighborhood(),
            family.getCity(),
            family.getState(),
            family.getPrimaryCaregiver(),
            family.getPrimaryCaregiverRelationship(),
            family.getContact(),
            family.getCaregiverPhone(),
            family.getCareFocus(),
            family.getNotes(),
            members,
            caregivers
        );
    }

    private FamilyMemberDto mapMemberDto(FamilyMember member) {
        return new FamilyMemberDto(
            member.getId().toString(),
            member.getName(),
            member.getBirthdate() != null ? member.getBirthdate().toString() : null,
            member.getDocument(),
            member.getPostalCode(),
            member.getAddressNumber(),
            member.getAddress(),
            member.getNeighborhood(),
            member.getCity(),
            member.getState(),
            member.getAvatar(),
            member.getMedicalHistory(),
            member.getLimitations(),
            member.getAllergies(),
            member.getWeight(),
            member.getHeight(),
            member.getImc(),
            member.getNeeds()
        );
    }

    private CaregiverDto mapCaregiverDto(Caregiver caregiver) {
        return new CaregiverDto(
            caregiver.getId().toString(),
            caregiver.getName(),
            caregiver.getRelation(),
            caregiver.getPhone()
        );
    }

    private LocalDate parseBirthdate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private <T> List<T> safe(List<T> values) {
        return values == null ? List.of() : values;
    }
}
