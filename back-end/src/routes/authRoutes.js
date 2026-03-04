const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
    registrarUsuario, 
    loginUsuario, 
    obtenerPerfil, 
    actualizarPerfil,
    cambiarPassword,
    logoutUsuario 
} = require('../controllers/authController');
const { protegerRutas } = require('../middleware/auth');
const { validarCampos, validacionesUsuario, sanitizarEntradas } = require('../middleware/validation');

const validarRegistro = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono').notEmpty().withMessage('El teléfono es requerido'),
    validarCampos
];

router.post('/registro', sanitizarEntradas, validarRegistro, registrarUsuario);
router.post('/login', sanitizarEntradas, loginUsuario);
router.get('/perfil', protegerRutas, obtenerPerfil);

module.exports = router;