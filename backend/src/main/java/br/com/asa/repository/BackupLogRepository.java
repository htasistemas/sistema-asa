package br.com.asa.repository;

import br.com.asa.model.BackupLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackupLogRepository extends JpaRepository<BackupLog, Long> {}

