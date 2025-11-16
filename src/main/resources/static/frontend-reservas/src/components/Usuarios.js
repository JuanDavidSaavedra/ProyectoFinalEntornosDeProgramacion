import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService, SessionHelper } from '../services/api';
import Navbar from './Navbar';
import './Usuarios.css';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // filtros por columna
    const [filters, setFilters] = useState({
        id: '',
        cedula: '',
        nombre: '',
        email: '',
        usuario: '',
        rol: ''
    });

    useEffect(() => {
        if (!SessionHelper.isLoggedIn()) {
            window.location.href = '/login';
            return;
        }
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await ApiService.get('/usuarios');
            if (response.success) {
                setUsuarios(response.data);
            } else {
                alert('Error al cargar usuarios: ' + response.message);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const eliminarUsuario = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este usuario? Se eliminarán también todas las reservas asociadas.')) {
            try {
                const response = await ApiService.delete(`/usuarios/${id}`);
                if (response.success) {
                    alert('Usuario eliminado correctamente');
                    cargarUsuarios();
                } else {
                    alert(response.message);
                }
            } catch (error) {
                alert('Error al eliminar usuario: ' + error.message);
            }
        }
    };

    const isAdmin = SessionHelper.isAdmin();

    const onFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const contains = (source, term) => {
        if (term === undefined || term === null) return true;
        if (!term.toString().trim()) return true;
        if (source === undefined || source === null) return false;
        return source.toString().toLowerCase().includes(term.toString().toLowerCase());
    };

    const filteredUsuarios = usuarios.filter(usuario => {
        return (
            contains(usuario.id, filters.id) &&
            contains(usuario.cedula, filters.cedula) &&
            contains(usuario.nombre, filters.nombre) &&
            contains(usuario.email, filters.email) &&
            contains(usuario.usuario, filters.usuario) &&
            contains(usuario.rol, filters.rol)
        );
    });

    if (loading) {
        return (
            <div className="page-fade-in">
                <Navbar />
                <div className="container page-container">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="usuarios-page page-fade-in"> {/* Agregar page-fade-in */}
            <Navbar />
            <div className="container page-container">
                <div className="card shadow-sm fade-in"> {/* Agregar fade-in al card */}
                    <div className="card-header bg-primary">
                        <h2 className="mb-0 text-white">👥 Gestión de Usuarios</h2>
                    </div>
                    <div className="card-body">
                        {isAdmin && (
                            <div className="mb-3" id="adminActions">
                                <Link to="/form-usuarios" className="btn btn-success">
                                    <i className="fas fa-plus me-2"></i>Agregar Usuario
                                </Link>
                            </div>
                        )}

                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead className="table-dark">
                                <tr>
                                    <th>
                                        ID
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar ID"
                                            value={filters.id}
                                            onChange={e => onFilterChange('id', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Cédula
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar cédula"
                                            value={filters.cedula}
                                            onChange={e => onFilterChange('cedula', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Nombre
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar nombre"
                                            value={filters.nombre}
                                            onChange={e => onFilterChange('nombre', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Email
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar email"
                                            value={filters.email}
                                            onChange={e => onFilterChange('email', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Usuario
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar usuario"
                                            value={filters.usuario}
                                            onChange={e => onFilterChange('usuario', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Rol
                                        <br />
                                    </th>
                                    {isAdmin && <th id="actionsHeader">Acciones</th>}
                                </tr>
                                </thead>
                                <tbody id="tablaUsuarios">
                                {filteredUsuarios.map(usuario => {
                                    let badgeClass = 'bg-secondary';
                                    if (usuario.rol === 'ADMIN') badgeClass = 'bg-danger';
                                    else if (usuario.rol === 'OPERATOR') badgeClass = 'bg-warning text-dark';
                                    else if (usuario.rol === 'USER') badgeClass = 'bg-info';

                                    return (
                                        <tr key={usuario.id}>
                                            <td>{usuario.id}</td>
                                            <td>{usuario.cedula}</td>
                                            <td>{usuario.nombre}</td>
                                            <td>{usuario.email}</td>
                                            <td>{usuario.usuario}</td>
                                            <td><span className={`badge ${badgeClass}`}>{usuario.rol}</span></td>
                                            {isAdmin && (
                                                <td>
                                                    <div className="btn-group-table">
                                                        <Link to={`/form-usuarios?id=${usuario.id}`} className="btn btn-sm btn-warning">Editar</Link>
                                                        <button
                                                            onClick={() => eliminarUsuario(usuario.id)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                                {filteredUsuarios.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 7 : 6} className="text-center text-muted">No se encontraron resultados.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="footer">
                <div className="container">
                    <p className="mb-1">&copy; 2025 - Sistema de Reservas de Canchas Deportivas - Proyecto inicial Entornos de Programación - Grupo E1</p>
                    <p className="lead"> Plataforma desarrollada para la gestión eficiente de instalaciones deportivas </p>
                </div>
            </footer>
        </div>
    );
};

export default Usuarios;
