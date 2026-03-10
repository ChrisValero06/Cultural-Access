// Servicio para manejar las operaciones de instituciones
import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const institucionesService = {
  // Obtener todas las instituciones
  async obtenerInstituciones() {
    try {
      const response = await fetch(`${API_BASE_URL}/instituciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Manejar diferentes estructuras de respuesta del backend
      let resultado = [];
      
      if (Array.isArray(data)) {
        // Si es directamente un array
        resultado = data;
      } else if (data && typeof data === 'object') {
        // Intentar extraer el array de diferentes propiedades posibles
        resultado = data.instituciones || data.data || data.resultado || data.rows || [];
        
        // Si aún no es un array, verificar si tiene una propiedad que sea array
        if (!Array.isArray(resultado) && data.success && data.data) {
          resultado = Array.isArray(data.data) ? data.data : [];
        }
      }
      
      // Verificar que sea un array válido
      if (!Array.isArray(resultado)) {
        resultado = [];
      }
      
      return resultado;
    } catch (error) {
      throw error;
    }
  },

  // Crear nueva institución
  async crearInstitucion(nombre) {
    try {
      const response = await fetch(`${API_BASE_URL}/instituciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
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

  // Buscar instituciones por término
  async buscarInstituciones(termino) {
    try {
      const response = await fetch(`${API_BASE_URL}/instituciones/buscar?termino=${encodeURIComponent(termino)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data.instituciones || data.data || []);
    } catch (error) {
      throw error;
    }
  },

  // Actualizar institución
  async actualizarInstitucion(id, nombre) {
    try {
      const response = await fetch(`${API_BASE_URL}/instituciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
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

  // Eliminar institución
  async eliminarInstitucion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/instituciones/${id}`, {
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
  }
};

