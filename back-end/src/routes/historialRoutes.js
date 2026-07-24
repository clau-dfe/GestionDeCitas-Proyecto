// back-end/src/routes/historialRoutes.js
const express = require('express');
const router = express.Router();
const { 
    obtenerHistorial, 
    guardarHistorial,
    actualizarDatosFijos,
    obtenerDatosFijos
} = require('../controllers/historialController');
const { protegerRutas } = require('../middleware/auth');

// Obtener historial completo de un paciente
router.get('/:pacienteId', protegerRutas, obtenerHistorial);

// Guardar historial (datos fijos + consulta)
router.post('/:pacienteId', protegerRutas, guardarHistorial);

// Obtener solo datos fijos del paciente
router.get('/:pacienteId/datos-fijos', protegerRutas, obtenerDatosFijos);

// Actualizar solo datos fijos del paciente
router.put('/:pacienteId/datos-fijos', protegerRutas, actualizarDatosFijos);

module.exports = router;