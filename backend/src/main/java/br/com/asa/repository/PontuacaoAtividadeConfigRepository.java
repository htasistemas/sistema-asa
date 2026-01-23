package br.com.asa.repository;

import br.com.asa.model.PontuacaoAtividadeConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PontuacaoAtividadeConfigRepository extends JpaRepository<PontuacaoAtividadeConfig, Long> {
    Optional<PontuacaoAtividadeConfig> findByChave(String chave);
}
