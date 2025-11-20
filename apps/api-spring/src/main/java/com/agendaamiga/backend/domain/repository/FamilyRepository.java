package com.agendaamiga.backend.domain.repository;

import com.agendaamiga.backend.domain.model.Family;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FamilyRepository extends JpaRepository<Family, UUID> {
}
