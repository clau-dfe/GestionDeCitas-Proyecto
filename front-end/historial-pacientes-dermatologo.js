// historial-pacientes-dermatologo.js
let todosLosPacientes = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    cargarPacientes();

    // Buscar pacientes en tiempo real
    document.getElementById('buscarPaciente').addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase().trim();
        filtrarPacientes(texto);
    });

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
        const data = await fetchAPI('/usuarios?tipo=paciente');
        if (data.success && data.usuarios) {
            todosLosPacientes = data.usuarios;
            mostrarPacientes(todosLosPacientes);
        } else {
            container.innerHTML = '<p style="text-align: center; color: red;">Error al cargar pacientes.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p style="text-align: center; color: red;">Error de conexión.</p>';
    }
}

function mostrarPacientes(pacientes) {
    const container = document.getElementById('pacientesContainer');

    if (pacientes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 15px;">
                <i class="fas fa-user-friends" style="font-size: 3rem; color: var(--pastel-medium);"></i>
                <p style="color: var(--text-light);">No hay pacientes registrados.</p>
            </div>
        `;
        return;
    }

    let html = '<div style="display: grid; gap: 10px;">';
    pacientes.forEach(paciente => {
        html += `
            <div style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 4px 10px var(--shadow-color); border-left: 5px solid var(--pastel-medium); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h4 style="margin: 0 0 5px 0;">${paciente.nombre}</h4>
                    <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">
                        <i class="fas fa-envelope"></i> ${paciente.email}
                    </p>
                    ${paciente.telefono ? `<p style="margin: 0; color: var(--text-light); font-size: 0.9rem;"><i class="fas fa-phone"></i> ${paciente.telefono}</p>` : ''}
                </div>
                <a href="historial-medico-paciente.html?paciente=${paciente.id}" style="background: var(--pastel-medium); color: white; padding: 8px 18px; border-radius: 20px; text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;">
                    <i class="fas fa-notes-medical"></i> Ver Historial
                </a>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function filtrarPacientes(texto) {
    if (!texto) {
        mostrarPacientes(todosLosPacientes);
        return;
    }

    const filtrados = todosLosPacientes.filter(p => 
        p.nombre.toLowerCase().includes(texto) ||
        p.email.toLowerCase().includes(texto)
    );
    mostrarPacientes(filtrados);
}