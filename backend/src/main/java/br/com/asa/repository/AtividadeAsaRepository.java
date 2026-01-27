package br.com.asa.repository;

import br.com.asa.model.AtividadeAsa;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtividadeAsaRepository extends JpaRepository<AtividadeAsa, Long> {
    List<AtividadeAsa> findByPeriodoRelatorio(String periodoRelatorio);
    Optional<AtividadeAsa> findByAsaIdentificacaoAndPeriodoRelatorio(String asaIdentificacao, String periodoRelatorio);
}
