// Servicio para manejar las llamadas a la API del backend Node.js
import { API_CONFIG, getApiUrl } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;
// Usar la misma URL base para consistencia
const API_BASE_GENERAL = API_CONFIG.BASE_URL;


export const apiService = {
  // ===== PROMOCIONES =====
  
  // Crear nueva promoción
  async crearPromocion(promocionData) {
    try {
      // Usar URL absoluta para evitar problemas del proxy
      const url = 'https://culturallaccess.residente.mx/api/promociones/';
      console.log('🔗 URL de crear promoción:', url);
      console.log('📋 Datos a enviar:', promocionData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promocionData),
        mode: 'cors', // Agregar modo CORS explícito
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las promociones
  async obtenerPromociones() {
    try {
      const url = `${API_BASE_URL}/promociones/obtener_promociones`;
      console.log('🔗 Conectando a:', url);
      
      // Crear un AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      // Verificar si la respuesta es HTML en lugar de JSON
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.log('⚠️ Proxy devolvió HTML, esto indica un problema con el servidor');
        console.log('🔍 Verificando si el servidor está devolviendo una página de error...');
        
        // Leer el contenido HTML para diagnosticar
        const responseText = await response.text();
        console.log('📄 Contenido HTML recibido (primeros 500 caracteres):', responseText.substring(0, 500));
        
        // Si contiene "doctype" es una página HTML completa
        if (responseText.includes('<!doctype') || responseText.includes('<html')) {
          throw new Error(`El servidor está devolviendo una página HTML completa en lugar de JSON. Esto puede indicar que el endpoint /api no existe o está mal configurado.`);
        }
        
        // Si no es HTML completo, puede ser un error de API
        throw new Error(`El servidor devolvió contenido no-JSON. Content-Type: ${contentType}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Verificar nuevamente el content-type
      const finalContentType = response.headers.get('content-type');
      if (!finalContentType || !finalContentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Respuesta no es JSON. Content-Type:', finalContentType);
        console.error('❌ Respuesta recibida:', responseText.substring(0, 200) + '...');
        throw new Error(`El servidor devolvió HTML en lugar de JSON. Content-Type: ${finalContentType}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos correctamente:', data);
      return data;
    } catch (error) {
      console.error('💥 Error en obtenerPromociones:', error);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: La conexión tardó demasiado tiempo');
      }
      throw error;
    }
  },

  // Obtener promociones para el dashboard (todas, incluyendo inactivas)
  async obtenerPromocionesAdmin() {
    try {
      // Probar diferentes endpoints para obtener todas las promociones
      const endpoints = [
        `${API_BASE_URL}/promociones?all=1`,
        `${API_BASE_URL}/promociones/obtener_promociones?all=1`,
        `${API_BASE_URL}/promociones`,
        `${API_BASE_URL}/promociones/obtener_promociones`
      ];
      
      let response;
      let lastError;
      
      for (const url of endpoints) {
        try {
          console.log('🔗 Probando endpoint:', url);
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('📡 Respuesta del servidor:', response.status, response.statusText);
          
          if (response.ok) {
            console.log('✅ Endpoint funcionando:', url);
            break;
          } else {
            lastError = `HTTP ${response.status}: ${response.statusText}`;
            console.log('❌ Endpoint falló:', url, lastError);
          }
        } catch (error) {
          lastError = error.message;
          console.log('❌ Error en endpoint:', url, error.message);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Todos los endpoints fallaron. Último error: ${lastError}`);
      }

      const data = await response.json();
      console.log('✅ Promociones cargadas:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('💥 Error en obtenerPromocionesAdmin:', error);
      throw error;
    }
  },

  // Subir imagen al servidor
  async subirImagen(imagen, nombreArchivo) {
    try {
      const formData = new FormData();
      formData.append('imagen', imagen);
      formData.append('nombre', nombreArchivo);

      const response = await fetch(`${API_BASE_URL}/promociones/subir_imagen`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar promociones por institución
  async buscarPorInstitucion(institucion) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/obtener_promociones?institucion=${encodeURIComponent(institucion)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar promociones por disciplina
  async buscarPorDisciplina(disciplina) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/obtener_promociones?disciplina=${encodeURIComponent(disciplina)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener promociones para el carrusel
  async obtenerPromocionesCarrusel() {
    try {
      const url = `${API_BASE_URL}/promociones/carrusel?v=${Date.now()}`;
      console.log('🔗 Intentando conectar a:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos correctamente');
      return data;
    } catch (error) {
      console.error('💥 Error en obtenerPromocionesCarrusel:', error);
      throw error;
    }
  },

  // Cambiar estado de promoción
  async cambiarEstadoPromocion(id, nuevoEstado) {
    try {
      const requestBody = { nuevoEstado };
      
      const response = await fetch(`${API_BASE_URL}/promociones/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar promoción
  async eliminarPromocion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar promoción
  async actualizarPromocion(id, promocionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promocionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Crear registro de control de acceso
  async crearControlAcceso(controlAccesoData) {
    try {
      // Normalizar nombres/valores según contrato del backend
      const payload = {
        institucion: controlAccesoData.institucion,
        numero_tarjeta: controlAccesoData.numeroTarjeta || controlAccesoData.numero_tarjeta,
        fecha: controlAccesoData.fecha,
        estado: controlAccesoData.estado === 'activo' ? 'activa' : (controlAccesoData.estado === 'inactivo' ? 'inactiva' : controlAccesoData.estado)
      };

      const url = `${API_BASE_GENERAL}/control-acceso`;
      console.log('🔗 URL de control de acceso:', url);
      console.log('📋 Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos correctamente:', data);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los registros de control de acceso
  async obtenerControlAcceso() {
    try {
      const response = await fetch(`${API_BASE_GENERAL}/control-acceso`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los usuarios registrados
  async obtenerUsuarios() {
    try {
      const response = await fetch(`${API_BASE_GENERAL}/usuario`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  async actualizarUsuario(id, usuarioData) {
    try {
      const response = await fetch(`${API_BASE_GENERAL}/usuario/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario
  async eliminarUsuario(id) {
    try {
      const response = await fetch(`${API_BASE_GENERAL}/usuario/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

};

export default apiService;
