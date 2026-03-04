const User = require('./User');
const Cita = require('./Cita');
const HistorialMedico = require('./HistorialMedico');
const { sequelize } = require('../config/sequelize');

// Definir relaciones
User.hasMany(Cita, { as: 'citasComoPaciente', foreignKey: 'pacienteId' });
User.hasMany(Cita, { as: 'citasComoDermatologo', foreignKey: 'dermatologoId' });
Cita.belongsTo(User, { as: 'paciente', foreignKey: 'pacienteId' });
Cita.belongsTo(User, { as: 'dermatologo', foreignKey: 'dermatologoId' });

User.hasOne(HistorialMedico, { foreignKey: 'pacienteId' });
HistorialMedico.belongsTo(User, { foreignKey: 'pacienteId' });

// Sincronizar modelos con la base de datos
const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados con la base de datos');
    } catch (error) {
        console.error('❌ Error sincronizando modelos:', error.message);
    }
};

module.exports = {
    User,
    Cita,
    HistorialMedico,
    syncModels
};