// Servicio para manejar las operaciones de promociones
import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const promocionesService = {
  // Obtener todas las promociones
  async obtenerPromociones() {
    try {
      const url = `${API_BASE_URL}/promociones/obtener_promociones`;
      
      // Crear un AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo');
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
      
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            break;
          } else {
            lastError = new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          lastError = error;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('No se pudieron obtener las promociones');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nueva promoción (usando form-data para compatibilidad con backend)
  async crearPromocion(promocionData) {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos como texto
      formData.append('institucion', promocionData.institucion);
      formData.append('tipo_promocion', promocionData.tipo_promocion);
      formData.append('disciplina', promocionData.disciplina);
      formData.append('beneficios', promocionData.beneficios);
      formData.append('comentarios_restricciones', promocionData.comentarios_restricciones);
      formData.append('fecha_inicio', promocionData.fecha_inicio);
      formData.append('fecha_fin', promocionData.fecha_fin);
      formData.append('estado', 'activa'); // Estado por defecto
      
      // Agregar URLs de imágenes si existen
      if (promocionData.imagen_principal) {
        formData.append('imagen_principal', promocionData.imagen_principal);
      }
      if (promocionData.imagen_secundaria) {
        formData.append('imagen_secundaria', promocionData.imagen_secundaria);
      }

      const response = await fetch(`${API_BASE_URL}/promociones`, {
        method: 'POST',
        body: formData, // Sin Content-Type, el navegador lo establece automáticamente
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      throw error
    }
  },

  // Subir imagen de promoción
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Intentar diferentes endpoints de eliminación
      const endpoints = [
        `${API_BASE_URL}/promociones/${id}`,
        `${API_BASE_URL}/promociones/eliminar/${id}`,
        `${API_BASE_URL}/promociones/delete/${id}`
      ];
      
      let response;
      let lastError;
      
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'DELETE',
            headers,
          });
          
          if (response.ok) {
            break;
          } else {
            lastError = new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          lastError = error;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('Todos los endpoints de eliminación fallaron');
      }

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

  // Actualizar promoción (versión simple sin archivos)
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

  // Actualizar promoción con archivos (usando FormData)
  async actualizarPromocionConArchivos(id, promocionData, imagenPrincipalFile = null, imagenSecundariaFile = null) {
    try {
      const formData = new FormData();
      
      // Agregar datos de la promoción
      Object.keys(promocionData).forEach(key => {
        if (key === 'imagen_principal' || key === 'imagen_secundaria') {
          if (promocionData[key] === null || promocionData[key] === '') {
            formData.append(key, ''); // Enviar string vacío para eliminar
          } else if (promocionData[key] !== undefined) {
            formData.append(key, promocionData[key]);
          }
        } else if (promocionData[key] !== null && promocionData[key] !== undefined) {
          formData.append(key, promocionData[key]);
        }
      });

      // Agregar archivos si existen
      if (imagenPrincipalFile) {
        formData.append('imagen_principal', imagenPrincipalFile);
      }
      if (imagenSecundariaFile) {
        formData.append('imagen_secundaria', imagenSecundariaFile);
      }

      const url = `${API_BASE_URL}/promociones/${id}`;

      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
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
