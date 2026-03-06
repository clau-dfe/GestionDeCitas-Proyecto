// mis-citas.js
let todasLasCitas = [];
let filtroActual = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarCitas();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

async function cargarCitas() {
    try {
        const data = await fetchAPI('/citas');
        
        if (data.success) {
            todasLasCitas = data.data || [];
            mostrarCitas();
        } else {
            mostrarError('Error al cargar citas');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión');
    }
}

function mostrarCitas() {
    const container = document.getElementById('citasContainer');
    
    // Filtrar citas según el filtro actual
    let citasAMostrar = todasLasCitas;
    if (filtroActual !== 'todas') {
        citasAMostrar = todasLasCitas.filter(c => c.estado === filtroActual);
    }
    
    if (citasAMostrar.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 15px;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--pastel-medium); margin-bottom: 15px;"></i>
                <p style="color: var(--text-light);">No tienes citas ${filtroActual !== 'todas' ? filtroActual : ''}</p>
                <a href="agendar-cita.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: var(--pastel-medium); color: white; text-decoration: none; border-radius: 25px;">Agendar primera cita</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    citasAMostrar.forEach(cita => {
        const fecha = new Date(cita.fecha).toLocaleDateString('es-ES');
        const estadoColor = {
            'pendiente': '#ffc107',
            'confirmada': '#28a745',
            'completada': '#17a2b8',
            'cancelada': '#dc3545'
        }[cita.estado] || '#6c757d';
        
        html += `
            <div class="cita-card" style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 10px var(--shadow-color); border-left: 5px solid ${estadoColor};">
                <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap;">
                    <div>
                        <h3 style="margin-bottom: 10px; color: var(--text-dark);">
                            ${cita.tipoConsulta || 'Consulta'} - ${fecha} a las ${cita.hora}
                        </h3>
                        <p><strong>Dermatólogo:</strong> Dr(a). ${cita.dermatologo?.nombre || 'No especificado'}</p>
                        <p><strong>Motivo:</strong> ${cita.motivo}</p>
                        ${cita.diagnostico ? `<p><strong>Diagnóstico:</strong> ${cita.diagnostico}</p>` : ''}
                        ${cita.tratamiento ? `<p><strong>Tratamiento:</strong> ${cita.tratamiento}</p>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <span style="background: ${estadoColor}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; display: inline-block; margin-bottom: 10px;">
                            ${cita.estado.toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                    ${cita.estado === 'pendiente' || cita.estado === 'confirmada' ? `
                        <button onclick="cancelarCita('${cita.id}')" style="padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 20px; cursor: pointer;">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                    ${cita.estado === 'pendiente' ? `
                        <button onclick="reprogramarCita('${cita.id}')" style="padding: 8px 20px; background: var(--pastel-medium); color: white; border: none; border-radius: 20px; cursor: pointer;">
                            <i class="fas fa-calendar-alt"></i> Reprogramar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filtrarCitas(estado) {
    filtroActual = estado;
    
    // Actualizar botones activos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'var(--pastel-light)';
        btn.style.color = 'var(--text-dark)';
    });
    
    const btnActivo = event.target;
    btnActivo.style.background = 'var(--pastel-medium)';
    btnActivo.style.color = 'white';
    
    mostrarCitas();
}

async function cancelarCita(citaId) {
    if (!confirm('¿Estás segura de cancelar esta cita?')) return;
    
    try {
        const data = await fetchAPI(`/citas/${citaId}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            alert('✅ Cita cancelada exitosamente');
            cargarCitas(); // Recargar la lista
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cancelar la cita');
    }
}

function reprogramarCita(citaId) {
    // Guardar el ID de la cita en sessionStorage para reprogramar
    sessionStorage.setItem('citaReprogramar', citaId);
    window.location.href = 'agendar-cita.html?reprogramar=true';
}

function mostrarError(texto) {
    document.getElementById('citasContainer').innerHTML = `
        <div style="text-align: center; padding: 40px; background: #f8d7da; border-radius: 15px; color: #721c24;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <p>${texto}</p>
        </div>
    `;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});