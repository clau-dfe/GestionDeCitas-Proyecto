// historial-medico.js
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar el historial
    cargarHistorial();

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

async function cargarHistorial() {
    const container = document.getElementById('historialContainer');
    container.innerHTML = `
        <p style="text-align: center; color: var(--text-light);">
            <i class="fas fa-spinner fa-spin"></i> Cargando tu historial...
        </p>
    `;

    try {
        // Obtener datos del perfil (incluye historial)
        const data = await fetchAPI('/auth/perfil');

        if (!data.success) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; background: #f8d7da; border-radius: 15px; color: #721c24;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p>Error al cargar el historial: ${data.error || 'Error desconocido'}</p>
                </div>
            `;
            return;
        }

        const user = data.usuario;
        const historial = user.historial || {};

        // Verificar si hay datos del historial
        const consultas = historial.consultasPrevias || [];
        const alergias = historial.alergias || [];
        const enfermedades = historial.enfermedadesCronicas || [];
        const medicamentos = historial.medicamentosActuales || [];

        // Construir el HTML del historial
        let html = '';

        // --- 1. Datos personales ---
        html += `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid var(--pastel-medium);">
                <h3 style="margin-top: 0; color: var(--text-dark);">
                    <i class="fas fa-user-circle"></i> Datos del Paciente
                </h3>
                <p><strong>Nombre:</strong> ${user.nombre}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Teléfono:</strong> ${user.telefono || 'No registrado'}</p>
                <p><strong>Miembro desde:</strong> ${user.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString('es-ES') : 'No disponible'}</p>
            </div>
        `;

        // --- 2. Consultas Previas ---
        html += `<h3 style="color: var(--text-dark);"><i class="fas fa-notes-medical"></i> Consultas Realizadas</h3>`;
        if (consultas.length === 0) {
            html += `<p style="color: var(--text-light);">No tienes consultas previas registradas.</p>`;
        } else {
            consultas.forEach((consulta, index) => {
                const fecha = consulta.fecha ? new Date(consulta.fecha).toLocaleDateString('es-ES') : 'Fecha no disponible';
                const hora = consulta.hora || 'Hora no disponible';
                html += `
                    <div style="border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 5px solid var(--pastel-medium); background: white;">
                        <h4 style="margin: 0 0 8px 0; color: var(--text-dark);">
                            Consulta ${index + 1}
                            <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-light);">
                                (${fecha} - ${hora})
                            </span>
                        </h4>
                        <p><strong>Motivo:</strong> ${consulta.motivo || 'No especificado'}</p>
                        ${consulta.diagnostico ? `<p><strong>Diagnóstico:</strong> ${consulta.diagnostico}</p>` : ''}
                        ${consulta.tratamiento ? `<p><strong>Tratamiento:</strong> ${consulta.tratamiento}</p>` : ''}
                        ${consulta.observaciones ? `<p><strong>Observaciones:</strong> ${consulta.observaciones}</p>` : ''}
                        <p style="font-size: 0.85rem; color: var(--text-light);">
                            Dermatólogo: ${consulta.dermatologo?.nombre || 'No especificado'}
                        </p>
                    </div>
                `;
            });
        }

        // --- 3. Alergias ---
        html += `<h3 style="color: var(--text-dark); margin-top: 25px;"><i class="fas fa-allergies"></i> Alergias</h3>`;
        if (alergias.length === 0) {
            html += `<p style="color: var(--text-light);">No tienes alergias registradas.</p>`;
        } else {
            html += `<ul style="list-style: none; padding: 0;">`;
            alergias.forEach(a => {
                html += `
                    <li style="padding: 8px 12px; background: #fff5f5; border-radius: 8px; margin: 5px 0; border-left: 4px solid #f56565;">
                        <strong>${a.nombre || 'Alergia'}</strong>
                        ${a.tipo ? `<span style="color: var(--text-light); font-size: 0.9rem;">(${a.tipo})</span>` : ''}
                        ${a.observaciones ? `<p style="margin: 5px 0 0 0; font-size: 0.9rem; color: var(--text-light);">${a.observaciones}</p>` : ''}
                    </li>
                `;
            });
            html += `</ul>`;
        }

        // --- 4. Enfermedades Crónicas ---
        html += `<h3 style="color: var(--text-dark); margin-top: 25px;"><i class="fas fa-heartbeat"></i> Enfermedades Crónicas</h3>`;
        if (enfermedades.length === 0) {
            html += `<p style="color: var(--text-light);">No tienes enfermedades crónicas registradas.</p>`;
        } else {
            enfermedades.forEach(e => {
                html += `
                    <div style="background: #fff8e7; padding: 12px; border-radius: 8px; margin: 5px 0; border-left: 4px solid #ecc94b;">
                        <strong>${e.nombre || 'Enfermedad'}</strong>
                        ${e.diagnostico ? `<p style="margin: 5px 0 0 0; font-size: 0.9rem; color: var(--text-light);">${e.diagnostico}</p>` : ''}
                        ${e.fechaDiagnostico ? `<p style="font-size: 0.85rem; color: var(--text-light);">Diagnosticado: ${new Date(e.fechaDiagnostico).toLocaleDateString('es-ES')}</p>` : ''}
                    </div>
                `;
            });
        }

        // --- 5. Medicamentos Actuales ---
        html += `<h3 style="color: var(--text-dark); margin-top: 25px;"><i class="fas fa-pills"></i> Medicamentos Actuales</h3>`;
        if (medicamentos.length === 0) {
            html += `<p style="color: var(--text-light);">No tienes medicamentos registrados.</p>`;
        } else {
            medicamentos.forEach(m => {
                html += `
                    <div style="background: #f0f4ff; padding: 12px; border-radius: 8px; margin: 5px 0; border-left: 4px solid #667eea;">
                        <strong>${m.nombre || 'Medicamento'}</strong>
                        ${m.dosis ? `<span style="color: var(--text-light);"> - ${m.dosis}</span>` : ''}
                        ${m.frecuencia ? `<p style="margin: 5px 0 0 0; font-size: 0.9rem; color: var(--text-light);">Frecuencia: ${m.frecuencia}</p>` : ''}
                        ${m.fechaInicio ? `<p style="font-size: 0.85rem; color: var(--text-light);">Inicio: ${new Date(m.fechaInicio).toLocaleDateString('es-ES')}</p>` : ''}
                    </div>
                `;
            });
        }

        // Mostrar todo
        container.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar historial:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; background: #f8d7da; border-radius: 15px; color: #721c24;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i>
                <p>Error de conexión al cargar el historial médico.</p>
                <p style="font-size: 0.9rem;">${error.message || 'Error desconocido'}</p>
                <button onclick="cargarHistorial()" style="margin-top: 15px; padding: 8px 20px; background: var(--pastel-medium); color: white; border: none; border-radius: 20px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}