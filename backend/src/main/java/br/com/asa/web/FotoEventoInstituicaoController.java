package br.com.asa.web;

import br.com.asa.service.FotoEventoInstituicaoService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fotos-eventos")
@CrossOrigin
public class FotoEventoInstituicaoController {
    private final FotoEventoInstituicaoService fotoEventoInstituicaoService;

    public FotoEventoInstituicaoController(FotoEventoInstituicaoService fotoEventoInstituicaoService) {
        this.fotoEventoInstituicaoService = fotoEventoInstituicaoService;
    }

    @GetMapping
    public List<FotoEventoInstituicaoDto> listar() {
        return fotoEventoInstituicaoService.listar();
    }

    @PostMapping
    public FotoEventoInstituicaoDto criar(@RequestBody FotoEventoInstituicaoRequest request) {
        return fotoEventoInstituicaoService.criar(request);
    }

    @PutMapping("/{id}")
    public FotoEventoInstituicaoDto atualizar(@PathVariable("id") Long id, @RequestBody FotoEventoInstituicaoRequest request) {
        return fotoEventoInstituicaoService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable("id") Long id) {
        fotoEventoInstituicaoService.excluir(id);
    }
}
