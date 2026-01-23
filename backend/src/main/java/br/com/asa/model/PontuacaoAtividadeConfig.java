package br.com.asa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pontuacao_atividade_config")
public class PontuacaoAtividadeConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chave", nullable = false, unique = true)
    private String chave;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @Column(name = "pontos", nullable = false)
    private Integer pontos;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChave() {
        return chave;
    }

    public void setChave(String chave) {
        this.chave = chave;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getPontos() {
        return pontos;
    }

    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }
}
