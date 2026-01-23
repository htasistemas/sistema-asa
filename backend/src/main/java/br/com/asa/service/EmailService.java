package br.com.asa.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String remetente;
    private final String nomeExibicao;
    private final String senhaSmtp;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String remetente,
                        @Value("${spring.mail.password:}") String senhaSmtp,
                        @Value("${app.email.nome-exibicao:Asa - Acao Solidaria Adventista}") String nomeExibicao) {
        this.mailSender = mailSender;
        this.remetente = remetente;
        this.senhaSmtp = senhaSmtp;
        this.nomeExibicao = nomeExibicao;
    }

    public void enviarEmail(String destinatario, String assunto, String mensagem) {
        if (senhaSmtp == null || senhaSmtp.isBlank() || "ALTERE_A_SENHA".equalsIgnoreCase(senhaSmtp.trim())) {
            throw new IllegalStateException("Configuracao SMTP invalida. Defina a senha de app do e-mail no backend.");
        }
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(destinatario);
        email.setFrom(String.format("%s <%s>", nomeExibicao, remetente));
        email.setSubject(assunto);
        email.setText(mensagem);
        mailSender.send(email);
    }
}
