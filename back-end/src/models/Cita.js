const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Cita = sequelize.define('Cita', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pacienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'paciente_id',
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    dermatologoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'dermatologo_id',
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora: {
        type: DataTypes.TIME,
        allowNull: false
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
        defaultValue: 'pendiente'
    },
    tipoConsulta: {
        type: DataTypes.ENUM('primera vez', 'seguimiento', 'procedimiento', 'emergencia', 'consulta general'),
        defaultValue: 'primera vez',
        field: 'tipo_consulta'
    },
    notas: {
        type: DataTypes.TEXT
    },
    diagnostico: {
        type: DataTypes.TEXT
    },
    tratamiento: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'citas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    indexes: [
        {
            unique: true,
            fields: ['dermatologo_id', 'fecha', 'hora']
        }
    ]
});

// Método para verificar si la cita puede ser cancelada
Cita.prototype.puedeCancelar = function() {
    const hoy = new Date();
    const fechaCita = new Date(this.fecha);
    const diferenciaDias = Math.ceil((fechaCita - hoy) / (1000 * 60 * 60 * 24));
    
    return this.estado !== 'cancelada' && 
           this.estado !== 'completada' && 
           diferenciaDias >= 1;
};

module.exports = Cita;
