package com.agendaamiga.backend.domain.repository;

import com.agendaamiga.backend.domain.model.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TreatmentRepository extends JpaRepository<Treatment, UUID> {
    List<Treatment> findAllByFamilyId(UUID familyId);
}
