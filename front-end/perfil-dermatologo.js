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
        const data = await fetchAPI('/citas');
        if (data.success && data.data && data.data.length > 0) {
            const proximas = data.data.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada');
            if (proximas.length === 0) {
                container.innerHTML = '<p style="text-align:center; color: var(--text-light);">No tienes citas pendientes.</p>';
                return;
            }
            let html = '<div style="display: grid; gap: 15px;">';
            proximas.slice(0, 3).forEach(cita => {
                const fecha = new Date(cita.fecha).toLocaleDateString('es-ES');
                html += `
                    <div style="background: var(--pastel-light); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p><strong>${fecha} - ${cita.hora}</strong></p>
                            <p style="color: var(--text-light); font-size: 0.9rem;">Paciente: ${cita.paciente?.nombre || 'Pendiente'}</p>
                        </div>
                        <span style="background: ${cita.estado === 'confirmada' ? '#28a745' : '#ffc107'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
                            ${cita.estado}
                        </span>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="text-align:center; color: var(--text-light);">No tienes citas pendientes.</p>';
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