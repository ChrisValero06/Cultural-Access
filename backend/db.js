require('dotenv').config();
const mysql = require('mysql2');
const config = require('./config');

// Crear conexión con MySQL
const connection = mysql.createConnection(config.database);

// Probar conexión
connection.connect((err) => {
  if (err) {
    return;
  }
});

module.exports = connection;
