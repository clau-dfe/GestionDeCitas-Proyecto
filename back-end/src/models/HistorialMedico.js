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
    // ===== DATOS FIJOS DEL PACIENTE (se llenan una vez) =====
    fechaNacimiento: {
        type: DataTypes.DATEONLY,
        field: 'fecha_nacimiento',
        allowNull: true
    },
    edad: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    direccion: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    ciudad: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    ocupacion: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // ===== DATOS DE CONSULTA (se agregan en cada visita) =====
    alergias: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    enfermedadesCronicas: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    medicamentosActuales: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    cirugiasPrevias: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    antecedentesFamiliares: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    consultasPrevias: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    notasAdicionales: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'historial_medico',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'ultima_actualizacion'
});

module.exports = HistorialMedico;