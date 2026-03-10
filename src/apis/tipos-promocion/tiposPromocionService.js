// Servicio para manejar los tipos de promoción
import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const tiposPromocionService = {
  // Obtener todos los tipos de promoción
  async obtenerTiposPromocion() {
    try {
      const response = await fetch(`${API_BASE_URL}/tipos-promocion`, {
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

      let resultado = [];
      if (Array.isArray(data)) {
        resultado = data;
      } else if (data && typeof data === 'object') {
        resultado = data.tipos || data.data || data.resultado || [];
        if (!Array.isArray(resultado) && data.success && data.data) {
          resultado = Array.isArray(data.data) ? data.data : [];
        }
      }
      if (!Array.isArray(resultado)) {
        resultado = [];
      }

      return resultado;
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo tipo de promoción
  async crearTipoPromocion(nombre, instituciones = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/tipos-promocion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, instituciones }),
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

  // Actualizar tipo de promoción
  async actualizarTipoPromocion(id, nombre, instituciones = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/tipos-promocion/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, instituciones }),
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

  // Eliminar tipo de promoción
  async eliminarTipoPromocion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tipos-promocion/${id}`, {
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
