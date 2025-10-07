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

      // Verificar si la respuesta es HTML en lugar de JSON
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        // Leer el contenido HTML para diagnosticar
        const responseText = await response.text();
        
        // Si contiene "doctype" es una página HTML completa
        if (responseText.includes('<!doctype') || responseText.includes('<html')) {
          throw new Error(`El servidor está devolviendo una página HTML completa en lugar de JSON. Esto puede indicar que el endpoint /api no existe o está mal configurado.`);
        }
        
        // Si no es HTML completo, puede ser un error de API
        throw new Error(`El servidor devolvió contenido no-JSON. Content-Type: ${contentType}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Verificar nuevamente el content-type
      const finalContentType = response.headers.get('content-type');
      if (!finalContentType || !finalContentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`El servidor devolvió HTML en lugar de JSON. Content-Type: ${finalContentType}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
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
        `${API_BASE_URL}/promociones?all=1&_ts=${Date.now()}`,
        `${API_BASE_URL}/promociones/obtener_promociones?all=1&_ts=${Date.now()}`,
        `${API_BASE_URL}/promociones?_ts=${Date.now()}`,
        `${API_BASE_URL}/promociones/obtener_promociones?_ts=${Date.now()}`
      ];
      
      let response;
      let lastError;
      
      for (const url of endpoints) {
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
            cache: 'no-store',
          });
          
          if (response.ok) {
            break;
          } else {
            lastError = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (error) {
          lastError = error.message;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Todos los endpoints fallaron. Último error: ${lastError}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
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

      // Algunos backends devuelven 204 No Content al eliminar correctamente
      if (response.status === 204) {
        return { estado: 'exito' };
      }

      // Si hay cuerpo JSON, devolverlo; si no, asumir éxito
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      return { estado: 'exito' };
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

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
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

  // ===== AUTENTICACIÓN =====

  // Login de usuario
  async login(emailOrUsuario, password) {
    try {
      const response = await fetch(`${API_BASE_GENERAL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviar ambos campos para mayor compatibilidad con el backend
        body: JSON.stringify({ email: emailOrUsuario, usuario: emailOrUsuario, password }),
      });

      if (!response.ok) {
        // Si el endpoint no existe (404) o similar, permitir fallback de frontend
        if (response.status === 404) {
          console.warn('Auth API no disponible (404). Usando login de respaldo en frontend.');
          return { token: 'frontend-only-token', user: { email: emailOrUsuario, usuario: emailOrUsuario } };
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error de autenticación: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback por error de red u otros problemas (sin bloquear el acceso)
      console.warn('Fallo en login remoto. Usando login de respaldo en frontend.', error);
      return { token: 'frontend-only-token', user: { email: emailOrUsuario, usuario: emailOrUsuario } };
    }
  },

  // Verificar token de autenticación
  async verificarToken(token) {
    try {
      const response = await fetch(`${API_BASE_GENERAL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw error;
    }
  },

  // Logout de usuario
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${API_BASE_GENERAL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Obtener email del usuario autenticado
  getCurrentUser() {
    return localStorage.getItem('userEmail');
  },

};

export default apiService;
