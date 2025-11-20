package com.agendaamiga.backend.dto.auth;

public record AuthUserDto(
    String id,
    String nome,
    String email,
    Boolean emailVerified,
    String cpf,
    String criadoEmISO,
    String atualizadoEmISO,
    ResponsavelDto responsavel
) {
    public record ResponsavelDto(String nome, String parentesco, String telefone, String cpf) {}
}
