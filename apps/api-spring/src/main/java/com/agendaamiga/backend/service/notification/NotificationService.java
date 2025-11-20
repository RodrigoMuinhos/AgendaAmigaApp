package com.agendaamiga.backend.service.notification;

import com.agendaamiga.backend.domain.model.User;

public interface NotificationService {
    void notifyRegistration(User user, String temporaryPassword);

    void notifyPasswordRecovery(User user, String token, int expiresInMinutes);

    void notifyTemporaryPassword(User user, String temporaryPassword);
}
