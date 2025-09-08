import React from 'react';

const DashboardHeader = ({ 
  tabActiva, 
  onTabChange, 
  onRefresh, 
  totalPromociones, 
  totalRegistros, 
  totalControlAcceso 
}) => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🎭 Panel de Control Cultural Access</h1>
            <p className="mt-2 text-orange-100">
              Gestiona promociones, registros y control de acceso
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-orange-100">
              {tabActiva === 'promociones' && `Total: ${totalPromociones} promociones`}
              {tabActiva === 'registros' && `Total: ${totalRegistros} registros`}
              {tabActiva === 'control-acceso' && `Total: ${totalControlAcceso} accesos`}
            </span>
            <button
              onClick={onRefresh}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Pestañas de navegación */}
        <div className="mt-6">
          <div className="flex space-x-1 bg-orange-400 rounded-lg p-1">
            <button
              onClick={() => onTabChange('promociones')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'promociones'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-orange-100 hover:text-white hover:bg-orange-500'
              }`}
            >
              🎭 Promociones
            </button>
            <button
              onClick={() => onTabChange('registros')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'registros'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-orange-100 hover:text-white hover:bg-orange-500'
              }`}
            >
              👥 Registros
            </button>
            <button
              onClick={() => onTabChange('control-acceso')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'control-acceso'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-orange-100 hover:text-white hover:bg-orange-500'
              }`}
            >
              🚪 Control de Acceso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

