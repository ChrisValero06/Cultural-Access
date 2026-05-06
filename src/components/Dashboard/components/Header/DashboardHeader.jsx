import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ 
  tabActiva, 
  onTabChange, 
  onRefresh, 
  totalPromociones,
  lastUpdate,
  loading
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Limpiar todos los datos de sesión
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userUsuario');
      localStorage.removeItem('perfilId');
      localStorage.removeItem('perfilNombre');
    } catch (e) {}
    // Redirigir al login
    navigate('/login', { replace: true });
  };
  const PMA_BASE = 'https://69.48.207.88/phpMyAdmin/index.php?route=/database/structure&db=cultural_Access';

  const openPhpMyAdmin = () => {
    try {
      window.open(PMA_BASE, '_blank', 'noopener');
    } catch (e) {
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white"> Panel de Control CulturAll Access</h1>
            <p className="mt-2 text-orange-100">Gestiona promociones</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-orange-100">
              {tabActiva === 'promociones' && `Total: ${totalPromociones} promociones`}
            </span>
            {lastUpdate && (
              <span className="text-xs text-orange-200">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            {loading && (
              <span className="text-xs text-orange-200 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-200 mr-1"></div>
                Cargando...
              </span>
            )}
            <button
              onClick={openPhpMyAdmin}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-medium text-sm whitespace-nowrap"
              title="Abrir phpMyAdmin"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              Base de Datos
            </button>
            <button
              onClick={onRefresh}
              className="bg-white text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
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
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
              Promociones
            </button>
            <button
              onClick={() => onTabChange('estadisticas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'estadisticas'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
             Estadísticas
            </button>
            <button
              onClick={() => onTabChange('instituciones')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'instituciones'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
              Instituciones
            </button>
            <button
              onClick={() => onTabChange('tipos-promocion')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'tipos-promocion'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
              Tipos Promoción
            </button>
            <button
              onClick={() => onTabChange('tarjetas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tabActiva === 'tarjetas'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-black hover:text-white hover:bg-orange-500'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => navigate('/reportes')}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-black hover:text-white hover:bg-orange-500"
            >
              Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;