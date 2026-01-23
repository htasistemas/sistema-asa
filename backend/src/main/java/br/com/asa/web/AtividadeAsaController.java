package br.com.asa.web;

import br.com.asa.service.AtividadeAsaService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/{id}")
    public AtividadeAsaDto atualizar(@PathVariable("id") Long id, @RequestBody AtividadeAsaDto dto) {
        return atividadeAsaService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable("id") Long id) {
        atividadeAsaService.excluir(id);
    }
}
