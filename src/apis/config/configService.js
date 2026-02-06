import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;
const TEXTOS_PROMOCIONES_ENDPOINT = API_CONFIG.ENDPOINTS?.TEXTOS_PROMOCIONES ?? '/config/textos-promociones';

export const configService = {
  /**
   * Obtiene título y subtítulo de la sección promociones desde el backend.
   * @returns {Promise<{ titulo: string, subtitulo: string } | null>} null si el backend no tiene el endpoint o falla.
   */
  async getTextosPromociones() {
    try {
      const response = await fetch(`${API_BASE_URL}${TEXTOS_PROMOCIONES_ENDPOINT}`);
      if (!response.ok) return null;
      const data = await response.json();
      const titulo = data?.titulo ?? data?.data?.titulo;
      const subtitulo = data?.subtitulo ?? data?.data?.subtitulo;
      if (typeof titulo === 'string' && typeof subtitulo === 'string') {
        return { titulo, subtitulo };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Guarda título y subtítulo en el backend.
   * @param {{ titulo?: string, subtitulo?: string }} payload
   * @returns {Promise<boolean>} true si se guardó correctamente.
   */
  async updateTextosPromociones(payload) {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}${TEXTOS_PROMOCIONES_ENDPOINT}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
