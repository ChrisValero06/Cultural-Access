// Servicio para manejar las llamadas a la API del backend PHP
import { API_CONFIG, getApiUrl } from '../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const apiService = {
  // Crear nueva promoción
  async crearPromocion(promocionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/crear_promocion.php`, {
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
      console.error('Error al crear promoción:', error);
      throw error;
    }
  },

  // Obtener todas las promociones
  async obtenerPromociones() {
    try {
      const response = await fetch(`${API_BASE_URL}/obtener_promociones.php`, {
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
      console.error('Error al obtener promociones:', error);
      throw error;
    }
  },

  // Subir imagen al servidor
  async subirImagen(imagen, nombreArchivo) {
    try {
      const formData = new FormData();
      formData.append('imagen', imagen);
      formData.append('nombre', nombreArchivo);

      const response = await fetch(`${API_BASE_URL}/subir_imagen.php`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  },

  // Buscar promociones por institución
  async buscarPorInstitucion(institucion) {
    try {
      const response = await fetch(`${API_BASE_URL}/buscar_promocion.php?institucion=${encodeURIComponent(institucion)}`, {
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
      console.error('Error al buscar promociones:', error);
      throw error;
    }
  },

  // Buscar promociones por disciplina
  async buscarPorDisciplina(disciplina) {
    try {
      const response = await fetch(`${API_BASE_URL}/buscar_promocion.php?disciplina=${encodeURIComponent(disciplina)}`, {
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
      console.error('Error al buscar promociones:', error);
      throw error;
    }
  }
};

export default apiService;
