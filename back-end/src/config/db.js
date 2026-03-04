const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        console.log(`��� Base de datos: ${process.env.DB_NAME}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
};

const initTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                tipo_usuario ENUM('paciente', 'dermatologo', 'admin') DEFAULT 'paciente',
                especialidad VARCHAR(100),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                activo BOOLEAN DEFAULT TRUE,
                INDEX idx_email (email),
                INDEX idx_tipo (tipo_usuario)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Tabla "usuarios" verificada/creada');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS citas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id INT NOT NULL,
                dermatologo_id INT NOT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                motivo TEXT NOT NULL,
                estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
                tipo_consulta ENUM('primera vez', 'seguimiento', 'procedimiento', 'emergencia', 'consulta general') DEFAULT 'primera vez',
                notas TEXT,
                diagnostico TEXT,
                tratamiento TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (dermatologo_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE KEY unique_cita (dermatologo_id, fecha, hora),
                INDEX idx_fecha (fecha),
                INDEX idx_estado (estado)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Tabla "citas" verificada/creada');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS historial_medico (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id INT UNIQUE NOT NULL,
                fecha_nacimiento DATE,
                genero ENUM('masculino', 'femenino', 'otro'),
                tipo_sangre ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
                ocupacion VARCHAR(100),
                direccion TEXT,
                alergias JSON,
                enfermedades_cronicas JSON,
                medicamentos_actuales JSON,
                cirugias_previas JSON,
                antecedentes_familiares JSON,
                examenes_realizados JSON,
                consultas_previas JSON,
                notas_adicionales TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Tabla "historial_medico" verificada/creada');

    } catch (error) {
        console.error('❌ Error creando tablas:', error.message);
    }
};

module.exports = {
    pool,
    testConnection,
    initTables
};
