import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../apis';
import { useInstituciones } from '../../../../context/InstitucionesContext';
import { tiposPromocionService } from '../../../../apis/tipos-promocion/tiposPromocionService';

// Opciones para los dropdowns
const OPCIONES_DROPDOWN = {
  disciplina: ['Artes Plásticas', 'Cine', 'Danza', 'Teatro', 'Música', 'Literatura', 'Diseño Gráfico', 'Arquitectura', 'Arte Textil', 'Otra']
};

// Normaliza URLs de imágenes a tu servidor en Plesk y aplica fallback local
const BASE_HOST = 'https://culturallaccess.com';
const UPLOADS_PREFIX = '/images/uploads/';
const FALLBACK_IMAGE = '/images/LogoDerecho.png';

function normalizeImageUrl(url) {
  if (!url) return FALLBACK_IMAGE;
  // Ya es absoluta
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Si ya viene con /images/... solo anteponer host
  if (url.startsWith('/images/')) return `${BASE_HOST}${url}`;
  // Si es solo el nombre/relativa, asumir que está en uploads
  return `${BASE_HOST}${UPLOADS_PREFIX}${url}`;
}

const EditarPromocionModal = ({ modalAbierto, setModalAbierto, editandoForm, setEditandoForm, onGuardarCambios, onPromocionActualizada }) => {
  const { instituciones, cargando: cargandoInstituciones } = useInstituciones();
  const [tiposPromocion, setTiposPromocion] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [imagenPrincipalFile, setImagenPrincipalFile] = useState(null);
  const [imagenSecundariaFile, setImagenSecundariaFile] = useState(null);
  const [previewPrincipal, setPreviewPrincipal] = useState(null);
  const [previewSecundaria, setPreviewSecundaria] = useState(null);
  const [imagenPrincipalError, setImagenPrincipalError] = useState(false);
  const [imagenSecundariaError, setImagenSecundariaError] = useState(false);
  
  const [todosLosTipos, setTodosLosTipos] = useState([]);

  useEffect(() => {
    tiposPromocionService.obtenerTiposPromocion()
      .then(data => {
        const tipos = Array.isArray(data) ? data : [];
        setTodosLosTipos(tipos);
      })
      .catch(() => setTodosLosTipos([]));
  }, []);

  // Filtrar tipos de promoción según la institución seleccionada
  useEffect(() => {
    const institucionSeleccionada = editandoForm?.institucion || '';
    if (institucionSeleccionada) {
      const tiposFiltrados = todosLosTipos
        .filter(t => {
          const instituciones = t.instituciones || [];
          // Si no tiene instituciones asignadas, se muestra en todas
          return instituciones.length === 0 || instituciones.includes(institucionSeleccionada);
        })
        .map(t => t.nombre || t)
        .sort((a, b) => a.localeCompare(b, 'es'));
      setTiposPromocion(tiposFiltrados);
    } else {
      const nombres = todosLosTipos.map(t => t.nombre || t).sort((a, b) => a.localeCompare(b, 'es'));
      setTiposPromocion(nombres);
    }
  }, [editandoForm?.institucion, todosLosTipos]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalAbierto && !guardando) setModalAbierto(false);
    };
    if (modalAbierto) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modalAbierto, guardando, setModalAbierto]);

  useEffect(() => {
    if (!modalAbierto) {
      setImagenPrincipalFile(null);
      setImagenSecundariaFile(null);
      setPreviewPrincipal(null);
      setPreviewSecundaria(null);
      setImagenPrincipalError(false);
      setImagenSecundariaError(false);
    }
  }, [modalAbierto]);

  // Convertir fechas ISO a formato yyyy-MM-dd para los inputs de tipo date
  useEffect(() => {
    if (modalAbierto && editandoForm) {
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        // Si ya está en formato yyyy-MM-dd, devolverlo tal cual
        if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
          return fecha;
        }
        // Si es una fecha ISO o Date, convertirla
        try {
          const fechaObj = new Date(fecha);
          if (!isNaN(fechaObj.getTime())) {
            const año = fechaObj.getFullYear();
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            const dia = String(fechaObj.getDate()).padStart(2, '0');
            return `${año}-${mes}-${dia}`;
          }
        } catch (e) {
        }
        return '';
      };

      // Solo actualizar si las fechas necesitan conversión
      if (editandoForm.fecha_inicio || editandoForm.fecha_fin) {
        const fechaInicioFormateada = formatearFecha(editandoForm.fecha_inicio);
        const fechaFinFormateada = formatearFecha(editandoForm.fecha_fin);
        
        if (fechaInicioFormateada !== editandoForm.fecha_inicio || fechaFinFormateada !== editandoForm.fecha_fin) {
          setEditandoForm({
            ...editandoForm,
            fecha_inicio: fechaInicioFormateada,
            fecha_fin: fechaFinFormateada
          });
        }
      }
    }
  }, [modalAbierto, editandoForm?.id]); // Solo cuando se abre el modal o cambia el ID
  
  if (!modalAbierto) return null;

  // Debug: mostrar datos de la promoción


  const validarImagen = (file) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const tamañoMaximo = 30 * 1024 * 1024; // 30MB
    if (!tiposPermitidos.includes(file.type)) {
      return false;
    }
    if (file.size > tamañoMaximo) {
      return false;
    }
    return true;
  };

  const handleImagenPrincipalChange = (e) => {
    const file = e.target.files[0];
    if (file && validarImagen(file)) {
      setImagenPrincipalFile(file);
      setImagenPrincipalError(false);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewPrincipal(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImagenSecundariaChange = (e) => {
    const file = e.target.files[0];
    if (file && validarImagen(file)) {
      setImagenSecundariaFile(file);
      setImagenSecundariaError(false);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewSecundaria(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImagenPrincipal = () => {
    setImagenPrincipalFile(null);
    setPreviewPrincipal(null);
    setImagenPrincipalError(false);
    setEditandoForm({...editandoForm, imagen_principal: ''});
  };

  const removeImagenSecundaria = () => {
    setImagenSecundariaFile(null);
    setPreviewSecundaria(null);
    setImagenSecundariaError(false);
    setEditandoForm({...editandoForm, imagen_secundaria: ''});
  };

  const handleGuardar = async () => {
    if (!editandoForm.institucion.trim()) { return; }
    if (!editandoForm.tipo_promocion.trim()) { return; }
    if (!editandoForm.disciplina.trim()) { return; }
    if (!editandoForm.fecha_inicio) { return; }
    if (!editandoForm.fecha_fin) { return; }
    
    // Validar que las fechas sean válidas
    const fechaInicio = new Date(editandoForm.fecha_inicio);
    const fechaFin = new Date(editandoForm.fecha_fin);
    
    if (isNaN(fechaInicio.getTime())) {
      return;
    }
    if (isNaN(fechaFin.getTime())) {
      return;
    }
    
    if (fechaInicio >= fechaFin) {
      return;
    }
    
    // Validar que la fecha de inicio no sea muy antigua (opcional)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diasDiferencia = Math.ceil((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
    
    if (diasDiferencia > 365) {
      return;
    }

    setGuardando(true);
    try {
      // Preparar datos para envío
      const datosPromocion = { ...editandoForm };
      
      // ⭐⭐ MANEJAR ELIMINACIÓN DE IMÁGENES
      // Si la imagen fue eliminada (string vacío), enviar null explícitamente
      const imagenPrincipalEliminada = datosPromocion.imagen_principal === '';
      const imagenSecundariaEliminada = datosPromocion.imagen_secundaria === '';
      
      if (imagenPrincipalEliminada) {
        datosPromocion.imagen_principal = null;
      }
      if (imagenSecundariaEliminada) {
        datosPromocion.imagen_secundaria = null;
      }
      
      // Si hay archivos nuevos O imágenes eliminadas, usar actualizarPromocionConArchivos
      if (imagenPrincipalFile || imagenSecundariaFile || imagenPrincipalEliminada || imagenSecundariaEliminada) {
        
        
        // ⭐⭐ USAR actualizarPromocionConArchivos() que envía todo junto
        try {
          const response = await apiService.actualizarPromocionConArchivos(
            editandoForm.id,
            datosPromocion,
            imagenPrincipalFile, // null si no hay archivo nuevo
            imagenSecundariaFile // null si no hay archivo nuevo
          );
          
          if (response.estado === 'exito' || response.success === true) {
            // Construir la promoción actualizada con las URLs del servidor
            const promocionActualizada = {
              ...datosPromocion,
              id: editandoForm.id,
              // Usar las URLs del servidor si están disponibles
              imagen_principal: response.promocion?.imagen_principal || 
                                response.imagen_principal || 
                                response.data?.imagen_principal ||
                                datosPromocion.imagen_principal,
              imagen_secundaria: response.promocion?.imagen_secundaria || 
                                 response.imagen_secundaria || 
                                 response.data?.imagen_secundaria ||
                                 datosPromocion.imagen_secundaria,
              // Incluir cualquier otro dato que el servidor haya devuelto
              ...(response.promocion || response.data || {})
            };
            
            // Cerrar el modal
            setModalAbierto(false);
            setEditandoForm(null);
            
            // Notificar al dashboard que la promoción fue actualizada
            if (onPromocionActualizada) {
              onPromocionActualizada(promocionActualizada);
            }
            
          } else {
            return;
          }
        } catch (error) {
          throw error; // Re-lanzar para que el catch externo lo maneje
        }
      } else {
        // Si no hay archivos nuevos, usar la función simple
        await onGuardarCambios();
      }
    } catch (error) {
    } finally {
      setGuardando(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !guardando) setModalAbierto(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4"> Editar Promoción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institución *</label>
            <div className="relative">
              <select
                value={editandoForm.institucion || ''}
                onChange={(e) => {
                  const nuevaInstitucion = e.target.value;
                  // Verificar si el tipo actual sigue siendo válido para la nueva institución
                  const tipoActualValido = todosLosTipos.some(t => {
                    const nombre = t.nombre || t;
                    const instituciones = t.instituciones || [];
                    return nombre === editandoForm.tipo_promocion && (instituciones.length === 0 || instituciones.includes(nuevaInstitucion));
                  });
                  setEditandoForm({
                    ...editandoForm,
                    institucion: nuevaInstitucion,
                    tipo_promocion: tipoActualValido ? editandoForm.tipo_promocion : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black appearance-none bg-white"
                required
                disabled={cargandoInstituciones}
              >
                <option value="" disabled>{cargandoInstituciones ? 'Cargando instituciones...' : 'Selecciona una institución'}</option>
                {instituciones.map((opcion, index) => (
                  <option key={index} value={opcion}>{opcion}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Promoción *</label>
            <div className="relative">
              <select 
                value={editandoForm.tipo_promocion || ''}
                onChange={(e) => setEditandoForm({...editandoForm, tipo_promocion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black appearance-none bg-white"
                required
              >
                <option value="" disabled>Selecciona el tipo de promoción</option>
                {tiposPromocion.map((opcion, index) => (
                  <option key={index} value={opcion}>{opcion}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina *</label>
            <div className="relative">
              <select 
                value={editandoForm.disciplina || ''}
                onChange={(e) => setEditandoForm({...editandoForm, disciplina: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black appearance-none bg-white"
                required
              >
                <option value="" disabled>Selecciona la disciplina</option>
                {OPCIONES_DROPDOWN.disciplina.map((opcion, index) => (
                  <option key={index} value={opcion}>{opcion}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Fecha Inicio</label>
            <input 
              type="date" 
              value={editandoForm.fecha_inicio || ''}
              onChange={(e) => setEditandoForm({...editandoForm, fecha_inicio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" 
              required
            />
            {editandoForm.fecha_inicio && (
              <p className="text-xs text-gray-500 mt-1">
                Fecha actual: {new Date(editandoForm.fecha_inicio).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Fecha Fin</label>
            <input 
              type="date" 
              value={editandoForm.fecha_fin || ''}
              onChange={(e) => setEditandoForm({...editandoForm, fecha_fin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" 
              required
            />
            {editandoForm.fecha_fin && (
              <p className="text-xs text-gray-500 mt-1">
                Fecha actual: {new Date(editandoForm.fecha_fin).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </div>
        
        {/* Indicador de estado de la promoción */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Estado de la Promoción</h4>
          <div className="flex items-center space-x-4">
            {editandoForm.fecha_inicio && editandoForm.fecha_fin && (
              <>
                <div className="text-sm">
                  <span className="font-medium">Inicio:</span> {new Date(editandoForm.fecha_inicio).toLocaleDateString('es-ES')}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Fin:</span> {new Date(editandoForm.fecha_fin).toLocaleDateString('es-ES')}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Estado:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    new Date() > new Date(editandoForm.fecha_fin) 
                      ? 'bg-red-100 text-red-800' 
                      : new Date() >= new Date(editandoForm.fecha_inicio) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {new Date() > new Date(editandoForm.fecha_fin) 
                      ? 'Expirada' 
                      : new Date() >= new Date(editandoForm.fecha_inicio) 
                        ? 'Activa' 
                        : 'Próximamente'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Beneficios</label>
          <textarea value={editandoForm.beneficios} onChange={(e) => setEditandoForm({...editandoForm, beneficios: e.target.value})}
            rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios y Restricciones</label>
          <textarea value={editandoForm.comentarios_restricciones} onChange={(e) => setEditandoForm({...editandoForm, comentarios_restricciones: e.target.value})}
            rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
        </div>

        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-2">🖼️ Imágenes de la Promoción</h4>
          <p className="text-sm text-gray-600 mb-4">Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 30MB por imagen.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
              <div className="space-y-3">
                {(previewPrincipal || editandoForm.imagen_principal) && !imagenPrincipalError && (
                  <div className="relative">
                    <img 
                      src={previewPrincipal || normalizeImageUrl(editandoForm.imagen_principal)} 
                      alt="Preview imagen principal"
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        if (e.currentTarget.dataset.fallback) return;
                        e.currentTarget.dataset.fallback = '1';
                        setImagenPrincipalError(true);
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <button type="button" onClick={removeImagenPrincipal}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                      ×
                    </button>
                  </div>
                )}
                {imagenPrincipalError && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-2">🖼️</div>
                      <p className="text-sm">Imagen no disponible</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handleImagenPrincipalChange}
                    className="hidden" id="imagen-principal" />
                  <label htmlFor="imagen-principal"
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 cursor-pointer text-center text-sm font-medium transition-colors">
                    {previewPrincipal || editandoForm.imagen_principal ? '🔄 Cambiar Imagen' : '📁 Seleccionar Imagen'}
                  </label>
                </div>
                <p className="text-xs text-gray-500 text-center">JPG, PNG, GIF - Máx. 30MB</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Secundaria (Opcional)</label>
              <div className="space-y-3">
                {(previewSecundaria || editandoForm.imagen_secundaria) && !imagenSecundariaError && (
                  <div className="relative">
                    <img 
                      src={previewSecundaria || normalizeImageUrl(editandoForm.imagen_secundaria)} 
                      alt="Preview imagen secundaria"
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        if (e.currentTarget.dataset.fallback) return;
                        e.currentTarget.dataset.fallback = '1';
                        setImagenSecundariaError(true);
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <button type="button" onClick={removeImagenSecundaria}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                      ×
                    </button>
                  </div>
                )}
                {imagenSecundariaError && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-2">🖼️</div>
                      <p className="text-sm">Imagen no disponible</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handleImagenSecundariaChange}
                    className="hidden" id="imagen-secundaria" />
                  <label htmlFor="imagen-secundaria"
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 cursor-pointer text-center text-sm font-medium transition-colors">
                    {previewSecundaria || editandoForm.imagen_secundaria ? '🔄 Cambiar Imagen' : '📁 Seleccionar Imagen'}
                  </label>
                </div>
                <p className="text-xs text-gray-500 text-center">JPG, PNG, GIF - Máx. 30MB</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={() => setModalAbierto(false)} disabled={guardando}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar Cambios</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPromocionModal;

