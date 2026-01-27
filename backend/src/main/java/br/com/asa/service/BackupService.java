package br.com.asa.service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BackupService {
    private final String urlBanco;
    private final String usuarioBanco;
    private final String senhaBanco;
    private final BackupLogService backupLogService;

    public BackupService(
        @Value("${spring.datasource.url}") String urlBanco,
        @Value("${spring.datasource.username}") String usuarioBanco,
        @Value("${spring.datasource.password}") String senhaBanco,
        BackupLogService backupLogService
    ) {
        this.urlBanco = urlBanco;
        this.usuarioBanco = usuarioBanco;
        this.senhaBanco = senhaBanco;
        this.backupLogService = backupLogService;
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
            backupLogService.registrar(
                "BACKUP",
                arquivo.getName(),
                arquivo.length(),
                "SUCESSO",
                "Backup gerado com sucesso."
            );
            return arquivo;
        } catch (IOException e) {
            backupLogService.registrar("BACKUP", null, null, "ERRO", "Nao foi possivel gerar o backup.");
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
            backupLogService.registrar(
                "RESTAURACAO",
                arquivo.getOriginalFilename(),
                arquivo.getSize(),
                "SUCESSO",
                "Backup restaurado com sucesso."
            );
        } catch (IOException e) {
            backupLogService.registrar(
                "RESTAURACAO",
                arquivo.getOriginalFilename(),
                arquivo.getSize(),
                "ERRO",
                "Nao foi possivel restaurar o backup."
            );
            throw new IllegalStateException("Nao foi possivel restaurar o backup.", e);
        }
    }

    public void testarBackup(MultipartFile arquivo) {
        DadosBanco dadosBanco = obterDadosBanco();
        try {
            File arquivoTemporario = Files.createTempFile("teste-backup-asa-", ".sql").toFile();
            arquivo.transferTo(arquivoTemporario);

            File arquivoTeste = Files.createTempFile("teste-backup-wrapper-", ".sql").toFile();
            String conteudo = Files.readString(arquivoTemporario.toPath(), StandardCharsets.UTF_8);
            String wrapper = "BEGIN;\n" + conteudo + "\nROLLBACK;\n";
            Files.writeString(arquivoTeste.toPath(), wrapper, StandardCharsets.UTF_8, StandardOpenOption.TRUNCATE_EXISTING);

            List<String> comando = List.of(
                "psql",
                "-h", dadosBanco.host(),
                "-p", String.valueOf(dadosBanco.porta()),
                "-U", usuarioBanco,
                "-d", dadosBanco.nomeBanco(),
                "-v", "ON_ERROR_STOP=1",
                "-f", arquivoTeste.getAbsolutePath()
            );
            executarComando(comando, senhaBanco);
            backupLogService.registrar(
                "TESTE_RESTAURACAO",
                arquivo.getOriginalFilename(),
                arquivo.getSize(),
                "SUCESSO",
                "Teste de restauracao executado com sucesso (ROLLBACK)."
            );
        } catch (IOException e) {
            backupLogService.registrar(
                "TESTE_RESTAURACAO",
                arquivo.getOriginalFilename(),
                arquivo.getSize(),
                "ERRO",
                "Nao foi possivel testar o backup."
            );
            throw new IllegalStateException("Nao foi possivel testar o backup.", e);
        }
    }

    private void executarComando(List<String> comando, String senha) {
        try {
            ProcessBuilder builder = new ProcessBuilder(comando);
            Map<String, String> ambiente = new HashMap<>(builder.environment());
            ambiente.put("PGPASSWORD", senha);
            builder.redirectErrorStream(true);
            Process processo = builder.start();
            CompletableFuture<String> leituraSaida = lerSaidaAssincrona(processo.getInputStream());
            boolean finalizado = processo.waitFor(3, TimeUnit.MINUTES);
            if (!finalizado) {
                processo.destroyForcibly();
                throw new IllegalStateException("Comando excedeu o tempo limite.");
            }
            int status = processo.exitValue();
            String saida = obterSaida(leituraSaida);
            if (status != 0) {
                throw new IllegalStateException("Comando retornou status " + status + ". Saida: " + saida);
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Falha ao executar comando do banco.", e);
        }
    }

    private CompletableFuture<String> lerSaidaAssincrona(InputStream entrada) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                return "";
            }
        });
    }

    private String obterSaida(CompletableFuture<String> leituraSaida) {
        try {
            return leituraSaida.get(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "";
        } catch (ExecutionException | java.util.concurrent.TimeoutException e) {
            return "";
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
