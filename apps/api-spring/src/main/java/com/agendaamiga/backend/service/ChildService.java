package com.agendaamiga.backend.service;

import com.agendaamiga.backend.domain.model.Child;
import com.agendaamiga.backend.domain.repository.ChildRepository;
import com.agendaamiga.backend.dto.child.ChildRequest;
import com.agendaamiga.backend.dto.child.ChildResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChildService {
    private final ChildRepository childRepository;
    private final ObjectMapper objectMapper;

    public ChildService(ChildRepository childRepository, ObjectMapper objectMapper) {
        this.childRepository = childRepository;
        this.objectMapper = objectMapper;
    }

    public List<ChildResponse> findByTutor(String tutorId) {
        return childRepository.findAllByTutorId(tutorId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public ChildResponse createChild(String tutorId, ChildRequest request) {
        final Child child = new Child();
        child.setTutorId(tutorId);
        child.setNome(request.nome());
        child.setNascimentoIso(request.nascimentoISO());
        child.setSexo(request.sexo());
        child.setPayload(serializePayload(request));
        return mapToResponse(childRepository.save(child));
    }

    private String serializePayload(ChildRequest request) {
        try {
            return objectMapper.writeValueAsString(request);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel serializar o payload da crianca.");
        }
    }

    private ChildResponse mapToResponse(Child child) {
        return new ChildResponse(
            child.getId().toString(),
            child.getNome(),
            child.getNascimentoIso(),
            child.getSexo(),
            child.getTutorId(),
            extractValue(child.getPayload(), "cartaoSUS"),
            extractValue(child.getPayload(), "cpf"),
            extractValue(child.getPayload(), "convenioOperadora"),
            extractValue(child.getPayload(), "convenioNumero"),
            extractValue(child.getPayload(), "tipoSanguineo"),
            parseResponsavel(child.getPayload()),
            child.getCreatedAt().toString(),
            child.getUpdatedAt().toString()
        );
    }

    private ChildResponse.ResponsavelDto parseResponsavel(String payload) {
        if (payload == null || payload.isBlank()) {
            return null;
        }
        try {
            final ChildRequest.ResponsavelDto dto = objectMapper.readValue(payload, ChildRequest.class).responsavel();
            if (dto == null) {
                return null;
            }
            return new ChildResponse.ResponsavelDto(dto.nome(), dto.parentesco(), dto.telefone());
        } catch (Exception exception) {
            return null;
        }
    }

    private String extractValue(String payload, String field) {
        if (payload == null) {
            return null;
        }
        try {
            return objectMapper.readTree(payload).path(field).asText(null);
        } catch (Exception exception) {
            return null;
        }
    }
}
