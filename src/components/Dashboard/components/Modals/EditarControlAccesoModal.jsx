import React from 'react';

const EditarControlAccesoModal = ({ 
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
        <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Control de Acceso</h3>
        
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta</label>
            <input
              type="text"
              value={editandoForm.numero_tarjeta}
              onChange={(e) => setEditandoForm({...editandoForm, numero_tarjeta: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              value={editandoForm.fecha}
              onChange={(e) => setEditandoForm({...editandoForm, fecha: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
            <input
              type="time"
              value={editandoForm.hora}
              onChange={(e) => setEditandoForm({...editandoForm, hora: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            value={editandoForm.estado}
            onChange={(e) => setEditandoForm({...editandoForm, estado: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios</label>
          <textarea
            value={editandoForm.comentarios}
            onChange={(e) => setEditandoForm({...editandoForm, comentarios: e.target.value})}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Comentarios adicionales sobre el acceso..."
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

export default EditarControlAccesoModal;
