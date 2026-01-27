package br.com.asa.service;

import br.com.asa.model.AtividadeAsa;
import br.com.asa.repository.AtividadeAsaRepository;
import br.com.asa.web.AtividadeAsaDto;
import br.com.asa.web.ImportacaoAtividadeRespostaDto;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AtividadeAsaService {
    private final AtividadeAsaRepository atividadeAsaRepository;

    public AtividadeAsaService(AtividadeAsaRepository atividadeAsaRepository) {
        this.atividadeAsaRepository = atividadeAsaRepository;
    }

    public ImportacaoAtividadeRespostaDto importarGoogleForms(InputStream arquivoCsv, String periodoRelatorio) throws IOException {
        ImportacaoAtividadeRespostaDto resposta = new ImportacaoAtividadeRespostaDto();
        String periodoImportacao = normalizarPeriodo(periodoRelatorio);
        if (periodoImportacao == null || periodoImportacao.isBlank()) {
            resposta.adicionarMensagem("Periodo do relatorio invalido para importacao.");
            return resposta;
        }
        try (BufferedReader leitor = new BufferedReader(new InputStreamReader(arquivoCsv, StandardCharsets.UTF_8))) {
            String linhaCabecalho = leitor.readLine();
            if (linhaCabecalho == null || linhaCabecalho.isBlank()) {
                resposta.adicionarMensagem("O arquivo CSV esta vazio.");
                return resposta;
            }

            List<String> cabecalhos = parsearLinhaCsv(linhaCabecalho);
            Map<Integer, String> cabecalhosNormalizados = new HashMap<>();
            for (int i = 0; i < cabecalhos.size(); i++) {
                cabecalhosNormalizados.put(i, normalizarCabecalho(cabecalhos.get(i)));
            }

            String linha;
            int numeroLinha = 1;
            while ((linha = leitor.readLine()) != null) {
                numeroLinha++;
                if (linha.isBlank()) {
                    continue;
                }
                resposta.setTotalLinhas(resposta.getTotalLinhas() + 1);

                try {
                    List<String> valores = parsearLinhaCsv(linha);
                    Map<String, String> mapaLinha = montarMapaLinha(cabecalhosNormalizados, valores);
                    AtividadeAsaDto dto = mapearLinhaParaDto(mapaLinha, periodoImportacao);

                    if (dto.getAsaIdentificacao() == null || dto.getAsaIdentificacao().isBlank()) {
                        resposta.setIgnorados(resposta.getIgnorados() + 1);
                        resposta.adicionarMensagem("Linha " + numeroLinha + ": ASA nao informada.");
                        continue;
                    }
                    if (dto.getPeriodoRelatorio() == null || dto.getPeriodoRelatorio().isBlank()) {
                        resposta.setIgnorados(resposta.getIgnorados() + 1);
                        resposta.adicionarMensagem("Linha " + numeroLinha + ": periodo do relatorio nao informado.");
                        continue;
                    }

                    Optional<AtividadeAsa> existenteOpt = atividadeAsaRepository
                        .findByAsaIdentificacaoAndPeriodoRelatorio(dto.getAsaIdentificacao(), dto.getPeriodoRelatorio());

                    if (existenteOpt.isPresent()) {
                        resposta.setIgnorados(resposta.getIgnorados() + 1);
                        resposta.setIgnoradosDuplicidade(resposta.getIgnoradosDuplicidade() + 1);
                        resposta.adicionarMensagem("Linha " + numeroLinha + ": ASA ja importada para este periodo.");
                        continue;
                    }
                    AtividadeAsa entidade = preencherEntidade(dto, new AtividadeAsa());
                    AtividadeAsa salvo = atividadeAsaRepository.save(entidade);
                    resposta.setImportados(resposta.getImportados() + 1);
                    if (salvo.getId() == null) {
                        resposta.adicionarMensagem("Linha " + numeroLinha + ": registro salvo sem identificador.");
                    }
                } catch (RuntimeException ex) {
                    resposta.setIgnorados(resposta.getIgnorados() + 1);
                    resposta.adicionarMensagem("Linha " + numeroLinha + ": erro ao importar (" + ex.getMessage() + ").");
                }
            }
        }
        if (resposta.getTotalLinhas() == 0) {
            resposta.adicionarMensagem("Nenhuma linha valida foi encontrada para importacao.");
        }
        return resposta;
    }

    public List<AtividadeAsaDto> listar() {
        return atividadeAsaRepository.findAll()
            .stream()
            .map(this::paraDto)
            .collect(Collectors.toList());
    }

    public AtividadeAsaDto criar(AtividadeAsaDto dto) {
        AtividadeAsa atividade = preencherEntidade(dto, new AtividadeAsa());
        return paraDto(atividadeAsaRepository.save(atividade));
    }

    public AtividadeAsaDto atualizar(Long id, AtividadeAsaDto dto) {
        AtividadeAsa atividade = preencherEntidade(dto, new AtividadeAsa());
        atividade.setId(id);
        return paraDto(atividadeAsaRepository.save(atividade));
    }

    public void excluir(Long id) {
        atividadeAsaRepository.deleteById(id);
    }

    private AtividadeAsaDto paraDto(AtividadeAsa atividade) {
        AtividadeAsaDto dto = new AtividadeAsaDto();
        dto.setId(atividade.getId());
        dto.setAsaIdentificacao(atividade.getAsaIdentificacao());
        dto.setPeriodoRelatorio(atividade.getPeriodoRelatorio());
        dto.setDiretorNome(atividade.getDiretorNome());
        dto.setTelefoneContato(atividade.getTelefoneContato());
        dto.setPossuiInstagram(atividade.isPossuiInstagram());
        dto.setPossuiEmailProprio(atividade.isPossuiEmailProprio());
        dto.setPossuiUniformeOficial(atividade.isPossuiUniformeOficial());
        dto.setPossuiNovoManualAsa(atividade.isPossuiNovoManualAsa());
        dto.setPossuiLivroBeneficenciaSocial(atividade.isPossuiLivroBeneficenciaSocial());
        dto.setEmailOficial(atividade.getEmailOficial());
        dto.setAcaoVisitaBeneficiarios(atividade.isAcaoVisitaBeneficiarios());
        dto.setAcaoRecoltaDonativos(atividade.isAcaoRecoltaDonativos());
        dto.setAcaoDoacaoSangue(atividade.isAcaoDoacaoSangue());
        dto.setAcaoCampanhaAgasalho(atividade.isAcaoCampanhaAgasalho());
        dto.setAcaoFeiraSolidaria(atividade.isAcaoFeiraSolidaria());
        dto.setAcaoPalestrasEducativas(atividade.isAcaoPalestrasEducativas());
        dto.setAcaoCursosGeracaoRenda(atividade.isAcaoCursosGeracaoRenda());
        dto.setAcaoMutiraoNatal(atividade.isAcaoMutiraoNatal());
        dto.setFamiliasAtendidas(atividade.getFamiliasAtendidas());
        dto.setCestasBasicas19kg(atividade.getCestasBasicas19kg());
        dto.setPecasRoupasCalcados(atividade.getPecasRoupasCalcados());
        dto.setVoluntariosAtivos(atividade.getVoluntariosAtivos());
        dto.setEstudosBiblicos(atividade.getEstudosBiblicos());
        dto.setBatismosMes(atividade.getBatismosMes());
        dto.setReuniaoAvaliacaoPlanejamento(atividade.isReuniaoAvaliacaoPlanejamento());
        dto.setAssistenciaAlimentos(atividade.isAssistenciaAlimentos());
        dto.setAssistenciaRoupas(atividade.isAssistenciaRoupas());
        dto.setAssistenciaMoveis(atividade.isAssistenciaMoveis());
        dto.setAssistenciaLimpezaHigiene(atividade.isAssistenciaLimpezaHigiene());
        dto.setAssistenciaConstrucao(atividade.isAssistenciaConstrucao());
        dto.setAssistenciaMaterialEscolar(atividade.isAssistenciaMaterialEscolar());
        dto.setAssistenciaMedicamentos(atividade.isAssistenciaMedicamentos());
        dto.setAssistenciaAtendimentoSaude(atividade.isAssistenciaAtendimentoSaude());
        dto.setAssistenciaMutiroes(atividade.isAssistenciaMutiroes());
        dto.setAssistenciaOutras(atividade.getAssistenciaOutras());
        dto.setDesenvolvimentoCapacitacaoProfissional(atividade.isDesenvolvimentoCapacitacaoProfissional());
        dto.setDesenvolvimentoCurriculoOrientacao(atividade.isDesenvolvimentoCurriculoOrientacao());
        dto.setDesenvolvimentoCursoIdioma(atividade.isDesenvolvimentoCursoIdioma());
        dto.setDesenvolvimentoCursoInformatica(atividade.isDesenvolvimentoCursoInformatica());
        dto.setDesenvolvimentoCursosGeracaoRenda(atividade.isDesenvolvimentoCursosGeracaoRenda());
        dto.setDesenvolvimentoAdministracaoFinanceiraLar(atividade.isDesenvolvimentoAdministracaoFinanceiraLar());
        dto.setDesenvolvimentoDeixarFumarBeber(atividade.isDesenvolvimentoDeixarFumarBeber());
        dto.setDesenvolvimentoPrevencaoDrogas(atividade.isDesenvolvimentoPrevencaoDrogas());
        dto.setDesenvolvimentoHabitosSaudaveis(atividade.isDesenvolvimentoHabitosSaudaveis());
        dto.setDesenvolvimentoEducacaoSexual(atividade.isDesenvolvimentoEducacaoSexual());
        dto.setDesenvolvimentoEducacaoFilhos(atividade.isDesenvolvimentoEducacaoFilhos());
        dto.setDesenvolvimentoAproveitamentoAlimentos(atividade.isDesenvolvimentoAproveitamentoAlimentos());
        dto.setDesenvolvimentoAlfabetizacaoAdultos(atividade.isDesenvolvimentoAlfabetizacaoAdultos());
        dto.setDesenvolvimentoOutras(atividade.getDesenvolvimentoOutras());
        dto.setAvaliacaoRelatorio(atividade.getAvaliacaoRelatorio());
        return dto;
    }

    private AtividadeAsa preencherEntidade(AtividadeAsaDto dto, AtividadeAsa atividade) {
        atividade.setAsaIdentificacao(dto.getAsaIdentificacao());
        atividade.setPeriodoRelatorio(dto.getPeriodoRelatorio());
        atividade.setDiretorNome(dto.getDiretorNome());
        atividade.setTelefoneContato(dto.getTelefoneContato());
        atividade.setPossuiInstagram(dto.isPossuiInstagram());
        atividade.setPossuiEmailProprio(dto.isPossuiEmailProprio());
        atividade.setPossuiUniformeOficial(dto.isPossuiUniformeOficial());
        atividade.setPossuiNovoManualAsa(dto.isPossuiNovoManualAsa());
        atividade.setPossuiLivroBeneficenciaSocial(dto.isPossuiLivroBeneficenciaSocial());
        atividade.setEmailOficial(dto.getEmailOficial());
        atividade.setAcaoVisitaBeneficiarios(dto.isAcaoVisitaBeneficiarios());
        atividade.setAcaoRecoltaDonativos(dto.isAcaoRecoltaDonativos());
        atividade.setAcaoDoacaoSangue(dto.isAcaoDoacaoSangue());
        atividade.setAcaoCampanhaAgasalho(dto.isAcaoCampanhaAgasalho());
        atividade.setAcaoFeiraSolidaria(dto.isAcaoFeiraSolidaria());
        atividade.setAcaoPalestrasEducativas(dto.isAcaoPalestrasEducativas());
        atividade.setAcaoCursosGeracaoRenda(dto.isAcaoCursosGeracaoRenda());
        atividade.setAcaoMutiraoNatal(dto.isAcaoMutiraoNatal());
        atividade.setFamiliasAtendidas(dto.getFamiliasAtendidas());
        atividade.setCestasBasicas19kg(dto.getCestasBasicas19kg());
        atividade.setPecasRoupasCalcados(dto.getPecasRoupasCalcados());
        atividade.setVoluntariosAtivos(dto.getVoluntariosAtivos());
        atividade.setEstudosBiblicos(dto.getEstudosBiblicos());
        atividade.setBatismosMes(dto.getBatismosMes());
        atividade.setReuniaoAvaliacaoPlanejamento(dto.isReuniaoAvaliacaoPlanejamento());
        atividade.setAssistenciaAlimentos(dto.isAssistenciaAlimentos());
        atividade.setAssistenciaRoupas(dto.isAssistenciaRoupas());
        atividade.setAssistenciaMoveis(dto.isAssistenciaMoveis());
        atividade.setAssistenciaLimpezaHigiene(dto.isAssistenciaLimpezaHigiene());
        atividade.setAssistenciaConstrucao(dto.isAssistenciaConstrucao());
        atividade.setAssistenciaMaterialEscolar(dto.isAssistenciaMaterialEscolar());
        atividade.setAssistenciaMedicamentos(dto.isAssistenciaMedicamentos());
        atividade.setAssistenciaAtendimentoSaude(dto.isAssistenciaAtendimentoSaude());
        atividade.setAssistenciaMutiroes(dto.isAssistenciaMutiroes());
        atividade.setAssistenciaOutras(dto.getAssistenciaOutras());
        atividade.setDesenvolvimentoCapacitacaoProfissional(dto.isDesenvolvimentoCapacitacaoProfissional());
        atividade.setDesenvolvimentoCurriculoOrientacao(dto.isDesenvolvimentoCurriculoOrientacao());
        atividade.setDesenvolvimentoCursoIdioma(dto.isDesenvolvimentoCursoIdioma());
        atividade.setDesenvolvimentoCursoInformatica(dto.isDesenvolvimentoCursoInformatica());
        atividade.setDesenvolvimentoCursosGeracaoRenda(dto.isDesenvolvimentoCursosGeracaoRenda());
        atividade.setDesenvolvimentoAdministracaoFinanceiraLar(dto.isDesenvolvimentoAdministracaoFinanceiraLar());
        atividade.setDesenvolvimentoDeixarFumarBeber(dto.isDesenvolvimentoDeixarFumarBeber());
        atividade.setDesenvolvimentoPrevencaoDrogas(dto.isDesenvolvimentoPrevencaoDrogas());
        atividade.setDesenvolvimentoHabitosSaudaveis(dto.isDesenvolvimentoHabitosSaudaveis());
        atividade.setDesenvolvimentoEducacaoSexual(dto.isDesenvolvimentoEducacaoSexual());
        atividade.setDesenvolvimentoEducacaoFilhos(dto.isDesenvolvimentoEducacaoFilhos());
        atividade.setDesenvolvimentoAproveitamentoAlimentos(dto.isDesenvolvimentoAproveitamentoAlimentos());
        atividade.setDesenvolvimentoAlfabetizacaoAdultos(dto.isDesenvolvimentoAlfabetizacaoAdultos());
        atividade.setDesenvolvimentoOutras(dto.getDesenvolvimentoOutras());
        atividade.setAvaliacaoRelatorio(dto.getAvaliacaoRelatorio());
        return atividade;
    }

    private Map<String, String> montarMapaLinha(Map<Integer, String> cabecalhosNormalizados, List<String> valores) {
        Map<String, String> mapa = new HashMap<>();
        for (int i = 0; i < valores.size(); i++) {
            String cabecalho = cabecalhosNormalizados.get(i);
            String valor = valores.get(i);
            if (cabecalho == null || cabecalho.isBlank()) {
                mapa.put("coluna_" + i, valor);
                continue;
            }
            mapa.put(cabecalho, valor);
        }
        return mapa;
    }

    private AtividadeAsaDto mapearLinhaParaDto(Map<String, String> linha, String periodoImportacao) {
        AtividadeAsaDto dto = new AtividadeAsaDto();
        String asaIdentificacao = obterPrimeiroValor(
            linha,
            "asa_identificacao",
            "nome_da_unidade",
            "asa",
            "asa_luizote",
            "coluna_1"
        );
        if (asaIdentificacao.isBlank()) {
            asaIdentificacao = localizarAsaEmColunasAnonimas(linha);
        }
        dto.setAsaIdentificacao(asaIdentificacao);
        dto.setPeriodoRelatorio(periodoImportacao);
        dto.setDiretorNome(obterPrimeiroValor(
            linha,
            "diretor_nome",
            "diretor",
            "diretora",
            "informe_o_nome_do_diretor_a_da_asa"
        ));
        dto.setTelefoneContato(obterPrimeiroValor(
            linha,
            "telefone_contato",
            "telefone",
            "telefone_para_contato"
        ));
        dto.setEmailOficial(obterPrimeiroValor(
            linha,
            "email_oficial",
            "email",
            "e_mail_oficial",
            "qual_e_mail_oficial_da_minha_asa"
        ));

        dto.setPossuiInstagram(parsearBooleano(obterPrimeiroValor(
            linha,
            "possui_instagram",
            "instagram",
            "a_sua_asa_possui_os_itens_abaixo_instagram"
        )));
        dto.setPossuiEmailProprio(parsearBooleano(obterPrimeiroValor(
            linha,
            "possui_email_proprio",
            "email_proprio",
            "a_sua_asa_possui_os_itens_abaixo_email_proprio"
        )));
        dto.setPossuiUniformeOficial(parsearBooleano(obterPrimeiroValor(
            linha,
            "possui_uniforme_oficial",
            "uniforme_oficial",
            "a_sua_asa_possui_os_itens_abaixo_uniforme_oficial"
        )));
        dto.setPossuiNovoManualAsa(parsearBooleano(obterPrimeiroValor(
            linha,
            "possui_novo_manual_asa",
            "novo_manual_da_asa",
            "a_sua_asa_possui_os_itens_abaixo_novo_manual_da_asa"
        )));
        dto.setPossuiLivroBeneficenciaSocial(parsearBooleano(obterPrimeiroValor(
            linha,
            "possui_livro_beneficencia_social",
            "livro_beneficencia_social",
            "a_sua_asa_possui_os_itens_abaixo_livro_beneficencia_social"
        )));

        dto.setAcaoVisitaBeneficiarios(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_visita_beneficiarios",
            "visita_a_beneficiarios",
            "minha_asa_promoveu_este_mes_o_projeto_visita_a_beneficiarios"
        )));
        dto.setAcaoRecoltaDonativos(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_recolta_donativos",
            "recolta_de_donativos_r",
            "minha_asa_promoveu_este_mes_o_projeto_recolta_de_donativos_r"
        )));
        dto.setAcaoDoacaoSangue(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_doacao_sangue",
            "doacao_de_sangue",
            "minha_asa_promoveu_este_mes_o_projeto_doacao_de_sangue"
        )));
        dto.setAcaoCampanhaAgasalho(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_campanha_agasalho",
            "campanha_do_agasalho",
            "minha_asa_promoveu_este_mes_o_projeto_campanha_do_agasalho"
        )));
        dto.setAcaoFeiraSolidaria(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_feira_solidaria",
            "feira_solidaria",
            "minha_asa_promoveu_este_mes_o_projeto_feira_solidaria"
        )));
        dto.setAcaoPalestrasEducativas(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_palestras_educativas",
            "palestras_educativas",
            "minha_asa_promoveu_este_mes_o_projeto_palestras_educativas"
        )));
        dto.setAcaoCursosGeracaoRenda(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_cursos_geracao_renda",
            "cursos_para_geracao_de_renda",
            "minha_asa_promoveu_este_mes_o_projeto_cursos_para_geracao_de_renda"
        )));
        dto.setAcaoMutiraoNatal(parsearBooleano(obterPrimeiroValor(
            linha,
            "acao_mutirao_natal",
            "mutirao_de_natal",
            "minha_asa_promoveu_este_mes_o_projeto_mutirao_de_natal"
        )));

        dto.setFamiliasAtendidas(parsearInteiroOuZero(obterPrimeiroValor(
            linha,
            "familias_atendidas",
            "quantas_familias_foram_atendidas_esse_mes"
        )));
        dto.setCestasBasicas19kg(parsearInteiroOuZero(obterPrimeiroValor(
            linha,
            "cestas_basicas_19kg",
            "cestas_basicas19kg",
            "quantas_cestas_basicas_de_19_kg_ou_mais_foram_distribuidas_este_mes"
        )));
        dto.setPecasRoupasCalcados(parsearInteiroOuZero(obterPrimeiroValor(
            linha,
            "pecas_roupas_calcados",
            "quantas_pecas_de_roupas_e_calcados_distribuidos"
        )));
        dto.setVoluntariosAtivos(parsearInteiroOuZero(obterPrimeiroValor(
            linha,
            "voluntarios_ativos",
            "numero_de_voluntarios_que_atuam_ativamente_na_sua_asa"
        )));
        dto.setEstudosBiblicos(parsearInteiroOuZero(obterPrimeiroValor(
            linha,
            "estudos_biblicos",
            "quantos_estudos_biblicos_estao_sendo_realizados"
        )));
        dto.setBatismosMes(parsearInteiroOuZero(obterPrimeiroValor(
            linha,
            "batismos_mes",
            "informe_aqui_a_quantidade_de_batismos_realizados_esse_mes_por_influencia_da_asa"
        )));
        dto.setAvaliacaoRelatorio(parsearInteiroOuZero(obterPrimeiroValor(
            linha,
            "avaliacao_relatorio",
            "avaliacao_do_relatorio",
            "o_que_voce_achou_deste_novo_relatorio_mensal"
        )));

        dto.setReuniaoAvaliacaoPlanejamento(parsearBooleano(obterPrimeiroValor(
            linha,
            "reuniao_avaliacao_planejamento",
            "reuniao_de_avaliacao_e_planejamento",
            "realizei_esse_mes_a_reuniao_com_toda_minha_equipe_de_asa_para_avaliacao_e_planejamento_mensal_de_atividades"
        )));

        dto.setAssistenciaAlimentos(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_alimentos",
            "acoes_assistenciais_promovidas_nesse_mes_distribuicao_de_alimentos_cestas_basicas_ou_sopas"
        )));
        dto.setAssistenciaRoupas(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_roupas",
            "acoes_assistenciais_promovidas_nesse_mes_distribuicao_de_roupas_calcados_cobertores_e_colchoes"
        )));
        dto.setAssistenciaMoveis(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_moveis",
            "acoes_assistenciais_promovidas_nesse_mes_distribuicao_de_moveis_e_utensilios_domesticos"
        )));
        dto.setAssistenciaLimpezaHigiene(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_limpeza_higiene",
            "acoes_assistenciais_promovidas_nesse_mes_distribuicao_de_produtos_de_limpeza_e_higiene_pessoal"
        )));
        dto.setAssistenciaConstrucao(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_construcao",
            "acoes_assistenciais_promovidas_nesse_mes_distribuicao_de_material_de_construcao"
        )));
        dto.setAssistenciaMaterialEscolar(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_material_escolar",
            "acoes_assistenciais_promovidas_nesse_mes_distribuicao_de_material_escolar"
        )));
        dto.setAssistenciaMedicamentos(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_medicamentos",
            "acoes_assistenciais_promovidas_nesse_mes_distribuicao_de_medicamentos"
        )));
        dto.setAssistenciaAtendimentoSaude(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_atendimento_saude",
            "acoes_assistenciais_promovidas_nesse_mes_atendimento_medico_odontologico_psicologico_e_espiritual"
        )));
        dto.setAssistenciaMutiroes(parsearBooleano(obterPrimeiroValor(
            linha,
            "assistencia_mutiroes",
            "acoes_assistenciais_promovidas_nesse_mes_mutiroes_e_dias_de_atendimento_a_comunidade"
        )));
        dto.setAssistenciaOutras(obterPrimeiroValor(
            linha,
            "assistencia_outras",
            "outras_acoes_assistenciais_nao_descritas"
        ));

        dto.setDesenvolvimentoCapacitacaoProfissional(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_capacitacao_profissional",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_cursos_de_capacitacao_profissional"
        )));
        dto.setDesenvolvimentoCurriculoOrientacao(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_curriculo_orientacao",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_elaboracao_de_curriculo_e_orientacao_vocacional"
        )));
        dto.setDesenvolvimentoCursoIdioma(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_curso_idioma",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_de_idioma"
        )));
        dto.setDesenvolvimentoCursoInformatica(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_curso_informatica",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_de_informatica"
        )));
        dto.setDesenvolvimentoCursosGeracaoRenda(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_cursos_geracao_renda",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_cursos_de_geracao_de_renda"
        )));
        dto.setDesenvolvimentoAdministracaoFinanceiraLar(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_administracao_financeira_lar",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_de_administracao_financeira_do_lar"
        )));
        dto.setDesenvolvimentoDeixarFumarBeber(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_deixar_fumar_beber",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_como_deixar_de_fumar_e_beber"
        )));
        dto.setDesenvolvimentoPrevencaoDrogas(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_prevencao_drogas",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_de_prevencao_de_uso_de_drogas"
        )));
        dto.setDesenvolvimentoHabitosSaudaveis(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_habitos_saudaveis",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_de_habitos_de_vida_saudaveis"
        )));
        dto.setDesenvolvimentoEducacaoSexual(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_educacao_sexual",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_educacao_sexual"
        )));
        dto.setDesenvolvimentoEducacaoFilhos(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_educacao_filhos",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_educacao_dos_filhos"
        )));
        dto.setDesenvolvimentoAproveitamentoAlimentos(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_aproveitamento_alimentos",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_de_aproveitamento_de_alimentos"
        )));
        dto.setDesenvolvimentoAlfabetizacaoAdultos(parsearBooleano(obterPrimeiroValor(
            linha,
            "desenvolvimento_alfabetizacao_adultos",
            "acoes_de_desenvolvimento_promovidas_nesse_mes_curso_de_alfabetizacao_de_adultos"
        )));
        dto.setDesenvolvimentoOutras(obterPrimeiroValor(
            linha,
            "desenvolvimento_outras",
            "outras_acoes_de_desenvolvimento_nao_descritas"
        ));

        return dto;
    }

    private String obterPrimeiroValor(Map<String, String> linha, String... chaves) {
        for (String chave : chaves) {
            String valor = linha.get(chave);
            if (valor != null && !valor.isBlank()) {
                return valor.trim();
            }
        }
        return "";
    }

    private String normalizarPeriodo(String valor) {
        if (valor == null || valor.isBlank()) {
            return "";
        }
        String texto = valor.trim();
        if (texto.matches("\\d{4}-\\d{2}")) {
            return texto;
        }
        if (texto.matches("\\d{2}/\\d{4}")) {
            String[] partes = texto.split("/");
            return partes[1] + "-" + partes[0];
        }
        String textoNormalizado = normalizarCabecalho(texto);
        java.util.regex.Matcher matcherMes = java.util.regex.Pattern
            .compile("^(\\d{1,2})[_\\.\\- ]")
            .matcher(textoNormalizado);
        if (matcherMes.find()) {
            int mes = Integer.parseInt(matcherMes.group(1));
            if (mes >= 1 && mes <= 12) {
                String anoAtual = String.valueOf(java.time.Year.now().getValue());
                return anoAtual + "-" + String.format("%02d", mes);
            }
        }
        Integer mesPorNome = obterMesPorNome(textoNormalizado);
        if (mesPorNome != null) {
            String anoAtual = String.valueOf(java.time.Year.now().getValue());
            return anoAtual + "-" + String.format("%02d", mesPorNome);
        }
        return texto;
    }

    private Integer parsearInteiro(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String somenteDigitos = valor.replaceAll("[^0-9-]", "");
        if (somenteDigitos.isBlank() || "-".equals(somenteDigitos)) {
            return null;
        }
        try {
            return Integer.valueOf(somenteDigitos);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private int parsearInteiroOuZero(String valor) {
        Integer numero = parsearInteiro(valor);
        return numero != null ? numero : 0;
    }

    private boolean parsearBooleano(String valor) {
        if (valor == null || valor.isBlank()) {
            return false;
        }
        String texto = normalizarCabecalho(valor);
        return "sim".equals(texto)
            || "true".equals(texto)
            || "1".equals(texto)
            || "x".equals(texto)
            || "yes".equals(texto);
    }

    private String normalizarCabecalho(String cabecalho) {
        if (cabecalho == null) {
            return "";
        }
        String semAcento = Normalizer.normalize(cabecalho, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "_")
            .replaceAll("^_+|_+$", "");
    }

    private List<String> parsearLinhaCsv(String linha) {
        List<String> valores = new java.util.ArrayList<>();
        if (linha == null) {
            return valores;
        }
        StringBuilder atual = new StringBuilder();
        boolean emAspas = false;
        for (int i = 0; i < linha.length(); i++) {
            char caractere = linha.charAt(i);
            if (caractere == '"') {
                boolean proximoEhAspa = (i + 1) < linha.length() && linha.charAt(i + 1) == '"';
                if (proximoEhAspa) {
                    atual.append('"');
                    i++;
                } else {
                    emAspas = !emAspas;
                }
                continue;
            }
            if (caractere == ',' && !emAspas) {
                valores.add(atual.toString().trim());
                atual.setLength(0);
                continue;
            }
            atual.append(caractere);
        }
        valores.add(atual.toString().trim());
        return valores;
    }

    private String localizarAsaEmColunasAnonimas(Map<String, String> linha) {
        for (Map.Entry<String, String> entrada : linha.entrySet()) {
            String chave = entrada.getKey();
            String valor = entrada.getValue();
            if (chave == null || !chave.startsWith("coluna_")) {
                continue;
            }
            if (valor == null) {
                continue;
            }
            String texto = valor.trim();
            if (texto.isBlank()) {
                continue;
            }
            if (texto.toUpperCase(Locale.ROOT).startsWith("ASA")) {
                return texto;
            }
        }
        return "";
    }

    private Integer obterMesPorNome(String textoNormalizado) {
        if (textoNormalizado == null || textoNormalizado.isBlank()) {
            return null;
        }
        Map<String, Integer> mesesPorNome = Map.ofEntries(
            Map.entry("janeiro", 1),
            Map.entry("fevereiro", 2),
            Map.entry("marco", 3),
            Map.entry("abril", 4),
            Map.entry("maio", 5),
            Map.entry("junho", 6),
            Map.entry("julho", 7),
            Map.entry("agosto", 8),
            Map.entry("setembro", 9),
            Map.entry("outubro", 10),
            Map.entry("novembro", 11),
            Map.entry("dezembro", 12)
        );
        for (Map.Entry<String, Integer> entrada : mesesPorNome.entrySet()) {
            if (textoNormalizado.contains(entrada.getKey())) {
                return entrada.getValue();
            }
        }
        return null;
    }
}
