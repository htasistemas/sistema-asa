package br.com.asa.service;

import br.com.asa.model.AtividadeAsa;
import br.com.asa.repository.AtividadeAsaRepository;
import br.com.asa.web.AtividadeAsaDto;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AtividadeAsaService {
    private final AtividadeAsaRepository atividadeAsaRepository;

    public AtividadeAsaService(AtividadeAsaRepository atividadeAsaRepository) {
        this.atividadeAsaRepository = atividadeAsaRepository;
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
}
