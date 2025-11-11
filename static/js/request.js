const API_BASE_URL = 'http://localhost:8095/api';

class RequestHelper {
    static async get(url) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }

    static async post(url, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }

    static async put(url, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }

    static async delete(url) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
}

// Helper para manejar sesiones
class SessionHelper {
    static setUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static clearUser() {
        localStorage.removeItem('currentUser');
    }

    static isAdmin() {
        const user = this.getUser();
        return user && (user.rol === 'ADMIN' || user.rol === 'OPERATOR');
    }

    static isLoggedIn() {
        return this.getUser() !== null;
    }

    static getUserId() {
        const user = this.getUser();
        return user ? user.id : null;
    }
}

// Función para verificar autenticación antes de cada petición
RequestHelper.addAuthCheck = function() {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        // Si estamos en la página de login, no aplicar la verificación de autenticación
        if (window.location.pathname.includes('index.html')) {
            return originalFetch.apply(this, args);
        }

        // Para otras páginas, verificar autenticación para peticiones a la API
        const url = args[0];
        if (url && url.includes(API_BASE_URL) && !SessionHelper.isLoggedIn()) {
            console.warn('Usuario no autenticado, redirigiendo al login');
            window.location.href = 'index.html';
            return Promise.reject(new Error('Usuario no autenticado'));
        }
        return originalFetch.apply(this, args);
    };
};

// Ejecutar la verificación de autenticación
RequestHelper.addAuthCheck();