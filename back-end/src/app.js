const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/sequelize');
const { syncModels } = require('./models');
const authRoutes = require('./routes/authRoutes');
const citaRoutes = require('./routes/citaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Probar conexión y sincronizar modelos
(async () => {
    try {
        const connected = await testConnection();
        if (connected) {
            await syncModels();
            console.log('🚀 Base de datos lista para usar');
        }
    } catch (error) {
        console.error('❌ Error en inicialización:', error.message);
    }
})();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rutas
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de Sistema de Citas Dermatológicas (MySQL + Sequelize)',
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/usuarios', userRoutes);

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            errors: err.errors.map(e => e.message)
        });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            error: 'El valor ya existe en la base de datos'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
    console.log(`📡 Base de datos: MySQL con Sequelize`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log('=================================');
});

module.exports = app;