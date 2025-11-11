const API_BASE_URL = 'http://localhost:8095/api';

class ApiService {
    static async request(url, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(url) {
        return this.request(url);
    }

    static async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
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

export { ApiService, SessionHelper };