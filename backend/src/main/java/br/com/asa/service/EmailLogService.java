package br.com.asa.service;

import br.com.asa.model.EmailLog;
import br.com.asa.repository.EmailLogRepository;
import br.com.asa.web.EmailLogDto;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class EmailLogService {
    private final EmailLogRepository emailLogRepository;

    public EmailLogService(EmailLogRepository emailLogRepository) {
        this.emailLogRepository = emailLogRepository;
    }

    public EmailLogDto registrar(String assunto, String mensagem, String cidade, String regiao, String distrito, int quantidadeEnvios) {
        EmailLog log = new EmailLog();
        log.setAssunto(assunto);
        log.setMensagem(mensagem);
        log.setCidade(cidade);
        log.setRegiao(regiao);
        log.setDistrito(distrito);
        log.setQuantidadeEnvios(quantidadeEnvios);
        log.setDataHora(LocalDateTime.now());
        return paraDto(emailLogRepository.save(log));
    }

    public List<EmailLogDto> listar() {
        return emailLogRepository.findAll().stream()
            .sorted(Comparator.comparing(EmailLog::getDataHora).reversed())
            .map(this::paraDto)
            .collect(Collectors.toList());
    }

    private EmailLogDto paraDto(EmailLog log) {
        EmailLogDto dto = new EmailLogDto();
        dto.setId(log.getId());
        dto.setAssunto(log.getAssunto());
        dto.setMensagem(log.getMensagem());
        dto.setCidade(log.getCidade());
        dto.setRegiao(log.getRegiao());
        dto.setDistrito(log.getDistrito());
        dto.setQuantidadeEnvios(log.getQuantidadeEnvios());
        dto.setDataHora(log.getDataHora());
        return dto;
    }
}
