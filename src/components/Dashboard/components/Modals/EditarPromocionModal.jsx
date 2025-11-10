import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../apis';

// Opciones para los dropdowns
const OPCIONES_DROPDOWN = {
  institucion: ['Amigos de la Historia Mexicana', 'Ballet de Monterrey', 'Bread Coffee Roasters', 'Café Belmonte', 'Casa Coa', 'Casa de la Cultura de Nuevo León', 'Casa Motis', 'Casa Musa', 'Centro Roberto Garza Sada', 'Cineteca de Nuevo León', 'Constelación Feria de Arte', 'Dramático', 'El Lingote Restaurante', 'Escuela Superior de Música y Danza de Monterrey', 'Fama Monterrey', 'Fondo de Cultura Económica', 'Fondo Editorial de Nuevo León', 'Fototeca de Nuevo León', 'Heart Ego', 'Horno 3', 'La Gran Audiencia', 'La Milarca', 'Librería Bruma', 'Librería Sentido', 'Monstera Coffee Bar', 'Museo 31', 'Museo del Acero Horno 3', 'Museo de Arte Contemporáneo de Monterrey (MARCO)', 'Museo de la Batalla', 'Museo de Historia Mexicana', 'Museo del Noreste', 'Museo del Palacio', 'Museo del Vidrio (MUVI)', 'Museo Estatal de Culturas Populares de Nuevo León', 'Museo Regional de Nuevo León El Obispado', 'Papalote Museo del Niño Monterrey', 'Salón de la Fama de Beisbol Mexicano', 'Saxy Jazz Club', 'Secretaría de Cultura', 'Seabird Coffee', 'Teatro de la Ciudad', 'Vaso Roto Ediciones'],
  tipoPromocion: ['Entradas gratuitas', 'Descuentos', 'Acceso prioritario', 'Descuentos para la educación', 'Visitas guiadas exclusivas', 'Descuentos en publicaciones CONARTE', 'Asistencia a conferencias', 'Descuentos en cafés/comida', 'Boletos 2x4', 'Descuentos por temporada', 'Otra'],
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
  const [guardando, setGuardando] = useState(false);
  const [imagenPrincipalFile, setImagenPrincipalFile] = useState(null);
  const [imagenSecundariaFile, setImagenSecundariaFile] = useState(null);
  const [previewPrincipal, setPreviewPrincipal] = useState(null);
  const [previewSecundaria, setPreviewSecundaria] = useState(null);
  const [imagenPrincipalError, setImagenPrincipalError] = useState(false);
  const [imagenSecundariaError, setImagenSecundariaError] = useState(false);
  
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
  
  if (!modalAbierto) return null;

  // Debug: mostrar datos de la promoción
  console.log('🔍 Datos de la promoción en el modal:', {
    id: editandoForm?.id,
    institucion: editandoForm?.institucion,
    imagen_principal: editandoForm?.imagen_principal,
    imagen_secundaria: editandoForm?.imagen_secundaria,
    previewPrincipal,
    previewSecundaria
  });

  const validarImagen = (file) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const tamañoMaximo = 30 * 1024 * 1024; // 30MB
    if (!tiposPermitidos.includes(file.type)) {
      alert('Tipo de archivo no permitido. Use JPG, PNG o GIF.');
      return false;
    }
    if (file.size > tamañoMaximo) {
      alert('El archivo es demasiado grande. Máximo 30MB.');
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
    if (!editandoForm.institucion.trim()) { alert('La institución es requerida'); return; }
    if (!editandoForm.tipo_promocion.trim()) { alert('El tipo de promoción es requerido'); return; }
    if (!editandoForm.disciplina.trim()) { alert('La disciplina es requerida'); return; }
    if (!editandoForm.fecha_inicio) { alert('La fecha de inicio es requerida'); return; }
    if (!editandoForm.fecha_fin) { alert('La fecha de fin es requerida'); return; }
    
    // Validar que las fechas sean válidas
    const fechaInicio = new Date(editandoForm.fecha_inicio);
    const fechaFin = new Date(editandoForm.fecha_fin);
    
    if (isNaN(fechaInicio.getTime())) {
      alert('La fecha de inicio no es válida'); return;
    }
    if (isNaN(fechaFin.getTime())) {
      alert('La fecha de fin no es válida'); return;
    }
    
    if (fechaInicio >= fechaFin) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio'); return;
    }
    
    // Validar que la fecha de inicio no sea muy antigua (opcional)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diasDiferencia = Math.ceil((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
    
    if (diasDiferencia > 365) {
      if (!confirm('La fecha de inicio es muy antigua (más de 1 año). ¿Estás seguro de continuar?')) {
        return;
      }
    }

    setGuardando(true);
    try {
      // Preparar datos para envío
      const datosPromocion = { ...editandoForm };
      
      // Si hay archivos nuevos, subir las imágenes primero
      if (imagenPrincipalFile || imagenSecundariaFile) {
        console.log('🔄 Actualizando promoción con archivos:', {
          id: editandoForm.id,
          imagenPrincipal: imagenPrincipalFile?.name,
          imagenSecundaria: imagenSecundariaFile?.name
        });
        
        // Subir imágenes por separado
        let nuevaImagenPrincipal = datosPromocion.imagen_principal;
        let nuevaImagenSecundaria = datosPromocion.imagen_secundaria;
        
        if (imagenPrincipalFile) {
          try {
            const nombreArchivo = `principal_${Date.now()}_${imagenPrincipalFile.name}`;
            const responseImagen = await apiService.subirImagen(imagenPrincipalFile, nombreArchivo);
            if (responseImagen.estado === 'exito' || responseImagen.success) {
              nuevaImagenPrincipal = responseImagen.ruta || responseImagen.url;
              console.log('✅ Imagen principal subida:', nuevaImagenPrincipal);
            }
          } catch (error) {
            console.error('❌ Error subiendo imagen principal:', error);
            alert('Error al subir la imagen principal. Se guardará sin cambios en la imagen.');
          }
        }
        
        if (imagenSecundariaFile) {
          try {
            const nombreArchivo = `secundaria_${Date.now()}_${imagenSecundariaFile.name}`;
            const responseImagen = await apiService.subirImagen(imagenSecundariaFile, nombreArchivo);
            if (responseImagen.estado === 'exito' || responseImagen.success) {
              nuevaImagenSecundaria = responseImagen.ruta || responseImagen.url;
              console.log('✅ Imagen secundaria subida:', nuevaImagenSecundaria);
            }
          } catch (error) {
            console.error('❌ Error subiendo imagen secundaria:', error);
            alert('Error al subir la imagen secundaria. Se guardará sin cambios en la imagen.');
          }
        }
        
        // Actualizar los datos con las nuevas rutas de imagen
        const promocionActualizada = {
          ...datosPromocion,
          imagen_principal: nuevaImagenPrincipal,
          imagen_secundaria: nuevaImagenSecundaria
        };
        
        // Actualizar la promoción con los datos actualizados
        const response = await apiService.actualizarPromocion(editandoForm.id, promocionActualizada);
        
        console.log('📡 Respuesta del servidor:', response);
        
        if (response.estado === 'exito' || response.success === true) {
          // Cerrar el modal
          setModalAbierto(false);
          setEditandoForm(null);
          
          // Notificar al dashboard que la promoción fue actualizada
          if (onPromocionActualizada) {
            onPromocionActualizada(promocionActualizada);
          }
          
          alert('✅ Promoción actualizada correctamente con nuevas imágenes');
        } else {
          alert('❌ No se pudo actualizar la promoción: ' + (response.message || 'Error desconocido'));
        }
      } else {
        // Si no hay archivos nuevos, usar la función simple
        console.log('🔄 Actualizando promoción sin archivos');
        await onGuardarCambios();
      }
    } catch (error) {
      console.error('💥 Error en handleGuardar:', error);
      alert('❌ Error al actualizar la promoción: ' + error.message);
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
        <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Promoción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institución *</label>
            <div className="relative">
              <select 
                value={editandoForm.institucion || ''}
                onChange={(e) => setEditandoForm({...editandoForm, institucion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black appearance-none bg-white"
                required
              >
                <option value="" disabled>Selecciona una institución</option>
                {OPCIONES_DROPDOWN.institucion.map((opcion, index) => (
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
                {OPCIONES_DROPDOWN.tipoPromocion.map((opcion, index) => (
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

