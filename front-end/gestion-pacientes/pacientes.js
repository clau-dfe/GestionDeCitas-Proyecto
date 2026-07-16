// pacientes.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroPaciente');
    
    if (!form) {
        console.error('❌ No se encontró el formulario de registro');
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const telefono = document.getElementById('telefono').value.trim();

        // Validaciones básicas
        if (!nombre || !email || !password || !telefono) {
            alert('❌ Todos los campos son obligatorios');
            return;
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
            tipoUsuario: 'paciente' // Siempre será paciente en este formulario
        };

        console.log('📤 Registrando paciente:', userData);

        try {
            const data = await fetchAPI('/auth/registro', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            console.log('📥 Respuesta del servidor:', data);

            if (data.success) {
                alert('✅ Paciente registrado exitosamente');
                form.reset();
                
                // Opcional: redirigir al menú después de 2 segundos
                setTimeout(() => {
                    window.location.href = '../Menu/menuPrincipal.html';
                }, 1500);
            } else {
                alert('❌ Error: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            alert('❌ Error de conexión. Asegúrate de que el backend esté corriendo en http://localhost:3000');
        }
    });
});