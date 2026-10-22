// Servicio para el newsletter (campañas en Mailchimp + suscriptores)
import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = `${API_CONFIG.BASE_URL}/newsletter`;

function headersAuth(extra = {}) {
  const token = localStorage.getItem('authToken');
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: headersAuth(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
}

async function requestHtml(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: headersAuth(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  return response.text();
}

export const newsletterService = {
  // Público: formulario del sitio
  suscribirNewsletter(correo_electronico) {
    return request('/suscriptores', { method: 'POST', body: { correo_electronico } });
  },

  obtenerSuscriptores() {
    return request('/suscriptores');
  },

  eliminarSuscriptor(id) {
    return request(`/suscriptores/${id}`, { method: 'DELETE' });
  },

  obtenerConteoAudiencia() {
    return request('/audiencia');
  },

  obtenerCampanas() {
    return request('/campanas');
  },

  obtenerCampana(id) {
    return request(`/campanas/${id}`);
  },

  crearCampana(campana) {
    return request('/campanas', { method: 'POST', body: campana });
  },

  actualizarCampana(id, campana) {
    return request(`/campanas/${id}`, { method: 'PUT', body: campana });
  },

  eliminarCampana(id) {
    return request(`/campanas/${id}`, { method: 'DELETE' });
  },

  // Renderiza el correo sin guardarlo (vista previa del editor)
  previewCampana(campana) {
    return requestHtml('/preview', { method: 'POST', body: campana });
  },

  previewCampanaGuardada(id) {
    return requestHtml(`/campanas/${id}/preview`);
  },

  enviarPrueba(id, correo) {
    return request(`/campanas/${id}/test`, { method: 'POST', body: { correo } });
  },

  enviarCampana(id) {
    return request(`/campanas/${id}/enviar`, { method: 'POST', body: {} });
  },

  programarCampana(id, fechaIso) {
    return request(`/campanas/${id}/programar`, { method: 'POST', body: { fecha: fechaIso } });
  },

  async subirImagenNewsletter(file) {
    const formData = new FormData();
    formData.append('imagen', file);
    const response = await fetch(`${API_BASE_URL}/imagenes`, {
      method: 'POST',
      headers: headersAuth(),
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
    return data.url;
  },
};
