import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            setCurrentUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    const login = async (usuario, contraseña) => {
        try {
            const response = await authAPI.login({ usuario, contraseña });

            if (response.data.success) {
                const { token, usuario } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(usuario));
                setCurrentUser(usuario);
                return { success: true };
            } else {
                return { success: false, message: response.data.mensaje };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error en el servidor'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);

            if (response.data.success) {
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error en el servidor'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    const isAdmin = () => {
        return currentUser?.rol === 'ADMIN';
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};