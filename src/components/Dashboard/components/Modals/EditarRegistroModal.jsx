import React from 'react';

const EditarRegistroModal = ({ 
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
        <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Registro de Usuario</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={editandoForm.nombre}
              onChange={(e) => setEditandoForm({...editandoForm, nombre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno</label>
            <input
              type="text"
              value={editandoForm.apellido_paterno}
              onChange={(e) => setEditandoForm({...editandoForm, apellido_paterno: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
            <input
              type="text"
              value={editandoForm.apellido_materno}
              onChange={(e) => setEditandoForm({...editandoForm, apellido_materno: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={editandoForm.email}
              onChange={(e) => setEditandoForm({...editandoForm, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={editandoForm.telefono}
              onChange={(e) => setEditandoForm({...editandoForm, telefono: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
            <select
              value={editandoForm.genero}
              onChange={(e) => setEditandoForm({...editandoForm, genero: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Seleccionar género</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="prefiero-no-decir">Prefiero no decir</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
            <input
              type="number"
              min="16"
              max="100"
              value={editandoForm.edad}
              onChange={(e) => setEditandoForm({...editandoForm, edad: e.target.value})}
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
            <option value="suspendido">Suspendido</option>
          </select>
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

export default EditarRegistroModal;
