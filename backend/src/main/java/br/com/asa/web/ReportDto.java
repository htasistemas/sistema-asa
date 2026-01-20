package br.com.asa.web;

import java.time.LocalDate;

public class ReportDto {
    private Long id;
    private Long unitId;
    private String type;
    private Integer beneficiaries;
    private Integer items;
    private LocalDate date;
    private String description;
    private Double value;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getBeneficiaries() {
        return beneficiaries;
    }

    public void setBeneficiaries(Integer beneficiaries) {
        this.beneficiaries = beneficiaries;
    }

    public Integer getItems() {
        return items;
    }

    public void setItems(Integer items) {
        this.items = items;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }
}