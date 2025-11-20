package com.agendaamiga.backend.domain.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "criancas")
public class Child {
    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tutor_id", nullable = false)
    private String tutorId;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "nascimento_iso", nullable = false)
    private String nascimentoIso;

    @Column(name = "sexo")
    private String sexo;

    @Column(name = "payload", columnDefinition = "jsonb")
    @Lob
    private String payload;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "atualizado_em")
    private Instant updatedAt;

    public Child() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTutorId() {
        return tutorId;
    }

    public void setTutorId(String tutorId) {
        this.tutorId = tutorId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNascimentoIso() {
        return nascimentoIso;
    }

    public void setNascimentoIso(String nascimentoIso) {
        this.nascimentoIso = nascimentoIso;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    public void prePersist() {
        this.id = UUID.randomUUID();
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
