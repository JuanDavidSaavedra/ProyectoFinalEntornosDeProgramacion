// Verificar si estamos en una página que necesita este script
if (document.getElementById('tablaReservas') || window.location.pathname.includes('form_reservas.html')) {

    document.addEventListener('DOMContentLoaded', function() {
        if (!SessionHelper.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        if (document.getElementById('tablaReservas')) {
            cargarReservas();
        }

        const reservaForm = document.getElementById('reservaForm');
        if (reservaForm) {
            const urlParams = new URLSearchParams(window.location.search);
            const reservaId = urlParams.get('id');

            if (reservaId) {
                const formTitle = document.getElementById('formTitle');
                if (formTitle) formTitle.textContent = '📅 Editar Reserva';
                cargarReserva(reservaId);
            }

            reservaForm.addEventListener('submit', guardarReserva);
        }
    });
}

function formatDateDisplay(fechaStr) {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length !== 3) return fechaStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

async function cargarReservas() {
    try {
        const response = await RequestHelper.get('/reservas');

        if (!response || !response.data) {
            console.error('Respuesta inválida:', response);
            return;
        }

        const reservas = response.data;
        const tbody = document.getElementById('tablaReservas');

        if (!tbody) {
            console.error('No se encontró el elemento tablaReservas');
            return;
        }

        tbody.innerHTML = '';

        const currentUser = SessionHelper.getUser();
        const isAdmin = SessionHelper.isAdmin();

        // Para usuarios normales, mostrar solo sus reservas
        // Para administradores, mostrar todas
        const reservasFiltradas = isAdmin ? reservas :
            reservas.filter(r => r.usuarioId === currentUser.id);

        reservasFiltradas.forEach(reserva => {
            const tr = document.createElement('tr');

            // TODOS los usuarios pueden editar/eliminar SUS PROPIAS reservas
            // Los administradores pueden editar/eliminar TODAS las reservas
            let accionesHTML;
            if (isAdmin || reserva.usuarioId === currentUser.id) {
                accionesHTML = `
                    <a href="form_reservas.html?id=${reserva.id}" class="btn btn-sm btn-warning">Editar</a>
                    <button onclick="eliminarReserva(${reserva.id})" class="btn btn-sm btn-danger">Eliminar</button>
                `;
            } else {
                accionesHTML = '<span class="text-muted">Solo lectura</span>';
            }

            const fechaDisplay = reserva.fecha ? formatDateDisplay(reserva.fecha) : '';

            let badgeClass = 'bg-secondary';
            if (reserva.estado === 'ACTIVA') badgeClass = 'bg-success';
            if (reserva.estado === 'FINALIZADA') badgeClass = 'bg-primary';
            if (reserva.estado === 'CANCELADA') badgeClass = 'bg-danger';

            tr.innerHTML = `
                <td>${reserva.id}</td>
                <td>${reserva.nombreUsuario || ''}</td>
                <td>${reserva.nombreCancha || ''}</td>
                <td>${fechaDisplay}</td>
                <td>${formatTime(reserva.horaInicio || '')}</td>
                <td>${formatTime(reserva.horaFin || '')}</td>
                <td><span class="badge ${badgeClass}">${reserva.estado || ''}</span></td>
                <td>${accionesHTML}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        alert('Error al cargar reservas: ' + error.message);
    }
}

async function eliminarReserva(id) {
    if (confirm('¿Está seguro de eliminar esta reserva?')) {
        try {
            await RequestHelper.delete(`/reservas/${id}`);
            cargarReservas();
        } catch (error) {
            alert('Error al eliminar reserva: ' + error.message);
        }
    }
}

// ... código anterior ...

async function cargarUsuariosYCanchas() {
    try {
        const currentUser = SessionHelper.getUser();
        const isAdmin = SessionHelper.isAdmin();

        // Cargar usuarios (solo admin puede ver todos, usuarios normales solo ven su usuario)
        const usuariosResponse = await RequestHelper.get('/usuarios');
        const usuariosSelect = document.getElementById('usuarioId');

        if (usuariosSelect) {
            usuariosSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
            usuariosResponse.data.forEach(usuario => {
                if (!isAdmin && usuario.id !== currentUser.id) {
                    return;
                }
                const option = document.createElement('option');
                option.value = usuario.id;
                option.textContent = `${usuario.nombre} (${usuario.usuario || ''})`;
                usuariosSelect.appendChild(option);
            });

            if (!isAdmin) {
                usuariosSelect.value = currentUser.id;
                usuariosSelect.disabled = true;
            }
        }

        // Cargar canchas activas
        const canchasResponse = await RequestHelper.get('/canchas');
        const canchasSelect = document.getElementById('canchaId');

        if (canchasSelect) {
            canchasSelect.innerHTML = '<option value="">Seleccionar cancha</option>';
            canchasResponse.data.forEach(cancha => {
                if (cancha.estado === 'ACTIVA') {
                    const option = document.createElement('option');
                    option.value = cancha.id;
                    option.textContent = `${cancha.nombre} - ${cancha.deporte} (Capacidad: ${cancha.capacidad} personas) - $${cancha.precioHora?.toLocaleString?.() || cancha.precioHora}/hora`;
                    option.setAttribute('data-capacidad', cancha.capacidad);
                    option.setAttribute('data-hora-apertura', cancha.horaApertura);
                    option.setAttribute('data-hora-cierre', cancha.horaCierre);
                    canchasSelect.appendChild(option);
                }
            });

            // Evento para mostrar información del horario de atención y cupos
            canchasSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const horaApertura = selectedOption.getAttribute('data-hora-apertura');
                const horaCierre = selectedOption.getAttribute('data-hora-cierre');

                if (horaApertura && horaCierre) {
                    const horarioInfo = document.getElementById('horarioAtencionInfo');
                    if (horarioInfo) {
                        horarioInfo.textContent = `Horario de atención: ${formatTime(horaApertura)} - ${formatTime(horaCierre)}`;
                        horarioInfo.style.display = 'block';
                    }
                }

                // Actualizar cupos disponibles cuando se cambia la cancha
                actualizarCuposDisponibles();
            });
        }

        // Agregar event listeners para fecha y hora
        const fechaInput = document.getElementById('fecha');
        const horaInicioInput = document.getElementById('horaInicio');
        const horaFinInput = document.getElementById('horaFin');

        if (fechaInput) fechaInput.addEventListener('change', actualizarCuposDisponibles);
        if (horaInicioInput) horaInicioInput.addEventListener('change', actualizarCuposDisponibles);
        if (horaFinInput) horaFinInput.addEventListener('change', actualizarCuposDisponibles);

    } catch (error) {
        alert('Error al cargar datos: ' + error.message);
    }
}

// Nueva función para actualizar cupos disponibles
async function actualizarCuposDisponibles() {
    const canchaId = document.getElementById('canchaId').value;
    const fecha = document.getElementById('fecha').value;
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;

    // Validar que todos los campos estén llenos
    if (!canchaId || !fecha || !horaInicio || !horaFin) {
        document.getElementById('cuposDisponiblesInfo').style.display = 'none';
        return;
    }

    try {
        const response = await RequestHelper.get(
            `/reservas/disponibilidad?canchaId=${canchaId}&fecha=${fecha}&horaInicio=${horaInicio}&horaFin=${horaFin}`
        );

        if (response && response.data) {
            const cuposInfo = document.getElementById('cuposDisponiblesInfo');
            const cuposDisponibles = response.data.cuposDisponibles;
            const capacidadTotal = response.data.capacidadTotal;
            const reservasActivas = response.data.reservasActivas;

            if (cuposDisponibles > 0) {
                cuposInfo.className = 'alert alert-success';
                cuposInfo.innerHTML = `
                    <strong>✅ Cupos disponibles:</strong> ${cuposDisponibles} de ${capacidadTotal}<br>
                    <small>Reservas activas en este horario: ${reservasActivas}</small>
                `;
            } else {
                cuposInfo.className = 'alert alert-danger';
                cuposInfo.innerHTML = `
                    <strong>❌ No hay cupos disponibles</strong><br>
                    <small>Capacidad total: ${capacidadTotal} personas | Reservas activas: ${reservasActivas}</small>
                `;
            }
            cuposInfo.style.display = 'block';
        }
    } catch (error) {
        console.error('Error al obtener cupos disponibles:', error);
        document.getElementById('cuposDisponiblesInfo').style.display = 'none';
    }
}

async function cargarReserva(id) {
    try {
        const response = await RequestHelper.get(`/reservas/${id}`);
        if (!response || !response.data) throw new Error('Reserva no encontrada');
        const reserva = response.data;

        const currentUser = SessionHelper.getUser();
        const isAdmin = SessionHelper.isAdmin();

        // Verificar permisos: solo admin o el dueño de la reserva puede editarla
        if (!isAdmin && reserva.usuarioId !== currentUser.id) {
            alert('No tiene permisos para editar esta reserva');
            window.location.href = 'reservas.html';
            return;
        }

        document.getElementById('reservaId').value = reserva.id;

        // Si no es admin, deshabilitar selección de usuario
        const usuarioSelect = document.getElementById('usuarioId');
        if (usuarioSelect && !isAdmin) {
            usuarioSelect.disabled = true;
        }

        document.getElementById('usuarioId').value = reserva.usuarioId;
        document.getElementById('canchaId').value = reserva.canchaId;
        document.getElementById('fecha').value = reserva.fecha;
        document.getElementById('horaInicio').value = reserva.horaInicio;
        document.getElementById('horaFin').value = reserva.horaFin;
        document.getElementById('estado').value = reserva.estado || 'ACTIVA';

        // Cargar información del horario de atención de la cancha seleccionada
        if (reserva.canchaId) {
            const canchaResponse = await RequestHelper.get(`/canchas/${reserva.canchaId}`);
            if (canchaResponse && canchaResponse.data) {
                const cancha = canchaResponse.data;
                const horarioInfo = document.getElementById('horarioAtencionInfo');
                if (horarioInfo) {
                    horarioInfo.textContent = `Horario de atención: ${formatTime(cancha.horaApertura)} - ${formatTime(cancha.horaCierre)}`;
                    horarioInfo.style.display = 'block';
                }
            }
        }
    } catch (error) {
        alert('Error al cargar reserva: ' + error.message);
    }
}

async function guardarReserva(e) {
    e.preventDefault();

    const reservaData = {
        usuarioId: parseInt(document.getElementById('usuarioId').value),
        canchaId: parseInt(document.getElementById('canchaId').value),
        fecha: document.getElementById('fecha').value,
        horaInicio: document.getElementById('horaInicio').value,
        horaFin: document.getElementById('horaFin').value,
        estado: document.getElementById('estado') ? document.getElementById('estado').value : 'ACTIVA'
    };

    const reservaId = document.getElementById('reservaId').value;

    try {
        if (reservaId) {
            await RequestHelper.put(`/reservas/${reservaId}`, reservaData);
            alert('Reserva actualizada correctamente');
        } else {
            await RequestHelper.post('/reservas', reservaData);
            alert('Reserva creada correctamente');
        }

        if (window.top !== window.self) {
            window.top.document.querySelector('iframe[name="myFrame"]').src = 'reservas.html';
        } else {
            if (document.getElementById('tablaReservas')) {
                cargarReservas();
            } else {
                window.location.href = 'reservas.html';
            }
        }
    } catch (error) {
        if (error.message.includes('Capacidad máxima') || error.message.includes('horario de atención')) {
            alert(error.message);
        } else {
            alert('Error al guardar reserva: ' + error.message);
        }
    }
}

// Solo cargar usuarios y canchas si estamos en el formulario de reservas
if (document.getElementById('reservaForm')) {
    document.addEventListener('DOMContentLoaded', cargarUsuariosYCanchas);
}

// Verificación automática de estados (cada 10 segundos)
async function verificarYActualizarReservas() {
    try {
        const response = await RequestHelper.get('/reservas');
        if (!response || !response.data) return;
        const reservas = response.data;

        const ahora = new Date();
        let huboCambios = false;

        for (const reserva of reservas) {
            if (!reserva.estado) continue;
            if (reserva.estado === 'ACTIVA') {
                const horaFin = reserva.horaFin ? reserva.horaFin : '00:00:00';
                const iso = `${reserva.fecha}T${horaFin}`;
                const fechaHoraFin = new Date(iso);

                if (ahora > fechaHoraFin) {
                    try {
                        const payload = {
                            usuarioId: reserva.usuarioId,
                            canchaId: reserva.canchaId,
                            fecha: reserva.fecha,
                            horaInicio: reserva.horaInicio,
                            horaFin: reserva.horaFin,
                            estado: 'FINALIZADA'
                        };
                        await RequestHelper.put(`/reservas/${reserva.id}`, payload);
                        huboCambios = true;
                    } catch (err) {
                        console.error(`Error actualizando reserva ${reserva.id}:`, err);
                    }
                }
            }
        }

        if (huboCambios && document.getElementById('tablaReservas')) {
            cargarReservas();
        }
    } catch (error) {
        console.error('Error al verificar reservas:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarYActualizarReservas();
    setInterval(verificarYActualizarReservas, 10000);
})