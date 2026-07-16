// login.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ login.js cargado correctamente');
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    console.log('📤 Intentando login con:', { email, password });

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('📥 Respuesta del servidor:', data);

        if (data.success) {
            // Guardar datos
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));

            const tipoUsuario = data.usuario.tipoUsuario;
            console.log('👤 Tipo de usuario:', tipoUsuario);

            // ✅ REDIRECCIÓN CORRECTA
            if (tipoUsuario === 'dermatologo') {
                console.log('🔄 Redirigiendo a perfil-dermatologo.html...');
                window.location.href = 'perfil-dermatologo.html';
            } else {
                console.log('🔄 Redirigiendo a perfil-paciente.html...');
                window.location.href = 'perfil-paciente.html';
            }
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        alert('❌ Error de conexión');
    }
});