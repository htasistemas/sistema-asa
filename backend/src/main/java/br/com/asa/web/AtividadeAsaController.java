package br.com.asa.web;

import br.com.asa.service.AtividadeAsaService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/atividades-asa")
@CrossOrigin
public class AtividadeAsaController {
    private final AtividadeAsaService atividadeAsaService;

    public AtividadeAsaController(AtividadeAsaService atividadeAsaService) {
        this.atividadeAsaService = atividadeAsaService;
    }

    @GetMapping
    public List<AtividadeAsaDto> listar() {
        return atividadeAsaService.listar();
    }

    @PostMapping
    public AtividadeAsaDto criar(@RequestBody AtividadeAsaDto dto) {
        return atividadeAsaService.criar(dto);
    }

    @PostMapping(path = "/importacao-google-forms")
    public ImportacaoAtividadeRespostaDto importarGoogleForms(@RequestParam("arquivo") MultipartFile arquivo,
                                                              @RequestParam("periodoRelatorio") String periodoRelatorio) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um arquivo CSV para importacao.");
        }
        if (periodoRelatorio == null || periodoRelatorio.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o periodo do relatorio para importacao.");
        }
        try {
            return atividadeAsaService.importarGoogleForms(arquivo.getInputStream(), periodoRelatorio);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao foi possivel ler o arquivo CSV.");
        }
    }

    @PutMapping("/{id}")
    public AtividadeAsaDto atualizar(@PathVariable("id") Long id, @RequestBody AtividadeAsaDto dto) {
        return atividadeAsaService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable("id") Long id) {
        atividadeAsaService.excluir(id);
    }
}
