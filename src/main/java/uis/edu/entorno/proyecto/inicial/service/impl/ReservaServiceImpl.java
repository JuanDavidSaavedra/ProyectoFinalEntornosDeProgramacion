package uis.edu.entorno.proyecto.inicial.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uis.edu.entorno.proyecto.inicial.model.Reserva;
import uis.edu.entorno.proyecto.inicial.model.Cancha;
import uis.edu.entorno.proyecto.inicial.model.Usuario;
import uis.edu.entorno.proyecto.inicial.model.dto.ReservaRequest;
import uis.edu.entorno.proyecto.inicial.repository.ReservaRepository;
import uis.edu.entorno.proyecto.inicial.repository.CanchaRepository;
import uis.edu.entorno.proyecto.inicial.repository.UsuarioRepository;
import uis.edu.entorno.proyecto.inicial.service.IReservaService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class ReservaServiceImpl implements IReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CanchaRepository canchaRepository;

    @Override
    public List<Reserva> findAll() {
        List<Reserva> reservas = reservaRepository.findAllByOrderByIdAsc();
        boolean seActualizoAlguna = actualizarEstadosAutomaticamente();

        if (seActualizoAlguna) {
            reservas = reservaRepository.findAllByOrderByIdAsc();
        }

        return reservas;
    }

    @Override
    public boolean actualizarEstadosAutomaticamente() {
        List<Reserva> reservas = reservaRepository.findAll();
        boolean seActualizo = false;
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();

        for (Reserva reserva : reservas) {
            // Solo procesar reservas que no estén canceladas
            if (!reserva.getEstado().equals("CANCELADA")) {
                String nuevoEstado = determinarEstadoReserva(reserva.getFecha(), reserva.getHoraFin(), hoy, ahora);
                if (!reserva.getEstado().equals(nuevoEstado)) {
                    reserva.setEstado(nuevoEstado);
                    reservaRepository.save(reserva);
                    seActualizo = true;
                }
            }
        }
        return seActualizo;
    }

    // Sobrecarga del método para usar fechas específicas (útil para testing)
    private String determinarEstadoReserva(LocalDate fecha, LocalTime horaFin, LocalDate hoy, LocalTime ahora) {
        if (fecha.isBefore(hoy) || (fecha.isEqual(hoy) && horaFin.isBefore(ahora))) {
            return "FINALIZADA";
        } else {
            return "ACTIVA";
        }
    }

    @Override
    public Optional<Reserva> findById(Integer id) {
        return reservaRepository.findById(id);
    }

    @Override
    public List<Reserva> findByUsuarioId(Integer usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public List<Reserva> findByCanchaId(Integer canchaId) {
        return reservaRepository.findByCanchaId(canchaId);
    }

    @Override
    public Reserva create(ReservaRequest reservaRequest) {
        try {
            // Validar que el usuario existe
            Usuario usuario = usuarioRepository.findById(reservaRequest.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("❌ Usuario no encontrado. Verifique el ID del usuario."));

            // Validar que la cancha existe
            Cancha cancha = canchaRepository.findById(reservaRequest.getCanchaId())
                    .orElseThrow(() -> new RuntimeException("❌ Cancha no encontrada. Verifique el ID de la cancha."));

            LocalDate hoy = LocalDate.now();
            LocalTime ahora = LocalTime.now();

            // Validar que la fecha no sea en el pasado
            if (reservaRequest.getFecha().isBefore(hoy)) {
                throw new RuntimeException("❌ No se pueden crear reservas en fechas pasadas.");
            }

            // Validar que si es para hoy, la hora de inicio sea al menos 30 minutos en el futuro
            if (reservaRequest.getFecha().isEqual(hoy)) {
                LocalTime horaMinima = ahora.plusMinutes(30); // Mínimo 30 minutos de anticipación

                if (reservaRequest.getHoraInicio().isBefore(horaMinima)) {
                    throw new RuntimeException("⏰ Para reservas del día actual, la hora de inicio debe ser al menos 30 minutos después de la hora actual (" +
                            horaMinima + "). Por favor, seleccione una hora futura o cambie la fecha.");
                }
            }

            // Validar horario de atención de la cancha
            if (!estaEnHorarioAtencion(cancha, reservaRequest.getHoraInicio(), reservaRequest.getHoraFin())) {
                throw new RuntimeException("🚫 La reserva está fuera del horario de atención de la cancha. " +
                        "Horario de atención: " + formatTimeForDisplay(cancha.getHoraApertura()) + " - " + formatTimeForDisplay(cancha.getHoraCierre()));
            }

            // Validar que la hora de inicio sea antes de la hora de fin
            if (!reservaRequest.getHoraInicio().isBefore(reservaRequest.getHoraFin())) {
                throw new RuntimeException("❌ La hora de inicio debe ser anterior a la hora de fin.");
            }

            // Validar duración máxima de 2 horas por reserva
            Duration duracion = Duration.between(reservaRequest.getHoraInicio(), reservaRequest.getHoraFin());
            if (duracion.toMinutes() > 120) {
                throw new RuntimeException("⏰ La reserva no puede exceder las 2 horas de duración.");
            }

            // Validar duración mínima de 30 minutos
            if (duracion.toMinutes() < 30) {
                throw new RuntimeException("⏰ La reserva debe tener una duración mínima de 30 minutos.");
            }

            // Validar límite de 2 horas por usuario por cancha por día
            validarLimiteHorasUsuario(usuario.getId(), cancha.getId(), reservaRequest.getFecha(),
                    reservaRequest.getHoraInicio(), reservaRequest.getHoraFin(), null);

            // Validar disponibilidad
            if (!isCanchaDisponible(reservaRequest.getCanchaId(),
                    reservaRequest.getFecha().toString(),
                    reservaRequest.getHoraInicio().toString(),
                    reservaRequest.getHoraFin().toString(), null)) {
                throw new RuntimeException("🔒 La cancha no está disponible en el horario seleccionado. " +
                        "Ya existe una reserva activa en ese horario.");
            }

            Reserva reserva = new Reserva();
            reserva.setUsuario(usuario);
            reserva.setCancha(cancha);
            reserva.setFecha(reservaRequest.getFecha());
            reserva.setHoraInicio(reservaRequest.getHoraInicio());
            reserva.setHoraFin(reservaRequest.getHoraFin());

            // Determinar estado inicial basado en fecha y hora
            reserva.setEstado(determinarEstadoReserva(reservaRequest.getFecha(), reservaRequest.getHoraFin()));

            return reservaRepository.save(reserva);
        } catch (RuntimeException e) {
            // Relanzar la excepción con el mensaje específico
            throw new RuntimeException(e.getMessage());
        }
    }

    // Método auxiliar para formatear horas para mostrar en mensajes
    private String formatTimeForDisplay(LocalTime time) {
        int hour = time.getHour();
        int minute = time.getMinute();
        String amPm = hour >= 12 ? "p.m." : "a.m.";
        int displayHour = hour % 12;
        if (displayHour == 0) displayHour = 12;

        return String.format("%d:%02d %s", displayHour, minute, amPm);
    }

    @Override
    public Reserva updateEstado(Integer id, String estado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setEstado(estado);
        return reservaRepository.save(reserva);
    }

    @Override
    public void delete(Integer id) {
        reservaRepository.deleteById(id);
    }

    @Override
    public boolean isCanchaDisponible(Integer canchaId, String fecha, String horaInicio, String horaFin) {
        return isCanchaDisponible(canchaId, fecha, horaInicio, horaFin, null);
    }

    private boolean isCanchaDisponible(Integer canchaId, String fecha, String horaInicio, String horaFin, Integer reservaId) {
        LocalDate fechaLocal = LocalDate.parse(fecha);
        LocalTime horaInicioLocal = LocalTime.parse(horaInicio);
        LocalTime horaFinLocal = LocalTime.parse(horaFin);

        List<Reserva> reservasSolapadas;
        if (reservaId != null) {
            reservasSolapadas = reservaRepository
                    .findByCanchaIdAndFechaAndHoraInicioLessThanAndHoraFinGreaterThanAndEstadoNotAndIdNot(
                            canchaId, fechaLocal, horaFinLocal, horaInicioLocal, "CANCELADA", reservaId);
        } else {
            reservasSolapadas = reservaRepository
                    .findByCanchaIdAndFechaAndHoraInicioLessThanAndHoraFinGreaterThanAndEstadoNot(
                            canchaId, fechaLocal, horaFinLocal, horaInicioLocal, "CANCELADA");
        }

        Cancha cancha = canchaRepository.findById(canchaId)
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

        return reservasSolapadas.size() < cancha.getCapacidad();
    }

    @Override
    public Reserva update(Integer id, ReservaRequest reservaRequest) {
        Reserva reservaExistente = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Validar que el usuario existe
        Usuario usuario = usuarioRepository.findById(reservaRequest.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("❌ Usuario no encontrado. Verifique el ID del usuario."));

        // Validar que la cancha existe
        Cancha cancha = canchaRepository.findById(reservaRequest.getCanchaId())
                .orElseThrow(() -> new RuntimeException("❌ Cancha no encontrada. Verifique el ID de la cancha."));

        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();

        // Validar que la fecha no sea en el pasado
        if (reservaRequest.getFecha().isBefore(hoy)) {
            throw new RuntimeException("❌ No se pueden actualizar reservas a fechas pasadas.");
        }

        // Validar que si es para hoy, la hora de inicio sea al menos 30 minutos en el futuro
        if (reservaRequest.getFecha().isEqual(hoy)) {
            LocalTime horaMinima = ahora.plusMinutes(30); // Mínimo 30 minutos de anticipación

            if (reservaRequest.getHoraInicio().isBefore(horaMinima)) {
                throw new RuntimeException("⏰ Para reservas del día actual, la hora de inicio debe ser al menos 30 minutos después de la hora actual (" +
                        horaMinima + "). Por favor, seleccione una hora futura o cambie la fecha.");
            }
        }

        reservaExistente.setUsuario(usuario);
        reservaExistente.setCancha(cancha);
        reservaExistente.setFecha(reservaRequest.getFecha());
        reservaExistente.setHoraInicio(reservaRequest.getHoraInicio());
        reservaExistente.setHoraFin(reservaRequest.getHoraFin());

        // Actualizar estado basado en nueva fecha y hora
        reservaExistente.setEstado(determinarEstadoReserva(reservaRequest.getFecha(), reservaRequest.getHoraFin()));

        return reservaRepository.save(reservaExistente);
    }

    // MÉTODOS PRIVADOS AUXILIARES - SIN DUPLICACIONES

    private String determinarEstadoReserva(LocalDate fecha, LocalTime horaFin) {
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();

        if (fecha.isBefore(hoy) || (fecha.isEqual(hoy) && horaFin.isBefore(ahora))) {
            return "FINALIZADA";
        } else {
            return "ACTIVA";
        }
    }

    private boolean estaEnHorarioAtencion(Cancha cancha, LocalTime horaInicio, LocalTime horaFin) {
        return !horaInicio.isBefore(cancha.getHoraApertura()) &&
                !horaFin.isAfter(cancha.getHoraCierre()) &&
                horaInicio.isBefore(horaFin);
    }

    private void validarLimiteHorasUsuario(Integer usuarioId, Integer canchaId, LocalDate fecha,
                                           LocalTime horaInicio, LocalTime horaFin, Integer reservaIdExcluir) {
        // Obtener todas las reservas del usuario para esta cancha en esta fecha (excluyendo CANCELADAS)
        List<Reserva> reservasUsuario = reservaRepository.findByUsuarioIdAndCanchaIdAndFechaAndEstadoNot(
                usuarioId, canchaId, fecha, "CANCELADA");

        // Calcular el total de horas reservadas
        long totalMinutos = 0;

        for (Reserva reserva : reservasUsuario) {
            // Excluir la reserva actual si estamos en modo edición
            if (reservaIdExcluir != null && reserva.getId().equals(reservaIdExcluir)) {
                continue;
            }

            Duration duracion = Duration.between(reserva.getHoraInicio(), reserva.getHoraFin());
            totalMinutos += duracion.toMinutes();
        }

        // Agregar la duración de la nueva reserva
        Duration duracionNueva = Duration.between(horaInicio, horaFin);
        totalMinutos += duracionNueva.toMinutes();

        // Convertir a horas (120 minutos = 2 horas)
        if (totalMinutos > 120) {
            long horasActuales = totalMinutos / 60;
            long minutosActuales = totalMinutos % 60;
            throw new RuntimeException("⏰ Límite excedido: Máximo 2 horas de reserva por usuario en la misma cancha por día. " +
                    "Tiempo total reservado: " + horasActuales + "h " + minutosActuales + "m");
        }
    }
}