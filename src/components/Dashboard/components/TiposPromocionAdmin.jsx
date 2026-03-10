import React, { useState, useEffect, useRef } from 'react';
import { tiposPromocionService } from '../../../apis/tipos-promocion/tiposPromocionService';
import { useInstituciones } from '../../../context/InstitucionesContext';

const SelectorInstituciones = ({ seleccionadas, onChange, disabled }) => {
  const { instituciones } = useInstituciones();
  const [abierto, setAbierto] = useState(false);
  const [busquedaInst, setBusquedaInst] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const institucionesFiltradas = instituciones.filter(inst =>
    inst.toLowerCase().includes(busquedaInst.toLowerCase())
  );

  const toggleInstitucion = (inst) => {
    if (seleccionadas.includes(inst)) {
      onChange(seleccionadas.filter(i => i !== inst));
    } else {
      onChange([...seleccionadas, inst]);
    }
  };

  const seleccionarTodas = () => {
    onChange([...instituciones]);
    setAbierto(false);
  };

  const deseleccionarTodas = () => {
    onChange([]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setAbierto(!abierto)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-between">
          <span className={seleccionadas.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
            {seleccionadas.length === 0
              ? 'Seleccionar instituciones...'
              : seleccionadas.length === instituciones.length
                ? 'Todas las instituciones'
                : `${seleccionadas.length} instituci${seleccionadas.length === 1 ? 'ón' : 'ones'} seleccionada${seleccionadas.length === 1 ? '' : 's'}`
            }
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {abierto && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={busquedaInst}
              onChange={(e) => setBusquedaInst(e.target.value)}
              placeholder="Buscar institución..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
          </div>
          <div className="px-3 py-2 border-b border-gray-200 flex gap-2">
            <button
              type="button"
              onClick={seleccionarTodas}
              className="text-xs text-orange-600 hover:text-orange-800 font-medium"
            >
              Seleccionar todas
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deseleccionarTodas}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Deseleccionar todas
            </button>
          </div>
          <div className="overflow-y-auto max-h-44">
            {institucionesFiltradas.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No se encontraron instituciones</div>
            ) : (
              institucionesFiltradas.map((inst) => (
                <label
                  key={inst}
                  className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(inst)}
                    onChange={() => toggleInstitucion(inst)}
                    className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{inst}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {seleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {seleccionadas.slice(0, 5).map((inst) => (
            <span
              key={inst}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full"
            >
              {inst}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggleInstitucion(inst)}
                  className="hover:text-orange-900"
                >
                  &times;
                </button>
              )}
            </span>
          ))}
          {seleccionadas.length > 5 && (
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{seleccionadas.length - 5} más
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const TiposPromocionAdmin = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevoTipo, setNuevoTipo] = useState('');
  const [nuevasInstituciones, setNuevasInstituciones] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Estados para edición
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [institucionesEditadas, setInstitucionesEditadas] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tiposPromocionService.obtenerTiposPromocion();

      const tiposOrdenados = Array.isArray(data)
        ? data.sort((a, b) => {
            const nombreA = (a.nombre || a).toLowerCase();
            const nombreB = (b.nombre || b).toLowerCase();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
          })
        : [];

      setTipos(tiposOrdenados);
    } catch (err) {
      setError('Error al cargar tipos de promoción: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarTipo = async (e) => {
    e.preventDefault();

    if (!nuevoTipo.trim()) {
      alert('Por favor ingresa el nombre del tipo de promoción');
      return;
    }

    const existe = tipos.some(tipo => {
      const nombre = tipo.nombre || tipo;
      return nombre.toLowerCase().trim() === nuevoTipo.toLowerCase().trim();
    });

    if (existe) {
      alert('Este tipo de promoción ya existe');
      return;
    }

    try {
      setAgregando(true);
      await tiposPromocionService.crearTipoPromocion(nuevoTipo.trim(), nuevasInstituciones);
      setNuevoTipo('');
      setNuevasInstituciones([]);
      await cargarTipos();
      alert('Tipo de promoción agregado correctamente');
    } catch (err) {
      alert('Error al agregar tipo de promoción: ' + err.message);
    } finally {
      setAgregando(false);
    }
  };

  const handleEliminar = async (tipo) => {
    const nombre = tipo.nombre || tipo;
    const id = tipo.id;

    if (!id) {
      alert('No se puede eliminar: ID no disponible');
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar "${nombre}"?`)) {
      try {
        await tiposPromocionService.eliminarTipoPromocion(id);
        await cargarTipos();
        alert('Tipo de promoción eliminado correctamente');
      } catch (err) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  const iniciarEdicion = (tipo) => {
    setEditandoId(tipo.id);
    setNombreEditado(tipo.nombre || tipo);
    setInstitucionesEditadas(tipo.instituciones || []);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
    setInstitucionesEditadas([]);
  };

  const handleGuardarEdicion = async (tipo) => {
    if (!nombreEditado.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    const existe = tipos.some(t => {
      const nombre = t.nombre || t;
      return t.id !== tipo.id &&
             nombre.toLowerCase().trim() === nombreEditado.toLowerCase().trim();
    });

    if (existe) {
      alert('Ya existe otro tipo de promoción con ese nombre');
      return;
    }

    try {
      setGuardando(true);
      await tiposPromocionService.actualizarTipoPromocion(tipo.id, nombreEditado.trim(), institucionesEditadas);
      setEditandoId(null);
      setNombreEditado('');
      setInstitucionesEditadas([]);
      await cargarTipos();
      alert('Tipo de promoción actualizado correctamente');
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const tiposFiltrados = tipos.filter(tipo => {
    const nombre = tipo.nombre || tipo;
    return nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-4 text-gray-600">Cargando tipos de promoción...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Administrar Tipos de Promoción</h2>
        <p className="text-gray-600 mt-1">
          Agrega, edita o elimina tipos de promoción. Total: {tipos.length} tipos
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={cargarTipos}
            className="ml-4 text-red-700 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Formulario para agregar */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar Nuevo Tipo de Promoción</h3>
        <form onSubmit={handleAgregarTipo} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              placeholder="Nombre del tipo de promoción"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={agregando}
            />
            <button
              type="submit"
              disabled={agregando || !nuevoTipo.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                agregando || !nuevoTipo.trim()
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
                '+ Agregar Tipo'
              )}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignar Instituciones (opcional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Selecciona a qué instituciones aplica este tipo de promoción
            </p>
            <SelectorInstituciones
              seleccionadas={nuevasInstituciones}
              onChange={setNuevasInstituciones}
              disabled={agregando}
            />
          </div>
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
              placeholder="Buscar tipo de promoción..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={cargarTipos}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Lista de Tipos de Promoción ({tiposFiltrados.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {tiposFiltrados.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {busqueda ? 'No se encontraron tipos con ese nombre' : 'No hay tipos de promoción registrados'}
            </div>
          ) : (
            tiposFiltrados.map((tipo, index) => {
              const nombre = tipo.nombre || tipo;
              const id = tipo.id || index;
              const esEditable = editandoId === id;
              const institucionesAsignadas = tipo.instituciones || [];

              return (
                <div
                  key={id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
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
                            onClick={() => handleGuardarEdicion(tipo)}
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
                            onClick={() => iniciarEdicion(tipo)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(tipo)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                            title="Eliminar"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Instituciones asignadas o editor de instituciones */}
                  {esEditable ? (
                    <div className="mt-3 ml-12">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instituciones asignadas
                      </label>
                      <SelectorInstituciones
                        seleccionadas={institucionesEditadas}
                        onChange={setInstitucionesEditadas}
                        disabled={guardando}
                      />
                    </div>
                  ) : (
                    institucionesAsignadas.length > 0 && (
                      <div className="mt-2 ml-12 flex flex-wrap gap-1">
                        {institucionesAsignadas.slice(0, 4).map((inst) => (
                          <span
                            key={inst}
                            className="inline-flex items-center px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-200"
                          >
                            {inst}
                          </span>
                        ))}
                        {institucionesAsignadas.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{institucionesAsignadas.length - 4} más
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TiposPromocionAdmin;
