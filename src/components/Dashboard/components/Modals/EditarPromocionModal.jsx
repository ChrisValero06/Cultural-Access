import React from 'react';

const EditarPromocionModal = ({ 
  modalAbierto, 
  setModalAbierto, 
  editandoForm, 
  setEditandoForm, 
  onGuardarCambios 
}) => {
  if (!modalAbierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Promoción</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institución</label>
            <input
              type="text"
              value={editandoForm.institucion}
              onChange={(e) => setEditandoForm({...editandoForm, institucion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Promoción</label>
            <input
              type="text"
              value={editandoForm.tipo_promocion}
              onChange={(e) => setEditandoForm({...editandoForm, tipo_promocion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina</label>
            <input
              type="text"
              value={editandoForm.disciplina}
              onChange={(e) => setEditandoForm({...editandoForm, disciplina: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={editandoForm.fecha_inicio}
              onChange={(e) => setEditandoForm({...editandoForm, fecha_inicio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={editandoForm.fecha_fin}
              onChange={(e) => setEditandoForm({...editandoForm, fecha_fin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Beneficios</label>
          <textarea
            value={editandoForm.beneficios}
            onChange={(e) => setEditandoForm({...editandoForm, beneficios: e.target.value})}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios y Restricciones</label>
          <textarea
            value={editandoForm.comentarios_restricciones}
            onChange={(e) => setEditandoForm({...editandoForm, comentarios_restricciones: e.target.value})}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setModalAbierto(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onGuardarCambios}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPromocionModal;

