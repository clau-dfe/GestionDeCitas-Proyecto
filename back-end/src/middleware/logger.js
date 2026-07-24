const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = (accion, usuario, detalles) => {
    const logEntry = {
        fecha: new Date().toISOString(),
        accion,
        usuario: usuario || 'Sistema',
        detalles: detalles || {}
    };

    const logFile = path.join(logDir, `auditoria-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    console.log('📝 Log de auditoría:', logEntry);
};

module.exports = logger;