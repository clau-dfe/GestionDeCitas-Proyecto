const { User } = require('../models');

// Obtener usuarios por tipo
const obtenerUsuariosPorTipo = async (req, res) => {
    try {
        const { tipo } = req.query;
        
        const where = {};
        if (tipo) {
            where.tipoUsuario = tipo;
        }
        
        const usuarios = await User.findAll({
            where,
            attributes: { exclude: ['password'] }
        });
        
        res.json({
            success: true,
            usuarios
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener usuarios'
        });
    }
};

module.exports = {
    obtenerUsuariosPorTipo
};