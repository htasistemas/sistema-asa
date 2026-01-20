package br.com.asa.web;

import br.com.asa.service.BackupService;
import java.io.File;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/backup")
public class BackupController {
    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping
    public ResponseEntity<Resource> baixarBackup() {
        File arquivo = backupService.gerarBackup();
        Resource recurso = new FileSystemResource(arquivo);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"backup-asa.sql\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(recurso);
    }

    @PostMapping("/restore")
    public ResponseEntity<BackupResponseDto> restaurarBackup(@RequestParam("arquivo") MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new BackupResponseDto(false, "Arquivo de backup nao informado."));
        }
        backupService.restaurarBackup(arquivo);
        return ResponseEntity.ok(new BackupResponseDto(true, "Backup restaurado com sucesso."));
    }
}
