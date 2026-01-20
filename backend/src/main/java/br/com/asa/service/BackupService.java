package br.com.asa.service;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BackupService {
    private final String urlBanco;
    private final String usuarioBanco;
    private final String senhaBanco;

    public BackupService(
        @Value("${spring.datasource.url}") String urlBanco,
        @Value("${spring.datasource.username}") String usuarioBanco,
        @Value("${spring.datasource.password}") String senhaBanco
    ) {
        this.urlBanco = urlBanco;
        this.usuarioBanco = usuarioBanco;
        this.senhaBanco = senhaBanco;
    }

    public File gerarBackup() {
        DadosBanco dadosBanco = obterDadosBanco();
        try {
            File arquivo = Files.createTempFile("backup-asa-", ".sql").toFile();
            List<String> comando = List.of(
                "pg_dump",
                "-h", dadosBanco.host(),
                "-p", String.valueOf(dadosBanco.porta()),
                "-U", usuarioBanco,
                "-F", "p",
                "-f", arquivo.getAbsolutePath(),
                dadosBanco.nomeBanco()
            );
            executarComando(comando, senhaBanco);
            return arquivo;
        } catch (IOException e) {
            throw new IllegalStateException("Nao foi possivel gerar o backup.", e);
        }
    }

    public void restaurarBackup(MultipartFile arquivo) {
        DadosBanco dadosBanco = obterDadosBanco();
        try {
            File arquivoTemporario = Files.createTempFile("restore-asa-", ".sql").toFile();
            arquivo.transferTo(arquivoTemporario);
            List<String> comando = List.of(
                "psql",
                "-h", dadosBanco.host(),
                "-p", String.valueOf(dadosBanco.porta()),
                "-U", usuarioBanco,
                "-d", dadosBanco.nomeBanco(),
                "-f", arquivoTemporario.getAbsolutePath()
            );
            executarComando(comando, senhaBanco);
        } catch (IOException e) {
            throw new IllegalStateException("Nao foi possivel restaurar o backup.", e);
        }
    }

    private void executarComando(List<String> comando, String senha) {
        try {
            ProcessBuilder builder = new ProcessBuilder(comando);
            Map<String, String> ambiente = new HashMap<>(builder.environment());
            ambiente.put("PGPASSWORD", senha);
            builder.redirectErrorStream(true);
            Process processo = builder.start();
            int status = processo.waitFor();
            if (status != 0) {
                throw new IllegalStateException("Comando retornou status " + status);
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Falha ao executar comando do banco.", e);
        }
    }

    private DadosBanco obterDadosBanco() {
        try {
            String semPrefixo = urlBanco.replace("jdbc:", "");
            URI uri = URI.create(semPrefixo);
            String host = uri.getHost();
            int porta = uri.getPort() > 0 ? uri.getPort() : 5432;
            String nomeBanco = uri.getPath() != null ? uri.getPath().replace("/", "") : "";
            if (host == null || nomeBanco.isBlank()) {
                throw new IllegalStateException("URL do banco invalida.");
            }
            return new DadosBanco(host, porta, nomeBanco);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("URL do banco invalida.", e);
        }
    }

    private record DadosBanco(String host, int porta, String nomeBanco) {}
}
