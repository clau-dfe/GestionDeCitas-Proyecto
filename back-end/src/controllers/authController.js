const { User, HistorialMedico } = require('../models');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/sequelize');
const logger = require('../middleware/logger'); 

// Generar token JWT
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// ============================================================
// REGISTRAR USUARIO (Paciente o Dermatólogo - SIN CLAVE MAESTRA)
// ============================================================
const registrarUsuario = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { nombre, email, password, telefono, tipoUsuario, especialidad } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !password || !telefono) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Por favor complete todos los campos requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExiste = await User.findOne({ where: { email } });
        if (usuarioExiste) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        // Validar que si es dermatólogo, tenga especialidad
        if (tipoUsuario === 'dermatologo' && !especialidad) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Los dermatólogos deben especificar su especialidad'
            });
        }

        // Crear usuario
        const usuario = await User.create({
            nombre,
            email: email.toLowerCase(),
            password,
            telefono,
            tipoUsuario: tipoUsuario || 'paciente',
            especialidad: tipoUsuario === 'dermatologo' ? especialidad : null
        }, { transaction: t });

        // Si es paciente, crear su historial médico
        if (usuario.tipoUsuario === 'paciente') {
            await HistorialMedico.create({
                pacienteId: usuario.id
            }, { transaction: t });
        }

        await t.commit();

        const token = generarToken(usuario.id);

        res.status(201).json({
            success: true,
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                tipoUsuario: usuario.tipoUsuario,
                especialidad: usuario.especialidad
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario. Intente nuevamente.'
        });
    }
};

// ============================================================
// INICIAR SESIÓN (LOGIN)
// ============================================================
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporcione email y contraseña'
            });
        }

        const usuario = await User.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        if (!usuario.activo) {
            return res.status(401).json({
                success: false,
                error: 'Usuario inactivo. Contacte al administrador.'
            });
        }

        const passwordCorrecta = await usuario.compararPassword(password);
        if (!passwordCorrecta) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        const token = generarToken(usuario.id);

        res.json({
            success: true,
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                tipoUsuario: usuario.tipoUsuario,
                especialidad: usuario.especialidad
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión. Intente nuevamente.'
        });
    }
};

// ============================================================
// OBTENER PERFIL DEL USUARIO AUTENTICADO
// ============================================================
const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await User.findByPk(req.usuario.id, {
            attributes: { exclude: ['password'] }
        });

        let historial = null;
        if (usuario.tipoUsuario === 'paciente') {
            historial = await HistorialMedico.findOne({
                where: { pacienteId: usuario.id }
            });
        }

        res.json({
            success: true,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                tipoUsuario: usuario.tipoUsuario,
                especialidad: usuario.especialidad,
                fechaRegistro: usuario.fecha_registro,
                historial: historial
            }
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener perfil'
        });
    }
};

// ============================================================
// ACTUALIZAR PERFIL
// ============================================================
const actualizarPerfil = async (req, res) => {
    try {
        const { nombre, telefono, especialidad } = req.body;

        const usuario = await User.findByPk(req.usuario.id);

        if (nombre) usuario.nombre = nombre;
        if (telefono) usuario.telefono = telefono;
        if (especialidad && usuario.tipoUsuario === 'dermatologo') {
            usuario.especialidad = especialidad;
        }

        await usuario.save();

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                tipoUsuario: usuario.tipoUsuario,
                especialidad: usuario.especialidad
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar perfil'
        });
    }
};

// ============================================================
// CAMBIAR CONTRASEÑA
// ============================================================
const cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = req.body;

        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporcione contraseña actual y nueva'
            });
        }

        if (passwordNueva.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const usuario = await User.findByPk(req.usuario.id);

        const passwordCorrecta = await usuario.compararPassword(passwordActual);
        if (!passwordCorrecta) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        usuario.password = passwordNueva;
        await usuario.save();

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al cambiar password:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar contraseña'
        });
    }
};

// ============================================================
// CERRAR SESIÓN
// ============================================================
const logoutUsuario = (req, res) => {
    res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
    });
};

// ============================================================
// EXPORTAR CONTROLADORES
// ============================================================
module.exports = {
    registrarUsuario,
    loginUsuario,
    obtenerPerfil,
    actualizarPerfil,
    cambiarPassword,
    logoutUsuario
};