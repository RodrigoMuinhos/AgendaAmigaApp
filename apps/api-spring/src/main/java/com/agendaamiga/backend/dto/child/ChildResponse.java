package com.agendaamiga.backend.dto.child;

public record ChildResponse(
    String id,
    String nome,
    String nascimentoISO,
    String sexo,
    String tutorId,
    String cartaoSUS,
    String cpf,
    String convenioOperadora,
    String convenioNumero,
    String tipoSanguineo,
    ResponsavelDto responsavel,
    String criadoEmISO,
    String atualizadoEmISO
) {
    public record ResponsavelDto(String nome, String parentesco, String telefone) {}
}
