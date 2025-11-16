import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiService, SessionHelper } from '../services/api';
import './Login.css'; // Importar los estilos CSS

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!usuario || !password) {
            alert('Por favor, complete todos los campos');
            return;
        }

        try {
            const response = await ApiService.post('/auth/login', {
                usuario: usuario,
                contraseña: password
            });

            console.log('Respuesta completa:', response);

            if (response.success) {
                SessionHelper.setUser(response.data);
                navigate('/menu');
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('Error en login:', error);
            alert('Error al iniciar sesión: ' + error.message);
        }
    };

    // Función para autocompletar credenciales
    const autocompletarCredenciales = (user, pass) => {
        setUsuario(user);
        setPassword(pass);
    };

    return (
        <div className="login-page">
            <div className="container-fluid">
                <div className="container">
                    <div className="hero-section mx-auto" style={{ maxWidth: '85%', padding: '2rem 1.5rem' }}>
                        <div className="row align-items-center">
                            <div className="col-12 text-center">
                                <h1 className="display-6 fw-bold text-primary mb-3">
                                    Sistema de Reservas de Canchas Deportivas
                                </h1>
                                <p className="lead text-dark mb-0">
                                    Plataforma integral para la gestión eficiente de canchas, usuarios y reservas deportivas
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-xxl-11 col-lg-12">
                            <div className="login-section">
                                <div className="row g-0">
                                    {/* Información del sistema */}
                                    <div className="col-lg-6 system-info">
                                        <h3 className="mb-4 text-white">¡Bienvenido al Sistema de Reservas de Canchas Deportivas!</h3>
                                        <p className="welcome-text">
                                            Plataforma especializada para la gestión integral de reservas en instalaciones
                                            deportivas.
                                            Optimiza el uso de tus canchas y mejora la experiencia de tus usuarios.
                                        </p>

                                        <div className="mb-4">
                                            <h5 className="text-white mb-3">Funcionalidades para Administradores</h5>
                                            <ul className="list-unstyled">
                                                <li>• Gestión completa de usuarios y permisos</li>
                                                <li>• Administración de canchas y disponibilidad</li>
                                                <li>• Control y monitoreo de reservas en tiempo real</li>
                                                <li>• Reportes detallados y estadísticas avanzadas</li>
                                                <li>• Configuración de horarios y tarifas</li>
                                            </ul>
                                        </div>

                                        <div className="mb-4">
                                            <h5 className="text-white mb-3">Beneficios para Usuarios</h5>
                                            <ul className="list-unstyled">
                                                <li>• Reserva rápida de canchas disponibles</li>
                                                <li>• Visualización de horarios en tiempo real</li>
                                                <li>• Gestión personal de reservas activas</li>
                                                <li>• Historial completo de actividades</li>
                                                <li>• Notificaciones automáticas y recordatorios</li>
                                            </ul>
                                        </div>

                                        <div className="mt-4 pt-3 border-top border-light">
                                            <h6 className="text-white mb-2">💬 Soporte Técnico</h6>
                                            <p className="welcome-text mb-0">¿Necesitas ayuda? Nuestro equipo de soporte está disponible
                                                para asistirte.</p>
                                        </div>
                                    </div>

                                    {/* Formulario */}
                                    <div className="col-lg-6">
                                        <div className="p-5">
                                            <div className="text-center mb-4">
                                                <img src="/img/logo.png" alt="Logo Reservas Deportivas" height="80" className="mb-3"/>
                                                <h3 className="fw-bold text-dark mb-2">INICIAR SESIÓN</h3>
                                                <p className="text-muted">Ingresa tus credenciales para acceder al sistema</p>
                                            </div>

                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label htmlFor="icon_user" className="form-label fw-semibold text-dark">
                                                        <i className="material-icons me-2"
                                                           style={{ verticalAlign: 'middle', color: '#3498db' }}>person</i>
                                                        Usuario
                                                    </label>
                                                    <input
                                                        id="icon_user"
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        placeholder="Ingresa tu usuario"
                                                        value={usuario}
                                                        onChange={(e) => setUsuario(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="icon_pass" className="form-label fw-semibold text-dark">
                                                        <i className="material-icons me-2"
                                                           style={{ verticalAlign: 'middle', color: '#3498db' }}>lock</i>
                                                        Contraseña
                                                    </label>
                                                    <input
                                                        id="icon_pass"
                                                        type="password"
                                                        className="form-control form-control-lg"
                                                        placeholder="Ingresa tu contraseña"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="d-grid">
                                                    <button type="submit" className="btn btn-primary login-btn fw-semibold">
                                                        <i className="material-icons">login</i> INGRESAR
                                                    </button>
                                                </div>

                                                <div className="text-center mt-3">
                                                    <p className="text-muted mb-2">
                                                        ¿No tienes cuenta?
                                                        <Link to="/registro" className="text-primary fw-semibold text-decoration-none ms-1">
                                                            Regístrate aquí
                                                        </Link>
                                                    </p>
                                                </div>
                                            </form>

                                            {/* Credenciales demo - AJUSTADAS PARA CONTRASEÑA LARGA */}
                                            <div className="demo-credentials">
                                                <div className="text-center">
                                                    <small className="text-muted d-block mb-3"><strong>Credenciales de Prueba</strong></small>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3 mb-md-0">
                                                            <div
                                                                className="credential-item"
                                                                onClick={() => autocompletarCredenciales('admin', '123')}
                                                            >
                                                                <small className="fw-semibold text-dark d-block mb-1">Administrador</small>
                                                                <small className="d-block">usuario: <strong>admin</strong></small>
                                                                <small className="d-block">contraseña: <strong>123</strong></small>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div
                                                                className="credential-item"
                                                                onClick={() => autocompletarCredenciales('mariagonz', '$2a$10$ABCDEFGHIJKLMNOPQRSTUVWXYZ012345')}
                                                            >
                                                                <small className="fw-semibold text-dark d-block mb-1">Usuario Normal</small>
                                                                <small className="d-block">usuario: <strong>mariagonz</strong></small>
                                                                <small className="d-block">contraseña:</small>
                                                                <small className="long-password d-block mt-1"><strong>$2a$10$ABCDEFGHIJKLMNOPQRSTUVWXYZ012345</strong></small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center mt-3">
                                                <small className="text-muted">
                                                    ¿Problemas para acceder?
                                                    <a href="#" className="text-decoration-none fw-semibold ms-1">Contactar Soporte</a>
                                                </small>
                                            </div>

                                            <div className="mt-5 pt-4 border-top">
                                                <div className="row text-center">
                                                    <div className="col-4">
                                                        <div className="feature-card">
                                                            <img src="/img/usuarios.png" alt="Gestión de Usuarios"
                                                                 className="feature-icon mx-auto"/>
                                                            <small className="d-block fw-semibold">Usuarios</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="feature-card">
                                                            <img src="/img/cancha.png" alt="Gestión de Canchas"
                                                                 className="feature-icon mx-auto"/>
                                                            <small className="d-block fw-semibold">Canchas</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="feature-card">
                                                            <img src="/img/reservas.png" alt="Gestión de Reservas"
                                                                 className="feature-icon mx-auto"/>
                                                            <small className="d-block fw-semibold">Reservas</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <footer className="text-center mt-4 mb-3">
                                <p className="text-light mb-1">
                                    &copy; 2025 Sistema de Reservas de Canchas Deportivas - Proyecto inicial Entornos de Programación - Grupo E1
                                </p>
                                <p className="text-light opacity-75 small">
                                    Plataforma desarrollada para la gestión eficiente de instalaciones deportivas
                                </p>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;