package com.escuintleco.repository;

import com.escuintleco.model.AperturaCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AperturaCajaRepository extends JpaRepository<AperturaCaja, Long> {
    Optional<AperturaCaja> findFirstByFechaAndEstadoOrderByIdDesc(LocalDate fecha, String estado);
    List<AperturaCaja> findByFecha(LocalDate fecha);
}
