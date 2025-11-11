// Verificar si estamos en la página de login
if (document.getElementById('loginForm') || window.location.pathname.includes('index.html')) {

    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');

        // Si el usuario ya está logueado, redirigir al menú
        if (SessionHelper.isLoggedIn() && !window.location.pathname.includes('index.html')) {
            window.location.href = 'menu.html';
            return;
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const usuario = document.getElementById('icon_user').value;
                const password = document.getElementById('icon_pass').value;

                if (!usuario || !password) {
                    alert('Por favor, complete todos los campos');
                    return;
                }

                try {
                    // Buscar usuario por nombre de usuario
                    const usuarios = await RequestHelper.get('/usuarios');
                    const user = usuarios.data.find(u => u.usuario === usuario && u.contraseña === password);

                    if (user) {
                        SessionHelper.setUser(user);
                        window.location.href = 'menu.html';
                    } else {
                        alert('Usuario o contraseña incorrectos');
                    }
                } catch (error) {
                    console.error('Error en login:', error);
                    alert('Error al iniciar sesión: ' + error.message);
                }
            });
        }
    });
}