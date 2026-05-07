import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../apis';
import DashboardHeader from './components/Header/DashboardHeader';
import DashboardContent from './components/Content/DashboardContent';
import EditarPromocionModal from './components/Modals/EditarPromocionModal';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const AdminDashboard = () => {
  useDocumentTitle('Panel de Control');
  const navigate = useNavigate();
  // Estados para promociones
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitucion, setFilterInstitucion] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('');
  const [filterEstado, setFilterEstado] = useState(''); // Nuevo filtro de estado
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Estados para edición de promociones
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [editandoForm, setEditandoForm] = useState(null);
  
  // Estado para la pestaña activa
  const [tabActiva, setTabActiva] = useState('promociones');

  useEffect(() => {
    // Verificar autenticación antes de cargar datos
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Solo Pepe y Francisco pueden acceder al AdminDashboard
    const perfilId = localStorage.getItem('perfilId');
    if (perfilId !== 'pepe' && perfilId !== 'francisco') {
      // Si no es Pepe o Francisco, redirigir al Registro
      navigate('/Registro');
      return;
    }
    
    cargarPromociones();
  }, [navigate]);

  // Limpiar sesión cuando el usuario sale de la página o presiona atrás
  useEffect(() => {
    const limpiarSesion = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userUsuario');
      localStorage.removeItem('perfilId');
      localStorage.removeItem('perfilNombre');
    }

    // Detectar cuando el usuario sale de la página (cierra pestaña, navega a otro sitio)
    const handleBeforeUnload = () => {
      limpiarSesion();
    }

    // Detectar cuando presionan el botón de atrás
    const handlePopState = () => {
      // Si van al login, limpiar sesión
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          limpiarSesion();
        }
      }, 100);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const cargarPromociones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.obtenerPromocionesAdmin();
      
      if (response && response.estado === 'exito') {
        setPromociones(response.promociones || []);
        setLastUpdate(new Date());
      } else if (response && response.success === true && response.data) {
        // Si la respuesta tiene success: true y data, usar esa estructura
        setPromociones(response.data || []);
        setLastUpdate(new Date());
      } else if (response && response.promociones) {
        // Si no hay estado pero sí hay promociones, asumir éxito
        setPromociones(response.promociones);
        setLastUpdate(new Date());
      } else {
        setError('Error al cargar las promociones: ' + (response?.mensaje || 'Respuesta inválida'));
      }
    } catch (error) {
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar promociones alfabéticamente por institución (A-Z)
  const promocionesFiltradas = promociones
    .filter(promocion => {
      const matchesSearch = promocion.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           promocion.tipo_promocion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           promocion.disciplina.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesInstitucion = filterInstitucion === '' || 
                                promocion.institucion.toLowerCase().includes(filterInstitucion.toLowerCase());
      
      const matchesDisciplina = filterDisciplina === '' || 
                               promocion.disciplina.toLowerCase().includes(filterDisciplina.toLowerCase());
      
      // Filtro por estado
      const matchesEstado = filterEstado === '' || (() => {
        if (filterEstado === 'activa') {
          return promocion.estado === 'activa' || 
                 (promocion.estado !== 'inactiva' && promocion.estado !== 'expirada' && 
                  new Date() >= new Date(promocion.fecha_inicio) && 
                  new Date() <= new Date(promocion.fecha_fin));
        } else if (filterEstado === 'inactiva') {
          return promocion.estado === 'inactiva';
        } else if (filterEstado === 'expirada') {
          return promocion.estado === 'expirada' || 
                 (promocion.estado !== 'inactiva' && new Date() > new Date(promocion.fecha_fin));
        }
        return true;
      })();
      
      return matchesSearch && matchesInstitucion && matchesDisciplina && matchesEstado;
    })
    .sort((a, b) => {
      // Ordenar alfabéticamente por institución (A-Z)
      const institucionA = (a.institucion || '').toLowerCase();
      const institucionB = (b.institucion || '').toLowerCase();
      return institucionA.localeCompare(institucionB, 'es', { sensitivity: 'base' });
    });

  const getStatusBadge = (fechaInicio, fechaFin, estado) => {
    // Solo para promociones (con fechas)
    
    // Para promociones (con fechas)
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


  // Función para cambiar de pestaña
  const handleTabChange = (tab) => {
    setTabActiva(tab);
  };

  // Función para manejar refresh según la pestaña activa
  const handleRefresh = () => {
    if (tabActiva === 'promociones') {
      cargarPromociones();
    }
    // Las otras pestañas manejan su propio refresh
  };

  // Funciones para limpiar filtros
  const handleClearFiltersPromociones = () => {
    setSearchTerm('');
    setFilterInstitucion('');
    setFilterDisciplina('');
    setFilterEstado('');
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
        
        // Comunicación entre ventanas (opcional)
        try {
          const broadcastChannel = new BroadcastChannel('promocion-updates');
          broadcastChannel.postMessage({
            type: 'promocionEstadoCambiado',
            promocionId: promocion.id,
            nuevoEstado: nuevoEstado
          });
          broadcastChannel.close();
        } catch (error) {}
        localStorage.setItem('promocionEstadoCambiado', Date.now().toString());
        window.dispatchEvent(new CustomEvent('promocionEstadoCambiado', {
          detail: { promocionId: promocion.id, nuevoEstado }
        }));
      }
    } catch (error) {
      setError('Error al cambiar el estado de la promoción.');
    }
  };

  // Función para manejar eliminación
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      try {
        // eliminarPromocion lanza excepción en cualquier error HTTP,
        // por lo que llegar aquí sin excepción significa éxito.
        await apiService.eliminarPromocion(id);
        setPromociones(prev => prev.filter(p => p.id !== id));
        alert('✅ Promoción eliminada correctamente');
        cargarPromociones();
      } catch (error) {
        alert('❌ Error al eliminar la promoción: ' + error.message);
      }
    }
  };

  // Función para manejar edición
  const handleEditar = (promocion) => {
    setEditandoForm({ ...promocion });
    setModalEditarAbierto(true);
  };

  // Función para guardar cambios de edición
  const handleGuardarCambios = async () => {
    try {
      // Usar la función simple para actualizar solo los datos
      const response = await apiService.actualizarPromocion(editandoForm.id, editandoForm);
      
      if (response.estado === 'exito' || response.success === true) {
        // Actualizar la lista local
        setPromociones(prev => prev.map(p => 
          p.id === editandoForm.id ? { ...editandoForm } : p
        ));
        
        setModalEditarAbierto(false);
        setEditandoForm(null);
        alert('✅ Promoción actualizada correctamente');
        
        // Recargar para asegurar sincronización
        cargarPromociones();
      } else {
        alert('❌ No se pudo actualizar la promoción');
      }
    } catch (error) {
      alert('❌ Error al actualizar la promoción: ' + error.message);
    }
  };

  // Función para manejar cuando una promoción es actualizada con archivos
  const handlePromocionActualizada = (promocionActualizada) => {
    // Actualizar la lista local con la promoción actualizada
    setPromociones(prev => prev.map(p => 
      p.id === promocionActualizada.id ? promocionActualizada : p
    ));
    
    // Recargar para asegurar sincronización
    cargarPromociones();
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
        <div className="text-center text-gray-800 max-w-2xl mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error al Cargar el Dashboard</h2>
          <p className="mb-4 text-red-600">{error}</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">Posibles soluciones:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Verifica tu conexión a internet</li>
              <li>• El servidor puede estar temporalmente fuera de servicio</li>
              <li>• Revisa la consola del navegador (F12) para más detalles</li>
              <li>• Intenta recargar la página</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={cargarPromociones}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              🔄 Reintentar
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              🔄 Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        tabActiva={tabActiva}
        onTabChange={handleTabChange}
        onRefresh={handleRefresh}
        totalPromociones={promociones.length}
        lastUpdate={lastUpdate}
        loading={loading}
      />

      <DashboardContent
        tabActiva={tabActiva}
        // Estados de promociones
        promocionesFiltradas={promocionesFiltradas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterInstitucion={filterInstitucion}
        setFilterInstitucion={setFilterInstitucion}
        filterDisciplina={filterDisciplina}
        setFilterDisciplina={setFilterDisciplina}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        onEditar={handleEditar}
        onCambiarEstado={handleCambiarEstado}
        onEliminar={handleEliminar}
        getStatusBadge={getStatusBadge}
        onClearFiltersPromociones={handleClearFiltersPromociones}
      />

      {/* Modal de edición de promociones */}
      {editandoForm && (
        <EditarPromocionModal
          modalAbierto={modalEditarAbierto}
          setModalAbierto={setModalEditarAbierto}
          editandoForm={editandoForm}
          setEditandoForm={setEditandoForm}
          onGuardarCambios={handleGuardarCambios}
          onPromocionActualizada={handlePromocionActualizada}
        />
      )}

    </div>
  );
};

export default AdminDashboard;