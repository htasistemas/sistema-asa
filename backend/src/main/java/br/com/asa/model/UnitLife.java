package br.com.asa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vida_unidade")
public class UnitLife {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "unidade_id", unique = true)
    private Unit unit;

    @Column(name = "metas_json", columnDefinition = "text")
    private String goalsJson;

    @Column(name = "pendencias_json", columnDefinition = "text")
    private String pendenciesJson;

    public Long getId() {
        return id;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public String getGoalsJson() {
        return goalsJson;
    }

    public void setGoalsJson(String goalsJson) {
        this.goalsJson = goalsJson;
    }

    public String getPendenciesJson() {
        return pendenciesJson;
    }

    public void setPendenciesJson(String pendenciesJson) {
        this.pendenciesJson = pendenciesJson;
    }
}
