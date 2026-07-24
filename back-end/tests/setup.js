// tests/setup.js
const { sequelize } = require('../src/config/sequelize');

// Sincronizar modelos antes de las pruebas
beforeAll(async () => {
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos de pruebas sincronizada');
});

// Cerrar conexión después de las pruebas
afterAll(async () => {
    await sequelize.close();
    console.log('✅ Conexión de pruebas cerrada');
});