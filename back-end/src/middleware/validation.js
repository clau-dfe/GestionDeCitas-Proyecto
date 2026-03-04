const { validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const erroresFormateados = errors.array().map(err => ({
            campo: err.param,
            mensaje: err.msg,
            valor: err.value
        }));

        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            errores: erroresFormateados
        });
    }
    
    next();
};

const validacionesCita = {
    fechaNoPasada: (value) => {
        const fechaIngresada = new Date(value);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaIngresada < hoy) {
            throw new Error('La fecha no puede ser en el pasado');
        }
        return true;
    },

    horarioLaboral: (value) => {
        const hora = parseInt(value.split(':')[0]);
        if (hora < 9 || hora > 18) {
            throw new Error('La hora debe estar entre 9:00 AM y 6:00 PM');
        }
        return true;
    },

    diaLaboral: (value) => {
        const fecha = new Date(value);
        const diaSemana = fecha.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            throw new Error('No hay atención los fines de semana');
        }
        return true;
    }
};

const validacionesUsuario = {
    telefonoColombiano: (value) => {
        const telefonoRegex = /^3\d{9}$/;
        if (!telefonoRegex.test(value)) {
            throw new Error('Teléfono inválido. Debe ser un número celular colombiano de 10 dígitos');
        }
        return true;
    },

    passwordFuerte: (value) => {
        const tieneMayuscula = /[A-Z]/.test(value);
        const tieneMinuscula = /[a-z]/.test(value);
        const tieneNumero = /\d/.test(value);
        const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (!tieneMayuscula || !tieneMinuscula || !tieneNumero || !tieneEspecial) {
            throw new Error('La contraseña debe tener al menos: una mayúscula, una minúscula, un número y un carácter especial');
        }
        return true;
    },

    emailNoTemporal: (value) => {
        const dominiosTemporales = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
        const dominio = value.split('@')[1];
        if (dominiosTemporales.includes(dominio)) {
            throw new Error('No se permiten emails temporales');
        }
        return true;
    }
};

const sanitizarEntradas = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim().replace(/<[^>]*>/g, '');
            }
        });
    }
    next();
};

const validarMongoId = (req, res, next) => {
    const id = req.params.id;
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (id && !mongoIdRegex.test(id)) {
        return res.status(400).json({
            success: false,
            error: 'ID inválido - Formato de MongoDB incorrecto'
        });
    }
    
    next();
};

const validarPaginacion = (req, res, next) => {
    let { pagina = 1, limite = 10 } = req.query;
    
    pagina = parseInt(pagina);
    limite = parseInt(limite);
    
    if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({
            success: false,
            error: 'La página debe ser un número mayor a 0'
        });
    }
    
    if (isNaN(limite) || limite < 1 || limite > 100) {
        return res.status(400).json({
            success: false,
            error: 'El límite debe ser un número entre 1 y 100'
        });
    }
    
    req.pagina = pagina;
    req.limite = limite;
    
    next();
};

module.exports = {
    validarCampos,
    validacionesCita,
    validacionesUsuario,
    sanitizarEntradas,
    validarMongoId,
    validarPaginacion
};
