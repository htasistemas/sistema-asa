package br.com.asa.web;

import br.com.asa.model.Report;
import br.com.asa.model.Unit;
import br.com.asa.repository.ReportRepository;
import br.com.asa.repository.UnitRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {
    private final ReportRepository reportRepository;
    private final UnitRepository unitRepository;

    public ReportController(ReportRepository reportRepository, UnitRepository unitRepository) {
        this.reportRepository = reportRepository;
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public List<ReportDto> list() {
        return reportRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping
    public ReportDto create(@RequestBody ReportDto dto) {
        Report report = fromDto(dto, new Report());
        return toDto(reportRepository.save(report));
    }

    @PutMapping("/{id}")
    public ReportDto update(@PathVariable Long id, @RequestBody ReportDto dto) {
        Report report = fromDto(dto, new Report());
        report.setId(id);
        return toDto(reportRepository.save(report));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reportRepository.deleteById(id);
    }

    private ReportDto toDto(Report report) {
        ReportDto dto = new ReportDto();
        dto.setId(report.getId());
        dto.setUnitId(report.getUnit().getId());
        dto.setType(report.getType());
        dto.setBeneficiaries(report.getBeneficiaries());
        dto.setItems(report.getItems());
        dto.setDate(report.getDate());
        dto.setDescription(report.getDescription());
        dto.setValue(report.getValue());
        return dto;
    }

    private Report fromDto(ReportDto dto, Report report) {
        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow();
        report.setUnit(unit);
        report.setType(dto.getType());
        report.setBeneficiaries(dto.getBeneficiaries());
        report.setItems(dto.getItems());
        report.setDate(dto.getDate());
        report.setDescription(dto.getDescription());
        report.setValue(dto.getValue());
        return report;
    }
}
