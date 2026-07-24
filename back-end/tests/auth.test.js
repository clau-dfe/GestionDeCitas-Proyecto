// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('🧪 Pruebas de Autenticación', () => {

    // ============================================================
    // PRUEBA 1: Registro exitoso
    // ============================================================
    test('✅ POST /api/auth/registro - Registro exitoso', async () => {
        const timestamp = Date.now();
        const response = await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: 'Usuario Test',
                email: `test.${timestamp}@test.com`,
                password: 'Test123!',
                telefono: '3001234567',
                tipoUsuario: 'paciente'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.usuario.email).toContain('test.');
        expect(response.body.usuario.tipoUsuario).toBe('paciente');

        console.log('✅ Registro exitoso:', response.body.usuario.nombre);
    });

    // ============================================================
    // PRUEBA 2: Registro con email duplicado
    // ============================================================
    test('❌ POST /api/auth/registro - Email duplicado', async () => {
        const timestamp = Date.now();
        // Primero registrar un usuario
        await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: 'Usuario Duplicado',
                email: `duplicado.${timestamp}@test.com`,
                password: 'Test123!',
                telefono: '3001234567',
                tipoUsuario: 'paciente'
            });

        // Intentar registrar con el mismo email
        const response = await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: 'Otro Usuario',
                email: `duplicado.${timestamp}@test.com`,
                password: 'Test123!',
                telefono: '3001234567',
                tipoUsuario: 'paciente'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('email ya está registrado');

        console.log('✅ Email duplicado detectado correctamente');
    });

    // ============================================================
    // PRUEBA 3: Registro con campos faltantes
    // ============================================================
    test('❌ POST /api/auth/registro - Campos faltantes', async () => {
        const response = await request(app)
            .post('/api/auth/registro')
            .send({
                tipoUsuario: 'paciente'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        // ✅ El mensaje de error ahora es "Error de validación"
        expect(response.body.error).toBe('Error de validación');

        console.log('✅ Validación de campos funcionando');
    });

    // ============================================================
    // PRUEBA 4: Login exitoso
    // ============================================================
    test('✅ POST /api/auth/login - Login exitoso', async () => {
        const timestamp = Date.now();
        // Registrar un usuario
        await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: 'Usuario Login',
                email: `login.${timestamp}@test.com`,
                password: 'Test123!',
                telefono: '3001234567',
                tipoUsuario: 'paciente'
            });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: `login.${timestamp}@test.com`,
                password: 'Test123!'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.usuario.email).toContain('login.');

        console.log('✅ Login exitoso:', response.body.usuario.nombre);
    });

    // ============================================================
    // PRUEBA 5: Login con credenciales inválidas
    // ============================================================
    test('❌ POST /api/auth/login - Credenciales inválidas', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'noexiste@test.com',
                password: 'passwordincorrecta'
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Credenciales inválidas');

        console.log('✅ Credenciales inválidas rechazadas');
    });

    // ============================================================
    // PRUEBA 6: Obtener perfil con token válido
    // ============================================================
    test('✅ GET /api/auth/perfil - Perfil con token válido', async () => {
        const timestamp = Date.now();
        // Registrar y hacer login
        await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: 'Usuario Perfil',
                email: `perfil.${timestamp}@test.com`,
                password: 'Test123!',
                telefono: '3001234567',
                tipoUsuario: 'paciente'
            });

        const login = await request(app)
            .post('/api/auth/login')
            .send({
                email: `perfil.${timestamp}@test.com`,
                password: 'Test123!'
            });

        const token = login.body.token;

        const response = await request(app)
            .get('/api/auth/perfil')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.usuario.email).toContain('perfil.');

        console.log('✅ Perfil obtenido con token válido');
    });

    // ============================================================
    // PRUEBA 7: Obtener perfil sin token
    // ============================================================
    test('❌ GET /api/auth/perfil - Sin token', async () => {
        const response = await request(app)
            .get('/api/auth/perfil');

        expect(response.status).toBe(401); // ✅ Cambiado de 400 a 401
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();

        console.log('✅ Acceso sin token bloqueado');
    });
});