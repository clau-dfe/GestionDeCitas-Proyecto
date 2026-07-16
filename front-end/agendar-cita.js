// agendar-cita.js

// ==================== CONFIGURACIÓN INICIAL ====================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar dermatólogos y citas
    cargarDermatologos();
    cargarMisCitas();
    configurarFechaMinima();

    // Eventos
    document.getElementById('dermatologo').addEventListener('change', cargarHorarios);
    document.getElementById('fecha').addEventListener('change', cargarHorarios);
    document.getElementById('citaForm').addEventListener('submit', agendarCita);
});

// ==================== CARGAR DERMATÓLOGOS ====================
async function cargarDermatologos() {
    try {
        const data = await fetchAPI('/usuarios?tipo=dermatologo');
        
        if (data.success && data.usuarios) {
            const select = document.getElementById('dermatologo');
            select.innerHTML = '<option value="">Selecciona un dermatólogo</option>';
            
            data.usuarios.forEach(derm => {
                select.innerHTML += `<option value="${derm.id}">Dr(a). ${derm.nombre} - ${derm.especialidad || 'Dermatología'}</option>`;
            });
        } else {
            console.error('Error al cargar dermatólogos:', data.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

// ==================== CARGAR HORARIOS ====================
async function cargarHorarios() {
    const dermatologoId = document.getElementById('dermatologo').value;
    const fecha = document.getElementById('fecha').value;
    const horaSelect = document.getElementById('hora');
    
    if (!dermatologoId || !fecha) {
        horaSelect.innerHTML = '<option value="">Selecciona dermatólogo y fecha</option>';
        horaSelect.disabled = true;
        return;
    }
    
    try {
        const data = await fetchAPI(`/citas/disponibilidad/${dermatologoId}?fecha=${fecha}`);
        
        if (data.success && data.horariosDisponibles && data.horariosDisponibles.length > 0) {
            horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
            data.horariosDisponibles.forEach(hora => {
                horaSelect.innerHTML += `<option value="${hora}">${hora}</option>`;
            });
            horaSelect.disabled = false;
        } else {
            horaSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
            horaSelect.disabled = true;
        }
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        horaSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
        horaSelect.disabled = true;
    }
}

// ==================== CONFIGURAR FECHA MÍNIMA ====================
function configurarFechaMinima() {
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.min = hoy;
    }
}

// ==================== AGENDAR CITA ====================
async function agendarCita(event) {
    event.preventDefault();
    
    const citaData = {
        dermatologo: document.getElementById('dermatologo').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        tipoConsulta: document.getElementById('tipoConsulta').value,
        motivo: document.getElementById('motivo').value.trim()
    };
    
    if (!citaData.dermatologo || !citaData.fecha || !citaData.hora || !citaData.motivo) {
        alert('❌ Todos los campos son obligatorios');
        return;
    }
    
    try {
        const data = await fetchAPI('/citas', {
            method: 'POST',
            body: JSON.stringify(citaData)
        });
        
        if (data.success) {
            alert('✅ Cita agendada exitosamente');
            document.getElementById('citaForm').reset();
            document.getElementById('hora').innerHTML = '<option value="">Primero selecciona dermatólogo y fecha</option>';
            document.getElementById('hora').disabled = true;
            cargarMisCitas(); // Recargar la lista de citas
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al agendar la cita');
    }
}

// ==================== CARGAR MIS CITAS ====================
async function cargarMisCitas() {
    const container = document.getElementById('citasContainer');
    container.innerHTML = '<p>Cargando tus citas...</p>';
    
    try {
        const data = await fetchAPI('/citas');
        
        if (data.success && data.data && data.data.length > 0) {
            let html = '';
            data.data.forEach(cita => {
                const fecha = new Date(cita.fecha).toLocaleDateString('es-ES');
                const estadoColor = {
                    'pendiente': '#ffc107',
                    'confirmada': '#28a745',
                    'cancelada': '#dc3545',
                    'completada': '#17a2b8'
                }[cita.estado] || '#6c757d';
                
                html += `
                    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 5px solid ${estadoColor};">
                        <p><strong>${cita.dermatologo?.nombre || 'Dermatólogo'}</strong></p>
                        <p>📅 ${fecha} - 🕐 ${cita.hora}</p>
                        <p>📝 ${cita.motivo}</p>
                        <p>Estado: <span style="font-weight: bold; color: ${estadoColor};">${cita.estado.toUpperCase()}</span></p>
                        ${cita.estado === 'pendiente' || cita.estado === 'confirmada' ? `
                            <button onclick="cancelarCita(${cita.id})" style="background: #dc3545; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">
                                Cancelar
                            </button>
                        ` : ''}
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>No tienes citas agendadas.</p>';
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
        container.innerHTML = '<p style="color: red;">Error al cargar tus citas</p>';
    }
}

// ==================== CANCELAR CITA ====================
async function cancelarCita(citaId) {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    try {
        const data = await fetchAPI(`/citas/${citaId}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            alert('✅ Cita cancelada exitosamente');
            cargarMisCitas(); // Recargar la lista
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cancelar la cita');
    }
}