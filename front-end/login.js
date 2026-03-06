// login.js - Versión con redirección asegurada
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ login.js cargado');
    limpiarCamposLogin();
});

function limpiarCamposLogin() {
    const form = document.getElementById('loginForm');
    if (form) form.reset();
    
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField) {
        emailField.value = '';
        emailField.setAttribute('autocomplete', 'off');
    }
    
    if (passwordField) {
        passwordField.value = '';
        passwordField.setAttribute('autocomplete', 'new-password');
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar datos
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            
            // Limpiar formulario
            limpiarCamposLogin();
            
            // ✅ REDIRECCIÓN DIRECTA (sin setTimeout innecesario)
            if (data.usuario.tipoUsuario === 'paciente') {
                window.location.href = 'perfil-paciente.html';
            } else if (data.usuario.tipoUsuario === 'dermatologo') {
                window.location.href = 'perfil-dermatologo.html';
            } else {
                window.location.href = 'perfil.html';
            }
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        alert('❌ Error de conexión');
    }
});