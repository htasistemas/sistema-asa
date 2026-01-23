package br.com.asa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracoes_gerais")
public class ConfiguracaoGeral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "versao", nullable = false)
    private String versao;

    @Column(name = "data_hora", nullable = false)
    private String dataHora;

    @Column(name = "mudancas", nullable = false, columnDefinition = "TEXT")
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
