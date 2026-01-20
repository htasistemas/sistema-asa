package br.com.asa.repository;

import br.com.asa.model.UnitManagement;
import br.com.asa.model.Unit;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitManagementRepository extends JpaRepository<UnitManagement, Long> {
    Optional<UnitManagement> findByUnit(Unit unit);
}