const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protegerRutas = async (req, res, next) => {
    let token;

    // Verificar si el token viene en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token recibido:', token.substring(0, 20) + '...'); // Log parcial
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado - Token no proporcionado'
        });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);

        // Buscar usuario
        const usuario = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            console.log('Usuario no encontrado para ID:', decoded.id);
            return res.status(401).json({
                success: false,
                error: 'No autorizado - Usuario no encontrado'
            });
        }

        if (!usuario.activo) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado - Usuario inactivo'
            });
        }

        // Adjuntar usuario a la request
        req.usuario = usuario;
        next();

    } catch (error) {
        console.error('Error en autenticación:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'No autorizado - Token inválido'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'No autorizado - Token expirado'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Error en autenticación'
        });
    }
};

module.exports = { protegerRutas };