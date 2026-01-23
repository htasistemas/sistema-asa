package br.com.asa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "atividades_asa")
public class AtividadeAsa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asa_identificacao", nullable = false)
    private String asaIdentificacao;

    @Column(name = "periodo_relatorio", nullable = false)
    private String periodoRelatorio;

    @Column(name = "diretor_nome", nullable = false)
    private String diretorNome;

    @Column(name = "telefone_contato", nullable = false)
    private String telefoneContato;

    @Column(name = "possui_instagram", nullable = false)
    private boolean possuiInstagram;

    @Column(name = "possui_email_proprio", nullable = false)
    private boolean possuiEmailProprio;

    @Column(name = "possui_uniforme_oficial", nullable = false)
    private boolean possuiUniformeOficial;

    @Column(name = "possui_novo_manual_asa", nullable = false)
    private boolean possuiNovoManualAsa;

    @Column(name = "possui_livro_beneficencia_social", nullable = false)
    private boolean possuiLivroBeneficenciaSocial;

    @Column(name = "email_oficial")
    private String emailOficial;

    @Column(name = "acao_visita_beneficiarios", nullable = false)
    private boolean acaoVisitaBeneficiarios;

    @Column(name = "acao_recolta_donativos", nullable = false)
    private boolean acaoRecoltaDonativos;

    @Column(name = "acao_doacao_sangue", nullable = false)
    private boolean acaoDoacaoSangue;

    @Column(name = "acao_campanha_agasalho", nullable = false)
    private boolean acaoCampanhaAgasalho;

    @Column(name = "acao_feira_solidaria", nullable = false)
    private boolean acaoFeiraSolidaria;

    @Column(name = "acao_palestras_educativas", nullable = false)
    private boolean acaoPalestrasEducativas;

    @Column(name = "acao_cursos_geracao_renda", nullable = false)
    private boolean acaoCursosGeracaoRenda;

    @Column(name = "acao_mutirao_natal", nullable = false)
    private boolean acaoMutiraoNatal;

    @Column(name = "familias_atendidas", nullable = false)
    private Integer familiasAtendidas;

    @Column(name = "cestas_basicas_19kg", nullable = false)
    private Integer cestasBasicas19kg;

    @Column(name = "pecas_roupas_calcados", nullable = false)
    private Integer pecasRoupasCalcados;

    @Column(name = "voluntarios_ativos", nullable = false)
    private Integer voluntariosAtivos;

    @Column(name = "estudos_biblicos", nullable = false)
    private Integer estudosBiblicos;

    @Column(name = "batismos_mes", nullable = false)
    private Integer batismosMes;

    @Column(name = "reuniao_avaliacao_planejamento", nullable = false)
    private boolean reuniaoAvaliacaoPlanejamento;

    @Column(name = "assistencia_alimentos", nullable = false)
    private boolean assistenciaAlimentos;

    @Column(name = "assistencia_roupas", nullable = false)
    private boolean assistenciaRoupas;

    @Column(name = "assistencia_moveis", nullable = false)
    private boolean assistenciaMoveis;

    @Column(name = "assistencia_limpeza_higiene", nullable = false)
    private boolean assistenciaLimpezaHigiene;

    @Column(name = "assistencia_construcao", nullable = false)
    private boolean assistenciaConstrucao;

    @Column(name = "assistencia_material_escolar", nullable = false)
    private boolean assistenciaMaterialEscolar;

    @Column(name = "assistencia_medicamentos", nullable = false)
    private boolean assistenciaMedicamentos;

    @Column(name = "assistencia_atendimento_saude", nullable = false)
    private boolean assistenciaAtendimentoSaude;

    @Column(name = "assistencia_mutiroes", nullable = false)
    private boolean assistenciaMutiroes;

    @Column(name = "assistencia_outras")
    private String assistenciaOutras;

    @Column(name = "desenvolvimento_capacitacao_profissional", nullable = false)
    private boolean desenvolvimentoCapacitacaoProfissional;

    @Column(name = "desenvolvimento_curriculo_orientacao", nullable = false)
    private boolean desenvolvimentoCurriculoOrientacao;

    @Column(name = "desenvolvimento_curso_idioma", nullable = false)
    private boolean desenvolvimentoCursoIdioma;

    @Column(name = "desenvolvimento_curso_informatica", nullable = false)
    private boolean desenvolvimentoCursoInformatica;

    @Column(name = "desenvolvimento_cursos_geracao_renda", nullable = false)
    private boolean desenvolvimentoCursosGeracaoRenda;

    @Column(name = "desenvolvimento_administracao_financeira_lar", nullable = false)
    private boolean desenvolvimentoAdministracaoFinanceiraLar;

    @Column(name = "desenvolvimento_deixar_fumar_beber", nullable = false)
    private boolean desenvolvimentoDeixarFumarBeber;

    @Column(name = "desenvolvimento_prevencao_drogas", nullable = false)
    private boolean desenvolvimentoPrevencaoDrogas;

    @Column(name = "desenvolvimento_habitos_saudaveis", nullable = false)
    private boolean desenvolvimentoHabitosSaudaveis;

    @Column(name = "desenvolvimento_educacao_sexual", nullable = false)
    private boolean desenvolvimentoEducacaoSexual;

    @Column(name = "desenvolvimento_educacao_filhos", nullable = false)
    private boolean desenvolvimentoEducacaoFilhos;

    @Column(name = "desenvolvimento_aproveitamento_alimentos", nullable = false)
    private boolean desenvolvimentoAproveitamentoAlimentos;

    @Column(name = "desenvolvimento_alfabetizacao_adultos", nullable = false)
    private boolean desenvolvimentoAlfabetizacaoAdultos;

    @Column(name = "desenvolvimento_outras")
    private String desenvolvimentoOutras;

    @Column(name = "avaliacao_relatorio", nullable = false)
    private Integer avaliacaoRelatorio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAsaIdentificacao() {
        return asaIdentificacao;
    }

    public void setAsaIdentificacao(String asaIdentificacao) {
        this.asaIdentificacao = asaIdentificacao;
    }

    public String getPeriodoRelatorio() {
        return periodoRelatorio;
    }

    public void setPeriodoRelatorio(String periodoRelatorio) {
        this.periodoRelatorio = periodoRelatorio;
    }

    public String getDiretorNome() {
        return diretorNome;
    }

    public void setDiretorNome(String diretorNome) {
        this.diretorNome = diretorNome;
    }

    public String getTelefoneContato() {
        return telefoneContato;
    }

    public void setTelefoneContato(String telefoneContato) {
        this.telefoneContato = telefoneContato;
    }

    public boolean isPossuiInstagram() {
        return possuiInstagram;
    }

    public void setPossuiInstagram(boolean possuiInstagram) {
        this.possuiInstagram = possuiInstagram;
    }

    public boolean isPossuiEmailProprio() {
        return possuiEmailProprio;
    }

    public void setPossuiEmailProprio(boolean possuiEmailProprio) {
        this.possuiEmailProprio = possuiEmailProprio;
    }

    public boolean isPossuiUniformeOficial() {
        return possuiUniformeOficial;
    }

    public void setPossuiUniformeOficial(boolean possuiUniformeOficial) {
        this.possuiUniformeOficial = possuiUniformeOficial;
    }

    public boolean isPossuiNovoManualAsa() {
        return possuiNovoManualAsa;
    }

    public void setPossuiNovoManualAsa(boolean possuiNovoManualAsa) {
        this.possuiNovoManualAsa = possuiNovoManualAsa;
    }

    public boolean isPossuiLivroBeneficenciaSocial() {
        return possuiLivroBeneficenciaSocial;
    }

    public void setPossuiLivroBeneficenciaSocial(boolean possuiLivroBeneficenciaSocial) {
        this.possuiLivroBeneficenciaSocial = possuiLivroBeneficenciaSocial;
    }

    public String getEmailOficial() {
        return emailOficial;
    }

    public void setEmailOficial(String emailOficial) {
        this.emailOficial = emailOficial;
    }

    public boolean isAcaoVisitaBeneficiarios() {
        return acaoVisitaBeneficiarios;
    }

    public void setAcaoVisitaBeneficiarios(boolean acaoVisitaBeneficiarios) {
        this.acaoVisitaBeneficiarios = acaoVisitaBeneficiarios;
    }

    public boolean isAcaoRecoltaDonativos() {
        return acaoRecoltaDonativos;
    }

    public void setAcaoRecoltaDonativos(boolean acaoRecoltaDonativos) {
        this.acaoRecoltaDonativos = acaoRecoltaDonativos;
    }

    public boolean isAcaoDoacaoSangue() {
        return acaoDoacaoSangue;
    }

    public void setAcaoDoacaoSangue(boolean acaoDoacaoSangue) {
        this.acaoDoacaoSangue = acaoDoacaoSangue;
    }

    public boolean isAcaoCampanhaAgasalho() {
        return acaoCampanhaAgasalho;
    }

    public void setAcaoCampanhaAgasalho(boolean acaoCampanhaAgasalho) {
        this.acaoCampanhaAgasalho = acaoCampanhaAgasalho;
    }

    public boolean isAcaoFeiraSolidaria() {
        return acaoFeiraSolidaria;
    }

    public void setAcaoFeiraSolidaria(boolean acaoFeiraSolidaria) {
        this.acaoFeiraSolidaria = acaoFeiraSolidaria;
    }

    public boolean isAcaoPalestrasEducativas() {
        return acaoPalestrasEducativas;
    }

    public void setAcaoPalestrasEducativas(boolean acaoPalestrasEducativas) {
        this.acaoPalestrasEducativas = acaoPalestrasEducativas;
    }

    public boolean isAcaoCursosGeracaoRenda() {
        return acaoCursosGeracaoRenda;
    }

    public void setAcaoCursosGeracaoRenda(boolean acaoCursosGeracaoRenda) {
        this.acaoCursosGeracaoRenda = acaoCursosGeracaoRenda;
    }

    public boolean isAcaoMutiraoNatal() {
        return acaoMutiraoNatal;
    }

    public void setAcaoMutiraoNatal(boolean acaoMutiraoNatal) {
        this.acaoMutiraoNatal = acaoMutiraoNatal;
    }

    public Integer getFamiliasAtendidas() {
        return familiasAtendidas;
    }

    public void setFamiliasAtendidas(Integer familiasAtendidas) {
        this.familiasAtendidas = familiasAtendidas;
    }

    public Integer getCestasBasicas19kg() {
        return cestasBasicas19kg;
    }

    public void setCestasBasicas19kg(Integer cestasBasicas19kg) {
        this.cestasBasicas19kg = cestasBasicas19kg;
    }

    public Integer getPecasRoupasCalcados() {
        return pecasRoupasCalcados;
    }

    public void setPecasRoupasCalcados(Integer pecasRoupasCalcados) {
        this.pecasRoupasCalcados = pecasRoupasCalcados;
    }

    public Integer getVoluntariosAtivos() {
        return voluntariosAtivos;
    }

    public void setVoluntariosAtivos(Integer voluntariosAtivos) {
        this.voluntariosAtivos = voluntariosAtivos;
    }

    public Integer getEstudosBiblicos() {
        return estudosBiblicos;
    }

    public void setEstudosBiblicos(Integer estudosBiblicos) {
        this.estudosBiblicos = estudosBiblicos;
    }

    public Integer getBatismosMes() {
        return batismosMes;
    }

    public void setBatismosMes(Integer batismosMes) {
        this.batismosMes = batismosMes;
    }

    public boolean isReuniaoAvaliacaoPlanejamento() {
        return reuniaoAvaliacaoPlanejamento;
    }

    public void setReuniaoAvaliacaoPlanejamento(boolean reuniaoAvaliacaoPlanejamento) {
        this.reuniaoAvaliacaoPlanejamento = reuniaoAvaliacaoPlanejamento;
    }

    public boolean isAssistenciaAlimentos() {
        return assistenciaAlimentos;
    }

    public void setAssistenciaAlimentos(boolean assistenciaAlimentos) {
        this.assistenciaAlimentos = assistenciaAlimentos;
    }

    public boolean isAssistenciaRoupas() {
        return assistenciaRoupas;
    }

    public void setAssistenciaRoupas(boolean assistenciaRoupas) {
        this.assistenciaRoupas = assistenciaRoupas;
    }

    public boolean isAssistenciaMoveis() {
        return assistenciaMoveis;
    }

    public void setAssistenciaMoveis(boolean assistenciaMoveis) {
        this.assistenciaMoveis = assistenciaMoveis;
    }

    public boolean isAssistenciaLimpezaHigiene() {
        return assistenciaLimpezaHigiene;
    }

    public void setAssistenciaLimpezaHigiene(boolean assistenciaLimpezaHigiene) {
        this.assistenciaLimpezaHigiene = assistenciaLimpezaHigiene;
    }

    public boolean isAssistenciaConstrucao() {
        return assistenciaConstrucao;
    }

    public void setAssistenciaConstrucao(boolean assistenciaConstrucao) {
        this.assistenciaConstrucao = assistenciaConstrucao;
    }

    public boolean isAssistenciaMaterialEscolar() {
        return assistenciaMaterialEscolar;
    }

    public void setAssistenciaMaterialEscolar(boolean assistenciaMaterialEscolar) {
        this.assistenciaMaterialEscolar = assistenciaMaterialEscolar;
    }

    public boolean isAssistenciaMedicamentos() {
        return assistenciaMedicamentos;
    }

    public void setAssistenciaMedicamentos(boolean assistenciaMedicamentos) {
        this.assistenciaMedicamentos = assistenciaMedicamentos;
    }

    public boolean isAssistenciaAtendimentoSaude() {
        return assistenciaAtendimentoSaude;
    }

    public void setAssistenciaAtendimentoSaude(boolean assistenciaAtendimentoSaude) {
        this.assistenciaAtendimentoSaude = assistenciaAtendimentoSaude;
    }

    public boolean isAssistenciaMutiroes() {
        return assistenciaMutiroes;
    }

    public void setAssistenciaMutiroes(boolean assistenciaMutiroes) {
        this.assistenciaMutiroes = assistenciaMutiroes;
    }

    public String getAssistenciaOutras() {
        return assistenciaOutras;
    }

    public void setAssistenciaOutras(String assistenciaOutras) {
        this.assistenciaOutras = assistenciaOutras;
    }

    public boolean isDesenvolvimentoCapacitacaoProfissional() {
        return desenvolvimentoCapacitacaoProfissional;
    }

    public void setDesenvolvimentoCapacitacaoProfissional(boolean desenvolvimentoCapacitacaoProfissional) {
        this.desenvolvimentoCapacitacaoProfissional = desenvolvimentoCapacitacaoProfissional;
    }

    public boolean isDesenvolvimentoCurriculoOrientacao() {
        return desenvolvimentoCurriculoOrientacao;
    }

    public void setDesenvolvimentoCurriculoOrientacao(boolean desenvolvimentoCurriculoOrientacao) {
        this.desenvolvimentoCurriculoOrientacao = desenvolvimentoCurriculoOrientacao;
    }

    public boolean isDesenvolvimentoCursoIdioma() {
        return desenvolvimentoCursoIdioma;
    }

    public void setDesenvolvimentoCursoIdioma(boolean desenvolvimentoCursoIdioma) {
        this.desenvolvimentoCursoIdioma = desenvolvimentoCursoIdioma;
    }

    public boolean isDesenvolvimentoCursoInformatica() {
        return desenvolvimentoCursoInformatica;
    }

    public void setDesenvolvimentoCursoInformatica(boolean desenvolvimentoCursoInformatica) {
        this.desenvolvimentoCursoInformatica = desenvolvimentoCursoInformatica;
    }

    public boolean isDesenvolvimentoCursosGeracaoRenda() {
        return desenvolvimentoCursosGeracaoRenda;
    }

    public void setDesenvolvimentoCursosGeracaoRenda(boolean desenvolvimentoCursosGeracaoRenda) {
        this.desenvolvimentoCursosGeracaoRenda = desenvolvimentoCursosGeracaoRenda;
    }

    public boolean isDesenvolvimentoAdministracaoFinanceiraLar() {
        return desenvolvimentoAdministracaoFinanceiraLar;
    }

    public void setDesenvolvimentoAdministracaoFinanceiraLar(boolean desenvolvimentoAdministracaoFinanceiraLar) {
        this.desenvolvimentoAdministracaoFinanceiraLar = desenvolvimentoAdministracaoFinanceiraLar;
    }

    public boolean isDesenvolvimentoDeixarFumarBeber() {
        return desenvolvimentoDeixarFumarBeber;
    }

    public void setDesenvolvimentoDeixarFumarBeber(boolean desenvolvimentoDeixarFumarBeber) {
        this.desenvolvimentoDeixarFumarBeber = desenvolvimentoDeixarFumarBeber;
    }

    public boolean isDesenvolvimentoPrevencaoDrogas() {
        return desenvolvimentoPrevencaoDrogas;
    }

    public void setDesenvolvimentoPrevencaoDrogas(boolean desenvolvimentoPrevencaoDrogas) {
        this.desenvolvimentoPrevencaoDrogas = desenvolvimentoPrevencaoDrogas;
    }

    public boolean isDesenvolvimentoHabitosSaudaveis() {
        return desenvolvimentoHabitosSaudaveis;
    }

    public void setDesenvolvimentoHabitosSaudaveis(boolean desenvolvimentoHabitosSaudaveis) {
        this.desenvolvimentoHabitosSaudaveis = desenvolvimentoHabitosSaudaveis;
    }

    public boolean isDesenvolvimentoEducacaoSexual() {
        return desenvolvimentoEducacaoSexual;
    }

    public void setDesenvolvimentoEducacaoSexual(boolean desenvolvimentoEducacaoSexual) {
        this.desenvolvimentoEducacaoSexual = desenvolvimentoEducacaoSexual;
    }

    public boolean isDesenvolvimentoEducacaoFilhos() {
        return desenvolvimentoEducacaoFilhos;
    }

    public void setDesenvolvimentoEducacaoFilhos(boolean desenvolvimentoEducacaoFilhos) {
        this.desenvolvimentoEducacaoFilhos = desenvolvimentoEducacaoFilhos;
    }

    public boolean isDesenvolvimentoAproveitamentoAlimentos() {
        return desenvolvimentoAproveitamentoAlimentos;
    }

    public void setDesenvolvimentoAproveitamentoAlimentos(boolean desenvolvimentoAproveitamentoAlimentos) {
        this.desenvolvimentoAproveitamentoAlimentos = desenvolvimentoAproveitamentoAlimentos;
    }

    public boolean isDesenvolvimentoAlfabetizacaoAdultos() {
        return desenvolvimentoAlfabetizacaoAdultos;
    }

    public void setDesenvolvimentoAlfabetizacaoAdultos(boolean desenvolvimentoAlfabetizacaoAdultos) {
        this.desenvolvimentoAlfabetizacaoAdultos = desenvolvimentoAlfabetizacaoAdultos;
    }

    public String getDesenvolvimentoOutras() {
        return desenvolvimentoOutras;
    }

    public void setDesenvolvimentoOutras(String desenvolvimentoOutras) {
        this.desenvolvimentoOutras = desenvolvimentoOutras;
    }

    public Integer getAvaliacaoRelatorio() {
        return avaliacaoRelatorio;
    }

    public void setAvaliacaoRelatorio(Integer avaliacaoRelatorio) {
        this.avaliacaoRelatorio = avaliacaoRelatorio;
    }
}
