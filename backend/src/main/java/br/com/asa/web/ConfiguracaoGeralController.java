package br.com.asa.web;

import br.com.asa.service.ConfiguracaoGeralService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracoes-gerais")
@CrossOrigin
public class ConfiguracaoGeralController {
    private final ConfiguracaoGeralService configuracaoGeralService;

    public ConfiguracaoGeralController(ConfiguracaoGeralService configuracaoGeralService) {
        this.configuracaoGeralService = configuracaoGeralService;
    }

    @GetMapping
    public List<ConfiguracaoGeralDto> listar() {
        return configuracaoGeralService.listar();
    }

    @PostMapping
    public ConfiguracaoGeralDto criar(@RequestBody ConfiguracaoGeralDto dto) {
        return configuracaoGeralService.criar(dto);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable("id") Long id) {
        configuracaoGeralService.excluir(id);
    }
}
