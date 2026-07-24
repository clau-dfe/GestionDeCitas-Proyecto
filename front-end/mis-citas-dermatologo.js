// mis-citas-dermatologo.js
let todasLasCitas = [];
let filtroActual = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    cargarCitas();

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

async function cargarCitas() {
    try {
        const data = await fetchAPI('/citas');
        if (data.success && data.data) {
            todasLasCitas = data.data;
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

    let citasAMostrar = todasLasCitas;
    if (filtroActual !== 'todas') {
        citasAMostrar = todasLasCitas.filter(c => c.estado === filtroActual);
    }

    if (citasAMostrar.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 15px;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--pastel-medium);"></i>
                <p style="color: var(--text-light);">No tienes citas ${filtroActual !== 'todas' ? filtroActual : ''}</p>
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

        const estadoTexto = {
            'pendiente': 'PENDIENTE',
            'confirmada': 'CONFIRMADA',
            'completada': 'COMPLETADA',
            'cancelada': 'CANCELADA'
        }[cita.estado] || cita.estado.toUpperCase();

        html += `
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 10px var(--shadow-color); border-left: 5px solid ${estadoColor};">
                <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap;">
                    <div>
                        <h3>${fecha} - ${cita.hora}</h3>
                        <p><strong>Paciente:</strong> ${cita.paciente?.nombre || 'No especificado'}</p>
                        <p><strong>Motivo:</strong> ${cita.motivo}</p>
                        ${cita.diagnostico ? `<p><strong>Diagnóstico:</strong> ${cita.diagnostico}</p>` : ''}
                        ${cita.tratamiento ? `<p><strong>Tratamiento:</strong> ${cita.tratamiento}</p>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <span style="background: ${estadoColor}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; display: inline-block; margin-bottom: 10px;">
                            ${estadoTexto}
                        </span>
                    </div>
                </div>
                
                <!-- BOTONES DE ACCIÓN -->
                <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                    ${cita.estado === 'pendiente' ? `
                        <button onclick="confirmarCita(${cita.id})" style="padding: 8px 20px; background: #28a745; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-check"></i> Aceptar
                        </button>
                        <button onclick="rechazarCita(${cita.id})" style="padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : ''}
                    
                    ${cita.estado === 'confirmada' ? `
                        <button onclick="atenderCita(${cita.id})" style="padding: 8px 20px; background: #17a2b8; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-stethoscope"></i> Atender
                        </button>
                        <button onclick="rechazarCita(${cita.id})" style="padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-times"></i> Cancelar
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
    
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'var(--pastel-light)';
        btn.style.color = 'var(--text-dark)';
    });
    
    const btnActivo = event.target;
    btnActivo.classList.add('active');
    btnActivo.style.background = 'var(--pastel-medium)';
    btnActivo.style.color = 'white';
    
    mostrarCitas();
}

// ==================== CONFIRMAR CITA (ACEPTAR) ====================
async function confirmarCita(citaId) {
    if (!confirm('¿Confirmar esta cita?')) return;
    
    try {
        const data = await fetchAPI(`/citas/${citaId}`, {
            method: 'PUT',
            body: JSON.stringify({ estado: 'confirmada' })
        });
        
        if (data.success) {
            alert('✅ Cita confirmada');
            cargarCitas();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al confirmar');
    }
}

// ==================== RECHAZAR CITA ====================
async function rechazarCita(citaId) {
    if (!confirm('¿Rechazar esta cita?')) return;
    
    try {
        const data = await fetchAPI(`/citas/${citaId}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            alert('✅ Cita rechazada');
            cargarCitas();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al rechazar');
    }
}

// ==================== ATENDER CITA (REDIRIGE A HISTORIAL) ====================
async function atenderCita(citaId) {
    console.log('🔍 Atendiendo cita ID:', citaId);
    
    try {
        // Obtener los datos de la cita para saber el paciente
        const data = await fetchAPI(`/citas/${citaId}`);
        console.log('🔍 Respuesta de la cita:', data);
        
        if (data.success && data.data) {
            const cita = data.data;
            const pacienteId = cita.paciente.id;
            console.log('🔍 Paciente ID:', pacienteId);
            console.log('🔍 Redirigiendo a: historial-medico-paciente.html?paciente=' + pacienteId + '&cita=' + citaId);
            
            // Redirigir a la plantilla de historial
            window.location.href = `historial-medico-paciente.html?paciente=${pacienteId}&cita=${citaId}`;
        } else {
            alert('❌ Error al obtener los datos de la cita: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('❌ Error en atenderCita:', error);
        alert('❌ Error al obtener los datos de la cita. Revisa la consola para más detalles.');
    }
}

function mostrarError(texto) {
    document.getElementById('citasContainer').innerHTML = `
        <div style="text-align: center; padding: 40px; background: #f8d7da; border-radius: 15px; color: #721c24;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
            <p>${texto}</p>
        </div>
    `;
}