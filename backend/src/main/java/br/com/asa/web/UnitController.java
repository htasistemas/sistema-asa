package br.com.asa.web;

import br.com.asa.model.Unit;
import br.com.asa.repository.UnitRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/units")
@CrossOrigin
public class UnitController {
    private final UnitRepository unitRepository;

    public UnitController(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public List<Unit> list() {
        return unitRepository.findAll();
    }

    @GetMapping("/{id}")
    public Unit getById(@PathVariable("id") Long id) {
        return unitRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public Unit create(@RequestBody Unit unit) {
        java.time.LocalDateTime agora = java.time.LocalDateTime.now();
        unit.setDataCriacao(agora);
        unit.setDataAtualizacao(agora);
        return unitRepository.save(unit);
    }

    @PutMapping("/{id}")
    public Unit update(@PathVariable("id") Long id, @RequestBody Unit unit) {
        unit.setId(id);
        unit.setDataAtualizacao(java.time.LocalDateTime.now());
        return unitRepository.save(unit);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        unitRepository.deleteById(id);
    }
}
