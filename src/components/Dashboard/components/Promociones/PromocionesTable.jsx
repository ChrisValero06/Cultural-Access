import React from 'react';

// Normaliza URLs de imágenes a tu servidor en Plesk y aplica fallback local
const BASE_HOST = 'https://culturallaccess.residente.mx';
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

const PromocionesTable = ({ 
  promocionesFiltradas, 
  onCambiarEstado, 
  onEliminar, 
  onEditar,
  getStatusBadge 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-800">
          Promociones ({promocionesFiltradas.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IMAGEN
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                INSTITUCIÓN
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TIPO
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DISCIPLINA
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
            {promocionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl font-medium text-gray-700 mb-2">No se encontraron promociones</p>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </td>
              </tr>
            ) : (
              promocionesFiltradas.map((promocion) => (
                <tr key={promocion.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                        src={normalizeImageUrl(promocion.imagen_principal)}
                        alt={`Imagen de ${promocion.institucion}`}
                        loading="lazy"
                        width={64}
                        height={64}
                        onError={(e) => {
                          // Evitar bucles de onError
                          if (e.currentTarget.dataset.fallback) return;
                          e.currentTarget.dataset.fallback = '1';
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {promocion.institucion}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {promocion.tipo_promocion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {promocion.disciplina}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(promocion.fecha_inicio, promocion.fecha_fin, promocion.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEditar(promocion)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                      <button 
                        onClick={() => onCambiarEstado(promocion)}
                        className={`px-3 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 ${
                          promocion.estado === 'activa' 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {promocion.estado === 'activa' ? (
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
                        onClick={() => onEliminar(promocion.id)}
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

export default PromocionesTable;

