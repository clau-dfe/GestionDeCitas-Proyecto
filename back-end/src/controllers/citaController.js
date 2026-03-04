const Cita = require('../models/Cita');
const User = require('../models/User');
const HistorialMedico = require('../models/HistorialMedico');

const crearCita = async (req, res) => {
    try {
        const { dermatologo, fecha, hora, motivo, tipoConsulta } = req.body;

        if (!dermatologo || !fecha || !hora || !motivo) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }

        const dermatologoExistente = await User.findOne({
            _id: dermatologo,
            tipoUsuario: 'dermatologo',
            activo: true
        });

        if (!dermatologoExistente) {
            return res.status(400).json({
                success: false,
                error: 'Dermatólogo no encontrado o no disponible'
            });
        }

        const citaExistente = await Cita.findOne({
            dermatologo,
            fecha: new Date(fecha),
            hora,
            estado: { $ne: 'cancelada' }
        });

        if (citaExistente) {
            return res.status(400).json({
                success: false,
                error: 'El dermatólogo no está disponible en ese horario'
            });
        }

        const citaPaciente = await Cita.findOne({
            paciente: req.usuario.id,
            fecha: new Date(fecha),
            hora,
            estado: { $ne: 'cancelada' }
        });

        if (citaPaciente) {
            return res.status(400).json({
                success: false,
                error: 'Ya tienes una cita agendada en ese horario'
            });
        }

        const cita = await Cita.create({
            paciente: req.usuario.id,
            dermatologo,
            fecha: new Date(fecha),
            hora,
            motivo,
            tipoConsulta: tipoConsulta || 'primera vez',
            estado: 'pendiente'
        });

        await cita.populate('paciente', 'nombre email telefono');
        await cita.populate('dermatologo', 'nombre email especialidad');

        res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            data: cita
        });

    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear la cita. Intente nuevamente.'
        });
    }
};

const obtenerCitas = async (req, res) => {
    try {
        const { estado, desde, hasta, pagina = 1, limite = 10 } = req.query;
        
        let filtro = {};
        
        if (req.usuario.tipoUsuario === 'paciente') {
            filtro.paciente = req.usuario.id;
        } else if (req.usuario.tipoUsuario === 'dermatologo') {
            filtro.dermatologo = req.usuario.id;
        }

        if (estado && ['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
            filtro.estado = estado;
        }

        if (desde || hasta) {
            filtro.fecha = {};
            if (desde) filtro.fecha.$gte = new Date(desde);
            if (hasta) filtro.fecha.$lte = new Date(hasta);
        }

        const skip = (parseInt(pagina) - 1) * parseInt(limite);
        const limit = parseInt(limite);

        const citas = await Cita.find(filtro)
            .populate('paciente', 'nombre email telefono')
            .populate('dermatologo', 'nombre email especialidad')
            .sort({ fecha: -1, hora: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Cita.countDocuments(filtro);

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

const obtenerCita = async (req, res) => {
    try {
        const cita = await Cita.findById(req.params.id)
            .populate('paciente', 'nombre email telefono')
            .populate('dermatologo', 'nombre email especialidad');

        if (!cita) {
            return res.status(404).json({
                success: false,
                error: 'Cita no encontrada'
            });
        }

        if (req.usuario.tipoUsuario !== 'admin' &&
            cita.paciente._id.toString() !== req.usuario.id &&
            cita.dermatologo._id.toString() !== req.usuario.id) {
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

const actualizarCita = async (req, res) => {
    try {
        const { estado, notas, diagnostico, tratamiento } = req.body;
        
        const cita = await Cita.findById(req.params.id);

        if (!cita) {
            return res.status(404).json({
                success: false,
                error: 'Cita no encontrada'
            });
        }

        if (req.usuario.tipoUsuario === 'paciente') {
            if (cita.paciente.toString() !== req.usuario.id) {
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
            if (cita.dermatologo.toString() !== req.usuario.id) {
                return res.status(403).json({
                    success: false,
                    error: 'No autorizado para modificar esta cita'
                });
            }
        }

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

        if (estado === 'completada' && req.usuario.tipoUsuario === 'dermatologo') {
            await HistorialMedico.findOneAndUpdate(
                { paciente: cita.paciente },
                {
                    $push: {
                        consultasPrevias: {
                            cita: cita._id,
                            fecha: cita.fecha,
                            dermatologo: cita.dermatologo,
                            motivo: cita.motivo,
                            diagnostico: diagnostico || cita.diagnostico,
                            tratamiento: tratamiento || cita.tratamiento,
                            observaciones: notas || cita.notas
                        }
                    }
                }
            );
        }

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

const cancelarCita = async (req, res) => {
    try {
        const cita = await Cita.findById(req.params.id);

        if (!cita) {
            return res.status(404).json({
                success: false,
                error: 'Cita no encontrada'
            });
        }

        if (req.usuario.tipoUsuario !== 'admin' &&
            cita.paciente.toString() !== req.usuario.id &&
            cita.dermatologo.toString() !== req.usuario.id) {
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
            _id: dermatologoId,
            tipoUsuario: 'dermatologo',
            activo: true
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

        const citasOcupadas = await Cita.find({
            dermatologo: dermatologoId,
            fecha: {
                $gte: fechaConsulta,
                $lte: fechaFin
            },
            estado: { $ne: 'cancelada' }
        }).select('hora');

        const horariosOcupados = new Set(citasOcupadas.map(c => c.hora));
        const disponibles = horariosDisponibles.filter(h => !horariosOcupados.has(h));

        res.json({
            success: true,
            fecha: fechaConsulta,
            dermatologo: {
                id: dermatologo._id,
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

const obtenerEstadisticas = async (req, res) => {
    try {
        let filtro = {};

        if (req.usuario.tipoUsuario === 'dermatologo') {
            filtro.dermatologo = req.usuario.id;
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
            Cita.countDocuments(filtro),
            Cita.countDocuments({
                ...filtro,
                fecha: {
                    $gte: hoy,
                    $lt: manana
                }
            }),
            Cita.countDocuments({
                ...filtro,
                estado: 'pendiente',
                fecha: { $gte: hoy }
            }),
            Cita.countDocuments({
                ...filtro,
                fecha: {
                    $gte: inicioMes,
                    $lte: finMes
                }
            }),
            Cita.aggregate([
                { $match: filtro },
                { $group: {
                    _id: '$estado',
                    count: { $sum: 1 }
                }}
            ])
        ]);

        res.json({
            success: true,
            data: {
                total: totalCitas,
                hoy: citasHoy,
                pendientes: citasPendientes,
                esteMes: citasMes,
                porEstado: citasPorEstado.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
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
