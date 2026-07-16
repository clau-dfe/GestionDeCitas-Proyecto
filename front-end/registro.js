// registro.js - Conectado al backend en puerto 3000
document.addEventListener('DOMContentLoaded', () => {
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
    
    const userData = {
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value,
        telefono: document.getElementById('telefono').value.trim(),
        tipoUsuario: document.getElementById('tipoUsuario').value
    };
    
    if (userData.tipoUsuario === 'dermatologo') {
        userData.especialidad = document.getElementById('especialidad').value.trim();
    }
    
    console.log('📤 Enviando datos:', userData);
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        console.log('📥 Respuesta:', data);
        
        if (data.success) {
            alert('✅ Registro exitoso. Ahora inicia sesión.');
            window.location.href = 'login.html';
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        alert('❌ Error de conexión. ¿El backend está corriendo en http://localhost:3000?');
    }
});