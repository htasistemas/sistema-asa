package br.com.asa.web;

import br.com.asa.model.Unit;
import br.com.asa.model.UnitManagement;
import br.com.asa.repository.UnitManagementRepository;
import br.com.asa.repository.UnitRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/unit-management")
@CrossOrigin
public class UnitManagementController {
    private final UnitManagementRepository unitManagementRepository;
    private final UnitRepository unitRepository;

    public UnitManagementController(UnitManagementRepository unitManagementRepository, UnitRepository unitRepository) {
        this.unitManagementRepository = unitManagementRepository;
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public List<UnitManagementDto> list() {
        return unitManagementRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{unitId}")
    public UnitManagementDto getByUnit(@PathVariable Long unitId) {
        Unit unit = unitRepository.findById(unitId).orElseThrow();
        return unitManagementRepository.findByUnit(unit).map(this::toDto).orElseGet(() -> {
            UnitManagementDto dto = new UnitManagementDto();
            dto.setUnitId(unitId);
            dto.setAssetsJson("[]");
            dto.setProjectsJson("[]");
            return dto;
        });
    }

    @PostMapping
    public UnitManagementDto upsert(@RequestBody UnitManagementDto dto) {
        Unit unit = unitRepository.findById(dto.getUnitId()).orElseThrow();
        UnitManagement entity = unitManagementRepository.findByUnit(unit).orElseGet(UnitManagement::new);
        entity.setUnit(unit);
        entity.setAssetsJson(dto.getAssetsJson());
        entity.setProjectsJson(dto.getProjectsJson());
        return toDto(unitManagementRepository.save(entity));
    }

    private UnitManagementDto toDto(UnitManagement management) {
        UnitManagementDto dto = new UnitManagementDto();
        dto.setUnitId(management.getUnit().getId());
        dto.setAssetsJson(management.getAssetsJson());
        dto.setProjectsJson(management.getProjectsJson());
        return dto;
    }
}