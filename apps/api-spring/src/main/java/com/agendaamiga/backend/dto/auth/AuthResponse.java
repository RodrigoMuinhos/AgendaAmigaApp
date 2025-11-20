package com.agendaamiga.backend.dto.auth;

public record AuthResponse(String token, AuthUserDto user) {}
