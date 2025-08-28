import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { useCarrusel } from '../../context/CarruselContext';

const AdminDashboard = () => {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('');
  
  // Estado para el modal de edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);
  const [editandoForm, setEditandoForm] = useState({
    institucion: '',
    tipo_promocion: '',
    disciplina: '',
    beneficios: '',
    comentarios_restricciones: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  // Usar el contexto para controlar carruseles
  const { carruseles, activarCarrusel, desactivarCarrusel } = useCarrusel();

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerPromociones();
      
      if (response.estado === 'exito') {
        setPromociones(response.promociones);
      } else {
        setError('Error al cargar las promociones');
      }
    } catch (error) {
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar promociones
  const promocionesFiltradas = promociones.filter(promocion => {
    const matchesSearch = promocion.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promocion.tipo_promocion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promocion.disciplina.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInstitucion = filterInstitucion === '' || 
                              promocion.institucion.toLowerCase().includes(filterInstitucion.toLowerCase());
    
    const matchesDisciplina = filterDisciplina === '' || 
                             promocion.disciplina.toLowerCase().includes(filterDisciplina.toLowerCase());
    
    return matchesSearch && matchesInstitucion && matchesDisciplina;
  });

  const getStatusBadge = (fechaInicio, fechaFin, estado) => {
    // Si el estado está definido en la base de datos, usarlo
    if (estado && estado !== 'activa') {
      if (estado === 'inactiva') {
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">🟡 Inactiva</span>;
      } else if (estado === 'expirada') {
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🔴 Expirada</span>;
      }
    }
    
    // Si no hay estado definido, calcular por fechas
    const today = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (today < inicio) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">🔵 Próximamente</span>;
    } else if (today >= inicio && today <= fin) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">🟢 Activa</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🔴 Expirada</span>;
    }
  };

  // Función para manejar edición
  const handleEditar = (promocion) => {
    setPromocionEditando(promocion);
    setEditandoForm({
      institucion: promocion.institucion,
      tipo_promocion: promocion.tipo_promocion,
      disciplina: promocion.disciplina,
      beneficios: promocion.beneficios,
      comentarios_restricciones: promocion.comentarios_restricciones,
      fecha_inicio: promocion.fecha_inicio,
      fecha_fin: promocion.fecha_fin
    });
    setModalAbierto(true);
  };

  // Función para manejar cambio de estado
  const handleCambiarEstado = async (promocion) => {
    try {
      const nuevoEstado = promocion.estado === 'activa' ? 'inactiva' : 'activa';
      
      const response = await apiService.cambiarEstadoPromocion(promocion.id, nuevoEstado);
      
      if (response.estado === 'exito') {
        // Actualizar la lista local
        setPromociones(prev => prev.map(p => 
          p.id === promocion.id ? { ...p, estado: nuevoEstado } : p
        ));
        
        // Mostrar mensaje de confirmación
        
        // Método 1: BroadcastChannel (más confiable)
        try {
          const broadcastChannel = new BroadcastChannel('promocion-updates');
          broadcastChannel.postMessage({
            type: 'promocionEstadoCambiado',
            promocionId: promocion.id,
            nuevoEstado: nuevoEstado
          });
          broadcastChannel.close();
          console.log('✅ Mensaje enviado por BroadcastChannel');
        } catch (error) {
          console.warn('⚠️ BroadcastChannel no disponible, usando métodos alternativos');
        }
        
        // Método 2: localStorage como respaldo
        localStorage.setItem('promocionEstadoCambiado', Date.now().toString());
        
        // Método 3: Evento personalizado como respaldo
        window.dispatchEvent(new CustomEvent('promocionEstadoCambiado', {
          detail: { promocionId: promocion.id, nuevoEstado }
        }));
        
        console.log('✅ Todos los métodos de comunicación ejecutados');
       
      }
    } catch (error) {
      setError('Error al cambiar el estado de la promoción.');
    }
  };

  // Función para manejar eliminación
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      try {
        const response = await apiService.eliminarPromocion(id);
        
        if (response.estado === 'exito') {
          // Actualizar la lista local
          setPromociones(prev => prev.filter(p => p.id !== id));
        }
          } catch (error) {
      // Error silencioso al eliminar promoción
    }
    }
  };

  // Función para guardar cambios del modal
  const handleGuardarCambios = async () => {
    try {
      const response = await apiService.actualizarPromocion(promocionEditando.id, editandoForm);
      
      if (response.estado === 'exito') {
        // Actualizar la lista local
        setPromociones(prev => prev.map(p => 
          p.id === promocionEditando.id ? { ...p, ...editandoForm } : p
        ));
        setModalAbierto(false);
        setPromocionEditando(null);
      }
    } catch (error) {
      // Error silencioso al actualizar promoción
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando promociones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-800">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4 text-red-600">{error}</p>
          <button 
            onClick={cargarPromociones}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">🎭 Panel de Control de Promociones</h1>
              <p className="mt-2 text-orange-100">
                Gestiona la visibilidad de los carruseles y promociones
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-orange-100">
                Total: {promociones.length} promociones
              </span>
              <button
                onClick={cargarPromociones}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2 md:mb-0">🔍 Filtros de Búsqueda</h3>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterInstitucion('');
                setFilterDisciplina('');
              }}
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
          </div>
        </div>

        {/* Tabla de promociones */}
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
                            src={promocion.imagen_principal}
                            alt={`Imagen de ${promocion.institucion}`}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x64?text=Sin+Imagen';
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
                            onClick={() => handleEditar(promocion)}
                            className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleCambiarEstado(promocion)}
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
                            onClick={() => handleEliminar(promocion.id)}
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

        {/* Panel de Control de Carruseles */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-6">🎠 Control de Carruseles</h3>
          
          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">💡 Cómo funciona el sistema</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">• <strong>Promociones Activas:</strong> Aparecen en el carrusel principal del sitio web</p>
                  <p className="mb-2">• <strong>Promociones Inactivas:</strong> No aparecen en el carrusel, pero se mantienen en la base de datos</p>
                  <p>• <strong>Cambios automáticos:</strong> Al cambiar el estado de una promoción, el carrusel se actualiza inmediatamente</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(carruseles).map(([carruselId, carrusel]) => (
              <div key={carruselId} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-full mr-3 ${
                    carrusel.visible ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {carrusel.visible ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-800">{carrusel.nombre}</h4>
                </div>
                <p className="text-gray-600 text-sm mb-4">{carrusel.descripcion}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    carrusel.visible ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {carrusel.visible ? '🟢 Visible' : '🔴 Oculto'}
                  </span>
                  <button 
                    onClick={() => carrusel.visible ? desactivarCarrusel(carruselId) : activarCarrusel(carruselId)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      carrusel.visible 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {carrusel.visible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Promoción</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institución</label>
                <input
                  type="text"
                  value={editandoForm.institucion}
                  onChange={(e) => setEditandoForm({...editandoForm, institucion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Promoción</label>
                <input
                  type="text"
                  value={editandoForm.tipo_promocion}
                  onChange={(e) => setEditandoForm({...editandoForm, tipo_promocion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina</label>
                <input
                  type="text"
                  value={editandoForm.disciplina}
                  onChange={(e) => setEditandoForm({...editandoForm, disciplina: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={editandoForm.fecha_inicio}
                  onChange={(e) => setEditandoForm({...editandoForm, fecha_inicio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={editandoForm.fecha_fin}
                  onChange={(e) => setEditandoForm({...editandoForm, fecha_fin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Beneficios</label>
              <textarea
                value={editandoForm.beneficios}
                onChange={(e) => setEditandoForm({...editandoForm, beneficios: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios y Restricciones</label>
              <textarea
                value={editandoForm.comentarios_restricciones}
                onChange={(e) => setEditandoForm({...editandoForm, comentarios_restricciones: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCambios}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
