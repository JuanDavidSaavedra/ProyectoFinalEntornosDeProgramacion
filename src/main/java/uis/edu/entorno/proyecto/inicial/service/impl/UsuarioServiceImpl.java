package uis.edu.entorno.proyecto.inicial.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uis.edu.entorno.proyecto.inicial.model.Usuario;
import uis.edu.entorno.proyecto.inicial.repository.UsuarioRepository;
import uis.edu.entorno.proyecto.inicial.service.IUsuarioService;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Override
    public Optional<Usuario> findById(Integer id) {
        return usuarioRepository.findById(id);
    }

    @Override
    public Optional<Usuario> findByCedula(String cedula) {
        return usuarioRepository.findByCedula(cedula);
    }

    @Override
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Override
    public Optional<Usuario> findByUsuario(String usuario) {
        return usuarioRepository.findByUsuario(usuario);
    }

    @Override
    public Usuario create(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    public Usuario update(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    public void delete(Integer id) {
        usuarioRepository.deleteById(id);
    }

    @Override
    public boolean existsByCedula(String cedula) {
        return usuarioRepository.existsByCedula(cedula);
    }

    @Override
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsuario(String usuario) {
        return usuarioRepository.existsByUsuario(usuario);
    }
}