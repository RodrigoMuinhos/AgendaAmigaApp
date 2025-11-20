package com.agendaamiga.backend.service;

import com.agendaamiga.backend.domain.model.Family;
import com.agendaamiga.backend.domain.model.Treatment;
import com.agendaamiga.backend.domain.repository.FamilyRepository;
import com.agendaamiga.backend.domain.repository.TreatmentRepository;
import com.agendaamiga.backend.dto.treatment.TreatmentRequest;
import com.agendaamiga.backend.dto.treatment.TreatmentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TreatmentService {
    private final TreatmentRepository treatmentRepository;
    private final FamilyRepository familyRepository;

    public TreatmentService(TreatmentRepository treatmentRepository, FamilyRepository familyRepository) {
        this.treatmentRepository = treatmentRepository;
        this.familyRepository = familyRepository;
    }

    public List<TreatmentResponse> findAll() {
        return treatmentRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public TreatmentResponse create(TreatmentRequest request) {
        final Family family = familyRepository.findById(UUID.fromString(request.familyId()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Familia nao encontrada."));
        final Treatment treatment = new Treatment();
        treatment.setFamily(family);
        treatment.setNome(request.name());
        treatment.setDose(request.dose());
        treatment.setHorario(request.schedule());
        treatment.setInstrucoes(request.instructions());
        treatment.setNextDose(parseNextDose(request.nextDose()));
        return mapToDto(treatmentRepository.save(treatment));
    }

    private Instant parseNextDose(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(raw);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de proxima dose invalido.");
        }
    }

    private TreatmentResponse mapToDto(Treatment treatment) {
        return new TreatmentResponse(
            treatment.getId().toString(),
            treatment.getFamily().getId().toString(),
            treatment.getNome(),
            treatment.getDose(),
            treatment.getHorario(),
            treatment.getInstrucoes(),
            treatment.getNextDose() != null ? treatment.getNextDose().toString() : null,
            treatment.getCreatedAt().toString(),
            treatment.getUpdatedAt().toString()
        );
    }
}
