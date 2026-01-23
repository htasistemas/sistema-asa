package br.com.asa.service;

import br.com.asa.model.AtividadeAsa;
import br.com.asa.model.PontuacaoAtividadeConfig;
import br.com.asa.model.PontuacaoUnidadeMes;
import br.com.asa.model.Unit;
import br.com.asa.repository.AtividadeAsaRepository;
import br.com.asa.repository.PontuacaoAtividadeConfigRepository;
import br.com.asa.repository.PontuacaoUnidadeMesRepository;
import br.com.asa.repository.UnitRepository;
import br.com.asa.web.PontuacaoAtividadeConfigDto;
import br.com.asa.web.PontuacaoUnidadeDto;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PontuacaoUnidadeService {
    private static final int META_SELO_EXCELENCIA = 100;

    private final AtividadeAsaRepository atividadeAsaRepository;
    private final UnitRepository unitRepository;
    private final PontuacaoAtividadeConfigRepository pontuacaoAtividadeConfigRepository;
    private final PontuacaoUnidadeMesRepository pontuacaoUnidadeMesRepository;

    public PontuacaoUnidadeService(AtividadeAsaRepository atividadeAsaRepository,
                                   UnitRepository unitRepository,
                                   PontuacaoAtividadeConfigRepository pontuacaoAtividadeConfigRepository,
                                   PontuacaoUnidadeMesRepository pontuacaoUnidadeMesRepository) {
        this.atividadeAsaRepository = atividadeAsaRepository;
        this.unitRepository = unitRepository;
        this.pontuacaoAtividadeConfigRepository = pontuacaoAtividadeConfigRepository;
        this.pontuacaoUnidadeMesRepository = pontuacaoUnidadeMesRepository;
    }

    @Transactional
    public List<PontuacaoUnidadeDto> calcularPontuacaoPorPeriodo(String periodoRelatorio) {
        String periodoNormalizado = normalizarSeparadorPeriodo(periodoRelatorio);
        validarPeriodo(periodoNormalizado);
        String periodoPontuacao = normalizarPeriodoParaPontuacao(periodoNormalizado);
        String periodoAtividades = normalizarPeriodoParaAtividades(periodoNormalizado);
        Map<String, PontuacaoAtividadeConfig> configuracoes = carregarConfiguracoes();
        Map<String, Integer> pontosPorUnidade = new HashMap<>();
        Map<String, String> unidadesNormalizadas = unitRepository.findAll().stream()
            .filter(unidade -> unidade.getNomeUnidade() != null && !unidade.getNomeUnidade().isBlank())
            .collect(Collectors.toMap(
                unidade -> normalizarNomeUnidade(unidade.getNomeUnidade()),
                Unit::getNomeUnidade,
                (a, b) -> a
            ));

        List<AtividadeAsa> atividades = atividadeAsaRepository.findByPeriodoRelatorio(periodoAtividades);
        for (AtividadeAsa atividade : atividades) {
            String nomeOriginal = atividade.getAsaIdentificacao();
            String nomeNormalizado = normalizarNomeUnidade(nomeOriginal);
            String nomeUnidade = unidadesNormalizadas.getOrDefault(nomeNormalizado, nomeOriginal);
            int pontos = calcularPontosAtividade(atividade, configuracoes);
            pontosPorUnidade.merge(nomeUnidade, pontos, Integer::sum);
        }

        List<Unit> unidades = unitRepository.findAll();
        for (Unit unidade : unidades) {
            pontosPorUnidade.putIfAbsent(unidade.getNomeUnidade(), 0);
        }

        List<PontuacaoUnidadeDto> resultado = new ArrayList<>();
        for (Map.Entry<String, Integer> entrada : pontosPorUnidade.entrySet()) {
            PontuacaoUnidadeMes registro = pontuacaoUnidadeMesRepository
                .findByNomeUnidadeAndPeriodoRelatorio(entrada.getKey(), periodoPontuacao)
                .orElseGet(PontuacaoUnidadeMes::new);
            boolean eraSelo = registro.getId() != null && registro.isSeloExcelencia();

            registro.setNomeUnidade(entrada.getKey());
            registro.setPeriodoRelatorio(periodoPontuacao);
            registro.setPontosTotal(entrada.getValue());
            registro.setSeloExcelencia(entrada.getValue() >= META_SELO_EXCELENCIA);

            int ano = obterAno(periodoPontuacao);
            long selosAno = pontuacaoUnidadeMesRepository.countByNomeUnidadeAndPeriodoRelatorioEndingWithAndSeloExcelenciaTrue(
                entrada.getKey(), String.valueOf(ano)
            );
            if (registro.isSeloExcelencia() && !eraSelo) {
                selosAno = Math.max(selosAno, 0) + 1;
            }
            if (!registro.isSeloExcelencia() && eraSelo) {
                selosAno = Math.max(selosAno - 1, 0);
            }
            registro.setTrofeuMelhorUnidadeAno(selosAno >= 12);
            registro.setDataCalculo(LocalDateTime.now());

            PontuacaoUnidadeMes salvo = pontuacaoUnidadeMesRepository.save(registro);
            resultado.add(paraDto(salvo));
        }

        return resultado.stream()
            .sorted(Comparator.comparing(PontuacaoUnidadeDto::getPontosTotal).reversed())
            .collect(Collectors.toList());
    }

    @Transactional
    public List<PontuacaoAtividadeConfigDto> listarConfiguracoes() {
        Map<String, PontuacaoAtividadeConfig> configuracoes = carregarConfiguracoes();
        return configuracoes.values().stream()
            .map(this::paraDto)
            .sorted(Comparator.comparing(PontuacaoAtividadeConfigDto::getDescricao))
            .collect(Collectors.toList());
    }

    @Transactional
    public List<PontuacaoAtividadeConfigDto> atualizarConfiguracoes(List<PontuacaoAtividadeConfigDto> configuracoesDto) {
        Map<String, PontuacaoAtividadeConfig> existentes = carregarConfiguracoes();
        for (PontuacaoAtividadeConfigDto dto : configuracoesDto) {
            if (dto.getChave() == null || dto.getChave().isBlank()) {
                continue;
            }
            PontuacaoAtividadeConfig config = existentes.get(dto.getChave());
            if (config == null) {
                config = new PontuacaoAtividadeConfig();
                config.setChave(dto.getChave());
                config.setDescricao(dto.getDescricao() == null ? dto.getChave() : dto.getDescricao());
            }
            config.setPontos(dto.getPontos() == null ? 0 : dto.getPontos());
            pontuacaoAtividadeConfigRepository.save(config);
        }
        return listarConfiguracoes();
    }

    private Map<String, PontuacaoAtividadeConfig> carregarConfiguracoes() {
        List<PontuacaoAtividadeConfig> configs = pontuacaoAtividadeConfigRepository.findAll();
        Map<String, PontuacaoAtividadeConfig> mapa = configs.stream()
            .collect(Collectors.toMap(PontuacaoAtividadeConfig::getChave, Function.identity(), (a, b) -> a));

        for (AtividadeCampo atividadeCampo : AtividadeCampo.values()) {
            if (!mapa.containsKey(atividadeCampo.chave)) {
                PontuacaoAtividadeConfig novo = new PontuacaoAtividadeConfig();
                novo.setChave(atividadeCampo.chave);
                novo.setDescricao(atividadeCampo.descricao);
                novo.setPontos(1);
                pontuacaoAtividadeConfigRepository.save(novo);
                mapa.put(novo.getChave(), novo);
            }
        }
        return mapa;
    }

    private int calcularPontosAtividade(AtividadeAsa atividade, Map<String, PontuacaoAtividadeConfig> configuracoes) {
        int total = 0;
        for (AtividadeCampo campo : AtividadeCampo.values()) {
            PontuacaoAtividadeConfig config = configuracoes.get(campo.chave);
            int pontosBase = config == null || config.getPontos() == null ? 0 : config.getPontos();
            int valor = campo.extrator.apply(atividade);
            total += valor * pontosBase;
        }
        return total;
    }

    private void validarPeriodo(String periodoRelatorio) {
        if (periodoRelatorio == null || periodoRelatorio.isBlank()) {
            throw new IllegalArgumentException("Periodo deve estar no formato MM-AAAA, MM/AAAA, AAAA-MM ou AAAA/MM.");
        }
        if (!periodoRelatorio.matches("\\d{2}-\\d{4}") && !periodoRelatorio.matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("Periodo deve estar no formato MM-AAAA, MM/AAAA, AAAA-MM ou AAAA/MM.");
        }
        String mes = periodoRelatorio.matches("\\d{2}-\\d{4}")
            ? periodoRelatorio.substring(0, 2)
            : periodoRelatorio.substring(5, 7);
        int valorMes = Integer.parseInt(mes);
        if (valorMes < 1 || valorMes > 12) {
            throw new IllegalArgumentException("Periodo deve estar no formato MM-AAAA, MM/AAAA, AAAA-MM ou AAAA/MM.");
        }
    }

    private int obterAno(String periodoRelatorio) {
        validarPeriodo(periodoRelatorio);
        String periodoPontuacao = normalizarPeriodoParaPontuacao(periodoRelatorio);
        return Integer.parseInt(periodoPontuacao.substring(3));
    }

    private String normalizarPeriodoParaPontuacao(String periodoRelatorio) {
        if (periodoRelatorio.matches("\\d{2}-\\d{4}")) {
            return periodoRelatorio;
        }
        return periodoRelatorio.substring(5, 7) + "-" + periodoRelatorio.substring(0, 4);
    }

    private String normalizarPeriodoParaAtividades(String periodoRelatorio) {
        if (periodoRelatorio.matches("\\d{4}-\\d{2}")) {
            return periodoRelatorio;
        }
        return periodoRelatorio.substring(3) + "-" + periodoRelatorio.substring(0, 2);
    }

    private String normalizarSeparadorPeriodo(String periodoRelatorio) {
        if (periodoRelatorio == null) {
            return null;
        }
        return periodoRelatorio.trim().replace('/', '-');
    }

    private String normalizarNomeUnidade(String nomeUnidade) {
        if (nomeUnidade == null) {
            return "";
        }
        String normalizado = nomeUnidade.trim()
            .replace("â€“", "-")
            .replace("–", "-")
            .replace("—", "-");
        String semPrefixo = normalizado.replaceFirst("(?i)^ASA\\s+", "");
        String semCidade = semPrefixo.split("\\s*-\\s*")[0];
        String semAcento = Normalizer.normalize(semCidade, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "");
        return semAcento.toLowerCase(Locale.ROOT).trim();
    }

    private PontuacaoUnidadeDto paraDto(PontuacaoUnidadeMes registro) {
        PontuacaoUnidadeDto dto = new PontuacaoUnidadeDto();
        dto.setNomeUnidade(registro.getNomeUnidade());
        dto.setPeriodoRelatorio(registro.getPeriodoRelatorio());
        dto.setPontosTotal(registro.getPontosTotal());
        dto.setSeloExcelencia(registro.isSeloExcelencia());
        dto.setTrofeuMelhorUnidadeAno(registro.isTrofeuMelhorUnidadeAno());
        return dto;
    }

    private PontuacaoAtividadeConfigDto paraDto(PontuacaoAtividadeConfig config) {
        PontuacaoAtividadeConfigDto dto = new PontuacaoAtividadeConfigDto();
        dto.setChave(config.getChave());
        dto.setDescricao(config.getDescricao());
        dto.setPontos(config.getPontos());
        return dto;
    }

    private enum AtividadeCampo {
        POSSUI_INSTAGRAM("possui_instagram", "Possui instagram", a -> a.isPossuiInstagram() ? 1 : 0),
        POSSUI_EMAIL_PROPRIO("possui_email_proprio", "Possui e-mail proprio", a -> a.isPossuiEmailProprio() ? 1 : 0),
        POSSUI_UNIFORME_OFICIAL("possui_uniforme_oficial", "Possui uniforme oficial", a -> a.isPossuiUniformeOficial() ? 1 : 0),
        POSSUI_NOVO_MANUAL_ASA("possui_novo_manual_asa", "Possui novo manual ASA", a -> a.isPossuiNovoManualAsa() ? 1 : 0),
        POSSUI_LIVRO_BENEFICENCIA_SOCIAL("possui_livro_beneficencia_social", "Possui livro beneficencia social", a -> a.isPossuiLivroBeneficenciaSocial() ? 1 : 0),
        ACAO_VISITA_BENEFICIARIOS("acao_visita_beneficiarios", "Acao visita beneficiarios", a -> a.isAcaoVisitaBeneficiarios() ? 1 : 0),
        ACAO_RECOLTA_DONATIVOS("acao_recolta_donativos", "Acao recolta donativos", a -> a.isAcaoRecoltaDonativos() ? 1 : 0),
        ACAO_DOACAO_SANGUE("acao_doacao_sangue", "Acao doacao sangue", a -> a.isAcaoDoacaoSangue() ? 1 : 0),
        ACAO_CAMPANHA_AGASALHO("acao_campanha_agasalho", "Acao campanha agasalho", a -> a.isAcaoCampanhaAgasalho() ? 1 : 0),
        ACAO_FEIRA_SOLIDARIA("acao_feira_solidaria", "Acao feira solidaria", a -> a.isAcaoFeiraSolidaria() ? 1 : 0),
        ACAO_PALESTRAS_EDUCATIVAS("acao_palestras_educativas", "Acao palestras educativas", a -> a.isAcaoPalestrasEducativas() ? 1 : 0),
        ACAO_CURSOS_GERACAO_RENDA("acao_cursos_geracao_renda", "Acao cursos geracao renda", a -> a.isAcaoCursosGeracaoRenda() ? 1 : 0),
        ACAO_MUTIRAO_NATAL("acao_mutirao_natal", "Acao mutirao natal", a -> a.isAcaoMutiraoNatal() ? 1 : 0),
        FAMILIAS_ATENDIDAS("familias_atendidas", "Familias atendidas", a -> a.getFamiliasAtendidas() != null && a.getFamiliasAtendidas() > 0 ? 1 : 0),
        CESTAS_BASICAS_19KG("cestas_basicas_19kg", "Cestas basicas 19kg", a -> a.getCestasBasicas19kg() != null && a.getCestasBasicas19kg() > 0 ? 1 : 0),
        PECAS_ROUPAS_CALCADOS("pecas_roupas_calcados", "Pecas roupas e calcados", a -> a.getPecasRoupasCalcados() != null && a.getPecasRoupasCalcados() > 0 ? 1 : 0),
        VOLUNTARIOS_ATIVOS("voluntarios_ativos", "Voluntarios ativos", a -> a.getVoluntariosAtivos() != null && a.getVoluntariosAtivos() > 0 ? 1 : 0),
        ESTUDOS_BIBLICOS("estudos_biblicos", "Estudos biblicos", a -> a.getEstudosBiblicos() != null && a.getEstudosBiblicos() > 0 ? 1 : 0),
        BATISMOS_MES("batismos_mes", "Batismos no mes", a -> a.getBatismosMes() != null && a.getBatismosMes() > 0 ? 1 : 0),
        REUNIAO_AVALIACAO_PLANEJAMENTO("reuniao_avaliacao_planejamento", "Reuniao de avaliacao e planejamento", a -> a.isReuniaoAvaliacaoPlanejamento() ? 1 : 0),
        ASSISTENCIA_ALIMENTOS("assistencia_alimentos", "Assistencia alimentos", a -> a.isAssistenciaAlimentos() ? 1 : 0),
        ASSISTENCIA_ROUPAS("assistencia_roupas", "Assistencia roupas", a -> a.isAssistenciaRoupas() ? 1 : 0),
        ASSISTENCIA_MOVEIS("assistencia_moveis", "Assistencia moveis", a -> a.isAssistenciaMoveis() ? 1 : 0),
        ASSISTENCIA_LIMPEZA_HIGIENE("assistencia_limpeza_higiene", "Assistencia limpeza e higiene", a -> a.isAssistenciaLimpezaHigiene() ? 1 : 0),
        ASSISTENCIA_CONSTRUCAO("assistencia_construcao", "Assistencia construcao", a -> a.isAssistenciaConstrucao() ? 1 : 0),
        ASSISTENCIA_MATERIAL_ESCOLAR("assistencia_material_escolar", "Assistencia material escolar", a -> a.isAssistenciaMaterialEscolar() ? 1 : 0),
        ASSISTENCIA_MEDICAMENTOS("assistencia_medicamentos", "Assistencia medicamentos", a -> a.isAssistenciaMedicamentos() ? 1 : 0),
        ASSISTENCIA_ATENDIMENTO_SAUDE("assistencia_atendimento_saude", "Assistencia atendimento saude", a -> a.isAssistenciaAtendimentoSaude() ? 1 : 0),
        ASSISTENCIA_MUTIROES("assistencia_mutiroes", "Assistencia mutiroes", a -> a.isAssistenciaMutiroes() ? 1 : 0),
        DESENVOLVIMENTO_CAPACITACAO_PROFISSIONAL("desenvolvimento_capacitacao_profissional", "Desenvolvimento capacitacao profissional", a -> a.isDesenvolvimentoCapacitacaoProfissional() ? 1 : 0),
        DESENVOLVIMENTO_CURRICULO_ORIENTACAO("desenvolvimento_curriculo_orientacao", "Desenvolvimento curriculo e orientacao", a -> a.isDesenvolvimentoCurriculoOrientacao() ? 1 : 0),
        DESENVOLVIMENTO_CURSO_IDIOMA("desenvolvimento_curso_idioma", "Desenvolvimento curso idioma", a -> a.isDesenvolvimentoCursoIdioma() ? 1 : 0),
        DESENVOLVIMENTO_CURSO_INFORMATICA("desenvolvimento_curso_informatica", "Desenvolvimento curso informatica", a -> a.isDesenvolvimentoCursoInformatica() ? 1 : 0),
        DESENVOLVIMENTO_CURSOS_GERACAO_RENDA("desenvolvimento_cursos_geracao_renda", "Desenvolvimento cursos geracao renda", a -> a.isDesenvolvimentoCursosGeracaoRenda() ? 1 : 0),
        DESENVOLVIMENTO_ADMINISTRACAO_FINANCEIRA_LAR("desenvolvimento_administracao_financeira_lar", "Desenvolvimento administracao financeira do lar", a -> a.isDesenvolvimentoAdministracaoFinanceiraLar() ? 1 : 0),
        DESENVOLVIMENTO_DEIXAR_FUMAR_BEBER("desenvolvimento_deixar_fumar_beber", "Desenvolvimento deixar fumar ou beber", a -> a.isDesenvolvimentoDeixarFumarBeber() ? 1 : 0),
        DESENVOLVIMENTO_PREVENCAO_DROGAS("desenvolvimento_prevencao_drogas", "Desenvolvimento prevencao drogas", a -> a.isDesenvolvimentoPrevencaoDrogas() ? 1 : 0),
        DESENVOLVIMENTO_HABITOS_SAUDAVEIS("desenvolvimento_habitos_saudaveis", "Desenvolvimento habitos saudaveis", a -> a.isDesenvolvimentoHabitosSaudaveis() ? 1 : 0),
        DESENVOLVIMENTO_EDUCACAO_SEXUAL("desenvolvimento_educacao_sexual", "Desenvolvimento educacao sexual", a -> a.isDesenvolvimentoEducacaoSexual() ? 1 : 0),
        DESENVOLVIMENTO_EDUCACAO_FILHOS("desenvolvimento_educacao_filhos", "Desenvolvimento educacao dos filhos", a -> a.isDesenvolvimentoEducacaoFilhos() ? 1 : 0),
        DESENVOLVIMENTO_APROVEITAMENTO_ALIMENTOS("desenvolvimento_aproveitamento_alimentos", "Desenvolvimento aproveitamento alimentos", a -> a.isDesenvolvimentoAproveitamentoAlimentos() ? 1 : 0),
        DESENVOLVIMENTO_ALFABETIZACAO_ADULTOS("desenvolvimento_alfabetizacao_adultos", "Desenvolvimento alfabetizacao adultos", a -> a.isDesenvolvimentoAlfabetizacaoAdultos() ? 1 : 0),
        AVALIACAO_RELATORIO("avaliacao_relatorio", "Avaliacao relatorio", a -> a.getAvaliacaoRelatorio() != null && a.getAvaliacaoRelatorio() > 0 ? 1 : 0);

        private final String chave;
        private final String descricao;
        private final Function<AtividadeAsa, Integer> extrator;

        AtividadeCampo(String chave, String descricao, Function<AtividadeAsa, Integer> extrator) {
            this.chave = chave;
            this.descricao = descricao;
            this.extrator = extrator;
        }
    }
}
