import React, { useState } from 'react';
import PromocionesFilters from '../Promociones/PromocionesFilters';
import PromocionesTable from '../Promociones/PromocionesTable';
import EstadisticasPerfiles from '../EstadisticasPerfiles';
import ReportesUsuarios from '../Reportes/ReportesUsuarios';
import ReportesRedenciones from '../Reportes/ReportesRedenciones';

const DashboardContent = ({ 
  tabActiva,
  promocionesFiltradas,
  searchTerm,
  setSearchTerm,
  filterInstitucion,
  setFilterInstitucion,
  filterDisciplina,
  setFilterDisciplina,
  filterEstado,
  setFilterEstado,
  onEditar,
  onCambiarEstado,
  onEliminar,
  getStatusBadge,
  onClearFiltersPromociones
}) => {
  const [tipoReporte, setTipoReporte] = useState('usuarios'); // 'usuarios' o 'redenciones'

  const renderPromociones = () => (
    <>
      <PromocionesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterInstitucion={filterInstitucion}
        setFilterInstitucion={setFilterInstitucion}
        filterDisciplina={filterDisciplina}
        setFilterDisciplina={setFilterDisciplina}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        onClearFilters={onClearFiltersPromociones}
      />
      <PromocionesTable
        promocionesFiltradas={promocionesFiltradas}
        onEditar={onEditar}
        onCambiarEstado={onCambiarEstado}
        onEliminar={onEliminar}
        getStatusBadge={getStatusBadge}
      />
    </>
  );

  const renderReportes = () => (
    <div>
      {/* Selector de tipo de reporte */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-4">
          <button
            onClick={() => setTipoReporte('usuarios')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              tipoReporte === 'usuarios'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Reportes de Usuarios Registrados
          </button>
          <button
            onClick={() => setTipoReporte('redenciones')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              tipoReporte === 'redenciones'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Reportes de Redenciones
          </button>
        </div>
      </div>

      {/* Mostrar el componente de reporte correspondiente */}
      {tipoReporte === 'usuarios' && <ReportesUsuarios />}
      {tipoReporte === 'redenciones' && <ReportesRedenciones />}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {tabActiva === 'promociones' && renderPromociones()}
      {tabActiva === 'estadisticas' && <EstadisticasPerfiles />}
      {tabActiva === 'reportes' && renderReportes()}
    </div>
  );
};

export default DashboardContent;