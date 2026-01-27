package br.com.asa.service;

import br.com.asa.model.BackupLog;
import br.com.asa.repository.BackupLogRepository;
import br.com.asa.web.BackupLogDto;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BackupLogService {
    private static final DateTimeFormatter FORMATADOR = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private final BackupLogRepository backupLogRepository;

    public BackupLogService(BackupLogRepository backupLogRepository) {
        this.backupLogRepository = backupLogRepository;
    }

    public void registrar(String tipo, String arquivoNome, Long tamanhoBytes, String status, String mensagem) {
        BackupLog log = new BackupLog();
        log.setDataHora(LocalDateTime.now());
        log.setTipo(tipo);
        log.setArquivoNome(arquivoNome);
        log.setTamanhoBytes(tamanhoBytes);
        log.setStatus(status);
        log.setMensagem(mensagem);
        backupLogRepository.save(log);
    }

    public List<BackupLogDto> listar() {
        return backupLogRepository.findAll().stream()
            .sorted(Comparator.comparing(BackupLog::getDataHora).reversed())
            .map(this::paraDto)
            .toList();
    }

    private BackupLogDto paraDto(BackupLog log) {
        BackupLogDto dto = new BackupLogDto();
        dto.setId(log.getId());
        dto.setDataHora(log.getDataHora() == null ? "" : log.getDataHora().format(FORMATADOR));
        dto.setTipo(log.getTipo());
        dto.setArquivoNome(log.getArquivoNome());
        dto.setTamanhoBytes(log.getTamanhoBytes());
        dto.setStatus(log.getStatus());
        dto.setMensagem(log.getMensagem());
        return dto;
    }
}

