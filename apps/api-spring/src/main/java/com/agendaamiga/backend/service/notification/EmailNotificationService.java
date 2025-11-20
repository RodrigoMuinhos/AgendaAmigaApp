package com.agendaamiga.backend.service.notification;

import com.agendaamiga.backend.domain.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmailNotificationService implements NotificationService {
    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendOrigin;

    public EmailNotificationService(
        JavaMailSender mailSender,
        @Value("${spring.mail.username}") String fromAddress,
        @Value("${app.frontend.origin:http://localhost:5173}") String frontendOrigin
    ) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendOrigin = frontendOrigin.replaceAll("/$", "");
    }

    @Override
    public void notifyRegistration(User user, String temporaryPassword) {
        if (user.getEmail() == null) {
            log.warn("Registro sem email: {}", user.getNome());
            return;
        }
        final String subject = "✔ Seu acesso temporário foi criado!";
        final String body = String.format(
            "Olá %s, tudo bem?%n%n"
                + "Seu cadastro foi realizado com sucesso e o acesso à plataforma já está disponível.%n"
                + "Preparamos uma senha temporária especialmente para você:%n%n"
                + "🔐 Senha temporária: %s%n%n"
                + "✔ Como acessar sua conta%n%n"
                + "Use os seguintes dados de login:%n%n"
                + "Login: %s%n"
                + "Senha: a senha temporária enviada acima%n%n"
                + "Após o primeiro acesso, recomendamos alterar sua senha para uma de sua preferência, garantindo mais segurança.%n%n"
                + "ℹ️ Dicas importantes%n%n"
                + "A senha temporária é válida apenas para o primeiro login.%n"
                + "Caso você esqueça sua senha no futuro, poderá solicitar uma nova diretamente na tela de login.%n"
                + "Se você não reconhece este cadastro, basta ignorar este e-mail.%n%n"
                + "Qualquer dúvida, estamos à disposição!%n"
                + "Atenciosamente,%n"
                + "Equipe Agenda Amiga",
            user.getNome(),
            temporaryPassword,
            user.getCpf()
        );
        sendEmail(user.getEmail(), subject, body);
    }

    @Override
    public void notifyPasswordRecovery(User user, String token, int expiresInMinutes) {
        if (user.getEmail() == null) {
            log.warn("Solicitação de recuperação sem email: {}", user.getId());
            return;
        }
        final String subject = "Agenda Amiga — Redefinição de senha";
        final String body = String.format(
            "Olá %s,%n%n"
                + "Recebemos uma solicitação para redefinir sua senha.%n"
                + "Use o código abaixo (vence em %d minutos):%n%n"
                + "%s%n%n"
                + "Acesse: %s/login%n%n"
                + "Se você não pediu esta alteração, ignore esta mensagem.",
            user.getNome(),
            expiresInMinutes,
            token,
            frontendOrigin
        );
        sendEmail(user.getEmail(), subject, body);
    }

    @Override
    public void notifyTemporaryPassword(User user, String temporaryPassword) {
        if (user.getEmail() == null) {
            log.warn("Senha temporária sem email: {}", user.getId());
            return;
        }
        final String subject = "Agenda Amiga — Senha temporária";
        final String body = String.format(
            "Olá %s,%n%n"
                + "Este é o acesso temporário gerado para você:%n%n"
                + "Senha: %s%n%n"
                + "Acesse: %s/login%n%n"
                + "Troque a senha assim que entrar na plataforma.",
            user.getNome(),
            temporaryPassword,
            frontendOrigin
        );
        sendEmail(user.getEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        final SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
            log.info("Email '{}' enviado para {}", subject, to);
        } catch (MailException exception) {
            log.error("Falha ao enviar email '{}': {}", subject, exception.getMessage(), exception);
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Nao foi possivel enviar o email. Tente novamente em instantes."
            );
        }
    }
}
