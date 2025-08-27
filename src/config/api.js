// Configuración de la API del backend
export const API_CONFIG = {
  // URL base del backend Node.js
  BASE_URL: 'http://localhost:3001/api',
  
  // Endpoints específicos
  ENDPOINTS: {
    CREAR_PROMOCION: '/crear_promocion',
    OBTENER_PROMOCIONES: '/obtener_promociones',
    BUSCAR_PROMOCION: '/buscar_promocion',
    SUBIR_IMAGEN: '/subir_imagen'
  },
  
  // Configuración de subida de archivos
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB en bytes
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  
  // Configuración de la base de datos
  DATABASE: {
    NAME: 'cultural_access',
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: ''
  }
}

// Función para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Función para validar tipos de archivo permitidos
export const isFileTypeAllowed = (file) => {
  return API_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)
}

// Función para validar tamaño de archivo
export const isFileSizeValid = (file) => {
  return file.size <= API_CONFIG.UPLOAD.MAX_FILE_SIZE
}

export default API_CONFIG
