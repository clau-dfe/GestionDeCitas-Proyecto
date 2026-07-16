// mis-pacientes.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    cargarPacientes();

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

async function cargarPacientes() {
    const container = document.getElementById('pacientesContainer');
    container.innerHTML = '<p style="text-align: center; color: var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Cargando pacientes...</p>';

    try {
        // Obtener todas las citas del dermatólogo
        const data = await fetchAPI('/citas');
        if (data.success && data.data) {
            // Extraer pacientes únicos de las citas
            const pacientesMap = new Map();
            data.data.forEach(cita => {
                if (cita.paciente && cita.paciente.id) {
                    pacientesMap.set(cita.paciente.id, cita.paciente);
                }
            });

            const pacientes = Array.from(pacientesMap.values());

            if (pacientes.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 15px;">
                        <i class="fas fa-user-friends" style="font-size: 3rem; color: var(--pastel-medium);"></i>
                        <p style="color: var(--text-light);">Aún no tienes pacientes.</p>
                    </div>
                `;
                return;
            }

            let html = '<div style="display: grid; gap: 15px;">';
            pacientes.forEach(paciente => {
                html += `
                    <div style="background: white; border-radius: 15px; padding: 15px; box-shadow: 0 4px 10px var(--shadow-color); border-left: 5px solid var(--pastel-medium); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h4 style="margin: 0 0 5px 0;">${paciente.nombre}</h4>
                            <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">
                                <i class="fas fa-envelope"></i> ${paciente.email}
                            </p>
                            ${paciente.telefono ? `<p style="margin: 0; color: var(--text-light); font-size: 0.9rem;"><i class="fas fa-phone"></i> ${paciente.telefono}</p>` : ''}
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <!-- Botón: Ver Historial -->
                            <a href="historial-medico-paciente.html?paciente=${paciente.id}" style="background: var(--pastel-medium); color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;">
                                <i class="fas fa-notes-medical"></i> Ver Historial
                            </a>
                            <!-- Botón: Agendar Cita -->
                            <a href="agendar-cita-dermatologo.html?paciente=${paciente.id}" style="background: var(--pastel-dark); color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;">
                                <i class="fas fa-calendar-plus"></i> Agendar Cita
                            </a>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="text-align:center; color: red;">Error al cargar pacientes.</p>';
        }
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        container.innerHTML = '<p style="text-align:center; color: red;">Error de conexión.</p>';
    }
}
