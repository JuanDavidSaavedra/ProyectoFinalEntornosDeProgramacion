package uis.edu.entorno.proyecto.inicial.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uis.edu.entorno.proyecto.inicial.model.Cancha;
import uis.edu.entorno.proyecto.inicial.repository.CanchaRepository;
import uis.edu.entorno.proyecto.inicial.service.ICanchaService;

import java.time.Duration;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CanchaServiceImpl implements ICanchaService {

    @Autowired
    private CanchaRepository canchaRepository;

    @Override
    public List<Cancha> findAll() {
        List<Cancha> canchas = canchaRepository.findAll();

        // Actualizar estado en tiempo real basado en horario de atención
        List<Cancha> canchasActualizadas = canchas.stream()
                .map(this::actualizarEstadoEnTiempoReal)
                .collect(Collectors.toList());

        // Ordenar: primero ACTIVAS, luego INACTIVAS
        canchasActualizadas.sort((c1, c2) -> {
            // Si ambas son ACTIVAS o ambas INACTIVAS, mantener orden original
            if (c1.getEstado().equals(c2.getEstado())) {
                return 0;
            }
            // Si c1 es ACTIVA y c2 es INACTIVA, c1 va primero
            if (c1.getEstado().equals("ACTIVA") && c2.getEstado().equals("INACTIVA")) {
                return -1;
            }
            // Si c1 es INACTIVA y c2 es ACTIVA, c2 va primero
            return 1;
        });

        return canchasActualizadas;
    }

    @Override
    public Optional<Cancha> findById(Integer id) {
        Optional<Cancha> canchaOpt = canchaRepository.findById(id);
        return canchaOpt.map(this::actualizarEstadoEnTiempoReal);
    }

    @Override
    public List<Cancha> findByDeporte(String deporte) {
        List<Cancha> canchas = canchaRepository.findByDeporte(deporte);
        List<Cancha> canchasActualizadas = canchas.stream()
                .map(this::actualizarEstadoEnTiempoReal)
                .collect(Collectors.toList());

        // Aplicar el mismo ordenamiento
        canchasActualizadas.sort((c1, c2) -> {
            if (c1.getEstado().equals(c2.getEstado())) {
                return 0;
            }
            if (c1.getEstado().equals("ACTIVA") && c2.getEstado().equals("INACTIVA")) {
                return -1;
            }
            return 1;
        });

        return canchasActualizadas;
    }

    @Override
    public List<Cancha> findByEstado(String estado) {
        // Para búsquedas por estado, también aplicamos la lógica de tiempo real
        List<Cancha> canchas = canchaRepository.findByEstado(estado);
        return canchas.stream()
                .map(this::actualizarEstadoEnTiempoReal)
                .collect(Collectors.toList());
    }

    @Override
    public Cancha create(Cancha cancha) {
        try {
            // Validar campos requeridos
            if (cancha.getNombre() == null || cancha.getNombre().trim().isEmpty()) {
                throw new RuntimeException("❌ El nombre de la cancha es requerido.");
            }
            if (cancha.getDeporte() == null || cancha.getDeporte().trim().isEmpty()) {
                throw new RuntimeException("❌ El deporte de la cancha es requerido.");
            }
            if (cancha.getUbicacion() == null || cancha.getUbicacion().trim().isEmpty()) {
                throw new RuntimeException("❌ La ubicación de la cancha es requerida.");
            }
            if (cancha.getPrecioHora() == null || cancha.getPrecioHora() <= 0) {
                throw new RuntimeException("❌ El precio por hora debe ser mayor a 0.");
            }
            if (cancha.getCapacidad() == null || cancha.getCapacidad() <= 0) {
                throw new RuntimeException("❌ La capacidad debe ser mayor a 0.");
            }
            if (cancha.getCapacidad() > 50) {
                throw new RuntimeException("❌ La capacidad máxima permitida es 50 personas.");
            }

            // Validar que la hora de cierre sea después de la hora de apertura
            if (cancha.getHoraCierre().isBefore(cancha.getHoraApertura()) ||
                    cancha.getHoraCierre().equals(cancha.getHoraApertura())) {
                throw new RuntimeException("❌ La hora de cierre debe ser después de la hora de apertura.");
            }

            // Validar duración mínima del horario de atención (al menos 1 hora)
            Duration duracionAtencion = Duration.between(cancha.getHoraApertura(), cancha.getHoraCierre());
            if (duracionAtencion.toMinutes() < 60) {
                throw new RuntimeException("❌ El horario de atención debe ser de al menos 1 hora.");
            }

            // Establecer estado inicial basado en horario
            cancha.setEstado(determinarEstadoCancha(cancha));
            return canchaRepository.save(cancha);
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public Cancha update(Cancha cancha) {
        // Validar que la hora de cierre sea después de la hora de apertura
        if (cancha.getHoraCierre().isBefore(cancha.getHoraApertura()) ||
                cancha.getHoraCierre().equals(cancha.getHoraApertura())) {
            throw new RuntimeException("La hora de cierre debe ser después de la hora de apertura");
        }

        // Actualizar estado basado en horario
        cancha.setEstado(determinarEstadoCancha(cancha));
        return canchaRepository.save(cancha);
    }

    @Override
    public void delete(Integer id) {
        canchaRepository.deleteById(id);
    }

    private Cancha actualizarEstadoEnTiempoReal(Cancha cancha) {
        // Si la cancha está marcada como INACTIVA administrativamente, mantener ese estado
        if ("INACTIVA".equals(cancha.getEstado())) {
            return cancha;
        }

        // Determinar estado basado en horario actual
        String estadoReal = determinarEstadoCancha(cancha);

        // Crear una copia para no modificar la entidad persistida
        Cancha canchaConEstadoReal = new Cancha();
        canchaConEstadoReal.setId(cancha.getId());
        canchaConEstadoReal.setNombre(cancha.getNombre());
        canchaConEstadoReal.setDeporte(cancha.getDeporte());
        canchaConEstadoReal.setUbicacion(cancha.getUbicacion());
        canchaConEstadoReal.setPrecioHora(cancha.getPrecioHora());
        canchaConEstadoReal.setCapacidad(cancha.getCapacidad());
        canchaConEstadoReal.setHoraApertura(cancha.getHoraApertura());
        canchaConEstadoReal.setHoraCierre(cancha.getHoraCierre());
        canchaConEstadoReal.setEstado(estadoReal); // Estado en tiempo real
        canchaConEstadoReal.setCreadoEn(cancha.getCreadoEn());

        return canchaConEstadoReal;
    }

    private String determinarEstadoCancha(Cancha cancha) {
        LocalTime ahora = LocalTime.now();

        // Verificar si está en horario de atención
        if (!ahora.isBefore(cancha.getHoraApertura()) && !ahora.isAfter(cancha.getHoraCierre())) {
            return "ACTIVA";
        } else {
            return "INACTIVA";
        }
    }
}