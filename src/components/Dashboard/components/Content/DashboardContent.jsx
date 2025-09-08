import React from 'react';
import PromocionesFilters from '../Promociones/PromocionesFilters';
import PromocionesTable from '../Promociones/PromocionesTable';
import RegistrosFilters from '../Registros/RegistrosFilters';
import RegistrosTable from '../Registros/RegistrosTable';
import ControlAccesoFilters from '../ControlAcceso/ControlAccesoFilters';
import ControlAccesoTable from '../ControlAcceso/ControlAccesoTable';

const DashboardContent = ({ 
  tabActiva,
  // Estados de promociones
  promocionesFiltradas,
  searchTerm,
  setSearchTerm,
  filterInstitucion,
  setFilterInstitucion,
  filterDisciplina,
  setFilterDisciplina,
  onEditar,
  onCambiarEstado,
  onEliminar,
  getStatusBadge,
  onClearFiltersPromociones,
  // Estados de registros
  registrosFiltrados,
  searchTermRegistros,
  setSearchTermRegistros,
  filterGenero,
  setFilterGenero,
  filterEdad,
  setFilterEdad,
  onClearFiltersRegistros,
  onEditarRegistro,
  onCambiarEstadoRegistro,
  onEliminarRegistro,
  // Estados de control de acceso
  controlAccesoFiltrado,
  searchTermControlAcceso,
  setSearchTermControlAcceso,
  filterInstitucionControlAcceso,
  setFilterInstitucionControlAcceso,
  onClearFiltersControlAcceso,
  onEditarControlAcceso,
  onCambiarEstadoControlAcceso,
  onEliminarControlAcceso
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

  const renderRegistros = () => (
    <>
      <RegistrosFilters
        searchTerm={searchTermRegistros}
        setSearchTerm={setSearchTermRegistros}
        filterGenero={filterGenero}
        setFilterGenero={setFilterGenero}
        filterEdad={filterEdad}
        setFilterEdad={setFilterEdad}
        onClearFilters={onClearFiltersRegistros}
      />
      <RegistrosTable
        registrosFiltrados={registrosFiltrados}
        onEditar={onEditarRegistro}
        onCambiarEstado={onCambiarEstadoRegistro}
        onEliminar={onEliminarRegistro}
        getStatusBadge={getStatusBadge}
      />
    </>
  );

  const renderControlAcceso = () => (
    <>
      <ControlAccesoFilters
        searchTerm={searchTermControlAcceso}
        setSearchTerm={setSearchTermControlAcceso}
        filterInstitucion={filterInstitucionControlAcceso}
        setFilterInstitucion={setFilterInstitucionControlAcceso}
        onClearFilters={onClearFiltersControlAcceso}
      />
      <ControlAccesoTable
        controlAccesoFiltrado={controlAccesoFiltrado}
        onEditar={onEditarControlAcceso}
        onCambiarEstado={onCambiarEstadoControlAcceso}
        onEliminar={onEliminarControlAcceso}
        getStatusBadge={getStatusBadge}
      />
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {tabActiva === 'promociones' && renderPromociones()}
      {tabActiva === 'registros' && renderRegistros()}
      {tabActiva === 'control-acceso' && renderControlAcceso()}
    </div>
  );
};

export default DashboardContent;

