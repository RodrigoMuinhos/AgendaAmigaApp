package com.agendaamiga.backend.dto.auth;

public record RecoverPasswordResponse(String message, int expiresInMinutes, String recoveryToken) {}
