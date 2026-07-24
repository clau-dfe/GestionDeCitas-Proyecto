// perfil-dermatologo.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    cargarDatosPerfil();
    cargarProximasCitas();
    cargarEstadisticas();

    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Menú toggle
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });
});

async function cargarDatosPerfil() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('nombreDermatologo').textContent = user.nombre || 'Dermatólogo';
            document.getElementById('emailDermatologo').textContent = user.email || '';
            document.getElementById('especialidadDermatologo').textContent = '🩺 ' + (user.especialidad || 'Especialidad no registrada');
        }

        const data = await fetchAPI('/auth/perfil');
        if (data.success) {
            const usuario = data.usuario;
            document.getElementById('nombreDermatologo').textContent = usuario.nombre;
            document.getElementById('emailDermatologo').textContent = usuario.email;
            document.getElementById('especialidadDermatologo').textContent = '🩺 ' + (usuario.especialidad || 'Especialidad no registrada');
            localStorage.setItem('user', JSON.stringify(usuario));
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}

async function cargarProximasCitas() {
    const container = document.getElementById('proximasCitas');
    try {
        // ✅ Obtener todas las citas (no solo pendientes)
        const data = await fetchAPI('/citas');
        if (data.success && data.data && data.data.length > 0) {
            // ✅ Mostrar todas las citas, no solo pendientes
            const citas = data.data;
            if (citas.length === 0) {
                container.innerHTML = '<p style="text-align:center; color: var(--text-light);">No tienes citas.</p>';
                return;
            }
            let html = '<div style="display: grid; gap: 15px;">';
            citas.slice(0, 5).forEach(cita => {
                const fecha = new Date(cita.fecha).toLocaleDateString('es-ES');
                const estadoColor = {
                    'pendiente': '#ffc107',
                    'confirmada': '#28a745',
                    'completada': '#17a2b8',
                    'cancelada': '#dc3545'
                }[cita.estado] || '#6c757d';
                
                html += `
                    <div style="background: var(--pastel-light); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid ${estadoColor};">
                        <div>
                            <p><strong>${fecha} - ${cita.hora}</strong></p>
                            <p style="color: var(--text-light); font-size: 0.9rem;">Paciente: ${cita.paciente?.nombre || 'No disponible'}</p>
                            <p style="color: var(--text-light); font-size: 0.9rem;">Motivo: ${cita.motivo}</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: ${estadoColor}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
                                ${cita.estado.toUpperCase()}
                            </span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="text-align:center; color: var(--text-light);">No tienes citas.</p>';
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
        container.innerHTML = '<p style="text-align:center; color: red;">Error al cargar citas.</p>';
    }
}

async function cargarEstadisticas() {
    try {
        const data = await fetchAPI('/citas');
        if (data.success && data.data) {
            const total = data.data.length;
            const pendientes = data.data.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length;
            const completadas = data.data.filter(c => c.estado === 'completada').length;
            document.getElementById('totalCitas').textContent = total;
            document.getElementById('citasPendientes').textContent = pendientes;
            document.getElementById('citasCompletadas').textContent = completadas;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}