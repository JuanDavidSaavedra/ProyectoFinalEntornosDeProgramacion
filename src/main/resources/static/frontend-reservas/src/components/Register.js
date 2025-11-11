import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import './Login.css'; // Usar los mismos estilos

const Register = () => {
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        email: '',
        usuario: '',
        contraseña: '',
        rol: 'USER'
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await ApiService.post('/auth/registro', formData);

            if (response.success) {
                alert('Usuario registrado correctamente');
                navigate('/login');
            } else {
                alert(response.message);
            }
        } catch (error) {
            alert('Error al registrar usuario: ' + error.message);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-page">
            <div className="container-fluid">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xxl-8 col-lg-10">
                            <div className="login-section">
                                <div className="p-5">
                                    <div className="text-center mb-4">
                                        <img src="/img/logo.png" alt="Logo Reservas Deportivas" height="80" className="mb-3"/>
                                        <h3 className="fw-bold text-dark mb-2">REGISTRO DE USUARIO</h3>
                                        <p className="text-muted">Completa el formulario para crear tu cuenta</p>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="cedula" className="form-label fw-semibold text-dark">
                                                    Cédula *
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    id="cedula"
                                                    name="cedula"
                                                    value={formData.cedula}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="nombre" className="form-label fw-semibold text-dark">
                                                    Nombre Completo *
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    id="nombre"
                                                    name="nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label fw-semibold text-dark">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="usuario" className="form-label fw-semibold text-dark">
                                                    Usuario *
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    id="usuario"
                                                    name="usuario"
                                                    value={formData.usuario}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="contraseña" className="form-label fw-semibold text-dark">
                                                    Contraseña *
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control form-control-lg"
                                                    id="contraseña"
                                                    name="contraseña"
                                                    value={formData.contraseña}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="rol" className="form-label fw-semibold text-dark">
                                                Rol *
                                            </label>
                                            <select
                                                className="form-select form-select-lg"
                                                id="rol"
                                                name="rol"
                                                value={formData.rol}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="USER">Usuario Normal</option>
                                                <option value="OPERATOR">Operador</option>
                                                <option value="ADMIN">Administrador</option>
                                            </select>
                                        </div>

                                        <div className="d-grid gap-2">
                                            <button type="submit" className="btn btn-primary login-btn fw-semibold">
                                                <i className="material-icons">person_add</i> REGISTRAR USUARIO
                                            </button>
                                            <Link to="/login" className="btn btn-secondary btn-lg">
                                                Volver al Login
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;