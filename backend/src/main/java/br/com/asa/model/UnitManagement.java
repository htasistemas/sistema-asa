package br.com.asa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "gestao_unidade")
public class UnitManagement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "unidade_id", unique = true)
    private Unit unit;

    @Column(name = "patrimonio_json", columnDefinition = "text")
    private String assetsJson;

    @Column(name = "projetos_json", columnDefinition = "text")
    private String projectsJson;

    public Long getId() {
        return id;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public String getAssetsJson() {
        return assetsJson;
    }

    public void setAssetsJson(String assetsJson) {
        this.assetsJson = assetsJson;
    }

    public String getProjectsJson() {
        return projectsJson;
    }

    public void setProjectsJson(String projectsJson) {
        this.projectsJson = projectsJson;
    }
}
