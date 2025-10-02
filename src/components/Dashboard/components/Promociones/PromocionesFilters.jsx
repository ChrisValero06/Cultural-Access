import React from 'react';

const PromocionesFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterInstitucion, 
  setFilterInstitucion, 
  filterDisciplina, 
  setFilterDisciplina,
  filterEstado,
  setFilterEstado,
  onClearFilters 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2 md:mb-0">🔍 Filtros de Búsqueda</h3>
        <button
          onClick={onClearFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          Limpiar filtros
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda general */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Búsqueda general
          </label>
          <input
            type="text"
            placeholder="Buscar en todo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filtro por institución */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institución
          </label>
          <input
            type="text"
            placeholder="Filtrar por institución..."
            value={filterInstitucion}
            onChange={(e) => setFilterInstitucion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filtro por disciplina */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Disciplina
          </label>
          <input
            type="text"
            placeholder="Filtrar por disciplina..."
            value={filterDisciplina}
            onChange={(e) => setFilterDisciplina(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todos los estados</option>
            <option value="activa">🟢 Activa</option>
            <option value="inactiva">🟡 Inactiva</option>
            <option value="expirada">🔴 Expirada</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PromocionesFilters;

