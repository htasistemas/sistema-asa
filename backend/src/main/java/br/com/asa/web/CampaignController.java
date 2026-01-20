package br.com.asa.web;

import br.com.asa.model.Campaign;
import br.com.asa.model.CampaignLocation;
import br.com.asa.repository.CampaignRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin
public class CampaignController {
    private final CampaignRepository campaignRepository;

    public CampaignController(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    @GetMapping
    public List<CampaignDto> list() {
        return campaignRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping
    public CampaignDto create(@RequestBody CampaignDto dto) {
        Campaign campaign = fromDto(dto, new Campaign());
        return toDto(campaignRepository.save(campaign));
    }

    @PutMapping("/{id}")
    public CampaignDto update(@PathVariable Long id, @RequestBody CampaignDto dto) {
        Campaign campaign = fromDto(dto, new Campaign());
        campaign.setId(id);
        return toDto(campaignRepository.save(campaign));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        campaignRepository.deleteById(id);
    }

    private CampaignDto toDto(Campaign campaign) {
        CampaignDto dto = new CampaignDto();
        dto.setId(campaign.getId());
        dto.setName(campaign.getName());
        dto.setBaseAddress(campaign.getBaseAddress());
        dto.setStartDate(campaign.getStartDate());
        dto.setEndDate(campaign.getEndDate());
        dto.setLocations(campaign.getLocations().stream().map(CampaignLocation::getLocation).collect(Collectors.toList()));
        return dto;
    }

    private Campaign fromDto(CampaignDto dto, Campaign campaign) {
        campaign.setName(dto.getName());
        campaign.setBaseAddress(dto.getBaseAddress());
        campaign.setStartDate(dto.getStartDate());
        campaign.setEndDate(dto.getEndDate());
        campaign.getLocations().clear();
        if (dto.getLocations() != null) {
            for (String location : dto.getLocations()) {
                if (location == null || location.trim().isEmpty()) {
                    continue;
                }
                CampaignLocation loc = new CampaignLocation();
                loc.setCampaign(campaign);
                loc.setLocation(location.trim());
                campaign.getLocations().add(loc);
            }
        }
        return campaign;
    }
}