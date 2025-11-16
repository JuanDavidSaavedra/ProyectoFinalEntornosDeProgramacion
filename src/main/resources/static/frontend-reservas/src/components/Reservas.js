import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ApiService, SessionHelper } from '../services/api';
import Navbar from './Navbar';
import './Reservas.css';

const Reservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
    const intervalRef = useRef();
    const isInitialMount = useRef(true);
    const currentUser = SessionHelper.getUser();
    const isAdmin = SessionHelper.isAdmin();

    // filtros por columna
    const [filters, setFilters] = useState({
        id: '',
        usuario: '',
        cancha: '',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        estado: ''
    });

    useEffect(() => {
        if (!SessionHelper.isLoggedIn()) {
            window.location.href = '/login';
            return;
        }

        cargarReservas();

        // Verificar y actualizar estados cada segundo
        intervalRef.current = setInterval(() => {
            console.log('🔄 Actualizando estados de reservas automáticamente...');
            actualizarReservasSilenciosamente();
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const cargarReservas = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/reservas');
            if (response.success) {
                setReservas(response.data);
                setUltimaActualizacion(new Date());
            } else {
                console.error('Error al cargar reservas:', response.message);
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Nueva función para actualización silenciosa (sin mostrar loading)
    const actualizarReservasSilenciosamente = async () => {
        try {
            // Llamar al endpoint que actualiza los estados en el backend
            await ApiService.post('/reservas/actualizar-estados', {});

            // Obtener las reservas actualizadas sin afectar la UI
            const response = await ApiService.get('/reservas');
            if (response.success) {
                setReservas(response.data);
                setUltimaActualizacion(new Date());
            }
        } catch (error) {
            console.error('Error al actualizar reservas silenciosamente:', error);
        }
    };

    const verificarYActualizarReservas = async () => {
        try {
            await ApiService.post('/reservas/actualizar-estados', {});
            await cargarReservas();
        } catch (error) {
            console.error('Error al verificar reservas:', error);
        }
    };

    const eliminarReserva = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta reserva?')) {
            try {
                const response = await ApiService.delete(`/reservas/${id}`);
                if (response.success) {
                    alert('Reserva eliminada correctamente');
                    cargarReservas();
                } else {
                    alert(response.message);
                }
            } catch (error) {
                alert('Error al eliminar reserva: ' + error.message);
            }
        }
    };

    const formatDateDisplay = (fechaStr) => {
        if (!fechaStr) return '';
        const parts = fechaStr.split('-');
        if (parts.length !== 3) return fechaStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

    const onFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const contains = (source, term) => {
        if (term === undefined || term === null) return true;
        if (!term.toString().trim()) return true;
        if (source === undefined || source === null) return false;
        return source.toString().toLowerCase().includes(term.toString().toLowerCase());
    };

    // Filtrar reservas para usuarios normales
    const reservasVisiblesPorUsuario = isAdmin ? reservas : reservas.filter(r => r.usuarioId === currentUser.id);

    // aplicar filtros combinados (A3 dentro de <th>, parcial)
    const filteredReservas = reservasVisiblesPorUsuario.filter(reserva => {
        const fechaDisplay = reserva.fecha ? formatDateDisplay(reserva.fecha) : '';
        return (
            contains(reserva.id, filters.id) &&
            contains(reserva.nombreUsuario || reserva.usuarioNombre || '', filters.usuario) &&
            contains(reserva.nombreCancha || '', filters.cancha) &&
            contains(fechaDisplay, filters.fecha) &&
            contains(formatTime(reserva.horaInicio || ''), filters.horaInicio) &&
            contains(formatTime(reserva.horaFin || ''), filters.horaFin) &&
            contains(reserva.estado || '', filters.estado)
        );
    });

    if (loading) {
        return (
            <div className="page-fade-in">
                <Navbar />
                <div className="container page-container">Cargando reservas...</div>
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
                    <div className="card-header bg-warning">
                        <h2 className="mb-0 text-dark">📅 Gestión de Reservas</h2>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <Link to="/form-reservas" className="btn btn-success">
                                <i className="fas fa-plus me-2"></i>Nueva Reserva
                            </Link>
                        </div>

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
                                        Cancha
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar cancha"
                                            value={filters.cancha}
                                            onChange={e => onFilterChange('cancha', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Fecha
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="DD/MM/AAAA"
                                            value={filters.fecha}
                                            onChange={e => onFilterChange('fecha', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Hora Inicio
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar hora inicio"
                                            value={filters.horaInicio}
                                            onChange={e => onFilterChange('horaInicio', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Hora Fin
                                        <br />
                                        <input
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Buscar hora fin"
                                            value={filters.horaFin}
                                            onChange={e => onFilterChange('horaFin', e.target.value)}
                                        />
                                    </th>
                                    <th>
                                        Estado
                                        <br />
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                                </thead>
                                <tbody id="tablaReservas">
                                {filteredReservas.map(reserva => {
                                    const fechaDisplay = reserva.fecha ? formatDateDisplay(reserva.fecha) : '';

                                    let badgeClass = 'bg-secondary';
                                    if (reserva.estado === 'ACTIVA') badgeClass = 'bg-success';
                                    if (reserva.estado === 'FINALIZADA') badgeClass = 'bg-primary';
                                    if (reserva.estado === 'CANCELADA') badgeClass = 'bg-danger';

                                    const puedeEditar = isAdmin || reserva.usuarioId === currentUser.id;

                                    return (
                                        <tr key={reserva.id}>
                                            <td>{reserva.id}</td>
                                            <td>{reserva.nombreUsuario || ''}</td>
                                            <td>{reserva.nombreCancha || ''}</td>
                                            <td>{fechaDisplay}</td>
                                            <td>{formatTime(reserva.horaInicio || '')}</td>
                                            <td>{formatTime(reserva.horaFin || '')}</td>
                                            <td><span className={`badge ${badgeClass}`}>{reserva.estado || ''}</span></td>
                                            <td>
                                                {puedeEditar ? (
                                                    <div className="btn-group-table">
                                                        <Link to={`/form-reservas?id=${reserva.id}`} className="btn btn-sm btn-warning">Editar</Link>
                                                        <button
                                                            onClick={() => eliminarReserva(reserva.id)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">Solo lectura</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredReservas.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center text-muted">No se encontraron resultados.</td>
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

export default Reservas;
