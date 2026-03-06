// pacientes.js - Conectado al backend
// La función fetchAPI viene de api.js

async function cargarPacientes() {
    try {
        // Mostrar indicador de carga
        const contenedor = document.getElementById('lista-pacientes');
        if (contenedor) {
            contenedor.innerHTML = '<p>Cargando pacientes...</p>';
        }

        // Llamar al backend (asumiendo que tienes un endpoint para listar pacientes)
        const data = await fetchAPI('/usuarios?tipo=paciente');
        
        if (data.success) {
            mostrarPacientes(data.usuarios);
        } else {
            mostrarError('Error al cargar pacientes: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión con el servidor');
    }
}

function mostrarPacientes(pacientes) {
    const contenedor = document.getElementById('lista-pacientes');
    
    if (!contenedor) return;
    
    if (!pacientes || pacientes.length === 0) {
        contenedor.innerHTML = '<p>No hay pacientes registrados</p>';
        return;
    }
    
    let html = '<h2>Lista de Pacientes</h2>';
    html += '<ul>';
    
    pacientes.forEach(paciente => {
        html += `
            <li>
                <strong>${paciente.nombre}</strong><br>
                Email: ${paciente.email}<br>
                Teléfono: ${paciente.telefono}<br>
                <hr>
            </li>
        `;
    });
    
    html += '</ul>';
    contenedor.innerHTML = html;
}

function mostrarError(mensaje) {
    const contenedor = document.getElementById('lista-pacientes');
    if (contenedor) {
        contenedor.innerHTML = `<p style="color: red;">${mensaje}</p>`;
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPacientes);