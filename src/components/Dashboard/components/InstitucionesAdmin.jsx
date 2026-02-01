import React, { useState, useEffect } from 'react';
import { institucionesService } from '../../../apis/instituciones/institucionesService';

const InstitucionesAdmin = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevaInstitucion, setNuevaInstitucion] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para edición
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Cargar instituciones al montar el componente
  useEffect(() => {
    cargarInstituciones();
  }, []);

  const cargarInstituciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await institucionesService.obtenerInstituciones();
      
      // Ordenar alfabéticamente
      const institucionesOrdenadas = Array.isArray(data) 
        ? data.sort((a, b) => {
            const nombreA = (a.nombre || a).toLowerCase();
            const nombreB = (b.nombre || b).toLowerCase();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
          })
        : [];
      
      setInstituciones(institucionesOrdenadas);
    } catch (err) {
      setError('Error al cargar instituciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarInstitucion = async (e) => {
    e.preventDefault();
    
    if (!nuevaInstitucion.trim()) {
      alert('Por favor ingresa el nombre de la institución');
      return;
    }

    // Verificar si ya existe
    const existe = instituciones.some(inst => {
      const nombre = inst.nombre || inst;
      return nombre.toLowerCase().trim() === nuevaInstitucion.toLowerCase().trim();
    });

    if (existe) {
      alert('Esta institución ya existe');
      return;
    }

    try {
      setAgregando(true);
      await institucionesService.crearInstitucion(nuevaInstitucion.trim());
      setNuevaInstitucion('');
      await cargarInstituciones();
      alert('✅ Institución agregada correctamente');
    } catch (err) {
      alert('❌ Error al agregar institución: ' + err.message);
    } finally {
      setAgregando(false);
    }
  };

  const handleEliminar = async (institucion) => {
    const nombre = institucion.nombre || institucion;
    const id = institucion.id;
    
    if (!id) {
      alert('No se puede eliminar: ID no disponible');
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar "${nombre}"?`)) {
      try {
        await institucionesService.eliminarInstitucion(id);
        await cargarInstituciones();
        alert('✅ Institución eliminada correctamente');
      } catch (err) {
        alert('❌ Error al eliminar: ' + err.message);
      }
    }
  };

  const iniciarEdicion = (institucion) => {
    setEditandoId(institucion.id);
    setNombreEditado(institucion.nombre || institucion);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
  };

  const handleGuardarEdicion = async (institucion) => {
    if (!nombreEditado.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    // Verificar si ya existe otro con el mismo nombre
    const existe = instituciones.some(inst => {
      const nombre = inst.nombre || inst;
      return inst.id !== institucion.id && 
             nombre.toLowerCase().trim() === nombreEditado.toLowerCase().trim();
    });

    if (existe) {
      alert('Ya existe otra institución con ese nombre');
      return;
    }

    try {
      setGuardando(true);
      await institucionesService.actualizarInstitucion(institucion.id, nombreEditado.trim());
      setEditandoId(null);
      setNombreEditado('');
      await cargarInstituciones();
      alert('✅ Institución actualizada correctamente');
    } catch (err) {
      alert('❌ Error al actualizar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Filtrar instituciones por búsqueda
  const institucionesFiltradas = instituciones.filter(inst => {
    const nombre = inst.nombre || inst;
    return nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-4 text-gray-600">Cargando instituciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Administrar Instituciones</h2>
        <p className="text-gray-600 mt-1">
          Agrega, edita o elimina instituciones culturales. Total: {instituciones.length} instituciones
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={cargarInstituciones}
            className="ml-4 text-red-700 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Formulario para agregar nueva institución */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar Nueva Institución</h3>
        <form onSubmit={handleAgregarInstitucion} className="flex gap-4">
          <input
            type="text"
            value={nuevaInstitucion}
            onChange={(e) => setNuevaInstitucion(e.target.value)}
            placeholder="Nombre de la institución"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={agregando}
          />
          <button
            type="submit"
            disabled={agregando || !nuevaInstitucion.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              agregando || !nuevaInstitucion.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {agregando ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Agregando...
              </span>
            ) : (
              '+ Agregar Institución'
            )}
          </button>
        </form>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar institución..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={cargarInstituciones}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de instituciones */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Lista de Instituciones ({institucionesFiltradas.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {institucionesFiltradas.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {busqueda ? 'No se encontraron instituciones con ese nombre' : 'No hay instituciones registradas'}
            </div>
          ) : (
            institucionesFiltradas.map((institucion, index) => {
              const nombre = institucion.nombre || institucion;
              const id = institucion.id || index;
              const esEditable = editandoId === id;
              
              return (
                <div 
                  key={id} 
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-gray-400 text-sm w-8">#{index + 1}</span>
                    {esEditable ? (
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="flex-1 px-3 py-1 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{nombre}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {esEditable ? (
                      <>
                        <button
                          onClick={() => handleGuardarEdicion(institucion)}
                          disabled={guardando}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          disabled={guardando}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => iniciarEdicion(institucion)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(institucion)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          🗑️ Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitucionesAdmin;
