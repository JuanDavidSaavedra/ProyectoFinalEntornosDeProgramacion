package uis.edu.entorno.proyecto.inicial.repository;

import uis.edu.entorno.proyecto.inicial.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCedula(String cedula);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByUsuario(String usuario);
    boolean existsByCedula(String cedula);
    boolean existsByEmail(String email);
    boolean existsByUsuario(String usuario);
}