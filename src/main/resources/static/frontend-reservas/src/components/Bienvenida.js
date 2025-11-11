import React from 'react';
import '../styles/original.css';

const Bienvenida = () => {
    return (
        <div className="container mt-5">
            <div className="welcome-container">
                <div className="welcome-icon">🏆</div>
                <h1>Bienvenido al Sistema de Reservas Deportivas</h1>
                <p className="lead">Gestiona usuarios, canchas y reservas de manera eficiente</p>

                <div className="features-container">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="feature-card">
                                <a className="nav-link" href="/usuarios">
                                    <img src="/img/usuarios.png" height="36" className="me-2" alt="Logo"/>
                                    <h3>Usuarios</h3>
                                </a>
                                <p>Gestiona los usuarios del sistema y sus permisos</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-card">
                                <a className="nav-link" href="/canchas">
                                    <img src="/img/cancha.png" height="36" className="me-2" alt="Logo"/>
                                    <h3>Canchas</h3>
                                </a>
                                <p>Administra las canchas deportivas disponibles</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-card">
                                <a className="nav-link" href="/reservas">
                                    <img src="/img/reservas.png" height="36" className="me-2" alt="Logo"/>
                                    <h3>Reservas</h3>
                                </a>
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
    );
};

export default Bienvenida;