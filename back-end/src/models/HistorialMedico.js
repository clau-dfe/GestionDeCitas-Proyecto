const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HistorialMedico = sequelize.define('HistorialMedico', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pacienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'paciente_id',
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    fechaNacimiento: {
        type: DataTypes.DATEONLY,
        field: 'fecha_nacimiento'
    },
    genero: {
        type: DataTypes.ENUM('masculino', 'femenino', 'otro')
    },
    tipoSangre: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        field: 'tipo_sangre'
    },
    ocupacion: DataTypes.STRING(100),
    direccion: DataTypes.TEXT,
    alergias: DataTypes.JSON,
    enfermedadesCronicas: DataTypes.JSON,
    medicamentosActuales: DataTypes.JSON,
    cirugiasPrevias: DataTypes.JSON,
    antecedentesFamiliares: DataTypes.JSON,
    examenesRealizados: DataTypes.JSON,
    consultasPrevias: DataTypes.JSON,
    notasAdicionales: DataTypes.TEXT
}, {
    tableName: 'historial_medico',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'ultima_actualizacion'
});

module.exports = HistorialMedico;