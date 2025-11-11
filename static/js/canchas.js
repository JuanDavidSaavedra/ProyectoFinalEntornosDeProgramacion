// Verificar si estamos en una página que necesita este script
if (document.getElementById('tablaCanchas') || window.location.pathname.includes('form_canchas.html')) {

    document.addEventListener('DOMContentLoaded', function() {
        if (!SessionHelper.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        if (document.getElementById('tablaCanchas')) {
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

            cargarCanchas();
        }

        const canchaForm = document.getElementById('canchaForm');
        if (canchaForm) {
            const urlParams = new URLSearchParams(window.location.search);
            const canchaId = urlParams.get('id');

            if (canchaId) {
                const formTitle = document.getElementById('formTitle');
                if (formTitle) formTitle.textContent = '🏟️ Editar Cancha';
                cargarCancha(canchaId);
            }

            canchaForm.addEventListener('submit', guardarCancha);
        }
    });
}

function formatTime(timeString) {
    if (!timeString) return '';

    if (timeString.includes('a. m.') || timeString.includes('p. m.')) {
        return timeString;
    }

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'p. m.' : 'a. m.';
    const hour12 = hour % 12 || 12;
    const minutesPart = minutes ? `:${minutes}` : '';
    return `${hour12}${minutesPart} ${ampm}`;
}

async function cargarCanchas() {
    try {
        const response = await RequestHelper.get('/canchas');

        if (!response || !response.data) {
            console.error('Respuesta inválida:', response);
            return;
        }

        const canchas = response.data;
        const tbody = document.getElementById('tablaCanchas');

        if (!tbody) {
            console.error('No se encontró el elemento tablaCanchas');
            return;
        }

        tbody.innerHTML = '';

        const isAdmin = SessionHelper.isAdmin();

        canchas.forEach(cancha => {
            const tr = document.createElement('tr');

            let accionesHTML;
            if (isAdmin) {
                accionesHTML = `
                    <a href="form_canchas.html?id=${cancha.id}" class="btn btn-sm btn-warning">Editar</a>
                    <button onclick="eliminarCancha(${cancha.id})" class="btn btn-sm btn-danger">Eliminar</button>
                `;
            } else {
                accionesHTML = '<span class="text-muted">Solo lectura</span>';
            }

            tr.innerHTML = `
                <td>${cancha.id}</td>
                <td>${cancha.nombre}</td>
                <td><span class="badge bg-primary">${cancha.deporte}</span></td>
                <td>${cancha.ubicacion}</td>
                <td>$${cancha.precioHora.toLocaleString()}</td>
                <td>${cancha.capacidad} personas</td>
                <td>${formatTime(cancha.horaApertura)} - ${formatTime(cancha.horaCierre)}</td>
                <td><span class="badge ${cancha.estado === 'ACTIVA' ? 'bg-success' : 'bg-secondary'}">${cancha.estado}</span></td>
                <td>${accionesHTML}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar canchas:', error);
        alert('Error al cargar canchas: ' + error.message);
    }
}

async function eliminarCancha(id) {
    if (confirm('¿Está seguro de eliminar esta cancha? Se eliminarán también todas las reservas asociadas.')) {
        try {
            await RequestHelper.delete(`/canchas/${id}`);
            await cargarCanchas();
        } catch (error) {
            alert('Error al eliminar cancha: ' + error.message);
        }
    }
}

async function cargarCancha(id) {
    try {
        const response = await RequestHelper.get(`/canchas/${id}`);
        const cancha = response.data;

        document.getElementById('canchaId').value = cancha.id;
        document.getElementById('nombre').value = cancha.nombre;
        document.getElementById('deporte').value = cancha.deporte;
        document.getElementById('ubicacion').value = cancha.ubicacion;
        document.getElementById('precioHora').value = cancha.precioHora;
        document.getElementById('capacidad').value = cancha.capacidad;
        document.getElementById('horaApertura').value = cancha.horaApertura;
        document.getElementById('horaCierre').value = cancha.horaCierre;
        document.getElementById('estado').value = cancha.estado;
    } catch (error) {
        alert('Error al cargar cancha: ' + error.message);
    }
}

async function guardarCancha(e) {
    e.preventDefault();

    const canchaData = {
        nombre: document.getElementById('nombre').value,
        deporte: document.getElementById('deporte').value,
        ubicacion: document.getElementById('ubicacion').value,
        precioHora: parseFloat(document.getElementById('precioHora').value),
        capacidad: parseInt(document.getElementById('capacidad').value),
        horaApertura: document.getElementById('horaApertura').value,
        horaCierre: document.getElementById('horaCierre').value,
        estado: document.getElementById('estado').value
    };

    const canchaId = document.getElementById('canchaId').value;

    try {
        if (canchaId) {
            canchaData.id = parseInt(canchaId);
            await RequestHelper.put(`/canchas/${canchaId}`, canchaData);
            alert('Cancha actualizada correctamente');
        } else {
            await RequestHelper.post('/canchas', canchaData);
            alert('Cancha creada correctamente');
        }

        window.location.href = 'canchas.html';
    } catch (error) {
        alert('Error al guardar cancha: ' + error.message);
    }
}
