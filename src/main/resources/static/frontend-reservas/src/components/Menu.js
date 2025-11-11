import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SessionHelper } from '../services/api';
import './Menu.css';
import './Bienvenida.css';

const Menu = () => {
    const navigate = useNavigate();
    const user = SessionHelper.getUser();

    const cerrarSesion = () => {
        if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
            SessionHelper.clearUser();
            navigate('/login');
        }
    };

    return (
        <div className="menu-page page-fade-in"> {/* Agregar page-fade-in */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-2">
                <div className="container">
                    <Link to="/menu" className="navbar-brand d-flex align-items-center">
                        <img src="/img/logo.png" height="40" className="me-2" alt="Logo"/>
                        <span>Reservas Deportivas</span>
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNav" aria-controls="navbarNav"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link to="/usuarios" className="nav-link">
                                    <img src="/img/usuarios.png" height="32" className="me-1" alt="Usuarios"/>
                                    Usuarios
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/canchas" className="nav-link">
                                    <img src="/img/cancha.png" height="32" className="me-1" alt="Canchas"/>
                                    Canchas
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/reservas" className="nav-link">
                                    <img src="/img/reservas.png" height="32" className="me-1" alt="Reservas"/>
                                    Reservas
                                </Link>
                            </li>
                        </ul>
                        <div className="navbar-nav">
                            <span className="user-info nav-item nav-link">
                                Bienvenido, {user?.nombre} ({user?.rol})
                            </span>
                            <button onClick={cerrarSesion} className="btn btn-outline-light btn-sm ms-2">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container page-container">
                <div className="welcome-container fade-in"> {/* Agregar fade-in al contenido también */}
                    <div className="welcome-icon">🏆</div>
                    <h1>Bienvenido al Sistema de Reservas Deportivas</h1>
                    <p className="lead">Gestiona usuarios, canchas y reservas de manera eficiente</p>

                    <div className="features-container">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="feature-card">
                                    <Link to="/usuarios" className="nav-link">
                                        <img src="/img/usuarios.png" height="36" className="me-2" alt="Logo"/>
                                        <h3>Usuarios</h3>
                                    </Link>
                                    <p>Gestiona los usuarios del sistema y sus permisos</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="feature-card">
                                    <Link to="/canchas" className="nav-link">
                                        <img src="/img/cancha.png" height="36" className="me-2" alt="Logo"/>
                                        <h3>Canchas</h3>
                                    </Link>
                                    <p>Administra las canchas deportivas disponibles</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="feature-card">
                                    <Link to="/reservas" className="nav-link">
                                        <img src="/img/reservas.png" height="36" className="me-2" alt="Logo"/>
                                        <h3>Reservas</h3>
                                    </Link>
                                    <p>Controla las reservas y horarios de las canchas</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p>Selecciona una opción del menú superior para comenzar</p>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <div className="container">
                    <p className="mb-1">&copy; 2025 Sistema de Reservas Deportivas - Proyecto inicial Entornos de Programación - Grupo E1</p>
                    <p className="lead">Plataforma desarrollada para la gestión eficiente de instalaciones deportivas</p>
                </div>
            </footer>
        </div>
    );
};

export default Menu;