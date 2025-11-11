import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Menu from './components/Menu';
import Usuarios from './components/Usuarios';
import Canchas from './components/Canchas';
import Reservas from './components/Reservas';
import FormUsuarios from './components/FormUsuarios';
import FormCanchas from './components/FormCanchas';
import FormReservas from './components/FormReservas';
import './App.css';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem('currentUser') !== null;
    return isLoggedIn ? children : <Navigate to="/login" />;
};

// Componente para rutas públicas (login/register)
const PublicRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem('currentUser') !== null;
    return !isLoggedIn ? children : <Navigate to="/menu" />;
};

function App() {
    const location = useLocation();

    return (
        <div className="App">
            <Routes location={location}>
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Rutas públicas */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/registro" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />

                {/* Rutas protegidas */}
                <Route path="/menu" element={
                    <ProtectedRoute>
                        <Menu />
                    </ProtectedRoute>
                } />
                <Route path="/usuarios" element={
                    <ProtectedRoute>
                        <Usuarios />
                    </ProtectedRoute>
                } />
                <Route path="/canchas" element={
                    <ProtectedRoute>
                        <Canchas />
                    </ProtectedRoute>
                } />
                <Route path="/reservas" element={
                    <ProtectedRoute>
                        <Reservas />
                    </ProtectedRoute>
                } />
                <Route path="/form-usuarios" element={
                    <ProtectedRoute>
                        <FormUsuarios />
                    </ProtectedRoute>
                } />
                <Route path="/form-canchas" element={
                    <ProtectedRoute>
                        <FormCanchas />
                    </ProtectedRoute>
                } />
                <Route path="/form-reservas" element={
                    <ProtectedRoute>
                        <FormReservas />
                    </ProtectedRoute>
                } />
            </Routes>
        </div>
    );
}

export default App;