package br.com.asa.repository;

import br.com.asa.model.UnitLife;
import br.com.asa.model.Unit;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitLifeRepository extends JpaRepository<UnitLife, Long> {
    Optional<UnitLife> findByUnit(Unit unit);
}