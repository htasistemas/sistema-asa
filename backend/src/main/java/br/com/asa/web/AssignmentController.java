package br.com.asa.web;

import br.com.asa.model.Assignment;
import br.com.asa.model.Campaign;
import br.com.asa.model.Unit;
import br.com.asa.repository.AssignmentRepository;
import br.com.asa.repository.CampaignRepository;
import br.com.asa.repository.UnitRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin
public class AssignmentController {
    private final AssignmentRepository assignmentRepository;
    private final CampaignRepository campaignRepository;
    private final UnitRepository unitRepository;

    public AssignmentController(AssignmentRepository assignmentRepository,
                                CampaignRepository campaignRepository,
                                UnitRepository unitRepository) {
        this.assignmentRepository = assignmentRepository;
        this.campaignRepository = campaignRepository;
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public List<AssignmentDto> list() {
        return assignmentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping
    public AssignmentDto create(@RequestBody AssignmentDto dto) {
        Assignment assignment = fromDto(dto, new Assignment());
        return toDto(assignmentRepository.save(assignment));
    }

    @PutMapping("/{id}")
    public AssignmentDto update(@PathVariable Long id, @RequestBody AssignmentDto dto) {
        Assignment assignment = fromDto(dto, new Assignment());
        assignment.setId(id);
        return toDto(assignmentRepository.save(assignment));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        assignmentRepository.deleteById(id);
    }

    private AssignmentDto toDto(Assignment assignment) {
        AssignmentDto dto = new AssignmentDto();
        dto.setId(assignment.getId());
        dto.setCampaignId(assignment.getCampaign().getId());
        dto.setUnitId(assignment.getUnit().getId());
        dto.setDate(assignment.getDate());
        dto.setLocation(assignment.getLocation());
        dto.setStartTime(assignment.getStartTime());
        dto.setEndTime(assignment.getEndTime());
        return dto;
    }

    private Assignment fromDto(AssignmentDto dto, Assignment assignment) {
        Campaign campaign = campaignRepository.findById(dto.getCampaignId()).orElseThrow();
        Unit unit = unitRepository.findById(dto.getUnitId()).orElseThrow();
        assignment.setCampaign(campaign);
        assignment.setUnit(unit);
        assignment.setDate(dto.getDate());
        assignment.setLocation(dto.getLocation());
        assignment.setStartTime(dto.getStartTime());
        assignment.setEndTime(dto.getEndTime());
        return assignment;
    }
}