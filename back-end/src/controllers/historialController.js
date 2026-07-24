// back-end/src/controllers/historialController.js
const { HistorialMedico, User } = require('../models');
const logger = require('../middleware/logger');

/**
 * @desc    Obtener el historial completo de un paciente
 * @route   GET /api/historial/:pacienteId
 * @access  Privado (dermatólogo o admin)
 */
const obtenerHistorial = async (req, res) => {
    try {
        const { pacienteId } = req.params;

        console.log('🔍 Obteniendo historial para paciente:', pacienteId);

        // Verificar que el paciente existe
        const paciente = await User.findByPk(pacienteId, {
            attributes: ['id', 'nombre', 'email', 'telefono']
        });

        if (!paciente) {
            return res.status(404).json({
                success: false,
                error: 'Paciente no encontrado'
            });
        }

        // Buscar historial del paciente
        let historial = await HistorialMedico.findOne({
            where: { pacienteId }
        });

        // Si no existe historial, crear uno vacío
        if (!historial) {
            historial = await HistorialMedico.create({
                pacienteId,
                consultasPrevias: []
            });
            console.log('✅ Historial creado para paciente:', pacienteId);
        }

        res.json({
            success: true,
            paciente,
            historial
        });

    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el historial'
        });
    }
};

/**
 * @desc    Guardar historial médico de un paciente
 * @route   POST /api/historial/:pacienteId
 * @access  Privado (dermatólogo)
 */
const guardarHistorial = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { 
            fechaNacimiento, edad, direccion, ciudad, ocupacion,
            motivo, alergias, enfermedades, medicamentos, cirugias,
            examenFisico, diagnostico, tratamiento, proximaCita, observaciones,
            citaId 
        } = req.body;

        console.log('🔍 Guardando historial para paciente:', pacienteId);

        // Validar campos obligatorios
        if (!motivo || !diagnostico || !tratamiento) {
            return res.status(400).json({
                success: false,
                error: 'Motivo, Diagnóstico y Tratamiento son obligatorios'
            });
        }

        // Verificar que el paciente existe
        const paciente = await User.findByPk(pacienteId);
        if (!paciente) {
            return res.status(404).json({
                success: false,
                error: 'Paciente no encontrado'
            });
        }

        // Buscar historial del paciente
        let historial = await HistorialMedico.findOne({
            where: { pacienteId }
        });

        if (!historial) {
            historial = await HistorialMedico.create({
                pacienteId,
                consultasPrevias: []
            });
        }

        // Actualizar datos fijos (solo si no están guardados)
        const datosFijosExisten = historial.fechaNacimiento || historial.edad || historial.direccion;
        
        if (!datosFijosExisten) {
            await historial.update({
                fechaNacimiento: fechaNacimiento || null,
                edad: edad || null,
                direccion: direccion || '',
                ciudad: ciudad || '',
                ocupacion: ocupacion || ''
            });
        }

        // Agregar consulta
        const consultas = historial.consultasPrevias || [];
        consultas.push({
            fecha: new Date(),
            motivo,
            diagnostico,
            tratamiento,
            alergias: alergias || '',
            enfermedades: enfermedades || '',
            medicamentos: medicamentos || '',
            cirugias: cirugias || '',
            examenFisico: examenFisico || '',
            proximaCita: proximaCita || null,
            observaciones: observaciones || ''
        });

        await historial.update({ consultasPrevias: consultas });

        logger('GUARDAR_HISTORIAL', req.usuario.id, {
            pacienteId,
            diagnostico,
            tratamiento,
            citaId: citaId || null
        });

        res.status(201).json({
            success: true,
            message: 'Historial guardado exitosamente',
            data: historial
        });

    } catch (error) {
        console.error('❌ Error al guardar historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al guardar el historial'
        });
    }
};

/**
 * @desc    Actualizar datos fijos del paciente
 * @route   PUT /api/historial/:pacienteId/datos-fijos
 * @access  Privado (dermatólogo o admin)
 */
const actualizarDatosFijos = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { fechaNacimiento, edad, direccion, ciudad, ocupacion } = req.body;

        let historial = await HistorialMedico.findOne({
            where: { pacienteId }
        });

        if (!historial) {
            return res.status(404).json({
                success: false,
                error: 'Historial no encontrado para este paciente'
            });
        }

        await historial.update({
            fechaNacimiento: fechaNacimiento || null,
            edad: edad || null,
            direccion: direccion || '',
            ciudad: ciudad || '',
            ocupacion: ocupacion || ''
        });

        res.json({
            success: true,
            message: 'Datos fijos actualizados exitosamente',
            data: historial
        });

    } catch (error) {
        console.error('❌ Error al actualizar datos fijos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar datos fijos'
        });
    }
};

/**
 * @desc    Obtener solo los datos fijos de un paciente
 * @route   GET /api/historial/:pacienteId/datos-fijos
 * @access  Privado (dermatólogo o admin)
 */
const obtenerDatosFijos = async (req, res) => {
    try {
        const { pacienteId } = req.params;

        const historial = await HistorialMedico.findOne({
            where: { pacienteId },
            attributes: ['fechaNacimiento', 'edad', 'direccion', 'ciudad', 'ocupacion']
        });

        if (!historial) {
            return res.json({
                success: true,
                data: null,
                message: 'No hay datos fijos registrados para este paciente'
            });
        }

        res.json({
            success: true,
            data: {
                fechaNacimiento: historial.fechaNacimiento,
                edad: historial.edad,
                direccion: historial.direccion,
                ciudad: historial.ciudad,
                ocupacion: historial.ocupacion
            }
        });

    } catch (error) {
        console.error('❌ Error al obtener datos fijos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos fijos'
        });
    }
};

module.exports = {
    obtenerHistorial,
    guardarHistorial,
    actualizarDatosFijos,
    obtenerDatosFijos
};