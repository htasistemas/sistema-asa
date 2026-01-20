package br.com.asa.web;

public class UnitLifeDto {
    private Long unitId;
    private String goalsJson;
    private String pendenciesJson;

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
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