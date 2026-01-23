package br.com.asa.web;

import java.time.LocalDateTime;

public class EmailLogDto {
    private Long id;
    private String assunto;
    private String mensagem;
    private String cidade;
    private String regiao;
    private String distrito;
    private Integer quantidadeEnvios;
    private LocalDateTime dataHora;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssunto() {
        return assunto;
    }

    public void setAssunto(String assunto) {
        this.assunto = assunto;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getRegiao() {
        return regiao;
    }

    public void setRegiao(String regiao) {
        this.regiao = regiao;
    }

    public String getDistrito() {
        return distrito;
    }

    public void setDistrito(String distrito) {
        this.distrito = distrito;
    }

    public Integer getQuantidadeEnvios() {
        return quantidadeEnvios;
    }

    public void setQuantidadeEnvios(Integer quantidadeEnvios) {
        this.quantidadeEnvios = quantidadeEnvios;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
