// tests/citas.test.js
const request = require('supertest');
const app = require('../src/app');

describe('🧪 Pruebas de Citas', () => {

    let tokenPaciente;
    let tokenDermatologo;
    let dermatologoId;
    let citaId;
    let pacienteId;

    // ============================================================
    // 1. Registrar un dermatólogo (con email único por timestamp)
    // ============================================================
    test('✅ Registrar dermatólogo para pruebas', async () => {
        const timestamp = Date.now();
        const response = await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: 'Dr. Prueba Citas',
                email: `dermatologo.${timestamp}@test.com`,
                password: 'Test123!',
                telefono: '3009876543',
                tipoUsuario: 'dermatologo',
                especialidad: 'Dermatología Clínica'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        tokenDermatologo = response.body.token;
        dermatologoId = response.body.usuario.id;

        console.log('✅ Dermatólogo registrado ID:', dermatologoId);
    });

    // ============================================================
    // 2. Registrar un paciente (con email único por timestamp)
    // ============================================================
    test('✅ Registrar paciente para pruebas', async () => {
        const timestamp = Date.now();
        const response = await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: 'Paciente Citas',
                email: `paciente.citas.${timestamp}@test.com`,
                password: 'Test123!',
                telefono: '3001234567',
                tipoUsuario: 'paciente'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        tokenPaciente = response.body.token;
        pacienteId = response.body.usuario.id;

        console.log('✅ Paciente registrado ID:', pacienteId);
    });

    // ============================================================
    // 3. Crear una cita exitosamente
    // ============================================================
    test('✅ POST /api/citas - Crear cita exitosa', async () => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 3);
        const fechaStr = fecha.toISOString().split('T')[0];

        const response = await request(app)
            .post('/api/citas')
            .set('Authorization', `Bearer ${tokenPaciente}`)
            .send({
                dermatologo: dermatologoId,
                fecha: fechaStr,
                hora: '10:00',
                motivo: 'Consulta dermatológica de prueba',
                tipoConsulta: 'primera vez'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.motivo).toBe('Consulta dermatológica de prueba');
        citaId = response.body.data.id;

        console.log('✅ Cita creada exitosamente ID:', citaId);
    });

    // ============================================================
    // 4. Crear cita en horario ocupado (debe fallar)
    // ============================================================
    test('❌ POST /api/citas - Horario ocupado', async () => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 3);
        const fechaStr = fecha.toISOString().split('T')[0];

        const response = await request(app)
            .post('/api/citas')
            .set('Authorization', `Bearer ${tokenPaciente}`)
            .send({
                dermatologo: dermatologoId,
                fecha: fechaStr,
                hora: '10:00',
                motivo: 'Otra consulta',
                tipoConsulta: 'primera vez'
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('no está disponible');

        console.log('✅ Horario ocupado detectado correctamente');
    });

    // ============================================================
    // 5. Obtener citas del paciente
    // ============================================================
    test('✅ GET /api/citas - Listar citas del paciente', async () => {
        const response = await request(app)
            .get('/api/citas')
            .set('Authorization', `Bearer ${tokenPaciente}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toBeGreaterThan(0);

        console.log('✅ Lista de citas obtenida. Total:', response.body.data.length);
    });

    // ============================================================
    // 6. Obtener disponibilidad de horarios
    // ============================================================
    test('✅ GET /api/citas/disponibilidad/:id - Obtener horarios', async () => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 4);
        const fechaStr = fecha.toISOString().split('T')[0];

        const response = await request(app)
            .get(`/api/citas/disponibilidad/${dermatologoId}?fecha=${fechaStr}`)
            .set('Authorization', `Bearer ${tokenPaciente}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.horariosDisponibles).toBeDefined();
        expect(Array.isArray(response.body.horariosDisponibles)).toBe(true);

        console.log('✅ Horarios disponibles obtenidos:', response.body.horariosDisponibles.length);
    });

    // ============================================================
    // 7. Cancelar una cita
    // ============================================================
    test('✅ DELETE /api/citas/:id - Cancelar cita', async () => {
        const response = await request(app)
            .delete(`/api/citas/${citaId}`)
            .set('Authorization', `Bearer ${tokenPaciente}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('cancelada');

        console.log('✅ Cita cancelada exitosamente');
    });

    // ============================================================
    // 8. Intentar cancelar cita ya cancelada (debe fallar)
    // ============================================================
    test('❌ DELETE /api/citas/:id - Cancelar cita ya cancelada', async () => {
        const response = await request(app)
            .delete(`/api/citas/${citaId}`)
            .set('Authorization', `Bearer ${tokenPaciente}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('24 horas');

        console.log('✅ Cita ya cancelada detectada');
    });

    // ============================================================
    // 9. Obtener citas del dermatólogo
    // ============================================================
    test('✅ GET /api/citas - Listar citas del dermatólogo', async () => {
        const response = await request(app)
            .get('/api/citas')
            .set('Authorization', `Bearer ${tokenDermatologo}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();

        console.log('✅ Lista de citas del dermatólogo obtenida. Total:', response.body.data.length);
    });

    // ============================================================
    // 10. Intentar crear cita sin autenticación (debe fallar)
    // ============================================================
    test('❌ POST /api/citas - Sin autenticación', async () => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 5);
        const fechaStr = fecha.toISOString().split('T')[0];

        const response = await request(app)
            .post('/api/citas')
            .send({
                dermatologo: dermatologoId,
                fecha: fechaStr,
                hora: '11:00',
                motivo: 'Consulta sin token',
                tipoConsulta: 'primera vez'
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('No autorizado');

        console.log('✅ Acceso sin token bloqueado');
    });
});