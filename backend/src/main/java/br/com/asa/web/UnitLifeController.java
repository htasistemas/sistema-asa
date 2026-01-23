package br.com.asa.web;

import br.com.asa.model.Unit;
import br.com.asa.model.UnitLife;
import br.com.asa.repository.UnitLifeRepository;
import br.com.asa.repository.UnitRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/unit-life")
@CrossOrigin
public class UnitLifeController {
    private final UnitLifeRepository unitLifeRepository;
    private final UnitRepository unitRepository;

    public UnitLifeController(UnitLifeRepository unitLifeRepository, UnitRepository unitRepository) {
        this.unitLifeRepository = unitLifeRepository;
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public List<UnitLifeDto> list() {
        return unitLifeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{unitId}")
    public UnitLifeDto getByUnit(@PathVariable("unitId") Long unitId) {
        Unit unit = unitRepository.findById(unitId).orElseThrow();
        return unitLifeRepository.findByUnit(unit).map(this::toDto).orElseGet(() -> {
            UnitLifeDto dto = new UnitLifeDto();
            dto.setUnitId(unitId);
            dto.setGoalsJson("{}");
            dto.setPendenciesJson("[]");
            return dto;
        });
    }

    @PostMapping
    public UnitLifeDto upsert(@RequestBody UnitLifeDto dto) {
        Unit unit = unitRepository.findById(dto.getUnitId()).orElseThrow();
        UnitLife entity = unitLifeRepository.findByUnit(unit).orElseGet(UnitLife::new);
        entity.setUnit(unit);
        entity.setGoalsJson(dto.getGoalsJson());
        entity.setPendenciesJson(dto.getPendenciesJson());
        return toDto(unitLifeRepository.save(entity));
    }

    private UnitLifeDto toDto(UnitLife life) {
        UnitLifeDto dto = new UnitLifeDto();
        dto.setUnitId(life.getUnit().getId());
        dto.setGoalsJson(life.getGoalsJson());
        dto.setPendenciesJson(life.getPendenciesJson());
        return dto;
    }
}
