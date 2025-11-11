package uis.edu.entorno.proyecto.inicial.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uis.edu.entorno.proyecto.inicial.model.Usuario;
import uis.edu.entorno.proyecto.inicial.model.dto.LoginRequest;
import uis.edu.entorno.proyecto.inicial.model.dto.ApiResponse;
import uis.edu.entorno.proyecto.inicial.service.IUsuarioService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private IUsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Buscar usuario por nombre de usuario
            Optional<Usuario> usuarioOpt = usuarioService.findByUsuario(loginRequest.getUsuario());

            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();

            // Verificar contraseña
            if (!usuario.getContraseña().equals(loginRequest.getContraseña())) {
                return ResponseEntity.ok(ApiResponse.error("Contraseña incorrecta"));
            }

            // Crear respuesta sin la contraseña por seguridad
            Usuario usuarioResponse = new Usuario();
            usuarioResponse.setId(usuario.getId());
            usuarioResponse.setCedula(usuario.getCedula());
            usuarioResponse.setNombre(usuario.getNombre());
            usuarioResponse.setEmail(usuario.getEmail());
            usuarioResponse.setUsuario(usuario.getUsuario());
            usuarioResponse.setRol(usuario.getRol());
            usuarioResponse.setCreatedAt(usuario.getCreatedAt());

            // Cambio clave: usar ApiResponse en lugar de AuthResponse
            return ResponseEntity.ok(ApiResponse.success("Login exitoso", usuarioResponse));

        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error en el login: " + e.getMessage()));
        }
    }

    private Map<String, Object> mapUsuarioToResponse(Usuario usuario) {
        Map<String, Object> usuarioResponse = new HashMap<>();
        usuarioResponse.put("id", usuario.getId());
        usuarioResponse.put("cedula", usuario.getCedula());
        usuarioResponse.put("nombre", usuario.getNombre());
        usuarioResponse.put("email", usuario.getEmail());
        usuarioResponse.put("usuario", usuario.getUsuario());
        usuarioResponse.put("rol", usuario.getRol());
        usuarioResponse.put("createdAt", usuario.getCreatedAt());
        return usuarioResponse;
    }

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            // Validar campos requeridos
            if (usuario.getCedula() == null || usuario.getCedula().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("La cédula es requerida"));
            }
            if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El nombre es requerido"));
            }
            if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El email es requerido"));
            }
            if (usuario.getUsuario() == null || usuario.getUsuario().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("El nombre de usuario es requerido"));
            }
            if (usuario.getContraseña() == null || usuario.getContraseña().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("La contraseña es requerida"));
            }
            if (usuario.getRol() == null || usuario.getRol().trim().isEmpty()) {
                // Por defecto, si no se asigna un rol, se asigna USER
                usuario.setRol("USER");
            }

            // Verificar duplicados
            if (usuarioService.existsByCedula(usuario.getCedula())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Ya existe un usuario con esta cédula"));
            }
            if (usuarioService.existsByEmail(usuario.getEmail())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Ya existe un usuario con este email"));
            }
            if (usuarioService.existsByUsuario(usuario.getUsuario())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Ya existe un usuario con este nombre de usuario"));
            }

            Usuario nuevoUsuario = usuarioService.create(usuario);

            // Crear respuesta sin la contraseña
            Usuario usuarioResponse = new Usuario();
            usuarioResponse.setId(nuevoUsuario.getId());
            usuarioResponse.setCedula(nuevoUsuario.getCedula());
            usuarioResponse.setNombre(nuevoUsuario.getNombre());
            usuarioResponse.setEmail(nuevoUsuario.getEmail());
            usuarioResponse.setUsuario(nuevoUsuario.getUsuario());
            usuarioResponse.setRol(nuevoUsuario.getRol());
            usuarioResponse.setCreatedAt(nuevoUsuario.getCreatedAt());

            return ResponseEntity.ok(ApiResponse.success("Usuario registrado exitosamente", usuarioResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error al registrar usuario: " + e.getMessage()));
        }
    }

    private String generarToken() {
        // Generar un token simple (en producción usar JWT)
        return "token-" + UUID.randomUUID().toString();
    }
}