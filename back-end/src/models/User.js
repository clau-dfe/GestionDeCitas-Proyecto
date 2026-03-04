const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre es requerido' }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: 'Email inválido' }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    tipoUsuario: {
        type: DataTypes.ENUM('paciente', 'dermatologo', 'admin'),
        defaultValue: 'paciente',
        field: 'tipo_usuario'
    },
    especialidad: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'fecha_registro',
    updatedAt: false,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Método para comparar contraseñas
User.prototype.compararPassword = async function(passwordIngresado) {
    return await bcrypt.compare(passwordIngresado, this.password);
};

module.exports = User;
