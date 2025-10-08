// Servicio para manejar las operaciones de control de acceso
import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const controlAccesoService = {
  // Crear nuevo registro de control de acceso
  async crearControlAcceso(controlData) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(controlData),
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

  // Obtener todos los registros de control de acceso
  async obtenerControlAcceso() {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso`, {
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
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener control de acceso por ID
  async obtenerControlAccesoPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso/${id}`, {
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
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar control de acceso
  async actualizarControlAcceso(id, controlData) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(controlData),
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

  // Eliminar control de acceso
  async eliminarControlAcceso(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso/${id}`, {
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

  // Buscar control de acceso por nombre
  async buscarControlAccesoPorNombre(nombre) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso/buscar?nombre=${encodeURIComponent(nombre)}`, {
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
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar control de acceso por tarjeta
  async buscarControlAccesoPorTarjeta(tarjeta) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso/buscar?tarjeta=${encodeURIComponent(tarjeta)}`, {
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
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar control de acceso por fecha
  async buscarControlAccesoPorFecha(fecha) {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso/buscar?fecha=${encodeURIComponent(fecha)}`, {
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
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas de control de acceso
  async obtenerEstadisticasControlAcceso() {
    try {
      const response = await fetch(`${API_BASE_URL}/promociones/control-acceso/estadisticas`, {
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
      return data;
    } catch (error) {
      throw error;
    }
  }
};
