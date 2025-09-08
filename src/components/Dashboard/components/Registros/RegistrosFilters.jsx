import React from 'react';

const RegistrosFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterGenero, 
  setFilterGenero, 
  filterEdad, 
  setFilterEdad,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda general */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Búsqueda general
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre, email o tarjeta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filtro por género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <select
            value={filterGenero}
            onChange={(e) => setFilterGenero(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todos los géneros</option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="prefiero-no-decir">Prefiero no decir</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Filtro por edad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edad
          </label>
          <select
            value={filterEdad}
            onChange={(e) => setFilterEdad(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todas las edades</option>
            <option value="16-17">16-17</option>
            <option value="18-29">18-29</option>
            <option value="30-49">30-49</option>
            <option value="50-59">50-59</option>
            <option value="60+">60+</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RegistrosFilters;

