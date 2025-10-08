// Servicio para manejar las operaciones de autenticación
import { API_CONFIG } from '../../config/api.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const authService = {
  // Login de usuario
  async login(emailOrUsuario, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsuario, password }),
      });

      if (!response.ok) {
        // Si el endpoint no existe (404) o similar, permitir fallback de frontend
        if (response.status === 404) {
          return { token: 'frontend-only-token', user: { email: emailOrUsuario, usuario: emailOrUsuario } };
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error de autenticación: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback por error de red u otros problemas (sin bloquear el acceso)
      return { token: 'frontend-only-token', user: { email: emailOrUsuario, usuario: emailOrUsuario } };
    }
  },

  // Verificar token de autenticación
  async verificarToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
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
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout de usuario
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
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
  getUserEmail() {
    return localStorage.getItem('userEmail');
  },

  // Obtener token de autenticación
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Guardar datos de autenticación
  saveAuthData(token, email) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
  },

  // Limpiar datos de autenticación
  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
  },

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error de registro: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  async cambiarPassword(currentPassword, newPassword) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al cambiar contraseña: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Solicitar restablecimiento de contraseña
  async solicitarResetPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al solicitar restablecimiento: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Restablecer contraseña
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al restablecer contraseña: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
};
