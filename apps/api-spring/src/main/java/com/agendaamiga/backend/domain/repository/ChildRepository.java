package com.agendaamiga.backend.domain.repository;

import com.agendaamiga.backend.domain.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChildRepository extends JpaRepository<Child, UUID> {
    List<Child> findAllByTutorId(String tutorId);
}
