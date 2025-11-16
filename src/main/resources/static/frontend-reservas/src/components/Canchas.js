import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ApiService, SessionHelper } from '../services/api';
import Navbar from './Navbar';
import './Canchas.css';

const Canchas = () => {
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
    const intervalRef = useRef();

    // filtros por columna (A3: input dentro del <th>)
    const [filters, setFilters] = useState({
        id: '',
        nombre: '',
        deporte: '',
        ubicacion: '',
        precio: '',
        capacidad: '',
        horario: '',
        estado: ''
    });

    useEffect(() => {
        if (!SessionHelper.isLoggedIn()) {
            window.location.href = '/login';
            return;
        }

        cargarCanchas();

        // Actualizar cada segundo para ver cambios de estado
        intervalRef.current = setInterval(() => {
            console.log('🔄 Actualizando estados de canchas automáticamente...');
            actualizarCanchasSilenciosamente();
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const cargarCanchas = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/canchas');
            if (response.success) {
                setCanchas(response.data);
                setUltimaActualizacion(new Date());
            } else {
                console.error('Error al cargar canchas:', response.message);
            }
        } catch (error) {
            console.error('Error al cargar canchas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Nueva función para actualización silenciosa
    const actualizarCanchasSilenciosamente = async () => {
        try {
            const response = await ApiService.get('/canchas');
            if (response.success) {
                setCanchas(response.data);
                setUltimaActualizacion(new Date());
            }
        } catch (error) {
            console.error('Error al actualizar canchas silenciosamente:', error);
        }
    };

    const eliminarCancha = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta cancha? Se eliminarán también todas las reservas asociadas.')) {
            try {
                const response = await ApiService.delete(`/canchas/${id}`);
                if (response.success) {
                    alert('Cancha eliminada correctamente');
                    cargarCanchas();
                } else {
                    alert(response.message);
                }
            } catch (error) {
                alert('Error al eliminar cancha: ' + error.message);
            }
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        if (timeString.includes('a. m.') || timeString.includes('p. m.')) {
            return timeString;
        }
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'p. m.' : 'a. m.';
        const hour12 = hour % 12 || 12;
        const minutesPart = minutes ? `:${minutes}` : '';
        return `${hour12}${minutesPart} ${ampm}`;
    };

    const isAdmin = SessionHelper.isAdmin();

    const onFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // función utilitaria para comparar (contains, case-insensitive)
    const contains = (source, term) => {
        if (term === undefined || term === null) return true;
        if (!term.toString().trim()) return true;
        if (source === undefined || source === null) return false;
        return source.toString().toLowerCase().includes(term.toString().toLowerCase());
    };

    const filteredCanchas = canchas.filter(cancha => {
        const horarioStr = `${formatTime(cancha.horaApertura || '')} - ${formatTime(cancha.horaCierre || '')}`;
        return (
            contains(cancha.id, filters.id) &&
            contains(cancha.nombre, filters.nombre) &&
            contains(cancha.deporte, filters.deporte) &&
            contains(cancha.ubicacion, filters.ubicacion) &&
            contains(cancha.precioHora, filters.precio) &&
            contains(cancha.capacidad, filters.capacidad) &&
            contains(horarioStr, filters.horario) &&
            contains(cancha.estado, filters.estado)
        );
    });

    if (loading) {
        return (
            <div className="page-fade-in">
                <Navbar />
                <div className="container page-container">Cargando canchas...</div>
            </div>
        );
    }

    return (
        <div className="usuarios-page page-fade-in">
            <Navbar />
            <div className="container page-container">
                {/* Agregar indicador de última actualización */}
                <div className="mb-3 d-flex justify-content-between align-items-center">
                    <div></div>
                    <small className="text-muted">
                        🔄 Actualizado: {ultimaActualizacion.toLocaleTimeString()}
                    </small>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-success">
                        <h2 className="mb-0 text-white">🏟️ Gestión de Canchas</h2>
                    </div>
                    <div className="card-body">
                        {isAdmin && (
                            <div className="mb-3" id="adminActions">
                                <Link to="/form-canchas" className="btn btn-success">
                                    <i className="fas fa-plus me-2"></i>Agregar Cancha
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
                                        Deporte
                                        <br />
                                    </th>
                                    <th>
                                        Ubicación
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar ubicación"
                                            value={filters.ubicacion}
                                            onChange={e => onFilterChange('ubicacion', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Precio/Hora
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar precio"
                                            value={filters.precio}
                                            onChange={e => onFilterChange('precio', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Capacidad
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar capacidad"
                                            value={filters.capacidad}
                                            onChange={e => onFilterChange('capacidad', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Horario
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar horario"
                                            value={filters.horario}
                                            onChange={e => onFilterChange('horario', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Estado
                                        <br />
                                    </th>
                                    {isAdmin && <th id="actionsHeader">Acciones</th>}
                                </tr>
                                </thead>
                                <tbody id="tablaCanchas">
                                {filteredCanchas.map(cancha => (
                                    <tr key={cancha.id}>
                                        <td>{cancha.id}</td>
                                        <td>{cancha.nombre}</td>
                                        <td><span className="badge bg-primary">{cancha.deporte}</span></td>
                                        <td>{cancha.ubicacion}</td>
                                        <td>${cancha.precioHora?.toLocaleString()}</td>
                                        <td>{cancha.capacidad} personas</td>
                                        <td>{formatTime(cancha.horaApertura)} - {formatTime(cancha.horaCierre)}</td>
                                        <td>
                                            <span className={`badge ${cancha.estado === 'ACTIVA' ? 'bg-success' : 'bg-secondary'}`}>
                                                {cancha.estado}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div className="btn-group-table">
                                                    <Link to={`/form-canchas?id=${cancha.id}`} className="btn btn-sm btn-warning">Editar</Link>
                                                    <button
                                                        onClick={() => eliminarCancha(cancha.id)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {filteredCanchas.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 9 : 8} className="text-center text-muted">No se encontraron resultados.</td>
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

export default Canchas;
