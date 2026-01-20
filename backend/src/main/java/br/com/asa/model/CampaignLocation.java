package br.com.asa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "campanha_local")
public class CampaignLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "campanha_id")
    private Campaign campaign;

    @Column(name = "local", nullable = false)
    private String location;

    public Long getId() {
        return id;
    }

    public Campaign getCampaign() {
        return campaign;
    }

    public void setCampaign(Campaign campaign) {
        this.campaign = campaign;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
