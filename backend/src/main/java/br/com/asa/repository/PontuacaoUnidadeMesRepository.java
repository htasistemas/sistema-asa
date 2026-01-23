package br.com.asa.repository;

import br.com.asa.model.PontuacaoUnidadeMes;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PontuacaoUnidadeMesRepository extends JpaRepository<PontuacaoUnidadeMes, Long> {
    Optional<PontuacaoUnidadeMes> findByNomeUnidadeAndPeriodoRelatorio(String nomeUnidade, String periodoRelatorio);
    List<PontuacaoUnidadeMes> findByPeriodoRelatorio(String periodoRelatorio);
    long countByNomeUnidadeAndPeriodoRelatorioEndingWithAndSeloExcelenciaTrue(String nomeUnidade, String ano);
}
