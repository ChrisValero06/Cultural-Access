const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
const config = require('./config');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Crear conexión a la base de datos
async function createConnection() {
  try {
    const connection = await mysql.createConnection(config.database);
    console.log('Conexión a la base de datos establecida');
    return connection;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// Crear tabla de promociones si no existe
async function createTables() {
  try {
    const connection = await createConnection();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS promociones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        institucion VARCHAR(255) NOT NULL,
        tipo_promocion VARCHAR(255) NOT NULL,
        disciplina VARCHAR(255) NOT NULL,
        beneficios TEXT NOT NULL,
        comentarios_restricciones TEXT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        imagen_principal VARCHAR(500) NOT NULL,
        imagen_secundaria VARCHAR(500),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createTableQuery);
    console.log('Tabla de promociones creada/verificada');
    await connection.end();
  } catch (error) {
    console.error('Error creando tablas:', error);
  }
}

// Endpoint para crear promoción
app.post('/api/crear_promocion', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const {
      institucion,
      tipo_promocion,
      disciplina,
      beneficios,
      comentarios_restricciones,
      fecha_inicio,
      fecha_fin,
      imagen_principal,
      imagen_secundaria
    } = req.body;

    // Validar campos requeridos
    if (!institucion || !tipo_promocion || !disciplina || !beneficios || 
        !comentarios_restricciones || !fecha_inicio || !fecha_fin || !imagen_principal) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    const insertQuery = `
      INSERT INTO promociones (
        institucion, tipo_promocion, disciplina, beneficios, 
        comentarios_restricciones, fecha_inicio, fecha_fin, 
        imagen_principal, imagen_secundaria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      institucion, tipo_promocion, disciplina, beneficios,
      comentarios_restricciones, fecha_inicio, fecha_fin,
      imagen_principal, imagen_secundaria
    ]);

    await connection.end();

    res.json({
      estado: 'exito',
      mensaje: 'Promoción creada exitosamente',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error creando promoción:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error interno del servidor'
    });
  }
});

// Endpoint para subir imagen
app.post('/api/subir_imagen', upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'No se subió ningún archivo'
      });
    }

    const imageUrl = `http://localhost:${PORT}/${req.file.filename}`;
    
    res.json({
      estado: 'exito',
      mensaje: 'Imagen subida exitosamente',
      url: imageUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error subiendo imagen'
    });
  }
});

// Endpoint para obtener promociones
app.get('/api/obtener_promociones', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [rows] = await connection.execute('SELECT * FROM promociones ORDER BY fecha_creacion DESC');
    
    await connection.end();

    res.json({
      estado: 'exito',
      promociones: rows
    });

  } catch (error) {
    console.error('Error obteniendo promociones:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error obteniendo promociones'
    });
  }
});

// Endpoint para buscar promociones
app.get('/api/buscar_promocion', async (req, res) => {
  try {
    const { institucion, disciplina } = req.query;
    const connection = await createConnection();
    
    let query = 'SELECT * FROM promociones WHERE 1=1';
    let params = [];

    if (institucion) {
      query += ' AND institucion LIKE ?';
      params.push(`%${institucion}%`);
    }

    if (disciplina) {
      query += ' AND disciplina LIKE ?';
      params.push(`%${disciplina}%`);
    }

    query += ' ORDER BY fecha_creacion DESC';

    const [rows] = await connection.execute(query, params);
    
    await connection.end();

    res.json({
      estado: 'exito',
      promociones: rows
    });

  } catch (error) {
    console.error('Error buscando promociones:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error buscando promociones'
    });
  }
});

// Crear directorio de uploads si no existe
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Inicializar tablas y arrancar servidor
createTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('API disponible en /api/*');
  });
}).catch(error => {
  console.error('Error inicializando servidor:', error);
});
