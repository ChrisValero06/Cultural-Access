// Archivo principal para exportar todos los servicios de API
export { promocionesService } from './promociones/promocionesService.js';
export { usuariosService } from './usuarios/usuariosService.js';
export { controlAccesoService } from './control-acceso/controlAccesoService.js';
export { authService } from './auth/authService.js';
export { institucionesService } from './instituciones/institucionesService.js';

// Servicio unificado que combina todos los servicios (para compatibilidad con código existente)
import { promocionesService } from './promociones/promocionesService.js';
import { usuariosService } from './usuarios/usuariosService.js';
import { controlAccesoService } from './control-acceso/controlAccesoService.js';
import { authService } from './auth/authService.js';
import { institucionesService } from './instituciones/institucionesService.js';

export const apiService = {
  // Promociones
  ...promocionesService,
  
  // Usuarios
  ...usuariosService,
  
  // Control de acceso
  ...controlAccesoService,
  
  // Autenticación
  ...authService,
  
  // Instituciones
  ...institucionesService,
  
  // Métodos adicionales para compatibilidad
  obtenerPromocionesAdmin: promocionesService.obtenerPromocionesAdmin,
  eliminarPromocion: promocionesService.eliminarPromocion,
  cambiarEstadoPromocion: promocionesService.cambiarEstadoPromocion,
  actualizarPromocion: promocionesService.actualizarPromocion,
  crearPromocion: promocionesService.crearPromocion,
  subirImagen: promocionesService.subirImagen,
  obtenerPromocionesCarrusel: promocionesService.obtenerPromocionesCarrusel,
  buscarPorInstitucion: promocionesService.buscarPorInstitucion,
  buscarPorDisciplina: promocionesService.buscarPorDisciplina,
  
  // Métodos de autenticación
  login: authService.login,
  logout: authService.logout,
  isAuthenticated: authService.isAuthenticated,
  getUserEmail: authService.getUserEmail,
  verificarToken: authService.verificarToken,
  
  // Métodos de usuarios
  crearUsuario: usuariosService.crearUsuario,
  verificarTarjeta: usuariosService.verificarTarjeta,
  obtenerUsuarios: usuariosService.obtenerUsuarios,
  obtenerUsuarioPorId: usuariosService.obtenerUsuarioPorId,
  actualizarUsuario: usuariosService.actualizarUsuario,
  eliminarUsuario: usuariosService.eliminarUsuario,
  buscarUsuariosPorNombre: usuariosService.buscarUsuariosPorNombre,
  buscarUsuariosPorEmail: usuariosService.buscarUsuariosPorEmail,
  
  // Métodos de control de acceso
  crearControlAcceso: controlAccesoService.crearControlAcceso,
  obtenerControlAcceso: controlAccesoService.obtenerControlAcceso,
  obtenerControlAccesoPorId: controlAccesoService.obtenerControlAccesoPorId,
  actualizarControlAcceso: controlAccesoService.actualizarControlAcceso,
  eliminarControlAcceso: controlAccesoService.eliminarControlAcceso,
  buscarControlAccesoPorNombre: controlAccesoService.buscarControlAccesoPorNombre,
  buscarControlAccesoPorTarjeta: controlAccesoService.buscarControlAccesoPorTarjeta,
  buscarControlAccesoPorFecha: controlAccesoService.buscarControlAccesoPorFecha,
  obtenerEstadisticasControlAcceso: controlAccesoService.obtenerEstadisticasControlAcceso,
  
  // Métodos de instituciones
  obtenerInstituciones: institucionesService.obtenerInstituciones,
  crearInstitucion: institucionesService.crearInstitucion,
  buscarInstituciones: institucionesService.buscarInstituciones,
  actualizarInstitucion: institucionesService.actualizarInstitucion,
  eliminarInstitucion: institucionesService.eliminarInstitucion
};
