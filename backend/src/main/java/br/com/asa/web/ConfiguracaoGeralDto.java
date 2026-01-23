package br.com.asa.web;

public class ConfiguracaoGeralDto {
    private Long id;
    private String versao;
    private String dataHora;
    private String mudancas;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVersao() {
        return versao;
    }

    public void setVersao(String versao) {
        this.versao = versao;
    }

    public String getDataHora() {
        return dataHora;
    }

    public void setDataHora(String dataHora) {
        this.dataHora = dataHora;
    }

    public String getMudancas() {
        return mudancas;
    }

    public void setMudancas(String mudancas) {
        this.mudancas = mudancas;
    }
}
