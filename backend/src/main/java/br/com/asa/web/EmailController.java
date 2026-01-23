package br.com.asa.web;

import br.com.asa.repository.UnitRepository;
import br.com.asa.service.EmailService;
import br.com.asa.service.EmailLogService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin
public class EmailController {
    private final UnitRepository unitRepository;
    private final EmailService emailService;
    private final EmailLogService emailLogService;

    public EmailController(UnitRepository unitRepository, EmailService emailService, EmailLogService emailLogService) {
        this.unitRepository = unitRepository;
        this.emailService = emailService;
        this.emailLogService = emailLogService;
    }

    @PostMapping("/unidades")
    public void enviarEmailUnidades(@RequestBody EnviarEmailUnidadesRequest request) {
        if (request.getAssunto() == null || request.getAssunto().isBlank()) {
            throw new IllegalArgumentException("Assunto obrigatorio.");
        }
        if (request.getMensagem() == null || request.getMensagem().isBlank()) {
            throw new IllegalArgumentException("Mensagem obrigatoria.");
        }

        List<String> emails = unitRepository.findAll().stream()
            .filter(unidade -> request.getCidade() == null || request.getCidade().isBlank()
                || (unidade.getCidade() != null && unidade.getCidade().equalsIgnoreCase(request.getCidade())))
            .filter(unidade -> request.getRegiao() == null || request.getRegiao().isBlank()
                || (unidade.getRegiao() != null && unidade.getRegiao().equalsIgnoreCase(request.getRegiao())))
            .filter(unidade -> request.getDistrito() == null || request.getDistrito().isBlank()
                || (unidade.getDistrito() != null && unidade.getDistrito().equalsIgnoreCase(request.getDistrito())))
            .map(unidade -> unidade.getEmailUnidade())
            .filter(email -> email != null && !email.isBlank())
            .toList();

        for (String email : emails) {
            emailService.enviarEmail(email, request.getAssunto(), request.getMensagem());
        }

        emailLogService.registrar(
            request.getAssunto(),
            request.getMensagem(),
            request.getCidade(),
            request.getRegiao(),
            request.getDistrito(),
            emails.size()
        );
    }

    @GetMapping("/logs")
    public List<EmailLogDto> listarLogs() {
        return emailLogService.listar();
    }
}
