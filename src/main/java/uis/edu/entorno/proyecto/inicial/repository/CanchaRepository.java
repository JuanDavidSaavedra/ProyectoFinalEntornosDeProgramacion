package uis.edu.entorno.proyecto.inicial.repository;

import uis.edu.entorno.proyecto.inicial.model.Cancha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CanchaRepository extends JpaRepository<Cancha, Integer> {
    List<Cancha> findByDeporte(String deporte);
    List<Cancha> findByEstado(String estado);
    List<Cancha> findByEstadoOrderByNombreAsc(String estado);
}