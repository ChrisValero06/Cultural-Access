import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../apis';

const EditarPromocionModal = ({ modalAbierto, setModalAbierto, editandoForm, setEditandoForm, onGuardarCambios }) => {
  const [guardando, setGuardando] = useState(false);
  const [imagenPrincipalFile, setImagenPrincipalFile] = useState(null);
  const [imagenSecundariaFile, setImagenSecundariaFile] = useState(null);
  const [previewPrincipal, setPreviewPrincipal] = useState(null);
  const [previewSecundaria, setPreviewSecundaria] = useState(null);
  
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
    }
  }, [modalAbierto]);
  
  if (!modalAbierto) return null;

  const validarImagen = (file) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const tamañoMaximo = 5 * 1024 * 1024;
    if (!tiposPermitidos.includes(file.type)) {
      alert('Tipo de archivo no permitido. Use JPG, PNG o GIF.');
      return false;
    }
    if (file.size > tamañoMaximo) {
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return false;
    }
    return true;
  };

  const handleImagenPrincipalChange = (e) => {
    const file = e.target.files[0];
    if (file && validarImagen(file)) {
      setImagenPrincipalFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewPrincipal(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImagenSecundariaChange = (e) => {
    const file = e.target.files[0];
    if (file && validarImagen(file)) {
      setImagenSecundariaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewSecundaria(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImagenPrincipal = () => {
    setImagenPrincipalFile(null);
    setPreviewPrincipal(null);
    setEditandoForm({...editandoForm, imagen_principal: ''});
  };

  const removeImagenSecundaria = () => {
    setImagenSecundariaFile(null);
    setPreviewSecundaria(null);
    setEditandoForm({...editandoForm, imagen_secundaria: ''});
  };

  const handleGuardar = async () => {
    if (!editandoForm.institucion.trim()) { alert('La institución es requerida'); return; }
    if (!editandoForm.tipo_promocion.trim()) { alert('El tipo de promoción es requerido'); return; }
    if (!editandoForm.disciplina.trim()) { alert('La disciplina es requerida'); return; }
    if (!editandoForm.fecha_inicio) { alert('La fecha de inicio es requerida'); return; }
    if (!editandoForm.fecha_fin) { alert('La fecha de fin es requerida'); return; }
    if (new Date(editandoForm.fecha_inicio) >= new Date(editandoForm.fecha_fin)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio'); return;
    }

    setGuardando(true);
    try {
      const formData = { ...editandoForm };
      
      if (imagenPrincipalFile) {
        try {
          const nombreArchivo = `principal_${Date.now()}_${imagenPrincipalFile.name}`;
          const responseImagen = await apiService.subirImagen(imagenPrincipalFile, nombreArchivo);
          if (responseImagen.estado === 'exito' || responseImagen.success) {
            formData.imagen_principal = responseImagen.ruta || responseImagen.url;
          }
        } catch (error) {
          alert('Error al subir la imagen principal. Se guardará sin cambios en la imagen.');
        }
      }
      
      if (imagenSecundariaFile) {
        try {
          const nombreArchivo = `secundaria_${Date.now()}_${imagenSecundariaFile.name}`;
          const responseImagen = await apiService.subirImagen(imagenSecundariaFile, nombreArchivo);
          if (responseImagen.estado === 'exito' || responseImagen.success) {
            formData.imagen_secundaria = responseImagen.ruta || responseImagen.url;
          }
        } catch (error) {
          alert('Error al subir la imagen secundaria. Se guardará sin cambios en la imagen.');
        }
      }
      
      setEditandoForm(formData);
      await onGuardarCambios();
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Institución</label>
            <input type="text" value={editandoForm.institucion}
              onChange={(e) => setEditandoForm({...editandoForm, institucion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Promoción</label>
            <input type="text" value={editandoForm.tipo_promocion}
              onChange={(e) => setEditandoForm({...editandoForm, tipo_promocion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina</label>
            <input type="text" value={editandoForm.disciplina}
              onChange={(e) => setEditandoForm({...editandoForm, disciplina: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input type="date" value={editandoForm.fecha_inicio}
              onChange={(e) => setEditandoForm({...editandoForm, fecha_inicio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input type="date" value={editandoForm.fecha_fin}
              onChange={(e) => setEditandoForm({...editandoForm, fecha_fin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
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
          <p className="text-sm text-gray-600 mb-4">Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
              <div className="space-y-3">
                {(previewPrincipal || editandoForm.imagen_principal) && (
                  <div className="relative">
                    <img src={previewPrincipal || editandoForm.imagen_principal} alt="Preview imagen principal"
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
                    <button type="button" onClick={removeImagenPrincipal}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                      ×
                    </button>
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
                <p className="text-xs text-gray-500 text-center">JPG, PNG, GIF - Máx. 5MB</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Secundaria (Opcional)</label>
              <div className="space-y-3">
                {(previewSecundaria || editandoForm.imagen_secundaria) && (
                  <div className="relative">
                    <img src={previewSecundaria || editandoForm.imagen_secundaria} alt="Preview imagen secundaria"
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
                    <button type="button" onClick={removeImagenSecundaria}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                      ×
                    </button>
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
                <p className="text-xs text-gray-500 text-center">JPG, PNG, GIF - Máx. 5MB</p>
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

