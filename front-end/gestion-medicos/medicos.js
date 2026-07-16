// medicos.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    const form = document.getElementById('registroEspecialista');
    if (!form) {
        console.error('❌ No se encontró el formulario');
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const telefono = document.getElementById('telefono').value.trim();
        const especialidad = document.getElementById('especialidad').value.trim();
        const claveMaestra = document.getElementById('claveMaestra').value.trim(); // 🔐 CLAVE

        }

        if (password.length < 6) {
            alert('❌ La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const userData = {
            nombre,
            email,
            password,
            telefono,
            tipoUsuario: 'dermatologo',
            especialidad,
        };

        console.log('📤 Registrando especialista:', userData);

        try {
            const data = await fetchAPI('/auth/registro', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            console.log('📥 Respuesta:', data);

            if (data.success) {
                alert('✅ Especialista registrado exitosamente');
                form.reset();
                setTimeout(() => {
                    window.location.href = '../perfil-dermatologo.html';
                }, 1500);
            } else {
                alert('❌ Error: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            alert('❌ Error de conexión');
        }
    });
});