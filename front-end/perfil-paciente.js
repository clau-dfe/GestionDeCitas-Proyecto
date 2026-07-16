// perfil-paciente.js
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

    // Menú toggle para responsive
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });
});

async function cargarDatosPerfil() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('nombreUsuario').textContent = user.nombre || 'Usuario';
            document.getElementById('emailUsuario').textContent = user.email || '';
        }

        // También podemos traer datos frescos del backend
        const data = await fetchAPI('/auth/perfil');
        if (data.success) {
            const usuario = data.usuario;
            document.getElementById('nombreUsuario').textContent = usuario.nombre;
            document.getElementById('emailUsuario').textContent = usuario.email;
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
                            <p style="color: var(--text-light); font-size: 0.9rem;">Dr(a). ${cita.dermatologo?.nombre || 'Pendiente'}</p>
                        </div>
                        <span style="background: ${cita.estado === 'confirmada' ? '#28a745' : '#ffc107'}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
                            ${cita.estado}
                        </span>
                    </div>
                `;
            });
            html += '</div>';
            if (proximas.length > 3) {
                html += `<p style="text-align:center; margin-top:15px;"><a href="mis-citas.html" style="color: var(--pastel-dark);">Ver todas (${proximas.length} citas)</a></p>`;
            }
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
