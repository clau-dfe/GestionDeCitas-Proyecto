const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const {
    crearCita,
    obtenerCitas,
    obtenerCita,
    actualizarCita,
    cancelarCita,
    obtenerDisponibilidad
} = require('../controllers/citaController');
const { protegerRutas } = require('../middleware/auth');
const { validarCampos } = require('../middleware/validation');

// Validaciones
const validarCrearCita = [
    body('dermatologo').isInt().withMessage('ID de dermatólogo inválido'),
    body('fecha').isISO8601().withMessage('Fecha inválida'),
    body('hora').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora inválido'),
    body('motivo').notEmpty().withMessage('El motivo es requerido'),
    validarCampos
];

// Rutas
router.post('/', protegerRutas, validarCrearCita, crearCita);
router.get('/', protegerRutas, obtenerCitas);
router.get('/disponibilidad/:dermatologoId', protegerRutas, obtenerDisponibilidad);
router.get('/:id', protegerRutas, obtenerCita);
router.put('/:id', protegerRutas, actualizarCita);
router.delete('/:id', protegerRutas, cancelarCita);

module.exports = router;