package br.com.asa.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pontuacao_unidade_mes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"nome_unidade", "periodo_relatorio"}))
public class PontuacaoUnidadeMes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_unidade", nullable = false)
    private String nomeUnidade;

    @Column(name = "periodo_relatorio", nullable = false)
    private String periodoRelatorio;

    @Column(name = "pontos_total", nullable = false)
    private Integer pontosTotal;

    @Column(name = "selo_excelencia", nullable = false)
    private boolean seloExcelencia;

    @Column(name = "trofeu_melhor_unidade_ano", nullable = false)
    private boolean trofeuMelhorUnidadeAno;

    @Column(name = "data_calculo", nullable = false)
    private LocalDateTime dataCalculo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeUnidade() {
        return nomeUnidade;
    }

    public void setNomeUnidade(String nomeUnidade) {
        this.nomeUnidade = nomeUnidade;
    }

    public String getPeriodoRelatorio() {
        return periodoRelatorio;
    }

    public void setPeriodoRelatorio(String periodoRelatorio) {
        this.periodoRelatorio = periodoRelatorio;
    }

    public Integer getPontosTotal() {
        return pontosTotal;
    }

    public void setPontosTotal(Integer pontosTotal) {
        this.pontosTotal = pontosTotal;
    }

    public boolean isSeloExcelencia() {
        return seloExcelencia;
    }

    public void setSeloExcelencia(boolean seloExcelencia) {
        this.seloExcelencia = seloExcelencia;
    }

    public boolean isTrofeuMelhorUnidadeAno() {
        return trofeuMelhorUnidadeAno;
    }

    public void setTrofeuMelhorUnidadeAno(boolean trofeuMelhorUnidadeAno) {
        this.trofeuMelhorUnidadeAno = trofeuMelhorUnidadeAno;
    }

    public LocalDateTime getDataCalculo() {
        return dataCalculo;
    }

    public void setDataCalculo(LocalDateTime dataCalculo) {
        this.dataCalculo = dataCalculo;
    }
}
