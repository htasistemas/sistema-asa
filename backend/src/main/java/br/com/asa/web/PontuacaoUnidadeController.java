package br.com.asa.web;

import br.com.asa.service.PontuacaoUnidadeService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pontuacao-unidades")
@CrossOrigin
public class PontuacaoUnidadeController {
    private final PontuacaoUnidadeService pontuacaoUnidadeService;

    public PontuacaoUnidadeController(PontuacaoUnidadeService pontuacaoUnidadeService) {
        this.pontuacaoUnidadeService = pontuacaoUnidadeService;
    }

    @GetMapping
    public List<PontuacaoUnidadeDto> listar(@RequestParam(value = "periodo", required = false) String periodo) {
        String periodoRelatorio = periodo == null || periodo.isBlank()
            ? LocalDate.now().format(DateTimeFormatter.ofPattern("MM-yyyy"))
            : periodo;
        return pontuacaoUnidadeService.calcularPontuacaoPorPeriodo(periodoRelatorio);
    }

    @GetMapping("/configuracoes")
    public List<PontuacaoAtividadeConfigDto> listarConfiguracoes() {
        return pontuacaoUnidadeService.listarConfiguracoes();
    }

    @PutMapping("/configuracoes")
    public List<PontuacaoAtividadeConfigDto> atualizarConfiguracoes(@RequestBody List<PontuacaoAtividadeConfigDto> configuracoes) {
        return pontuacaoUnidadeService.atualizarConfiguracoes(configuracoes);
    }
}
