// Configuración de la base de datos
const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'cultrual_access'
  },
  server: {
    port: process.env.PORT || 3001
  }
};

module.exports = config;
