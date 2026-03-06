// perfil-paciente.js
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarDatosPerfil();
    cargarProximasCitas();
    cargarEstadisticas();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

async function cargarDatosPerfil() {
    try {
        const data = await fetchAPI('/auth/perfil');
        
        if (data.success) {
            const user = data.usuario;
            document.getElementById('nombreUsuario').textContent = user.nombre;
            document.getElementById('emailUsuario').textContent = user.email;
            
            // Guardar datos actualizados
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            cerrarSesion();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarProximasCitas() {
    try {
        const data = await fetchAPI('/citas?estado=pendiente&estado=confirmada');
        
        const container = document.getElementById('proximasCitas');
        
        if (data.success && data.data && data.data.length > 0) {
            let html = '<div style="display: grid; gap: 15px;">';
            
            data.data.slice(0, 3).forEach(cita => {
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
            
            if (data.data.length > 3) {
                html += `<p style="text-align: center; margin-top: 15px;"><a href="mis-citas.html" style="color: var(--pastel-dark);">Ver todas (${data.data.length} citas)</a></p>`;
            }
            
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; background: var(--pastel-light); border-radius: 15px;">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; color: var(--pastel-medium); margin-bottom: 10px;"></i>
                    <p style="color: var(--text-light);">No tienes citas programadas</p>
                    <a href="agendar-cita.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: var(--pastel-medium); color: white; text-decoration: none; border-radius: 25px;">
                        Agendar primera cita
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
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
        console.error('Error:', error);
    }
}

// Hover effects para las tarjetas de funcionalidades
document.querySelectorAll('.funcionalidad-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 8px 25px var(--shadow-color)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 4px 15px var(--shadow-color)';
    });
});

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    cerrarSesion();
});