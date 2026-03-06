// registro.js - Versión con limpieza forzada de datos
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ registro.js cargado correctamente');
    
    const tipoSelect = document.getElementById('tipoUsuario');
    const especialidadDiv = document.getElementById('especialidadDiv');
    
    if (tipoSelect && especialidadDiv) {
        tipoSelect.addEventListener('change', () => {
            especialidadDiv.style.display = tipoSelect.value === 'dermatologo' ? 'block' : 'none';
        });
    }
});

document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('1️⃣ Formulario enviado');
    
    // Obtener valores y limpiarlos
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const telefono = document.getElementById('telefono').value.trim();
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    
    console.log('2️⃣ Datos recolectados:', { nombre, email, password, telefono, tipoUsuario });
    
    // Validaciones básicas
    if (!nombre || !email || !password || !telefono) {
        mostrarMensaje('❌ Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (password.length < 6) {
        mostrarMensaje('❌ La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const userData = {
        nombre,
        email,
        password,
        telefono,
        tipoUsuario
    };
    
    if (tipoUsuario === 'dermatologo') {
        const especialidad = document.getElementById('especialidad').value.trim();
        if (!especialidad) {
            mostrarMensaje('❌ Los dermatólogos deben especificar su especialidad', 'error');
            return;
        }
        userData.especialidad = especialidad;
    }
    
    console.log('3️⃣ Enviando datos al backend:', userData);
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/registro', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        console.log('4️⃣ Status de respuesta:', response.status);
        
        const data = await response.json();
        console.log('5️⃣ Datos de respuesta:', data);
        
        if (data.success) {
            // ✅ LIMPIEZA FORZADA DE CAMPOS - Múltiples métodos para asegurar
            limpiarFormularioCompletamente();
            
            // ✅ Mostrar mensaje de éxito
            mostrarMensaje('✅ ¡Registro exitoso! Serás redirigido al login...', 'exito');
            
            // ✅ Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            // Mostrar error específico del backend
            mostrarMensaje('❌ ' + data.error, 'error');
            
            // Si el error es de email duplicado, resaltar el campo
            if (data.error.includes('email ya está registrado')) {
                document.getElementById('email').focus();
                document.getElementById('email').style.borderColor = 'var(--pastel-dark)';
                document.getElementById('email').style.borderWidth = '3px';
            }
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        mostrarMensaje('❌ Error de conexión. ¿El backend está corriendo en http://localhost:5000?', 'error');
    }
});

// Función especializada para limpiar TODOS los campos del formulario
function limpiarFormularioCompletamente() {
    console.log('🧹 Limpiando formulario por seguridad...');
    
    // Método 1: Reset del formulario
    const form = document.getElementById('registroForm');
    form.reset();
    
    // Método 2: Limpiar campo por campo (más agresivo)
    document.getElementById('nombre').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('tipoUsuario').value = 'paciente'; // Valor por defecto
    
    // Limpiar especialidad si existe
    const especialidadField = document.getElementById('especialidad');
    if (especialidadField) {
        especialidadField.value = '';
    }
    
    // Ocultar el campo de especialidad (por si estaba visible)
    const especialidadDiv = document.getElementById('especialidadDiv');
    if (especialidadDiv) {
        especialidadDiv.style.display = 'none';
    }
    
    // Quitar cualquier resaltado de errores
    document.getElementById('email').style.borderColor = '';
    document.getElementById('email').style.borderWidth = '';
    
    console.log('✅ Formulario completamente limpio');
}

// Función para mostrar mensajes en la interfaz
function mostrarMensaje(texto, tipo) {
    // Buscar si ya existe un contenedor de mensajes
    let mensajeDiv = document.getElementById('mensajeRegistro');
    
    // Si no existe, crearlo
    if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensajeRegistro';
        mensajeDiv.style.padding = '15px';
        mensajeDiv.style.margin = '15px 0';
        mensajeDiv.style.borderRadius = '10px';
        mensajeDiv.style.textAlign = 'center';
        mensajeDiv.style.fontWeight = '500';
        mensajeDiv.style.transition = 'all 0.3s ease';
        mensajeDiv.style.zIndex = '1000';
        
        // Insertar después del título
        const titulo = document.querySelector('.container h2');
        if (titulo) {
            titulo.insertAdjacentElement('afterend', mensajeDiv);
        } else {
            document.querySelector('.container').prepend(mensajeDiv);
        }
    }
    
    // Estilo según el tipo de mensaje
    if (tipo === 'exito') {
        mensajeDiv.style.background = '#d4edda';
        mensajeDiv.style.color = '#155724';
        mensajeDiv.style.border = '2px solid #c3e6cb';
        mensajeDiv.style.boxShadow = '0 4px 10px rgba(40, 167, 69, 0.2)';
    } else {
        mensajeDiv.style.background = '#f8d7da';
        mensajeDiv.style.color = '#721c24';
        mensajeDiv.style.border = '2px solid #f5c6cb';
        mensajeDiv.style.boxShadow = '0 4px 10px rgba(220, 53, 69, 0.2)';
    }
    
    mensajeDiv.textContent = texto;
    
    // Hacer scroll hacia el mensaje
    mensajeDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}