// agendar-cita.js
let dermatologos = [];

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarDermatologos();
    configurarFechaMinima();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

function configurarFechaMinima() {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    fechaInput.min = `${año}-${mes}-${dia}`;
}

async function cargarDermatologos() {
    try {
        const data = await fetchAPI('/usuarios?tipo=dermatologo');
        
        if (data.success && data.usuarios) {
            dermatologos = data.usuarios;
            const select = document.getElementById('dermatologo');
            select.innerHTML = '<option value="">Selecciona un dermatólogo</option>';
            
            data.usuarios.forEach(derm => {
                select.innerHTML += `<option value="${derm.id}">Dr(a). ${derm.nombre} - ${derm.especialidad || 'Dermatología'}</option>`;
            });
        } else {
            mostrarError('No hay dermatólogos disponibles');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar dermatólogos');
    }
}

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
        horaSelect.innerHTML = '<option value="">Cargando horarios...</option>';
        horaSelect.disabled = true;
        
        const data = await fetchAPI(`/citas/disponibilidad/${dermatologoId}?fecha=${fecha}`);
        
        if (data.success && data.horariosDisponibles) {
            horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
            
            if (data.horariosDisponibles.length === 0) {
                horaSelect.innerHTML = '<option value="">No hay horarios disponibles</option>';
            } else {
                data.horariosDisponibles.forEach(hora => {
                    horaSelect.innerHTML += `<option value="${hora}">${hora}</option>`;
                });
                horaSelect.disabled = false;
            }
        } else {
            horaSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
        }
    } catch (error) {
        console.error('Error:', error);
        horaSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
    }
}

document.getElementById('citaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const citaData = {
        dermatologo: document.getElementById('dermatologo').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        tipoConsulta: document.getElementById('tipoConsulta').value,
        motivo: document.getElementById('motivo').value.trim()
    };
    
    if (!citaData.dermatologo || !citaData.fecha || !citaData.hora || !citaData.motivo) {
        mostrarMensaje('❌ Todos los campos son obligatorios', 'error');
        return;
    }
    
    try {
        const data = await fetchAPI('/citas', {
            method: 'POST',
            body: JSON.stringify(citaData)
        });
        
        if (data.success) {
            mostrarMensaje('✅ Cita agendada exitosamente', 'exito');
            setTimeout(() => {
                window.location.href = 'mis-citas.html';
            }, 2000);
        } else {
            mostrarMensaje('❌ ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('❌ Error al agendar la cita', 'error');
    }
});

function mostrarMensaje(texto, tipo) {
    let mensajeDiv = document.getElementById('mensajeCita');
    
    if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensajeCita';
        mensajeDiv.style.padding = '15px';
        mensajeDiv.style.margin = '15px 0';
        mensajeDiv.style.borderRadius = '10px';
        mensajeDiv.style.textAlign = 'center';
        
        const titulo = document.querySelector('.container h2');
        titulo.insertAdjacentElement('afterend', mensajeDiv);
    }
    
    mensajeDiv.style.background = tipo === 'exito' ? '#d4edda' : '#f8d7da';
    mensajeDiv.style.color = tipo === 'exito' ? '#155724' : '#721c24';
    mensajeDiv.style.border = tipo === 'exito' ? '2px solid #c3e6cb' : '2px solid #f5c6cb';
    mensajeDiv.textContent = texto;
}

function mostrarError(texto) {
    const select = document.getElementById('dermatologo');
    select.innerHTML = `<option value="">${texto}</option>`;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});