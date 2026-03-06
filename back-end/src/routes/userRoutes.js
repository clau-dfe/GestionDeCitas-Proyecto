const express = require('express');
const router = express.Router();
const { obtenerUsuariosPorTipo } = require('../controllers/userController');
const { protegerRutas } = require('../middleware/auth');

router.get('/', protegerRutas, obtenerUsuariosPorTipo);

module.exports = router;