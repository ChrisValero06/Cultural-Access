import React from 'react';
import PromocionesFilters from '../Promociones/PromocionesFilters';
import PromocionesTable from '../Promociones/PromocionesTable';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {tabActiva === 'promociones' && renderPromociones()}
    </div>
  );
};

export default DashboardContent;