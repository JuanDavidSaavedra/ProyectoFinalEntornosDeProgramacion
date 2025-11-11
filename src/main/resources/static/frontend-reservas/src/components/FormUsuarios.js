import React, {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {ApiService} from '../services/api';
import Navbar from './Navbar';
import './FormUsuarios.css';

const FormUsuarios = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const usuarioId = searchParams.get('id');
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        email: '',
        usuario: '',
        contraseña: '',
        rol: 'USER'
    });

    useEffect(() => {
        if (usuarioId) {
            cargarUsuario(usuarioId);
        }
    }, [usuarioId]);

    const cargarUsuario = async (id) => {
        try {
            const response = await ApiService.get(`/usuarios/${id}`);
            if (response.success) {
                const usuario = response.data;
                setFormData({
                    cedula: usuario.cedula,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    usuario: usuario.usuario,
                    contraseña: usuario.contraseña,
                    rol: usuario.rol
                });
            } else {
                alert(response.message);
            }
        } catch (error) {
            alert('Error al cargar usuario: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;
            if (usuarioId) {
                response = await ApiService.put(`/usuarios/${usuarioId}`, formData);
            } else {
                response = await ApiService.post('/usuarios', formData);
            }

            if (response.success) {
                alert(usuarioId ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
                navigate('/usuarios');
            } else {
                alert(response.message);
            }
        } catch (error) {
            if (error.message.includes('Ya existe un usuario')) {
                alert(error.message);
            } else {
                alert('Error al guardar usuario: ' + error.message);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="page-fade-in">
            <Navbar/>
            <div className="container page-container">
                <div className="card shadow-sm fade-in">
                    <div className="card-header bg-primary">
                        <h2 className="mb-0 text-white">
                            {usuarioId ? '👥 Editar Usuario' : '👥 Agregar Usuario'}
                        </h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <input type="hidden" id="usuarioId" value={usuarioId || ''}/>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="cedula" className="form-label">Cédula *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="cedula"
                                        name="cedula"
                                        value={formData.cedula}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="nombre" className="form-label">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="email" className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="usuario" className="form-label">Nombre de Usuario *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="usuario"
                                        name="usuario"
                                        value={formData.usuario}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="contraseña" className="form-label">Contraseña *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="contraseña"
                                        name="contraseña"
                                        value={formData.contraseña}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="rol" className="form-label">Rol *</label>
                                    <select
                                        className="form-select"
                                        id="rol"
                                        name="rol"
                                        value={formData.rol}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccionar rol</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="OPERATOR">Operador</option>
                                        <option value="USER">Usuario</option>
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success">Guardar</button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/usuarios')}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormUsuarios;