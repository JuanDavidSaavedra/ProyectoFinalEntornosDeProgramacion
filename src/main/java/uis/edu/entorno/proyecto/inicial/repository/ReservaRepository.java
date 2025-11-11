package uis.edu.entorno.proyecto.inicial.repository;

import uis.edu.entorno.proyecto.inicial.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    List<Reserva> findByUsuarioId(Integer usuarioId);
    List<Reserva> findByCanchaId(Integer canchaId);

    // Nuevo método para validar límite de horas
    List<Reserva> findByUsuarioIdAndCanchaIdAndFechaAndEstadoNot(
            Integer usuarioId, Integer canchaId, LocalDate fecha, String estado);

    List<Reserva> findByEstado(String estado);

    // Método para verificar disponibilidad
    @Query("SELECT r FROM Reserva r WHERE r.cancha.id = ?1 AND r.fecha = ?2 AND r.horaInicio < ?3 AND r.horaFin > ?4 AND r.estado != ?5")
    List<Reserva> findByCanchaIdAndFechaAndHoraInicioLessThanAndHoraFinGreaterThanAndEstadoNot(
            Integer canchaId, LocalDate fecha, LocalTime horaFin, LocalTime horaInicio, String estado);

    @Query("SELECT r FROM Reserva r WHERE r.cancha.id = ?1 AND r.fecha = ?2 AND r.horaInicio < ?3 AND r.horaFin > ?4 AND r.estado != ?5 AND r.id != ?6")
    List<Reserva> findByCanchaIdAndFechaAndHoraInicioLessThanAndHoraFinGreaterThanAndEstadoNotAndIdNot(
            Integer canchaId, LocalDate fecha, LocalTime horaFin, LocalTime horaInicio, String estado, Integer id);

    List<Reserva> findAllByOrderByIdAsc();
}