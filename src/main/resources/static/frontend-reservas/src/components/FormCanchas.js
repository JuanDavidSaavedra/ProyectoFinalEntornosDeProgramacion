import React, {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {ApiService} from '../services/api';
import Navbar from './Navbar';
import './FormCanchas.css';

const FormCanchas = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const canchaId = searchParams.get('id');
    const [formData, setFormData] = useState({
        nombre: '',
        deporte: '',
        ubicacion: '',
        precioHora: '',
        capacidad: '',
        horaApertura: '',
        horaCierre: '',
        estado: 'ACTIVA'
    });
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (canchaId) {
            cargarCancha(canchaId);
        }
    }, [canchaId]);

    const cargarCancha = async (id) => {
        try {
            const response = await ApiService.get(`/canchas/${id}`);
            if (response.success) {
                const cancha = response.data;
                setFormData({
                    nombre: cancha.nombre,
                    deporte: cancha.deporte,
                    ubicacion: cancha.ubicacion,
                    precioHora: cancha.precioHora,
                    capacidad: cancha.capacidad,
                    horaApertura: cancha.horaApertura,
                    horaCierre: cancha.horaCierre,
                    estado: cancha.estado
                });
            } else {
                alert(response.message);
            }
        } catch (error) {
            alert('Error al cargar cancha: ' + error.message);
        }
    };

    // Función para validar los datos del formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar que la hora de cierre sea posterior a la hora de apertura
        if (formData.horaApertura && formData.horaCierre) {
            const [aperturaH, aperturaM] = formData.horaApertura.split(':').map(Number);
            const [cierreH, cierreM] = formData.horaCierre.split(':').map(Number);

            const aperturaMinutos = aperturaH * 60 + aperturaM;
            const cierreMinutos = cierreH * 60 + cierreM;

            if (cierreMinutos <= aperturaMinutos) {
                nuevosErrores.horaCierre = 'La hora de cierre debe ser posterior a la hora de apertura';
            }

            // Validar que el horario de atención sea razonable (mínimo 1 hora)
            if (cierreMinutos - aperturaMinutos < 60) {
                nuevosErrores.horario = 'El horario de atención debe ser de al menos 1 hora';
            }
        }

        // Validar capacidad mínima y máxima
        if (formData.capacidad) {
            const capacidad = parseInt(formData.capacidad);
            if (capacidad < 1) {
                nuevosErrores.capacidad = 'La capacidad debe ser al menos 1 persona';
            }
            if (capacidad > 100) {
                nuevosErrores.capacidad = 'La capacidad no puede exceder 100 personas';
            }
        }

        // Validar precio
        if (formData.precioHora) {
            const precio = parseFloat(formData.precioHora);
            if (precio < 0) {
                nuevosErrores.precioHora = 'El precio no puede ser negativo';
            }
            if (precio > 1000000) {
                nuevosErrores.precioHora = 'El precio es demasiado alto';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar antes de enviar
        if (!validarFormulario()) {
            alert('❌ Por favor, corrija los errores antes de guardar la cancha.');
            return;
        }

        const canchaData = {
            nombre: formData.nombre,
            deporte: formData.deporte,
            ubicacion: formData.ubicacion,
            precioHora: parseFloat(formData.precioHora),
            capacidad: parseInt(formData.capacidad),
            horaApertura: formData.horaApertura,
            horaCierre: formData.horaCierre,
            estado: formData.estado
        };

        try {
            let response;
            if (canchaId) {
                canchaData.id = parseInt(canchaId);
                response = await ApiService.put(`/canchas/${canchaId}`, canchaData);
            } else {
                response = await ApiService.post('/canchas', canchaData);
            }

            if (response.success) {
                alert(canchaId ? '✅ Cancha actualizada correctamente' : '✅ Cancha creada correctamente');
                navigate('/canchas');
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('Error detallado:', error);

            let mensajeError = error.message;

            if (mensajeError.includes('Error 400:') || mensajeError.includes('Error 500:')) {
                const partes = mensajeError.split(':');
                if (partes.length > 1) {
                    mensajeError = partes[1].trim();
                }
            }

            alert(`❌ ${mensajeError}`);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Validar en tiempo real cuando cambian los campos relevantes
    useEffect(() => {
        if (formData.horaApertura && formData.horaCierre) {
            validarFormulario();
        }
    }, [formData.horaApertura, formData.horaCierre]);

    const formatTimeForDisplay = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'p. m.' : 'a. m.';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <div className="page-fade-in">
            <Navbar/>
            <div className="container page-container">
                <div className="card shadow-sm fade-in">
                    <div className="card-header bg-success">
                        <h2 className="mb-0 text-white">
                            {canchaId ? '🏟️ Editar Cancha' : '🏟️ Agregar Cancha'}
                        </h2>
                    </div>
                    <div className="card-body">
                        {/* Mostrar resumen del horario */}
                        {formData.horaApertura && formData.horaCierre && (
                            <div className="alert alert-info">
                                <strong>ℹ️ Horario de atención configurado:</strong> {formatTimeForDisplay(formData.horaApertura)} - {formatTimeForDisplay(formData.horaCierre)}
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

                        <form onSubmit={handleSubmit}>
                            <input type="hidden" id="canchaId" value={canchaId || ''}/>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="nombre" className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        maxLength="100"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="deporte" className="form-label">Deporte *</label>
                                    <select
                                        className="form-select"
                                        id="deporte"
                                        name="deporte"
                                        value={formData.deporte}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccionar deporte</option>
                                        <option value="Fútbol">Fútbol</option>
                                        <option value="Básquetbol">Básquetbol</option>
                                        <option value="Voleibol">Voleibol</option>
                                        <option value="Tenis">Tenis</option>
                                        <option value="Pádel">Pádel</option>
                                        <option value="Rugby">Rugby</option>
                                        <option value="Múltiple">Múltiple</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-12">
                                    <label htmlFor="ubicacion" className="form-label">Ubicación *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="ubicacion"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleChange}
                                        required
                                        maxLength="200"
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="precioHora" className="form-label">Precio por Hora *</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errores.precioHora ? 'is-invalid' : ''}`}
                                        id="precioHora"
                                        name="precioHora"
                                        step="1000"
                                        min="0"
                                        max="1000000"
                                        value={formData.precioHora}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errores.precioHora && (
                                        <div className="invalid-feedback">{errores.precioHora}</div>
                                    )}
                                    <div className="form-text">Precio por hora en pesos</div>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="capacidad" className="form-label">Capacidad de Personas *</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errores.capacidad ? 'is-invalid' : ''}`}
                                        id="capacidad"
                                        name="capacidad"
                                        min="1"
                                        max="100"
                                        value={formData.capacidad}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errores.capacidad && (
                                        <div className="invalid-feedback">{errores.capacidad}</div>
                                    )}
                                    <div className="form-text">Capacidad máxima recomendada: 100 personas</div>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="horaApertura" className="form-label">Hora de Apertura *</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        id="horaApertura"
                                        name="horaApertura"
                                        value={formData.horaApertura}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div className="form-text">Hora en que abre la cancha (ej: 05:00 para 5:00 am)</div>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="horaCierre" className="form-label">Hora de Cierre *</label>
                                    <input
                                        type="time"
                                        className={`form-control ${errores.horaCierre ? 'is-invalid' : ''}`}
                                        id="horaCierre"
                                        name="horaCierre"
                                        value={formData.horaCierre}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errores.horaCierre && (
                                        <div className="invalid-feedback">{errores.horaCierre}</div>
                                    )}
                                    <div className="form-text">Hora en que cierra la cancha (ej: 22:00 para 10:00 pm)</div>
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
                                        <option value="INACTIVA">Inactiva</option>
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={Object.keys(errores).length > 0}
                                >
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/canchas')}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                            </div>

                            {Object.keys(errores).length > 0 && (
                                <div className="mt-3">
                                    <small className="text-danger">
                                        ⚠️ Corrija los errores antes de guardar la cancha.
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

export default FormCanchas;