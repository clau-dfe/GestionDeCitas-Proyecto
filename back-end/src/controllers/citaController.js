const { Op } = require('sequelize');
const Cita = require('../models/Cita');
const User = require('../models/User');
const HistorialMedico = require('../models/HistorialMedico');
const logger = require('../middleware/logger');

/**
 * @desc    Crear una nueva cita
 * @route   POST /api/citas
 * @access  Privado (pacientes)
 */
const crearCita = async (req, res) => {
    try {
        const { dermatologo, fecha, hora, motivo, tipoConsulta } = req.body;

        // Validar campos requeridos
        if (!dermatologo || !fecha || !hora || !motivo) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }

        // Verificar que el dermatólogo existe y es dermatólogo
        const dermatologoExistente = await User.findOne({
            where: {
                id: dermatologo,
                tipoUsuario: 'dermatologo',
                activo: true
            }
        });

        if (!dermatologoExistente) {
            return res.status(400).json({
                success: false,
                error: 'Dermatólogo no encontrado o no disponible'
            });
        }

        // Verificar disponibilidad del dermatólogo
        const citaExistente = await Cita.findOne({
            where: {
                dermatologoId: dermatologo,
                fecha: new Date(fecha),
                hora: hora,
                estado: { [Op.ne]: 'cancelada' }
            }
        });

        if (citaExistente) {
            return res.status(400).json({
                success: false,
                error: 'El dermatólogo no está disponible en ese horario'
            });
        }

        // Validar que el paciente no tenga otra cita en el mismo horario
        const citaPaciente = await Cita.findOne({
            where: {
                pacienteId: req.usuario.id,
                fecha: new Date(fecha),
                hora: hora,
                estado: { [Op.ne]: 'cancelada' }
            }
        });

        if (citaPaciente) {
            return res.status(400).json({
                success: false,
                error: 'Ya tienes una cita agendada en ese horario'
            });
        }

        // Crear la cita
        const cita = await Cita.create({
            pacienteId: req.usuario.id,
            dermatologoId: dermatologo,
            fecha: new Date(fecha),
            hora: hora,
            motivo: motivo,
            tipoConsulta: tipoConsulta || 'primera vez',
            estado: 'pendiente'
        });

        // Poblar los datos de la cita
        const citaConDatos = await Cita.findByPk(cita.id, {
            include: [
                { model: User, as: 'paciente', attributes: ['nombre', 'email', 'telefono'] },
                { model: User, as: 'dermatologo', attributes: ['nombre', 'email', 'especialidad'] }
            ]
        });

        // LOG DE AUDITORÍA - CREAR CITA
        logger('CREAR_CITA', req.usuario.id, {
            citaId: cita.id,
            pacienteId: req.usuario.id,
            dermatologoId: dermatologo,
            fecha: fecha,
            hora: hora,
            tipoConsulta: tipoConsulta || 'primera vez'
        });

        res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            data: citaConDatos
        });

    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear la cita. Intente nuevamente.'
        });
    }
};

/**
 * @desc    Obtener todas las citas del usuario
 * @route   GET /api/citas
 * @access  Privado
 */
const obtenerCitas = async (req, res) => {
    try {
        const { estado, desde, hasta, pagina = 1, limite = 10 } = req.query;
        
        // Construir filtro según tipo de usuario
        let filtro = {};
        
        if (req.usuario.tipoUsuario === 'paciente') {
            filtro.pacienteId = req.usuario.id;
        } else if (req.usuario.tipoUsuario === 'dermatologo') {
            filtro.dermatologoId = req.usuario.id;
        }

        // Filtrar por estado si se proporciona
        if (estado && ['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
            filtro.estado = estado;
        }

        // Filtrar por rango de fechas
        if (desde || hasta) {
            filtro.fecha = {};
            if (desde) filtro.fecha[Op.gte] = new Date(desde);
            if (hasta) filtro.fecha[Op.lte] = new Date(hasta);
        }

        // Calcular paginación
        const skip = (parseInt(pagina) - 1) * parseInt(limite);
        const limit = parseInt(limite);

        // Obtener citas
        const citas = await Cita.findAll({
            where: filtro,
            include: [
                { model: User, as: 'paciente', attributes: ['id', 'nombre', 'email', 'telefono'] },
                { model: User, as: 'dermatologo', attributes: ['id', 'nombre', 'email', 'especialidad'] }
            ],
            order: [['fecha', 'DESC'], ['hora', 'DESC']],
            limit: limit,
            offset: skip
        });

        // Contar total de citas para paginación
        const total = await Cita.count({ where: filtro });

        res.json({
            success: true,
            count: citas.length,
            total,
            pagina: parseInt(pagina),
            totalPaginas: Math.ceil(total / limit),
            data: citas
        });

    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener las citas'
        });
    }
};

/**
 * @desc    Obtener una cita específica
 * @route   GET /api/citas/:id
 * @access  Privado
 */
const obtenerCita = async (req, res) => {
    try {
        console.log('🔍 ID de cita recibido:', req.params.id);
        
        const cita = await Cita.findByPk(req.params.id, {
            include: [
                { model: User, as: 'paciente', attributes: ['id', 'nombre', 'email', 'telefono'] },
                { model: User, as: 'dermatologo', attributes: ['id', 'nombre', 'email', 'especialidad'] }
            ]
        });

        console.log('🔍 Cita encontrada:', cita ? 'Sí' : 'No');

        if (!cita) {
            return res.status(404).json({
                success: false,
                error: 'Cita no encontrada'
            });
        }

        // Verificar que el usuario tiene acceso a esta cita
        if (req.usuario.tipoUsuario !== 'admin' &&
            cita.paciente.id.toString() !== req.usuario.id.toString() &&
            cita.dermatologo.id.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para ver esta cita'
            });
        }

        res.json({
            success: true,
            data: cita
        });

    } catch (error) {
        console.error('Error al obtener cita:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener la cita'
        });
    }
};

/**
 * @desc    Actualizar estado de cita (confirmar/cancelar/completar)
 * @route   PUT /api/citas/:id
 * @access  Privado
 */
const actualizarCita = async (req, res) => {
    try {
        const { estado, notas, diagnostico, tratamiento } = req.body;
        
        const cita = await Cita.findByPk(req.params.id);

        if (!cita) {
            return res.status(404).json({
                success: false,
                error: 'Cita no encontrada'
            });
        }

        // Verificar permisos según el rol
        if (req.usuario.tipoUsuario === 'paciente') {
            if (cita.pacienteId.toString() !== req.usuario.id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'No autorizado para modificar esta cita'
                });
            }
            if (estado !== 'cancelada') {
                return res.status(403).json({
                    success: false,
                    error: 'Los pacientes solo pueden cancelar citas'
                });
            }
            if (!cita.puedeCancelar()) {
                return res.status(400).json({
                    success: false,
                    error: 'No se puede cancelar la cita con menos de 24 horas de anticipación'
                });
            }
        }

        if (req.usuario.tipoUsuario === 'dermatologo') {
            if (cita.dermatologoId.toString() !== req.usuario.id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'No autorizado para modificar esta cita'
                });
            }
        }

        // Actualizar campos permitidos según el rol
        if (estado) {
            const transicionesValidas = {
                'pendiente': ['confirmada', 'cancelada'],
                'confirmada': ['completada', 'cancelada'],
                'completada': [],
                'cancelada': []
            };

            if (!transicionesValidas[cita.estado].includes(estado)) {
                return res.status(400).json({
                    success: false,
                    error: `No se puede cambiar de ${cita.estado} a ${estado}`
                });
            }
            cita.estado = estado;
        }

        if (req.usuario.tipoUsuario === 'dermatologo') {
            if (notas) cita.notas = notas;
            if (diagnostico) cita.diagnostico = diagnostico;
            if (tratamiento) cita.tratamiento = tratamiento;
        }

        await cita.save();

        // Si la cita se completó, actualizar el historial médico del paciente
        if (estado === 'completada' && req.usuario.tipoUsuario === 'dermatologo') {
            try {
                // Buscar el historial del paciente
                let historial = await HistorialMedico.findOne({
                    where: { pacienteId: cita.pacienteId }
                });

                // Si no existe historial, crearlo
                if (!historial) {
                    historial = await HistorialMedico.create({
                        pacienteId: cita.pacienteId,
                        consultasPrevias: []
                    });
                    console.log('✅ Historial creado para paciente:', cita.pacienteId);
                }

                // Obtener consultas actuales o crear array vacío
                const consultas = historial.consultasPrevias || [];
                
                // Agregar nueva consulta
                consultas.push({
                    cita: cita.id,
                    fecha: cita.fecha,
                    dermatologoId: cita.dermatologoId,
                    motivo: cita.motivo,
                    diagnostico: diagnostico || cita.diagnostico,
                    tratamiento: tratamiento || cita.tratamiento,
                    observaciones: notas || cita.notas
                });

                // Actualizar historial
                await historial.update({ consultasPrevias: consultas });

                console.log('✅ Historial médico actualizado para paciente:', cita.pacienteId);

            } catch (error) {
                console.error('❌ Error al actualizar historial:', error);
            }
        }

        // LOG DE AUDITORÍA - ACTUALIZAR CITA
        logger('ACTUALIZAR_CITA', req.usuario.id, {
            citaId: cita.id,
            nuevoEstado: cita.estado,
            diagnostico: cita.diagnostico || null,
            tratamiento: cita.tratamiento || null,
            notas: cita.notas || null
        });

        res.json({
            success: true,
            message: 'Cita actualizada exitosamente',
            data: cita
        });

    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar la cita'
        });
    }
};

/**
 * @desc    Cancelar cita (método específico para cancelación)
 * @route   DELETE /api/citas/:id
 * @access  Privado
 */
const cancelarCita = async (req, res) => {
    try {
        const cita = await Cita.findByPk(req.params.id);

        if (!cita) {
            return res.status(404).json({
                success: false,
                error: 'Cita no encontrada'
            });
        }

        // Verificar permisos
        const esPaciente = cita.pacienteId.toString() === req.usuario.id.toString();
        const esDermatologo = cita.dermatologoId.toString() === req.usuario.id.toString();
        const esAdmin = req.usuario.tipoUsuario === 'admin';

        if (!esAdmin && !esPaciente && !esDermatologo) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para cancelar esta cita'
            });
        }

        if (!cita.puedeCancelar()) {
            return res.status(400).json({
                success: false,
                error: 'No se puede cancelar la cita con menos de 24 horas de anticipación'
            });
        }

        cita.estado = 'cancelada';
        await cita.save();

        // LOG DE AUDITORÍA - CANCELAR CITA
        logger('CANCELAR_CITA', req.usuario.id, {
            citaId: cita.id,
            pacienteId: cita.pacienteId,
            dermatologoId: cita.dermatologoId,
            fecha: cita.fecha,
            hora: cita.hora
        });

        res.json({
            success: true,
            message: 'Cita cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cancelar la cita'
        });
    }
};

/**
 * @desc    Obtener horarios disponibles de un dermatólogo
 * @route   GET /api/citas/disponibilidad/:dermatologoId
 * @access  Privado
 */
const obtenerDisponibilidad = async (req, res) => {
    try {
        const { fecha } = req.query;
        const dermatologoId = req.params.dermatologoId;

        if (!fecha) {
            return res.status(400).json({
                success: false,
                error: 'La fecha es requerida'
            });
        }

        const dermatologo = await User.findOne({
            where: {
                id: dermatologoId,
                tipoUsuario: 'dermatologo',
                activo: true
            }
        });

        if (!dermatologo) {
            return res.status(404).json({
                success: false,
                error: 'Dermatólogo no encontrado'
            });
        }

        const horariosDisponibles = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ];

        const fechaConsulta = new Date(fecha);
        fechaConsulta.setHours(0, 0, 0, 0);
        
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);

        const citasOcupadas = await Cita.findAll({
            where: {
                dermatologoId: dermatologoId,
                fecha: {
                    [Op.gte]: fechaConsulta,
                    [Op.lte]: fechaFin
                },
                estado: { [Op.ne]: 'cancelada' }
            },
            attributes: ['hora']
        });

        const horariosOcupados = new Set(citasOcupadas.map(c => c.hora));
        const disponibles = horariosDisponibles.filter(h => !horariosOcupados.has(h));

        res.json({
            success: true,
            fecha: fechaConsulta,
            dermatologo: {
                id: dermatologo.id,
                nombre: dermatologo.nombre,
                especialidad: dermatologo.especialidad
            },
            horariosDisponibles: disponibles
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener disponibilidad'
        });
    }
};

/**
 * @desc    Obtener estadísticas de citas (para dashboard)
 * @route   GET /api/citas/estadisticas
 * @access  Privado (admin y dermatólogos)
 */
const obtenerEstadisticas = async (req, res) => {
    try {
        let filtro = {};

        if (req.usuario.tipoUsuario === 'dermatologo') {
            filtro.dermatologoId = req.usuario.id;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const [
            totalCitas,
            citasHoy,
            citasPendientes,
            citasMes,
            citasPorEstado
        ] = await Promise.all([
            Cita.count({ where: filtro }),
            Cita.count({
                where: {
                    ...filtro,
                    fecha: {
                        [Op.gte]: hoy,
                        [Op.lt]: manana
                    }
                }
            }),
            Cita.count({
                where: {
                    ...filtro,
                    estado: 'pendiente',
                    fecha: { [Op.gte]: hoy }
                }
            }),
            Cita.count({
                where: {
                    ...filtro,
                    fecha: {
                        [Op.gte]: inicioMes,
                        [Op.lte]: finMes
                    }
                }
            }),
            Cita.findAll({
                where: filtro,
                attributes: [
                    'estado',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['estado']
            })
        ]);

        // Procesar resultados de la consulta agrupada
        const porEstado = {};
        citasPorEstado.forEach(item => {
            porEstado[item.estado] = item.dataValues.count;
        });

        res.json({
            success: true,
            data: {
                total: totalCitas,
                hoy: citasHoy,
                pendientes: citasPendientes,
                esteMes: citasMes,
                porEstado: porEstado
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
};

module.exports = {
    crearCita,
    obtenerCitas,
    obtenerCita,
    actualizarCita,
    cancelarCita,
    obtenerDisponibilidad,
    obtenerEstadisticas
};