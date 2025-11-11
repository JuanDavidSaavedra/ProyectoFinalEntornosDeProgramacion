package uis.edu.entorno.proyecto.inicial.service;

import uis.edu.entorno.proyecto.inicial.model.Reserva;
import uis.edu.entorno.proyecto.inicial.model.dto.ReservaRequest;
import java.util.List;
import java.util.Optional;

public interface IReservaService {
    List<Reserva> findAll();
    Optional<Reserva> findById(Integer id);
    List<Reserva> findByUsuarioId(Integer usuarioId);
    List<Reserva> findByCanchaId(Integer canchaId);
    Reserva create(ReservaRequest reservaRequest);
    Reserva updateEstado(Integer id, String estado);
    void delete(Integer id);
    boolean isCanchaDisponible(Integer canchaId, String fecha, String horaInicio, String horaFin);

    Reserva update(Integer id, ReservaRequest reservaRequest);

    boolean actualizarEstadosAutomaticamente();
}

