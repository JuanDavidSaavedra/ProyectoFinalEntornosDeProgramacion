package uis.edu.entorno.proyecto.inicial.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uis.edu.entorno.proyecto.inicial.model.Reserva;
import uis.edu.entorno.proyecto.inicial.model.Cancha;
import uis.edu.entorno.proyecto.inicial.model.dto.ReservaRequest;
import uis.edu.entorno.proyecto.inicial.model.dto.ReservaResponse;
import uis.edu.entorno.proyecto.inicial.model.dto.ApiResponse;
import uis.edu.entorno.proyecto.inicial.service.IReservaService;
import uis.edu.entorno.proyecto.inicial.repository.ReservaRepository;
import uis.edu.entorno.proyecto.inicial.repository.CanchaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private IReservaService reservaService;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private CanchaRepository canchaRepository;

    private ReservaResponse mapToResponse(Reserva r) {
        return new ReservaResponse(
                r.getId(),
                r.getUsuario().getId(),
                r.getUsuario().getNombre(),
                r.getCancha().getId(),
                r.getCancha().getNombre(),
                r.getFecha(),
                r.getHoraInicio(),
                r.getHoraFin(),
                r.getEstado()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllReservas() {
        try {
            List<Reserva> reservas = reservaService.findAll();
            // Aplicar ordenamiento personalizado
            reservas.sort((r1, r2) -> {
                // Primero por estado: ACTIVA > FINALIZADA > CANCELADA
                int estadoCompare = getEstadoPriority(r1.getEstado()) - getEstadoPriority(r2.getEstado());
                if (estadoCompare != 0) return estadoCompare;

                // Luego por fecha (más cercana primero)
                int fechaCompare = r1.getFecha().compareTo(r2.getFecha());
                if (fechaCompare != 0) return fechaCompare;

                // Finalmente por hora de inicio
                return r1.getHoraInicio().compareTo(r2.getHoraInicio());
            });

            List<ReservaResponse> resp = reservas.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Reservas obtenidas exitosamente", resp));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error al obtener reservas: " + e.getMessage()));
        }
    }

    private int getEstadoPriority(String estado) {
        return switch (estado) {
            case "ACTIVA" -> 1;
            case "FINALIZADA" -> 2;
            case "CANCELADA" -> 3;
            default -> 4;
        };
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getReservaById(@PathVariable Integer id) {
        try {
            return reservaService.findById(id)
                    .map(r -> ResponseEntity.ok(ApiResponse.success("Reserva encontrada", mapToResponse(r))))
                    .orElseGet(() -> ResponseEntity.ok(ApiResponse.error("Reserva no encontrada")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error al buscar reserva: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createReserva(@RequestBody ReservaRequest reservaRequest) {
        try {
            Reserva nueva = reservaService.create(reservaRequest);
            return ResponseEntity.ok(ApiResponse.success("Reserva creada exitosamente", mapToResponse(nueva)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponse> updateEstadoReserva(@PathVariable Integer id, @RequestBody String estado) {
        try {
            Reserva actualizada = reservaService.updateEstado(id, estado);
            return ResponseEntity.ok(ApiResponse.success("Estado actualizado", mapToResponse(actualizada)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error al actualizar estado: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateReserva(@PathVariable Integer id, @RequestBody ReservaRequest reservaRequest) {
        try {
            Reserva actualizada = reservaService.update(id, reservaRequest);
            return ResponseEntity.ok(ApiResponse.success("Reserva actualizada exitosamente", mapToResponse(actualizada)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteReserva(@PathVariable Integer id) {
        try {
            if (reservaService.findById(id).isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Reserva no encontrada"));
            }
            reservaService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Reserva eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error al eliminar reserva: " + e.getMessage()));
        }
    }

    @PostMapping("/actualizar-estados")
    public ResponseEntity<ApiResponse> actualizarEstados() {
        try {
            boolean seActualizo = reservaService.actualizarEstadosAutomaticamente();
            String mensaje = seActualizo ?
                    "Estados actualizados automáticamente. Se modificaron algunos estados." :
                    "Estados verificados. No se requirieron cambios.";

            return ResponseEntity.ok(ApiResponse.success(mensaje));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error al actualizar estados: " + e.getMessage()));
        }
    }

    @GetMapping("/disponibilidad")
    public ResponseEntity<ApiResponse> getCuposDisponibles(
            @RequestParam Integer canchaId,
            @RequestParam String fecha,
            @RequestParam String horaInicio,
            @RequestParam String horaFin) {

        try {
            LocalDate fechaLocal = LocalDate.parse(fecha);
            LocalTime horaInicioLocal = LocalTime.parse(horaInicio);
            LocalTime horaFinLocal = LocalTime.parse(horaFin);

            // Obtener cancha
            Cancha cancha = canchaRepository.findById(canchaId)
                    .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

            // Obtener reservas activas en el mismo horario
            List<Reserva> reservasSolapadas = reservaRepository
                    .findByCanchaIdAndFechaAndHoraInicioLessThanAndHoraFinGreaterThanAndEstadoNot(
                            canchaId, fechaLocal, horaFinLocal, horaInicioLocal, "CANCELADA");

            int reservasCount = reservasSolapadas.size();
            int cuposDisponibles = cancha.getCapacidad() - reservasCount;

            Map<String, Object> response = new HashMap<>();
            response.put("cuposDisponibles", cuposDisponibles);
            response.put("capacidadTotal", cancha.getCapacidad());
            response.put("reservasActivas", reservasCount);

            return ResponseEntity.ok(ApiResponse.success("Cupos obtenidos exitosamente", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error al obtener cupos: " + e.getMessage()));
        }
    }

}
