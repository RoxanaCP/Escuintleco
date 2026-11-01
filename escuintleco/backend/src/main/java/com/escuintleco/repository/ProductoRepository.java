package com.escuintleco.repository;

import com.escuintleco.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();
    Optional<Producto> findByCodigo(String codigo);
    List<Producto> findByCategoriaIdAndActivoTrue(Long categoriaId);
    List<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
}
