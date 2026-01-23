package br.com.asa.web;

public class PontuacaoUnidadeDto {
    private String nomeUnidade;
    private String periodoRelatorio;
    private Integer pontosTotal;
    private boolean seloExcelencia;
    private boolean trofeuMelhorUnidadeAno;

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
}
