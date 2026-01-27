package br.com.asa.web;

import java.util.ArrayList;
import java.util.List;

public class ImportacaoAtividadeRespostaDto {
    private int totalLinhas;
    private int importados;
    private int atualizados;
    private int ignorados;
    private int ignoradosDuplicidade;
    private final List<String> mensagens = new ArrayList<>();

    public int getTotalLinhas() {
        return totalLinhas;
    }

    public void setTotalLinhas(int totalLinhas) {
        this.totalLinhas = totalLinhas;
    }

    public int getImportados() {
        return importados;
    }

    public void setImportados(int importados) {
        this.importados = importados;
    }

    public int getAtualizados() {
        return atualizados;
    }

    public void setAtualizados(int atualizados) {
        this.atualizados = atualizados;
    }

    public int getIgnorados() {
        return ignorados;
    }

    public void setIgnorados(int ignorados) {
        this.ignorados = ignorados;
    }

    public int getIgnoradosDuplicidade() {
        return ignoradosDuplicidade;
    }

    public void setIgnoradosDuplicidade(int ignoradosDuplicidade) {
        this.ignoradosDuplicidade = ignoradosDuplicidade;
    }

    public List<String> getMensagens() {
        return mensagens;
    }

    public void adicionarMensagem(String mensagem) {
        if (mensagem != null && !mensagem.isBlank()) {
            mensagens.add(mensagem);
        }
    }
}
