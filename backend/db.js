require('dotenv').config();
const mysql = require('mysql2');
const config = require('./config');

// Crear conexión con MySQL
const connection = mysql.createConnection(config.database);

// Probar conexión
connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos cultural_access');
});

module.exports = connection;
