import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiService, SessionHelper } from '../services/api';
import Navbar from './Navbar';
import './FormReservas.css';

const FormReservas = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reservaId = searchParams.get('id');
    const [formData, setFormData] = useState({
        usuarioId: '',
        canchaId: '',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        estado: 'ACTIVA'
    });
    const [usuarios, setUsuarios] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cuposDisponibles, setCuposDisponibles] = useState(null);
    const [horaMinimaHoy, setHoraMinimaHoy] = useState('');
    const [hoy, setHoy] = useState('');
    const [errores, setErrores] = useState({});
    const [submitError, setSubmitError] = useState('');

    // Calcular fecha actual y hora mínima en zona horaria local
    useEffect(() => {
        const ahora = new Date();

        // Calcular fecha actual en formato YYYY-MM-DD en zona horaria local
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        const fechaHoy = `${anio}-${mes}-${dia}`;
        setHoy(fechaHoy);

        // Calcular hora mínima para hoy (30 minutos después de la hora actual) en zona horaria local
        const horaMinima = new Date(ahora.getTime() + 30 * 60000);
        const horas = String(horaMinima.getHours()).padStart(2, '0');
        const minutos = String(horaMinima.getMinutes()).padStart(2, '0');
        const horaMinimaStr = `${horas}:${minutos}`;
        setHoraMinimaHoy(horaMinimaStr);
    }, []);

    useEffect(() => {
        cargarUsuariosYCanchas();
        if (reservaId) {
            cargarReserva(reservaId);
        }
    }, [reservaId]);

    const cargarUsuariosYCanchas = async () => {
        try {
            const currentUser = SessionHelper.getUser();
            const isAdmin = SessionHelper.isAdmin();

            // Cargar usuarios
            const usuariosResponse = await ApiService.get('/usuarios');
            if (usuariosResponse.success) {
                const usuariosFiltrados = isAdmin ?
                    usuariosResponse.data :
                    usuariosResponse.data.filter(u => u.id === currentUser.id);
                setUsuarios(usuariosFiltrados);
            }

            // Cargar canchas activas
            const canchasResponse = await ApiService.get('/canchas');
            if (canchasResponse.success) {
                setCanchas(canchasResponse.data);
            }

            // Si no es admin, establecer el usuario actual por defecto
            if (!isAdmin) {
                setFormData(prev => ({
                    ...prev,
                    usuarioId: currentUser.id.toString()
                }));
            }

            setLoading(false);
        } catch (error) {
            alert('Error al cargar datos: ' + error.message);
            setLoading(false);
        }
    };

    const cargarReserva = async (id) => {
        try {
            const response = await ApiService.get(`/reservas/${id}`);
            if (response.success) {
                const reserva = response.data;

                const currentUser = SessionHelper.getUser();
                const isAdmin = SessionHelper.isAdmin();

                if (!isAdmin && reserva.usuarioId !== currentUser.id) {
                    alert('No tiene permisos para editar esta reserva');
                    navigate('/reservas');
                    return;
                }

                setFormData({
                    usuarioId: reserva.usuarioId.toString(),
                    canchaId: reserva.canchaId.toString(),
                    fecha: reserva.fecha,
                    horaInicio: reserva.horaInicio,
                    horaFin: reserva.horaFin,
                    estado: reserva.estado || 'ACTIVA'
                });
            } else {
                alert(response.message);
            }
        } catch (error) {
            alert('Error al cargar reserva: ' + error.message);
        }
    };

    // Función para calcular la duración en horas entre dos horas
    const calcularDuracion = (horaInicio, horaFin) => {
        const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
        const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

        const inicioMinutos = horaInicioH * 60 + horaInicioM;
        const finMinutos = horaFinH * 60 + horaFinM;

        return (finMinutos - inicioMinutos) / 60;
    };

    // Función para validar horario dentro del rango de atención
    const validarHorarioAtencion = (horaInicio, horaFin, cancha) => {
        if (!cancha) return true;

        const [horaAperturaH, horaAperturaM] = cancha.horaApertura.split(':').map(Number);
        const [horaCierreH, horaCierreM] = cancha.horaCierre.split(':').map(Number);
        const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
        const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

        const aperturaMinutos = horaAperturaH * 60 + horaAperturaM;
        const cierreMinutos = horaCierreH * 60 + horaCierreM;
        const inicioMinutos = horaInicioH * 60 + horaInicioM;
        const finMinutos = horaFinH * 60 + horaFinM;

        return inicioMinutos >= aperturaMinutos && finMinutos <= cierreMinutos;
    };

    // Función para comparar horas en formato HH:MM
    const compararHoras = (hora1, hora2) => {
        const [h1, m1] = hora1.split(':').map(Number);
        const [h2, m2] = hora2.split(':').map(Number);
        const minutos1 = h1 * 60 + m1;
        const minutos2 = h2 * 60 + m2;
        return minutos1 - minutos2;
    };

    const verificarCuposDisponibles = async () => {
        if (!formData.canchaId || !formData.fecha || !formData.horaInicio || !formData.horaFin) {
            setCuposDisponibles(null);
            setErrores({});
            return;
        }

        const nuevosErrores = {};
        const canchaSeleccionada = canchas.find(c => c.id.toString() === formData.canchaId);

        // Solo validar "hoy" si la fecha de reserva es igual a la fecha actual LOCAL
        const esParaHoy = formData.fecha === hoy;

        // Si la fecha es para hoy, validar que la hora de inicio sea al menos 30 minutos después
        if (esParaHoy) {
            if (compararHoras(formData.horaInicio, horaMinimaHoy) < 0) {
                nuevosErrores.horaInicio = `Para reservas del día actual, la hora de inicio debe ser al menos 30 minutos después de la hora actual (${horaMinimaHoy}).`;
            }
        }

        // Validar que la hora de inicio sea antes de la hora de fin
        if (formData.horaInicio >= formData.horaFin) {
            nuevosErrores.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
        }

        // Validar duración máxima de 2 horas
        const duracion = calcularDuracion(formData.horaInicio, formData.horaFin);
        if (duracion > 2) {
            nuevosErrores.duracion = 'La duración máxima permitida es de 2 horas';
        }

        // Validar horario de atención
        if (canchaSeleccionada && !validarHorarioAtencion(formData.horaInicio, formData.horaFin, canchaSeleccionada)) {
            nuevosErrores.horarioAtencion = `La reserva debe estar dentro del horario de atención: ${formatTime(canchaSeleccionada.horaApertura)} - ${formatTime(canchaSeleccionada.horaCierre)}`;
        }

        setErrores(nuevosErrores);

        // Si hay errores de validación local, no hacemos la llamada al API
        if (Object.keys(nuevosErrores).length > 0) {
            setCuposDisponibles(null);
            return;
        }

        try {
            const response = await ApiService.get(
                `/reservas/disponibilidad?canchaId=${formData.canchaId}&fecha=${formData.fecha}&horaInicio=${formData.horaInicio}&horaFin=${formData.horaFin}${reservaId ? `&reservaId=${reservaId}` : ''}`
            );

            if (response.success) {
                setCuposDisponibles(response.data);
            } else {
                // Si hay error en la disponibilidad, mostrarlo como advertencia
                setCuposDisponibles({
                    advertencia: response.message || 'Error al verificar disponibilidad'
                });
            }
        } catch (error) {
            console.error('Error al obtener cupos disponibles:', error);
            setCuposDisponibles({
                advertencia: 'Error al verificar disponibilidad: ' + error.message
            });
        }
    };

    useEffect(() => {
        verificarCuposDisponibles();
    }, [formData.canchaId, formData.fecha, formData.horaInicio, formData.horaFin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validarReservaEnTiempoReal()) {
            alert('❌ Por favor, corrija los errores antes de guardar la reserva.');
            return;
        }

        const reservaData = {
            usuarioId: parseInt(formData.usuarioId),
            canchaId: parseInt(formData.canchaId),
            fecha: formData.fecha,
            horaInicio: formData.horaInicio,
            horaFin: formData.horaFin,
            estado: formData.estado
        };

        try {
            let response;
            if (reservaId) {
                response = await ApiService.put(`/reservas/${reservaId}`, reservaData);
            } else {
                response = await ApiService.post('/reservas', reservaData);
            }

            if (response.success) {
                alert(reservaId ? '✅ Reserva actualizada correctamente' : '✅ Reserva creada correctamente');
                navigate('/reservas');
            } else {
                // Mostrar el mensaje específico del backend
                setSubmitError(response.message || 'Error desconocido al guardar la reserva');
            }
        } catch (error) {
            console.error('Error detallado:', error);

            // Mejor manejo de errores
            let mensajeError = 'Error al procesar la solicitud';

            if (error.response) {
                // Error de respuesta HTTP
                const data = error.response.data;
                if (data && data.message) {
                    mensajeError = data.message;
                } else if (typeof data === 'string') {
                    mensajeError = data;
                }
            } else if (error.request) {
                // Error de red
                mensajeError = 'Error de conexión. Verifique su conexión a internet.';
            } else {
                // Otros errores
                mensajeError = error.message || 'Error desconocido';
            }

            setSubmitError(mensajeError);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Limpiar error al cambiar campos
        if (submitError) setSubmitError('');
    };

    // Función para validar si la reserva es válida en tiempo real
    const validarReservaEnTiempoReal = () => {
        if (!formData.fecha || !formData.horaInicio || !formData.horaFin || !formData.canchaId || !formData.usuarioId) {
            return false;
        }

        const esParaHoy = formData.fecha === hoy;

        // Si es para hoy, validar hora mínima
        if (esParaHoy) {
            if (compararHoras(formData.horaInicio, horaMinimaHoy) < 0) {
                return false;
            }
        }

        // Validar que la hora de inicio sea antes de la hora de fin
        if (formData.horaInicio >= formData.horaFin) {
            return false;
        }

        // Validar duración máxima
        const duracion = calcularDuracion(formData.horaInicio, formData.horaFin);
        if (duracion > 2) {
            return false;
        }

        // Validar horario de atención
        const canchaSeleccionada = canchas.find(c => c.id.toString() === formData.canchaId);
        if (canchaSeleccionada && !validarHorarioAtencion(formData.horaInicio, formData.horaFin, canchaSeleccionada)) {
            return false;
        }

        // Si hay advertencia de cupos, no permitir guardar
        return !(cuposDisponibles && cuposDisponibles.advertencia);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'p. m.' : 'a. m.';
        const hour12 = hour % 12 || 12;
        const minutesPart = minutes ? `:${minutes}` : '';
        return `${hour12}${minutesPart} ${ampm}`;
    };

    const isAdmin = SessionHelper.isAdmin();
    const canchaSeleccionada = canchas.find(c => c.id.toString() === formData.canchaId);
    const duracion = formData.horaInicio && formData.horaFin ? calcularDuracion(formData.horaInicio, formData.horaFin) : 0;

    if (loading) {
        return (
            <div className="page-fade-in">
                <Navbar />
                <div className="container page-container">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="page-fade-in">
            <Navbar />
            <div className="container page-container">
                <div className="card shadow-sm">
                    <div className="card-header bg-warning">
                        <h2 className="mb-0 text-dark">
                            {reservaId ? '📅 Editar Reserva' : '📅 Nueva Reserva'}
                        </h2>
                    </div>
                    <div className="card-body">
                        {/* Información de horario de atención */}
                        {canchaSeleccionada && (
                            <div className="alert alert-info">
                                <strong>ℹ️ Horario de atención:</strong> {formatTime(canchaSeleccionada.horaApertura)} - {formatTime(canchaSeleccionada.horaCierre)}
                            </div>
                        )}

                        {/* Información de cupos disponibles */}
                        {cuposDisponibles && (
                            <div className={`alert ${cuposDisponibles.cuposDisponibles > 0 && !cuposDisponibles.advertencia ? 'alert-success' : 'alert-danger'}`}>
                                {cuposDisponibles.advertencia ? (
                                    <>
                                        <strong>{cuposDisponibles.advertencia}</strong>
                                    </>
                                ) : cuposDisponibles.cuposDisponibles > 0 ? (
                                    <>
                                        <strong>✅ Cupos disponibles:</strong> {cuposDisponibles.cuposDisponibles} de {cuposDisponibles.capacidadTotal}<br/>
                                        <small>Reservas activas en este horario: {cuposDisponibles.reservasActivas}</small>
                                    </>
                                ) : (
                                    <>
                                        <strong>❌ No hay cupos disponibles</strong><br/>
                                        <small>Capacidad total: {cuposDisponibles.capacidadTotal} personas | Reservas activas: {cuposDisponibles.reservasActivas}</small>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mostrar errores de validación */}
                        {Object.keys(errores).length > 0 && (
                            <div className="alert alert-danger">
                                <strong>❌ Errores de validación:</strong>
                                <ul className="mb-0 mt-2">
                                    {Object.entries(errores).map(([campo, mensaje]) => (
                                        <li key={campo}>{mensaje}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Mostrar error del servidor */}
                        {submitError && (
                            <div className="alert alert-danger">
                                <strong>❌ Error del servidor:</strong> {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <input type="hidden" id="reservaId" value={reservaId || ''} />

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="usuarioId" className="form-label">Usuario *</label>
                                    <select
                                        className="form-select"
                                        id="usuarioId"
                                        name="usuarioId"
                                        value={formData.usuarioId}
                                        onChange={handleChange}
                                        required
                                        disabled={!isAdmin && reservaId}
                                    >
                                        <option value="">Seleccionar usuario</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nombre} ({usuario.usuario})
                                            </option>
                                        ))}
                                    </select>
                                    {!isAdmin && (
                                        <div className="form-text">Solo puede crear reservas para su propio usuario</div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="canchaId" className="form-label">Cancha *</label>
                                    <select
                                        className="form-select"
                                        id="canchaId"
                                        name="canchaId"
                                        value={formData.canchaId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccionar cancha</option>
                                        {canchas.map(cancha => (
                                            <option key={cancha.id} value={cancha.id}>
                                                {cancha.nombre} - {cancha.deporte} (${cancha.precioHora}/hora) -
                                                <span className={`badge ${cancha.estado === 'ACTIVA' ? 'bg-success' : 'bg-secondary'} ms-1`}>
                                                    {cancha.estado}
                                                </span>
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label htmlFor="fecha" className="form-label">Fecha *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fecha"
                                        name="fecha"
                                        value={formData.fecha}
                                        onChange={handleChange}
                                        min={hoy}
                                        required
                                    />
                                    <div className="form-text">No se permiten fechas pasadas</div>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="horaInicio" className="form-label">Hora Inicio *</label>
                                    <input
                                        type="time"
                                        className={`form-control ${errores.horaInicio ? 'is-invalid' : ''}`}
                                        id="horaInicio"
                                        name="horaInicio"
                                        value={formData.horaInicio}
                                        onChange={handleChange}
                                        min={formData.fecha === hoy ? horaMinimaHoy : '00:00'}
                                        required
                                    />
                                    {formData.fecha === hoy && (
                                        <div className="form-text text-warning">
                                            ⚠️ Hora mínima para hoy: {horaMinimaHoy}
                                        </div>
                                    )}
                                    {errores.horaInicio && (
                                        <div className="invalid-feedback">{errores.horaInicio}</div>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="horaFin" className="form-label">Hora Fin *</label>
                                    <input
                                        type="time"
                                        className={`form-control ${errores.horaFin ? 'is-invalid' : ''}`}
                                        id="horaFin"
                                        name="horaFin"
                                        value={formData.horaFin}
                                        onChange={handleChange}
                                        min={formData.horaInicio || '00:00'}
                                        required
                                    />
                                    <div className="form-text">
                                        Duración máxima: 2 horas {duracion > 0 && `(Actual: ${duracion.toFixed(2)} horas)`}
                                    </div>
                                    {errores.horaFin && (
                                        <div className="invalid-feedback">{errores.horaFin}</div>
                                    )}
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="estado" className="form-label">Estado *</label>
                                    <select
                                        className="form-select"
                                        id="estado"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="ACTIVA">Activa</option>
                                        <option value="FINALIZADA">Finalizada</option>
                                        <option value="CANCELADA">Cancelada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={!validarReservaEnTiempoReal()}
                                >
                                    {reservaId ? 'Actualizar Reserva' : 'Crear Reserva'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/reservas')}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                            </div>

                            {!validarReservaEnTiempoReal() && (
                                <div className="mt-3">
                                    <small className="text-danger">
                                        ⚠️ Complete todos los campos correctamente para poder guardar la reserva.
                                    </small>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormReservas;