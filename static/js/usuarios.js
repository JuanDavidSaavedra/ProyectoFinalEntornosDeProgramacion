// Verificar si estamos en una página que necesita este script
if (document.getElementById('tablaUsuarios') || window.location.pathname.includes('form_usuarios.html')) {

    document.addEventListener('DOMContentLoaded', function() {
        if (!SessionHelper.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        if (document.getElementById('tablaUsuarios')) {
            const isAdmin = SessionHelper.isAdmin();

            const adminActions = document.getElementById('adminActions');
            const actionsHeader = document.getElementById('actionsHeader');
            if (!isAdmin) {
                if (adminActions) adminActions.style.display = 'none';
                if (actionsHeader) actionsHeader.style.display = 'none';
            } else {
                if (adminActions) adminActions.style.display = 'block';
                if (actionsHeader) actionsHeader.style.display = 'table-cell';
            }

            cargarUsuarios();
        }

        // Configurar formulario si existe
        const usuarioForm = document.getElementById('usuarioForm');
        if (usuarioForm) {
            const urlParams = new URLSearchParams(window.location.search);
            const usuarioId = urlParams.get('id');

            if (usuarioId) {
                const formTitle = document.getElementById('formTitle');
                if (formTitle) formTitle.textContent = '👥 Editar Usuario';
                cargarUsuario(usuarioId);
            }

            usuarioForm.addEventListener('submit', guardarUsuario);
        }
    });
}

async function cargarUsuarios() {
    try {
        const response = await RequestHelper.get('/usuarios');

        if (!response || !response.data) {
            console.error('Respuesta inválida:', response);
            return;
        }

        const usuarios = response.data;
        const tbody = document.getElementById('tablaUsuarios');

        if (!tbody) {
            console.error('No se encontró el elemento tablaUsuarios');
            return;
        }

        tbody.innerHTML = '';

        const currentUser = SessionHelper.getUser();
        const isAdmin = SessionHelper.isAdmin();

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');

            let accionesHTML;
            if (isAdmin) {
                accionesHTML = `
                    <a href="form_usuarios.html?id=${usuario.id}" class="btn btn-sm btn-warning">Editar</a>
                    <button onclick="eliminarUsuario(${usuario.id})" class="btn btn-sm btn-danger">Eliminar</button>
                `;
            } else {
                accionesHTML = '<span class="text-muted">Solo lectura</span>';
            }

            let badgeClass = 'bg-secondary';
            if (usuario.rol === 'ADMIN') badgeClass = 'bg-danger';
            else if (usuario.rol === 'OPERATOR') badgeClass = 'bg-warning text-dark';
            else if (usuario.rol === 'USER') badgeClass = 'bg-info';

            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.cedula}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.usuario}</td>
                <td><span class="badge ${badgeClass}">${usuario.rol}</span></td>
                <td>${accionesHTML}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        alert('Error al cargar usuarios: ' + error.message);
    }
}

async function eliminarUsuario(id) {
    if (confirm('¿Está seguro de eliminar este usuario? Se eliminarán también todas las reservas asociadas.')) {
        try {
            await RequestHelper.delete(`/usuarios/${id}`);
            alert('Usuario eliminado correctamente');
            cargarUsuarios();
        } catch (error) {
            alert('Error al eliminar usuario: ' + error.message);
        }
    }
}

async function cargarUsuario(id) {
    try {
        const response = await RequestHelper.get(`/usuarios/${id}`);
        const usuario = response.data;

        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('cedula').value = usuario.cedula;
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('email').value = usuario.email;
        document.getElementById('usuario').value = usuario.usuario;
        document.getElementById('contraseña').value = usuario.contraseña;
        document.getElementById('rol').value = usuario.rol;
    } catch (error) {
        alert('Error al cargar usuario: ' + error.message);
    }
}

async function guardarUsuario(e) {
    e.preventDefault();

    const usuarioData = {
        cedula: document.getElementById('cedula').value,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        usuario: document.getElementById('usuario').value,
        contraseña: document.getElementById('contraseña').value,
        rol: document.getElementById('rol').value
    };

    const usuarioId = document.getElementById('usuarioId').value;

    try {
        if (usuarioId) {
            // Actualizar usuario existente
            await RequestHelper.put(`/usuarios/${usuarioId}`, usuarioData);
            alert('Usuario actualizado correctamente');
        } else {
            // Crear nuevo usuario
            await RequestHelper.post('/usuarios', usuarioData);
            alert('Usuario creado correctamente');
        }

        // Redirigir a la lista de usuarios
        window.location.href = 'usuarios.html';
    } catch (error) {
        // Mostrar mensaje de error específico del backend
        if (error.message.includes('Ya existe un usuario')) {
            alert(error.message);
        } else {
            alert('Error al guardar usuario: ' + error.message);
        }
    }
}
