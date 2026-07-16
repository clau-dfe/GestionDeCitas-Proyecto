const express = require('express');
const router = express.Router();
const { obtenerUsuariosPorTipo } = require('../controllers/userController');
const { protegerRutas } = require('../middleware/auth');

// Ruta para obtener usuarios (protegida)
router.get('/', protegerRutas, obtenerUsuariosPorTipo);

module.exports = router;