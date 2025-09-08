import React from 'react';

const RegistrosTable = ({ 
  registrosFiltrados, 
  onEditar, 
  onCambiarEstado, 
  onEliminar, 
  getStatusBadge 
}) => {
  console.log('🔍 RegistrosTable - registrosFiltrados recibidos:', registrosFiltrados);
  console.log('🔍 RegistrosTable - primer registro:', registrosFiltrados?.[0]);
  if (registrosFiltrados?.[0]) {
    console.log('🔍 RegistrosTable - campos del primer registro:', Object.keys(registrosFiltrados[0]));
    console.log('🔍 RegistrosTable - teléfono del primer registro:', registrosFiltrados[0].telefono);
    console.log('🔍 RegistrosTable - número de tarjeta del primer registro:', registrosFiltrados[0].numero_tarjeta);
  }
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-800">
          Registros de Usuarios ({registrosFiltrados.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NOMBRE COMPLETO
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TELÉFONO
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GÉNERO
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EDAD
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TARJETA
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                FECHA REGISTRO
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ESTADO
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-16 text-center text-gray-500">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-xl font-medium text-gray-700 mb-2">No se encontraron registros</p>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </td>
              </tr>
            ) : (
              registrosFiltrados.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registro.nombre} {registro.apellido_paterno} {registro.apellido_materno}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {registro.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {registro.telefono && registro.telefono.trim() !== '' ? registro.telefono : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {registro.genero && registro.genero.trim() !== '' ? registro.genero : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {registro.edad && registro.edad.trim() !== '' ? registro.edad : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {registro.numero_tarjeta && registro.numero_tarjeta.trim() !== '' ? registro.numero_tarjeta : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(registro.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(registro.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEditar(registro)}
                        className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => onCambiarEstado(registro)}
                        className={`px-3 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 ${
                          registro.estado === 'activo' 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {registro.estado === 'activo' ? (
                          <>
                            <span>🔴</span>
                            <span>Desactivar</span>
                          </>
                        ) : (
                          <>
                            <span>🟢</span>
                            <span>Activar</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => onEliminar(registro.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrosTable;

