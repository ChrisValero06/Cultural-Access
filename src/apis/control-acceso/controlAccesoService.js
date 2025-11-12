// Servicio para manejar las operaciones de control de acceso
import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;
const CONTROL_ENDPOINT = API_CONFIG.ENDPOINTS?.CONTROL_ACCESO || '/control-acceso';

export const controlAccesoService = {
  // Crear nuevo registro de control de acceso (POST /control-acceso)
  async crearControlAcceso(controlData) {
    try {
      const { institucion, numeroTarjeta, fecha, estado, tipoPromocion } = controlData;

      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}`;
      const payload = {
        institucion,
        numero_tarjeta: numeroTarjeta,
        ...(fecha ? { fecha } : {}),
        ...(estado ? { estado } : {}),
        ...(tipoPromocion ? { tipo_promocion: tipoPromocion } : {})
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json().catch(() => ({ success: true }));
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los registros (GET /control-acceso?limit&offset)
  async obtenerControlAcceso({ limit = 100, offset = 0 } = {}) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Obtener accesos por institución (GET /control-acceso/institucion/:institucion)
  async obtenerPorInstitucion(institucion, { limit = 50 } = {}) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}/institucion/${encodeURIComponent(institucion)}?limit=${encodeURIComponent(limit)}`;
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Obtener accesos por número de tarjeta (GET /control-acceso/tarjeta/:numero_tarjeta)
  async obtenerPorTarjeta(numeroTarjeta, { limit = 50 } = {}) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}/tarjeta/${encodeURIComponent(numeroTarjeta)}?limit=${encodeURIComponent(limit)}`;
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Obtener accesos por fecha (GET /control-acceso/fecha/:fecha)
  async obtenerPorFecha(fecha, { limit = 50 } = {}) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}/fecha/${encodeURIComponent(fecha)}?limit=${encodeURIComponent(limit)}`;
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Obtener accesos por estado (GET /control-acceso/estado/:estado)
  async obtenerPorEstado(estado, { limit = 50 } = {}) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}/estado/${encodeURIComponent(estado)}?limit=${encodeURIComponent(limit)}`;
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas (GET /control-acceso/estadisticas)
  async obtenerEstadisticasControlAcceso({ dias = 30 } = {}) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}/estadisticas?dias=${encodeURIComponent(dias)}`;
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Actualizar estado (PUT /control-acceso/:id/estado)
  async actualizarEstado(id, estado) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}/${encodeURIComponent(id)}/estado`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Eliminar registro (DELETE /control-acceso/:id)
  async eliminarControlAcceso(id) {
    try {
      const url = `${API_BASE_URL}${CONTROL_ENDPOINT}/${encodeURIComponent(id)}`;
      const response = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${url} -> ${text}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};
