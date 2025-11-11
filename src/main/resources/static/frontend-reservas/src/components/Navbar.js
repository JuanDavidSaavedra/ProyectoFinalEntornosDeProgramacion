import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SessionHelper } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const user = SessionHelper.getUser();

    const cerrarSesion = () => {
        if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
            SessionHelper.clearUser();
            navigate('/login');
        }
    };

    return (
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
    );
};

export default Navbar;