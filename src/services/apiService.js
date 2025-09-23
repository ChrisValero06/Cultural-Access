// Servicio para manejar las llamadas a la API del backend Node.js
import { API_CONFIG, getApiUrl } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;
// Algunos endpoints del backend viven bajo /api (no bajo /api/promociones)
const API_BASE_GENERAL = 'https://culturallaccess.residente.mx/api';

export const apiService = {
  // Crear nueva promoción
  async crearPromocion(promocionData) {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promocionData),
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
      console.log('🔗 Conectando a:', `${API_BASE_URL}`);
      
      // Crear un AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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

  // Obtener promociones para el dashboard (todas, sin filtrar por estado)
  async obtenerPromocionesAdmin() {
    try {
      const url = `${API_BASE_URL}?all=1`;
      console.log('🔗 Conectando a (admin):', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Respuesta del servidor (admin):', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
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

      const response = await fetch(`${API_BASE_URL}/subir_imagen`, {
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
      const response = await fetch(`${API_BASE_URL}?institucion=${encodeURIComponent(institucion)}`, {
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
      const response = await fetch(`${API_BASE_URL}?disciplina=${encodeURIComponent(disciplina)}`, {
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
      const url = `${API_CONFIG.BASE_URL}/carrusel?v=${Date.now()}`;
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
      
      const response = await fetch(`${API_BASE_URL}/${id}/estado`, {
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
      const response = await fetch(`${API_BASE_URL}/${id}`, {
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

  // Actualizar promoción
  async actualizarPromocion(id, promocionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promocionData),
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
