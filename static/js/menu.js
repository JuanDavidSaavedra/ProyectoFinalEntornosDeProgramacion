// Verificar si estamos en la página del menú
if (window.location.pathname.includes('menu.html') || document.getElementById('userInfo')) {

    document.addEventListener('DOMContentLoaded', function() {
        // Verificar si el usuario está logueado
        if (!SessionHelper.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // Mostrar información del usuario
        const user = SessionHelper.getUser();
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement && user) {
            userInfoElement.textContent = `Bienvenido, ${user.nombre} (${user.rol})`;
        }

        // Configurar el botón de cerrar sesión
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', cerrarSesion);
        }
    });
}

// Función global para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        SessionHelper.clearUser();
        window.location.href = 'index.html';
    }
}

// También hacer la función disponible globalmente
window.cerrarSesion = cerrarSesion;