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
        estado ENUM('activa', 'inactiva', 'expirada') DEFAULT 'activa',
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
        imagen_principal, imagen_secundaria, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activa')
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
    
    console.log('Promociones obtenidas de la BD:', rows);
    console.log('Primera promoción:', rows[0]);
    console.log('Columnas disponibles:', Object.keys(rows[0] || {}));
    
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

// Endpoint de debug para ver todas las promociones
app.get('/api/debug-promociones', async (req, res) => {
  try {
    const connection = await createConnection();
    
    console.log('🔍 Endpoint debug-promociones llamado');
    
    const [rows] = await connection.execute(`
      SELECT id, institucion, tipo_promocion, disciplina, estado, 
             fecha_inicio, fecha_fin, imagen_principal
      FROM promociones 
      ORDER BY id
    `);
    
    console.log('📊 Todas las promociones en BD:', rows);
    
    await connection.end();

    res.json({
      estado: 'exito',
      total: rows.length,
      promociones: rows
    });

  } catch (error) {
    console.error('Error en debug-promociones:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error obteniendo promociones para debug'
    });
  }
});

// Endpoint para obtener promociones para el carrusel
app.get('/api/promociones-carrusel', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Obtener solo promociones ACTIVAS y dentro de su rango de fechas válido
    const [rows] = await connection.execute(`
      SELECT id, institucion, imagen_principal, imagen_secundaria, fecha_creacion,
             fecha_inicio, fecha_fin, estado
      FROM promociones 
      WHERE imagen_principal IS NOT NULL 
      AND estado = 'activa'
      AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
      ORDER BY fecha_creacion DESC
    `);
    
    await connection.end();

    // Agrupar por institución para crear carruseles
    const carruseles = [];
    const institucionesMap = new Map();

    rows.forEach((promocion) => {
      if (!institucionesMap.has(promocion.institucion)) {
        const carrusel = {
          id: carruseles.length + 1,
          institucion: promocion.institucion,
          imagenes: []
        };
        carruseles.push(carrusel);
        institucionesMap.set(promocion.institucion, carrusel);
      }

      const carrusel = institucionesMap.get(promocion.institucion);
      
      // Agregar imagen principal
      if (promocion.imagen_principal) {
        carrusel.imagenes.push(promocion.imagen_principal);
      }
      
      // Agregar imagen secundaria si existe
      if (promocion.imagen_secundaria) {
        carrusel.imagenes.push(promocion.imagen_secundaria);
      }
    });

    // Ordenar carruseles: los más antiguos primero (arriba), los nuevos abajo
    carruseles.sort((a, b) => {
      // Buscar la fecha de creación más antigua de cada carrusel
      const promocionesA = rows.filter(r => r.institucion === a.institucion);
      const promocionesB = rows.filter(r => r.institucion === b.institucion);
      
      if (promocionesA.length > 0 && promocionesB.length > 0) {
        const fechaMasAntiguaA = Math.min(...promocionesA.map(p => new Date(p.fecha_creacion)));
        const fechaMasAntiguaB = Math.min(...promocionesB.map(p => new Date(p.fecha_creacion)));
        
        return fechaMasAntiguaA - fechaMasAntiguaB;
      }
      return 0;
    });

    res.json({
      estado: 'exito',
      carruseles: carruseles
    });

  } catch (error) {
    console.error('Error obteniendo promociones para carrusel:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error obteniendo promociones para carrusel'
    });
  }
});

// Endpoint para actualizar estado de promociones
app.post('/api/actualizar-estado-promociones', async (req, res) => {
  try {
    const connection = await createConnection();
    
    // Actualizar promociones expiradas
    await connection.execute(`
      UPDATE promociones 
      SET estado = 'expirada' 
      WHERE CURDATE() > fecha_fin AND estado = 'activa'
    `);
    
    // Activar promociones que están en su período
    await connection.execute(`
      UPDATE promociones 
      SET estado = 'activa' 
      WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin AND estado != 'activa'
    `);
    
    await connection.end();
    
    res.json({
      estado: 'exito',
      mensaje: 'Estados de promociones actualizados'
    });
    
  } catch (error) {
    console.error('Error actualizando estados:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error actualizando estados'
    });
  }
});

// Endpoint para cambiar estado de una promoción específica
app.put('/api/cambiar-estado-promocion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    
    console.log('Cambiando estado - ID:', id, 'Nuevo estado:', nuevoEstado);
    console.log('Body completo:', req.body);
    
    if (!['activa', 'inactiva', 'expirada'].includes(nuevoEstado)) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Estado no válido'
      });
    }
    
    const connection = await createConnection();
    
    // Verificar el estado actual antes de cambiar
    const [currentRows] = await connection.execute('SELECT estado FROM promociones WHERE id = ?', [id]);
    console.log('Estado actual de la promoción:', currentRows[0]);
    
    await connection.execute(`
      UPDATE promociones 
      SET estado = ? 
      WHERE id = ?
    `, [nuevoEstado, id]);
    
    // Verificar que se actualizó correctamente
    const [updatedRows] = await connection.execute('SELECT estado FROM promociones WHERE id = ?', [id]);
    console.log('Estado después de la actualización:', updatedRows[0]);
    
    await connection.end();
    
    res.json({
      estado: 'exito',
      mensaje: `Estado cambiado a ${nuevoEstado}`
    });
    
  } catch (error) {
    console.error('Error cambiando estado:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error cambiando estado'
    });
  }
});

// Endpoint para eliminar promoción
app.delete('/api/eliminar-promocion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    await connection.execute('DELETE FROM promociones WHERE id = ?', [id]);
    
    await connection.end();
    
    res.json({
      estado: 'exito',
      mensaje: 'Promoción eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando promoción:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error eliminando promoción'
    });
  }
});

// Endpoint para actualizar promoción
app.put('/api/actualizar-promocion/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

    const connection = await createConnection();
    
    const updateQuery = `
      UPDATE promociones SET 
        institucion = ?, tipo_promocion = ?, disciplina = ?, 
        beneficios = ?, comentarios_restricciones = ?, 
        fecha_inicio = ?, fecha_fin = ?, 
        imagen_principal = ?, imagen_secundaria = ?
      WHERE id = ?
    `;

    await connection.execute(updateQuery, [
      institucion, tipo_promocion, disciplina, beneficios,
      comentarios_restricciones, fecha_inicio, fecha_fin,
      imagen_principal, imagen_secundaria, id
    ]);

    await connection.end();

    res.json({
      estado: 'exito',
      mensaje: 'Promoción actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando promoción:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error interno del servidor'
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
