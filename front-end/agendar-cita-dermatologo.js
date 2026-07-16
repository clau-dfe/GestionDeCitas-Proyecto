// agendar-cita-dermatologo.js
let pacientes = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    cargarPacientes();
    configurarFechaMinima();

    document.getElementById('fecha').addEventListener('change', cargarHorarios);
    document.getElementById('citaDermatologoForm').addEventListener('submit', agendarCita);

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

async function cargarPacientes() {
    try {
        const data = await fetchAPI('/usuarios?tipo=paciente');
        if (data.success && data.usuarios) {
            pacientes = data.usuarios;
            const select = document.getElementById('pacienteSelect');
            select.innerHTML = '<option value="">Selecciona un paciente</option>';
            data.usuarios.forEach(paciente => {
                select.innerHTML += `<option value="${paciente.id}">${paciente.nombre} - ${paciente.email}</option>`;
            });
        } else {
            console.error('Error al cargar pacientes:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function configurarFechaMinima() {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
}

async function cargarHorarios() {
    const pacienteId = document.getElementById('pacienteSelect').value;
    const fecha = document.getElementById('fecha').value;
    const horaSelect = document.getElementById('hora');

    if (!pacienteId || !fecha) {
        horaSelect.innerHTML = '<option value="">Selecciona paciente y fecha</option>';
        horaSelect.disabled = true;
        return;
    }

    try {
        // Obtener el dermatólogo actual (el que está logueado)
        const user = JSON.parse(localStorage.getItem('user'));
        const dermatologoId = user.id;

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
        console.error('Error:', error);
    }
}

async function agendarCita(event) {
    event.preventDefault();

    const pacienteId = document.getElementById('pacienteSelect').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const motivo = document.getElementById('motivo').value.trim();

    if (!pacienteId || !fecha || !hora || !motivo) {
        alert('❌ Todos los campos son obligatorios');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    const citaData = {
        paciente: pacienteId,
        dermatologo: user.id,
        fecha: fecha,
        hora: hora,
        motivo: motivo,
        tipoConsulta: 'primera vez'
    };

    try {
        const data = await fetchAPI('/citas', {
            method: 'POST',
            body: JSON.stringify(citaData)
        });

        if (data.success) {
            alert('✅ Cita agendada exitosamente para el paciente');
            document.getElementById('citaDermatologoForm').reset();
            document.getElementById('hora').innerHTML = '<option value="">Selecciona paciente y fecha</option>';
            document.getElementById('hora').disabled = true;
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al agendar la cita');
    }
}
