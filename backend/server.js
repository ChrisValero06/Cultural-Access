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
    return connection;
  } catch (error) {
    throw error;
  }
}

// Crear tablas si no existen
async function createTables() {
  try {
    const connection = await createConnection();
    
    // Crear tabla de promociones
    const createPromocionesQuery = `
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
    
    // Crear tabla de control de acceso
    const createControlAccesoQuery = `
      CREATE TABLE IF NOT EXISTS control_acceso (
        id_institucion INT AUTO_INCREMENT PRIMARY KEY,
        institucion VARCHAR(255) NOT NULL,
        numero_tarjeta VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        estado ENUM('activo', 'inactivo') DEFAULT 'activo'
      )
    `;

    // Crear tabla de registro de usuarios
    const createRegistroUsuariosQuery = `
      CREATE TABLE IF NOT EXISTS registro_usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        apellido_paterno VARCHAR(255) NOT NULL,
        apellido_materno VARCHAR(255) NOT NULL,
        genero ENUM('femenino', 'masculino', 'prefiero-no-decir', 'otro'),
        email VARCHAR(255) NOT NULL UNIQUE,
        calle_numero VARCHAR(500) NOT NULL,
        municipio VARCHAR(255) NOT NULL,
        estado_direccion VARCHAR(255) NOT NULL,
        colonia VARCHAR(255) NOT NULL,
        codigo_postal VARCHAR(10) NOT NULL,
        telefono VARCHAR(15) NOT NULL,
        edad ENUM('16-17', '18-29', '30-49', '50-59', '60+') NOT NULL,
        estado_civil ENUM('soltero', 'casado', 'viudo', 'divorciado', 'union_libre', 'sociedad_convivencia', 'prefiero_no_decir') NOT NULL,
        estudios ENUM('primaria', 'secundaria', 'preparatoria', 'licenciatura', 'maestria', 'doctorado', 'sin-estudios'),
        curp VARCHAR(18),
        estado_nacimiento VARCHAR(255) NOT NULL,
        dia_nacimiento INT NOT NULL,
        mes_nacimiento INT NOT NULL,
        ano_nacimiento INT NOT NULL,
        numero_tarjeta VARCHAR(5) NOT NULL UNIQUE,
        acepta_info ENUM('si', 'no') NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado_usuario ENUM('activo', 'inactivo') DEFAULT 'activo'
      )
    `;
    
    await connection.execute(createPromocionesQuery);
    
    await connection.execute(createControlAccesoQuery);

    await connection.execute(createRegistroUsuariosQuery);
    
    // Verificar y agregar columna de teléfono si no existe
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'registro_usuarios' 
        AND COLUMN_NAME = 'telefono'
        AND TABLE_SCHEMA = DATABASE()
      `);
      
      if (columns.length === 0) {
        await connection.execute(`
          ALTER TABLE registro_usuarios 
          ADD COLUMN telefono VARCHAR(15) AFTER email
        `);
      }
    } catch (error) {
    }
    
    await connection.end();
  } catch (error) {
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
    
    const [rows] = await connection.execute(`
      SELECT id, institucion, tipo_promocion, disciplina, estado, 
             fecha_inicio, fecha_fin, imagen_principal
      FROM promociones 
      ORDER BY id
    `);
    
    await connection.end();

    res.json({
      estado: 'exito',
      total: rows.length,
      promociones: rows
    });

  } catch (error) {
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
    
    if (!['activa', 'inactiva', 'expirada'].includes(nuevoEstado)) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Estado no válido'
      });
    }
    
    const connection = await createConnection();
    
    await connection.execute(`
      UPDATE promociones 
      SET estado = ? 
      WHERE id = ?
    `, [nuevoEstado, id]);
    
    await connection.end();
    
    res.json({
      estado: 'exito',
      mensaje: `Estado cambiado a ${nuevoEstado}`
    });
    
  } catch (error) {
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
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error interno del servidor'
    });
  }
});

// Endpoint para crear registro de control de acceso
app.post('/api/control-acceso', async (req, res) => {
  try {
    const { institucion, numeroTarjeta, fecha } = req.body;

    // Validar campos requeridos
    if (!institucion || !numeroTarjeta || !fecha) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Todos los campos son requeridos'
      });
    }

    const connection = await createConnection();
    
    const insertQuery = `
      INSERT INTO control_acceso (institucion, numero_tarjeta, fecha) 
      VALUES (?, ?, ?)
    `;

    const [result] = await connection.execute(insertQuery, [institucion, numeroTarjeta, fecha]);

    await connection.end();

    res.status(201).json({
      estado: 'exito',
      mensaje: 'Registro de control de acceso creado exitosamente',
      id_institucion: result.insertId
    });

  } catch (error) {
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error interno del servidor'
    });
  }
});

// Endpoint para procesar formulario de registro cultural access
app.post('/api/culturalaccessform', async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      genero,
      email,
      telefono,
      calle_numero,
      municipio,
      estado,
      colonia,
      codigo_postal,
      edad,
      estado_civil,
      estudios,
      curp,
      estado_nacimiento,
      dia_nacimiento,
      mes_nacimiento,
      ano_nacimiento,
      numero_tarjeta,
      acepta_info
    } = req.body;

    // Construir fecha_nacimiento a partir de los campos individuales
    const fecha_nacimiento = `${ano_nacimiento}-${mes_nacimiento}-${dia_nacimiento}`;

    // Debug: Log de los datos recibidos
    console.log('Datos recibidos:', {
      nombre, apellido_paterno, email, telefono,
      calle_numero, municipio, estado, colonia, codigo_postal,
      edad, estado_nacimiento, dia_nacimiento, mes_nacimiento, ano_nacimiento,
      numero_tarjeta, acepta_info
    });

    // Validar campos requeridos según la estructura de la base de datos
    if (!nombre || !apellido_paterno || !apellido_materno || !email || !telefono ||
        !calle_numero || !municipio || !estado || !colonia || !codigo_postal || 
        !edad || !estado_nacimiento || !dia_nacimiento || !mes_nacimiento || !ano_nacimiento || !numero_tarjeta || !acepta_info) {
      
      // Debug: Identificar qué campos faltan
      const camposFaltantes = [];
      if (!nombre) camposFaltantes.push('nombre');
      if (!apellido_paterno) camposFaltantes.push('apellido_paterno');
      if (!apellido_materno) camposFaltantes.push('apellido_materno');
      if (!email) camposFaltantes.push('email');
      if (!telefono) camposFaltantes.push('telefono');
      if (!calle_numero) camposFaltantes.push('calle_numero');
      if (!municipio) camposFaltantes.push('municipio');
      if (!estado) camposFaltantes.push('estado');
      if (!colonia) camposFaltantes.push('colonia');
      if (!codigo_postal) camposFaltantes.push('codigo_postal');
      if (!edad) camposFaltantes.push('edad');
      if (!estado_nacimiento) camposFaltantes.push('estado_nacimiento');
      if (!dia_nacimiento) camposFaltantes.push('dia_nacimiento');
      if (!mes_nacimiento) camposFaltantes.push('mes_nacimiento');
      if (!ano_nacimiento) camposFaltantes.push('ano_nacimiento');
      if (!numero_tarjeta) camposFaltantes.push('numero_tarjeta');
      if (!acepta_info) camposFaltantes.push('acepta_info');
      
      console.log('Campos faltantes:', camposFaltantes);
      
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados',
        camposFaltantes: camposFaltantes
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Validar formato de teléfono (más flexible)
    const telefonoRegex = /^[\d\-\s\(\)\+]+$/;
    if (!telefonoRegex.test(telefono) || telefono.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Formato de teléfono inválido. Debe contener al menos 10 caracteres y solo números, guiones, espacios, paréntesis y el signo +'
      });
    }

    // Validar que el email y número de tarjeta no estén duplicados
    const connection = await createConnection();
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM registro_usuarios WHERE email = ? OR numero_tarjeta = ?',
      [email, numero_tarjeta]
    );

    if (existingUsers.length > 0) {
      // Verificar específicamente qué campo está duplicado
      const [emailExists] = await connection.execute(
        'SELECT id FROM registro_usuarios WHERE email = ?',
        [email]
      );
      
      const [tarjetaExists] = await connection.execute(
        'SELECT id FROM registro_usuarios WHERE numero_tarjeta = ?',
        [numero_tarjeta]
      );

      await connection.end();

      if (emailExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario registrado con este email'
        });
      }

      if (tarjetaExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario registrado con este número de tarjeta'
        });
      }
    }

    // Insertar nuevo usuario
    const insertQuery = `
      INSERT INTO registro_usuarios (
        nombre, apellido_paterno, apellido_materno, genero, email, telefono,
        calle_numero, municipio, estado, colonia, codigo_postal,
        edad, estado_civil, estudios, curp, estado_nacimiento,
        fecha_nacimiento, numero_tarjeta, acepta_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      nombre, apellido_paterno, apellido_materno, genero, email, telefono,
      calle_numero, municipio, estado, colonia, codigo_postal,
      edad, estado_civil, estudios, curp, estado_nacimiento,
      fecha_nacimiento, numero_tarjeta, acepta_info
    ]);

    await connection.end();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result.insertId
    });

  } catch (error) {
    
    // Si es un error de duplicado de email
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario registrado con este email'
      });
    }

    // Si es un error de duplicado de número de tarjeta
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('numero_tarjeta')) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario registrado con este número de tarjeta'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint de prueba simple
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de prueba simple para usuarios
app.get('/api/usuarios-test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Endpoint de prueba funcionando',
      usuarios: [],
      total: 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en endpoint de prueba: ' + error.message
    });
  }
});

// Endpoint para agregar columna telefono si no existe
app.post('/api/agregar-telefono', async (req, res) => {
  let connection = null;
  try {
    connection = await createConnection();
    
    // Verificar si la columna telefono ya existe
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'registro_usuarios' AND COLUMN_NAME = 'telefono'`,
      [config.database.database]
    );
    
    if (columns.length === 0) {
      // Agregar la columna telefono
      await connection.execute(
        `ALTER TABLE registro_usuarios ADD COLUMN telefono VARCHAR(15) AFTER email`
      );
      
      await connection.end();
      connection = null;
      
      return res.json({ 
        success: true, 
        message: 'Columna telefono agregada exitosamente' 
      });
    } else {
      await connection.end();
      connection = null;
      
      return res.json({ 
        success: true, 
        message: 'La columna telefono ya existe' 
      });
    }
  } catch (error) {
    if (connection) {
      try { await connection.end(); } catch (_) {}
    }
    return res.status(500).json({
      success: false,
      message: 'Error al agregar columna telefono',
      error: error.message
    });
  }
});

// Endpoint para obtener todos los usuarios registrados
app.get('/api/usuarios', async (req, res) => {

  // Dos variantes seguras del SELECT (evitar columnas inexistentes)
  const SELECT_USUARIOS_ESTADO = `
    SELECT 
      id, nombre, apellido_paterno, apellido_materno, genero, email,
      telefono, calle_numero, municipio,
      estado,
      colonia, codigo_postal,
      edad, estado_civil, estudios, curp, estado_nacimiento,
      fecha_nacimiento,
      numero_tarjeta, acepta_info, fecha_registro
    FROM registro_usuarios
    ORDER BY fecha_registro DESC
  `;

  const SELECT_USUARIOS_ESTADO_DIRECCION = `
    SELECT 
      id, nombre, apellido_paterno, apellido_materno, genero, email,
      telefono, calle_numero, municipio,
      estado,
      colonia, codigo_postal,
      edad, estado_civil, estudios, curp, estado_nacimiento,
      fecha_nacimiento,
      numero_tarjeta, acepta_info, fecha_registro
    FROM registro_usuarios
    ORDER BY fecha_registro DESC
  `;

  let connection = null;
  try {
    connection = await createConnection();

    // Verificar existencia de la tabla antes de consultar
    const [tableCheck] = await connection.execute(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'registro_usuarios'`,
      [config.database.database]
    );
    if (tableCheck[0].count === 0) {
      throw new Error('La tabla registro_usuarios no existe en la base de datos');
    }

    let rows;
    try {
      // Intentar con la columna 'estado'
      [rows] = await connection.execute(SELECT_USUARIOS_ESTADO);
    } catch (err) {
      // Si la columna 'estado' no existe, intentar con 'estado_direccion'
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        [rows] = await connection.execute(SELECT_USUARIOS_ESTADO_DIRECCION);
      } else {
        throw err;
      }
    }

    await connection.end();
    connection = null;

    return res.json({ success: true, usuarios: rows, total: rows.length });
  } catch (error) {
    if (connection) {
      try { await connection.end(); } catch (_) {}
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
  }
});

// Endpoint para actualizar usuario
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      genero,
      email,
      telefono,
      calle_numero,
      municipio,
      estado,
      colonia,
      codigo_postal,
      edad,
      estado_civil,
      estudios,
      curp,
      estado_nacimiento,
      dia_nacimiento,
      mes_nacimiento,
      ano_nacimiento,
      numero_tarjeta,
      acepta_info,
      estado_usuario
    } = req.body;

    const connection = await createConnection();
    
    // Verificar que el usuario existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM registro_usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar duplicados de email y número de tarjeta (excluyendo el usuario actual)
    if (email) {
      const [emailExists] = await connection.execute(
        'SELECT id FROM registro_usuarios WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (emailExists.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario registrado con este email'
        });
      }
    }

    if (numero_tarjeta) {
      const [tarjetaExists] = await connection.execute(
        'SELECT id FROM registro_usuarios WHERE numero_tarjeta = ? AND id != ?',
        [numero_tarjeta, id]
      );
      
      if (tarjetaExists.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario registrado con este número de tarjeta'
        });
      }
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const updateValues = [];

    if (nombre !== undefined) { updateFields.push('nombre = ?'); updateValues.push(nombre); }
    if (apellido_paterno !== undefined) { updateFields.push('apellido_paterno = ?'); updateValues.push(apellido_paterno); }
    if (apellido_materno !== undefined) { updateFields.push('apellido_materno = ?'); updateValues.push(apellido_materno); }
    if (genero !== undefined) { updateFields.push('genero = ?'); updateValues.push(genero); }
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (telefono !== undefined) { updateFields.push('telefono = ?'); updateValues.push(telefono); }
    if (calle_numero !== undefined) { updateFields.push('calle_numero = ?'); updateValues.push(calle_numero); }
    if (municipio !== undefined) { updateFields.push('municipio = ?'); updateValues.push(municipio); }
    if (estado !== undefined) { updateFields.push('estado = ?'); updateValues.push(estado); }
    if (colonia !== undefined) { updateFields.push('colonia = ?'); updateValues.push(colonia); }
    if (codigo_postal !== undefined) { updateFields.push('codigo_postal = ?'); updateValues.push(codigo_postal); }
    if (edad !== undefined) { updateFields.push('edad = ?'); updateValues.push(edad); }
    if (estado_civil !== undefined) { updateFields.push('estado_civil = ?'); updateValues.push(estado_civil); }
    if (estudios !== undefined) { updateFields.push('estudios = ?'); updateValues.push(estudios); }
    if (curp !== undefined) { updateFields.push('curp = ?'); updateValues.push(curp); }
    if (estado_nacimiento !== undefined) { updateFields.push('estado_nacimiento = ?'); updateValues.push(estado_nacimiento); }
    if (dia_nacimiento !== undefined) { updateFields.push('dia_nacimiento = ?'); updateValues.push(dia_nacimiento); }
    if (mes_nacimiento !== undefined) { updateFields.push('mes_nacimiento = ?'); updateValues.push(mes_nacimiento); }
    if (ano_nacimiento !== undefined) { updateFields.push('ano_nacimiento = ?'); updateValues.push(ano_nacimiento); }
    if (numero_tarjeta !== undefined) { updateFields.push('numero_tarjeta = ?'); updateValues.push(numero_tarjeta); }
    if (acepta_info !== undefined) { updateFields.push('acepta_info = ?'); updateValues.push(acepta_info); }
    if (estado_usuario !== undefined) { updateFields.push('estado_usuario = ?'); updateValues.push(estado_usuario); }

    if (updateFields.length === 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    updateValues.push(id);
    const updateQuery = `UPDATE registro_usuarios SET ${updateFields.join(', ')} WHERE id = ?`;

    await connection.execute(updateQuery, updateValues);
    await connection.end();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para eliminar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    // Verificar que el usuario existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM registro_usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await connection.execute('DELETE FROM registro_usuarios WHERE id = ?', [id]);
    await connection.end();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para cambiar estado de usuario
app.put('/api/usuarios/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Debe ser "activo" o "inactivo"'
      });
    }

    const connection = await createConnection();
    
    // Verificar que el usuario existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM registro_usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await connection.execute(
      'UPDATE registro_usuarios SET estado_usuario = ? WHERE id = ?',
      [estado, id]
    );
    
    await connection.end();

    res.json({
      success: true,
      message: `Estado del usuario cambiado a ${estado}`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para verificar disponibilidad de número de tarjeta
app.get('/api/verificar-tarjeta/:numeroTarjeta', async (req, res) => {
  try {
    const { numeroTarjeta } = req.params;
    
    if (!numeroTarjeta || numeroTarjeta.length !== 5) {
      return res.status(400).json({
        success: false,
        message: 'Número de tarjeta inválido'
      });
    }

    const connection = await createConnection();
    
    const [rows] = await connection.execute(
      'SELECT id FROM registro_usuarios WHERE numero_tarjeta = ?',
      [numeroTarjeta]
    );
    
    await connection.end();

    const disponible = rows.length === 0;

    res.json({
      success: true,
      disponible: disponible,
      message: disponible ? 'Número de tarjeta disponible' : 'Número de tarjeta ya registrado'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para obtener todos los registros de control de acceso
app.get('/api/control-acceso', async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [rows] = await connection.execute('SELECT * FROM control_acceso ORDER BY id_institucion DESC');
    
    await connection.end();

    res.json({
      estado: 'exito',
      datos: rows
    });

  } catch (error) {
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
    // Servidor iniciado
  });
}).catch(error => {
});
